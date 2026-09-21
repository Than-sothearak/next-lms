import { courseOwnerFilter } from "@/lib/course-access";
import { mongooseConnect } from "@/lib/mongoose";
import { Attachment } from "@/models/Attachment";
import { Course } from "@/models/Course";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ courseId: string, attachmentId: string }> }
) {
    await mongooseConnect();
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await Course.find({ _id: (await params).courseId, ...await courseOwnerFilter(userId) },);

        if (courseOwner.length > 0 ) {
            const attachment = await Attachment.deleteOne({
                _id: (await params).attachmentId, courses: (await params).courseId
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
