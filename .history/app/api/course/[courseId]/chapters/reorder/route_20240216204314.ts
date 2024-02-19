import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

mongooseConnect();
export async function PUT(
    req: Request,
    { params }: { params: { courseId: string } }) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { courseId } = params;
        const list = await req.json();
        
        const courseOwner = await Course.find({ _id: params.courseId, userId: userId },);

        if (courseOwner.length > 0) {
            
            for (let item of list.list) {
                await Chapter.updateOne({ _id: item._id},  {position: item.position})
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
