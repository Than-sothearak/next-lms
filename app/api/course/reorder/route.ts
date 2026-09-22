import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { courseOwnerFilter } from "@/lib/course-access";

export async function PUT(req: Request) {
  await mongooseConnect();

  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { list } = await req.json();
    if (!Array.isArray(list)) {
      return new NextResponse("Invalid course order", { status: 400 });
    }

    const ownerFilter = await courseOwnerFilter(userId);
    const courseIds = list.map((item: { _id: string }) => item._id);
    const ownedCount = await Course.countDocuments({ ...ownerFilter, _id: { $in: courseIds } });
    if (ownedCount !== new Set(courseIds).size) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await Promise.all(list.map((item: { _id: string; position: number }) =>
      Course.updateOne(
        { _id: item._id, ...ownerFilter },
        { $set: { position: item.position } }
      )
    ));

    return NextResponse.json("Success", { status: 200 });
  } catch (error) {
    console.error("[COURSE_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
