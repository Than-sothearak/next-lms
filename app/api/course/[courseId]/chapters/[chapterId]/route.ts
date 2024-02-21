import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { Category } from "@/models/Course";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string, chapterId: string } }
) {
  await mongooseConnect();
  try {
    const { userId } = auth();
    const { courseId } = params;
    const { chapterId } = params
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

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string, chapterId: string } }
) {
  await mongooseConnect();
  try {
    const { userId } = auth();
    const { courseId } = params;
    const { chapterId } = params

    if (!userId) {
      return new NextResponse("Unauthorized no user", { status: 401 });
    }
    const courseOwner = await Course.find({
      _id: courseId,
      userId: userId,
    });
    if (courseOwner.length > 0) {
      
      const deleteChapter = await Chapter.deleteOne(
        { _id: chapterId },
      );
      await Course.updateOne({_id: courseId}, {$pull: { chapter: chapterId  }} )

      const publishedChapter = await Chapter.find({
        courseId: courseId, isPublished: true,
      })

      if (!publishedChapter.length) {
        await Course.updateOne({
          _id: courseId
        }, {
          isPublished: false,
        })
      }
   
      return NextResponse.json(deleteChapter);
    } else {
      return new NextResponse("Unauthorized :(", { status: 401 });
    }
  } catch (error) {
    console.log("[COURSE_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
