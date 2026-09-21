import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { Purchase } from "@/models/Purchase";

export async function POST(
  _request: Request,
  { params }: { params: { courseId: string } }
) {
  await mongooseConnect();

  try {
    const user = await currentUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await Course.findOne({
      _id: params.courseId,
      isPublished: true,
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const purchase = await Purchase.findOneAndUpdate(
      { userId: user.id, courseId: course._id },
      { $setOnInsert: { userId: user.id, courseId: course._id } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ enrolled: true, purchaseId: purchase._id });
  } catch (error) {
    console.log("[COURSE_ID_ENROLL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}