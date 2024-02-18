import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request, 
    {params}: {params: { courseId : string}}) {
    try{

        const { userId } = auth();
        const { courseId } = params;
        const values = await req.json();
     
        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        const courseOwner = await Course.find({ _id: courseId, userId: userId },);
        if (courseOwner.length > 0) {
            const updateChorse = await Course.updateOne({_id: courseId}, ...values  )
            return NextResponse.json(updateChorse);
        }else {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
    } catch (error) {
     console.log("[COURSE_ID", error);
     return new NextResponse("Internal Error", { status: 500})
    }
}