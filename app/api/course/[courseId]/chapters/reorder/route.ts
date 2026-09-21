import { courseOwnerFilter } from "@/lib/course-access";
import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PUT(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }) {
        await mongooseConnect();
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { courseId } = await params;
        const list = await req.json();
        
        const courseOwner = await Course.find({ _id: (await params).courseId, ...await courseOwnerFilter(userId) },);

        if (courseOwner.length > 0) {
            
            for (let item of list.list) {
                await Chapter.updateOne({ _id: item._id, courseId },  {position: item.position})
            }

            return NextResponse.json("Successed", {status: 200});

        } else {
            return new NextResponse("Unauthorized", { status: 401 });

        }

    } catch (error) {
        console.log("[Chapter_ID", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
