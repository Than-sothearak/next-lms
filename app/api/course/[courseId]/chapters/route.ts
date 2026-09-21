import { courseOwnerFilter } from "@/lib/course-access";
import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongoose";
import { NextResponse } from "next/server";


export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }) {
    await mongooseConnect();
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { courseId } = await params;
        const values = await req.json();
        const courseOwner = await Course.find({ _id: (await params).courseId, ...await courseOwnerFilter(userId) },);

        if (courseOwner.length > 0) {

            const findLastChapter = await Chapter.findOne({ courseId: courseId }).sort({ position: -1 })

            const newPostion = (findLastChapter?.position ?? -1) + 1;

            const createChapter = await Chapter.create({ courseId: courseId, position: newPostion, title: values.title })

            return NextResponse.json(createChapter);

        } else {
            return new NextResponse("Unauthorized", { status: 401 });

        }

    } catch (error) {
        console.log("[Chapter_ID", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
