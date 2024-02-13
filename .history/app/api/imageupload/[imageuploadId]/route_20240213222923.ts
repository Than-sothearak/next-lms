import { Course } from "@/models/Courses";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request, 
    {params}: {params: { imageuploadId : string}}) {
    try{

        const { userId } = auth();
        const { imageuploadId } = params;
        const values = await req.json();
        const imgUrl = JSON.stringify(values);
       
        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        const updateCourse = await Course.updateOne({_id: imageuploadId}, {userId: userId, imageUrl: values.images } )
        return NextResponse.json(updateCourse);
    } catch (error) {
     console.log("[COURSE_ID", error);
     return new NextResponse("Internal Error", { status: 500})
    }
}