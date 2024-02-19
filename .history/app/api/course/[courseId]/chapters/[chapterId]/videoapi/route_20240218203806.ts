import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request, 
    {params}: {params: { courseId : string , chapterId : string}}) {
    try{

        const { userId } = auth();
        const { courseId } = params;
        const { chapterId } = params;
        const values = await req.json();
     
        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        const courseOwner = await Course.find({ _id: courseId, userId: userId },);
        if (courseOwner.length > 0) {
            const updateChapter = await Chapter.updateOne({_id: chapterId}, {videoUrl: values.videos } )
            return NextResponse.json(updateChapter);
        }else {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
    } catch (error) {
     console.log("[COURSE_ID", error);
     return new NextResponse("Internal Error", { status: 500})
    }
}