import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { Category } from "@/models/Course";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

mongooseConnect();
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string, chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const { chapterId} = params
    const values = await req.json();
  
    if (!userId) {
      return new NextResponse("Unauthorized no user", { status: 401 });
    }
    const courseOwner = await Course.find({
      _id: courseId,
      userId: userId,
    });
    if (courseOwner.length > 0) {
      const updateChapter = await Chapter.updateOne(
        { _id: chapterId },
        { ...values }
      );

      return NextResponse.json(updateChapter);
    } else {
      return new NextResponse("Unauthorized :(", { status: 401 });
    }
  } catch (error) {
    console.log("[COURSE_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
