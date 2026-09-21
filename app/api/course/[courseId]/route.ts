import { courseOwnerFilter } from "@/lib/course-access";
import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  await mongooseConnect();
  try {
    const { userId } = await auth();
    const { courseId } = await params;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const courseOwner = await Course.find({
      _id: courseId,
      ...await courseOwnerFilter(userId),
    });

    if (courseOwner.length > 0) {
      const updateCourse = await Course.updateOne(
        { _id: courseId, ...await courseOwnerFilter(userId) },
        { $set: Object.fromEntries(["title", "description", "imageUrl", "price", "categoryId"].filter((key) => key in values).map((key) => [key, values[key]])) }
      );
      return NextResponse.json(updateCourse);
    } else {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  } catch (error) {
    console.log("[COURSE_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  await mongooseConnect();
  try {
    const { userId } = await auth();
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await Course.find({
      _id: courseId,
      ...await courseOwnerFilter(userId),
    });

    if (courseOwner.length > 0) {
      const updateCourse = await Course.deleteOne({
        _id: courseId,
        ...await courseOwnerFilter(userId),
      });
      return NextResponse.json(updateCourse);
    } else {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  } catch (error) {
    console.log("[COURSE_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
