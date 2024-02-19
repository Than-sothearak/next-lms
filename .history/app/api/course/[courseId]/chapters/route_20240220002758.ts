import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function POST(
    req: Request,
    { params }: { params: { courseId: string } }) {
        await mongooseConnect();
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { courseId } = params;
        const values = await req.json();
        const courseOwner = await Course.find({ _id: params.courseId, userId: userId },);

        if (courseOwner.length > 0) {
            
            const findLastChapter = await Chapter.findOne({courseId: courseId}).sort({position: -1})
            const newPostion = findLastChapter ? findLastChapter.position + 1 : 0;

            const createChapter = await Chapter.create({ courseId: courseId, position: newPostion, title: values.title})

            return NextResponse.json(createChapter);

        } else {
            return new NextResponse("Unauthorized", { status: 401 });

        }

    } catch (error) {
        console.log("[Chapter_ID", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
