import { auth } from "@clerk/nextjs";
import { mongooseConnect } from "../../../lib/mongoose";
import { Course } from "../../../models/Courses";
import { NextResponse } from "next/server";

export async function POST(
req: Request,
res: Response,
) {
    try {

        const { userId } = auth();
        const { title } = await req.json();

        if(!userId) {
            return new NextResponse("Unauthorized", {status: 401});
        }

    } catch (err) {

    }
}