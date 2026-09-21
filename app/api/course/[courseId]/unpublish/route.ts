import { courseOwnerFilter } from "@/lib/course-access";
import { mongooseConnect } from "@/lib/mongoose";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }) {
        await mongooseConnect();
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { courseId } = await params;

        const publishedCourse = await Course.updateOne({ _id: courseId, ...await courseOwnerFilter(userId) }, {
            isPublished: false,
        })
        return NextResponse.json(publishedCourse);

    } catch (error) {
        console.log("[Chapter_PUBLISH", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
