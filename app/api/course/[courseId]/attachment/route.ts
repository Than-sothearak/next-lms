import { courseOwnerFilter } from "@/lib/course-access";
import { mongooseConnect } from "@/lib/mongoose";
import { Attachment } from "@/models/Attachment";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  await mongooseConnect();
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await params;
    const values = await req.json();

    const courseOwner = await Course.find({
      _id: (await params).courseId,
      ...await courseOwnerFilter(userId),
    });

    if (courseOwner.length > 0) {
      const updateAttachment = await Attachment.create({
        courses: courseId,
        ...values,
      });

      return NextResponse.json(updateAttachment);
    } else {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  } catch (error) {
    console.log("[Attachment_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
