import { mongooseConnect } from "@/lib/mongoose";
import { Chapter } from "@/models/Chapter";
import { UserProgress } from "@/models/UserProgress";
import { auth } from "@clerk/nextjs";

export const getProgress = async (

    userId: string,
    courseId: string,
): Promise<number> => {
    await mongooseConnect()
  
    try {
        const {userId} = auth();
        const publishedChapters = await Chapter.find({courseId: courseId,  isPublished: true})


        const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

        const validCompletedChapters = await UserProgress.countDocuments({userId: userId, chapterId: {
            in: publishedChapterIds,
        }, isCompleted: true})
    
     
        const progressPercentage = (validCompletedChapters / publishedChapterIds.length) * 100;

        return progressPercentage;
    } catch (error) {
        console.log("[GET_PROGRESS]", error);
        return 0;
    }
}