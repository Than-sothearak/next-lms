import { Attachment } from "@/models/Attachment";
import { Chapter } from "@/models/Chapter";
import { Course } from "@/models/Course";
import { Purchase } from "@/models/Purchase";
import { UserProgress } from "@/models/UserProgress";


interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
  position: number;
};

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
  position,
}: GetChapterProps) => {
  try {
    const purchase = await Purchase.find()
    
    const course = await Course.find({})

    const chapter = await Chapter.find({_id: chapterId, isPublished: true})

    if (!chapter || !course) {
      throw new Error("Chapter or course not found");
    }

    let muxData = null;
    let attachments: typeof Attachment[] = [];
    let nextChapter: typeof Chapter | null = null;

    if (purchase) {
      attachments = await Attachment.find({course: courseId})
    }


    nextChapter = await Chapter.find({courseId: courseId, isPublished: true, position: { $gt: chapter?.position }}).sort({position: -1})

    const userProgress = await UserProgress.find({userId: userId, chapterId: chapterId})
    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    }
  }
}