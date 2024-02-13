import { Course } from "@/models/Courses";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request, 
    {params}: {params: { courseId : string}}) {
    try{

        const { userId } = auth();
        const { courseId } = params;
        const img= await req.json();
        console.log(img)
        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        const updateCourse = await Course.updateOne({_id: courseId}, {userId: userId, imageUrl: img} )
        return NextResponse.json(updateCourse);
    } catch (error) {
     console.log("[COURSE_ID", error);
     return new NextResponse("Internal Error", { status: 500})
    }
}