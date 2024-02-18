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
        const courseOwner = await Course.find({ _id: params.courseId, userId: userId },);
        if (courseOwner.length > 0) {
            const updateCourse = await Course.updateOne({_id: courseId}, {userId: userId, imageUrl: values.images } )
            return NextResponse.json(updateCourse);
        }else {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
    } catch (error) {
     console.log("[COURSE_ID", error);
     return new NextResponse("Internal Error", { status: 500})
    }
}