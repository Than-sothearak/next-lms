import { auth } from "@clerk/nextjs";
import { mongooseConnect } from "../../../lib/mongoose";
import { Course } from "../../../models/Course";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {

  await mongooseConnect();

    try {
      const { userId } = auth();
      const { title } = await req.json();
  
      if (!userId) {
        return new NextResponse("Unauthorized no user", { status: 401 });
      }
     
      const findCourse = await Course.findOne({title})
      if (findCourse){
          return new NextResponse('Course already exists!', { status: 400 });
      } else {
          const course = await Course.create({
              title,
              userId,
            });
            return NextResponse.json(course);
      }
    
    } catch (error) {
      console.log("[COURSES", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  
  
}