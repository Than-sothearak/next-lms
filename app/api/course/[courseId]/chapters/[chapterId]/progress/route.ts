import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { UserProgress } from "@/models/UserProgress";
import { Chapter } from "@/models/Chapter";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {

    await mongooseConnect()
  try {
    const { userId } = await auth();
    const { isCompleted } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    } 
    
    const filter = {
        userId: userId,
        chapterId: (await params).chapterId
        
      };
      
      const update = {
        $set: {
          userId: userId,
          chapterId: (await params).chapterId,
          isCompleted: isCompleted,
          courseId: (await params).courseId,
        }
      };
      
      const options = {
        upsert: true, // Create a new document if no document matches the query
        returnOriginal: false // Return the modified document rather than the original
      };
      
      const userProgress = await UserProgress.findOneAndUpdate(filter, update, options);

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}