import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request, 
    {params}: {params: { courseId : string}}) {
        await mongooseConnect();
    try{

        const { userId } = auth();
        const { courseId } = params;
        const values = await req.json();
       
        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        
            const updateCourse = await Course.updateOne({_id: courseId, userId: userId}, {imageUrl: values.images} )
            return NextResponse.json(updateCourse);
       
        
    } catch (error) {
     console.log("[COURSE_ID", error);
     return new NextResponse("Internal Error", { status: 500})
    }
}