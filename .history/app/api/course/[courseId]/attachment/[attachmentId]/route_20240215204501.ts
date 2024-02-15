import { mongooseConnect } from "@/lib/mongoose";
import { Attachment } from "@/models/Attachment";
import { Course } from "@/models/Courses";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

mongooseConnect()

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string, attachmentId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await Course.find({ _id: params.courseId, userId: userId },);

        if (courseOwner.length > 0 ) {
            const attachment = await Attachment.deleteOne({
                _id: params.attachmentId
            });

            return NextResponse.json(attachment);


        } else {
            return new NextResponse("Unauthorized", { status: 401 });

        }


    } catch (error) {
        console.log("ATTACHMENT_ID", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
