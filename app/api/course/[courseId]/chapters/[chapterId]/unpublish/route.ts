import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

mongooseConnect();
export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string, chapterId: string } }) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { courseId } = params;
        const { chapterId } = params;
        const courseOwner = await Course.find({ _id: params.courseId, userId: userId },);

        if (courseOwner.length > 0) {

            await Course.updateOne({_id: courseId}, {$pull: { chapter: chapterId  }} )
            const publishedChapter = await Chapter.updateOne({ _id: chapterId, courseId: courseId }, {
                isPublished: false,
            })

            return NextResponse.json(publishedChapter);

        } else {
            return new NextResponse("Unauthorized", { status: 401 });

        }

    } catch (error) {
        console.log("[Chapter_PUBLISH", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
