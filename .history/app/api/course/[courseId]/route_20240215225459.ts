import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

mongooseConnect();
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();
    console.log(values.categoryId)
    if (!userId) {
      return new NextResponse("Unauthorized no user", { status: 401 });
    }
    const courseOwner = await Course.find({
      _id: params.courseId,
      userId: userId,
    });
    if (courseOwner.length > 0) {
      const updateCourse = await Course.updateOne(
        { _id: courseId },
        { userId: userId, ...values }
      );

      await Category.updateOne( { $push: { courses: courseId } });

      return NextResponse.json(updateCourse);
    } else {
      return new NextResponse("Unauthorized :(", { status: 401 });
    }
  } catch (error) {
    console.log("[COURSE_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
