import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function PATCH(

    req: Request,
    { params }: { params: { courseId: string } }) {
        await mongooseConnect();
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { courseId } = params;

        const publishedCourse = await Course.updateOne({ _id: courseId, userId: userId }, {
            isPublished: true,
        })
        return NextResponse.json(publishedCourse);

    } catch (error) {
        console.log("[Chapter_PUBLISH", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
