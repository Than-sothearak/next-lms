import { mongooseConnect } from "@/lib/mongoose";
import { Attachment } from "@/models/Attachment";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function POST(
    req: Request, 
    {params}: {params: { courseId : string}}) {
        await mongooseConnect();
    try{
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        
        const { courseId } = params;
        const values = await req.json();
        
        const updateAttachment = await Attachment.create({courses: courseId, ...values} )

        return NextResponse.json(updateAttachment);
    } catch (error) {
     console.log("[Attachment_ID", error);
     return new NextResponse("Internal Error", { status: 500})
    }
}
