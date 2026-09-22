import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCurrentUserRole } from "@/lib/roles";
import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";

export async function GET() {
  const { userId } = await auth();
  if (!userId || (await getCurrentUserRole()) !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await mongooseConnect();
  const courses = await Course.find({}, { _id: 1, title: 1 })
    .sort({ title: 1 })
    .lean();
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId || (await getCurrentUserRole()) !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await mongooseConnect();
  try {
    const { chapterId, destinationCourseId } = await req.json();
    const sourceChapter = await Chapter.findById(chapterId).lean();
    const destinationCourse = await Course.findById(destinationCourseId);

    if (!sourceChapter || !destinationCourse) {
      return NextResponse.json(
        { error: "Chapter or destination course was not found." },
        { status: 404 },
      );
    }

    const lastChapter = await Chapter.findOne({
      courseId: destinationCourseId,
    }).sort({ position: -1 });
    const position = (lastChapter?.position ?? -1) + 1;

    const copiedChapter = await Chapter.create({
      title: sourceChapter.title,
      description: sourceChapter.description,
      videoUrl: sourceChapter.videoUrl,
      imageUrl: sourceChapter.imageUrl,
      price: sourceChapter.price,
      position,
      courseId: destinationCourseId,
      isPublished: false,
      isLocked: sourceChapter.isLocked,
      isFree: sourceChapter.isFree,
    });

    destinationCourse.chapter.push(copiedChapter._id);
    await destinationCourse.save();

    return NextResponse.json({ id: copiedChapter._id });
  } catch (error) {
    console.error("[ADMIN_COPY_CHAPTER]", error);
    return NextResponse.json(
      { error: "Could not copy chapter." },
      { status: 500 },
    );
  }
}
