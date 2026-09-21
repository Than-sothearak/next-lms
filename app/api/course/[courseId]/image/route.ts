import { courseOwnerFilter } from "@/lib/course-access";
import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request, 
    {params}: {params: Promise<{ courseId : string}>}) {
        await mongooseConnect();
    try{

        const { userId } = await auth();
        const { courseId } = await params;
        const values = await req.json();
       
        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        
            const updateCourse = await Course.updateOne({_id: courseId, ...await courseOwnerFilter(userId)}, {imageUrl: values.imageFile} )
            return NextResponse.json(updateCourse);
       
        
    } catch (error) {
     console.log("[COURSE_ID", error);
     return new NextResponse("Internal Error", { status: 500})
    }
}
