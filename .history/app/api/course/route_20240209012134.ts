import { auth } from "@clerk/nextjs";
import { mongooseConnect } from "../../../lib/mongoose";
import { Course } from "../../../models/Courses";
import { NextResponse } from "next/server";
import { error } from "console";

export async function POST(req: Request, res: Response) {
  try {
    await mongooseConnect();

    const { userId } = auth();
    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await Course.create({
    
      title,
      userId,
    
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
