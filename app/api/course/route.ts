import { auth } from "@clerk/nextjs/server";
import { mongooseConnect } from "../../../lib/mongoose";
import { Course } from "../../../models/Course";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  await mongooseConnect();

    try {
      const { userId } = await auth();
      const { title } = await req.json();
  
      if (!userId) {
        return new NextResponse("Unauthorized no user", { status: 401 });
      }
     
      const findCourse = await Course.findOne({title})
      if (findCourse){
          return new NextResponse('Course already exists!', { status: 400 });
      } else {
          const lastCourse = await Course.findOne({ userId }).sort({ position: -1 });
          const course = await Course.create({
              title,
              userId,
              position: (lastCourse?.position ?? -1) + 1,
            });
            return NextResponse.json(course);
      }
    
    } catch (error) {
      console.log("[COURSES", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  
  
}
