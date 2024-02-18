"use client";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { ImageIcon, Pencil, PlusCircle, Target, Upload, Video } from "lucide-react";
import {  useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const formSchema = z.object({
  videoUrl: z.string().min(2, {
    message: "image is required",
  }),
});

interface ChapterVideoProps {
  initialData: {
    videoUrl: string;
  };
  courseId: string;
  chapterId: string
}

interface Image {
  url: string;
}

export const ChapterVideo = ({ initialData, courseId, chapterId }: ChapterVideoProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<null>(null);
  const [videos, setVideos] = useState<any>("");
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };


  async function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files?.[0];

    if (files) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", files);
      const res = await axios.post(`/api/upload-image/`, formData);
      setVideos(res.data.link);
      setUploading(false);
    }
    setUploading(false);
  }

  async function handleOnSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const values = {
      videos,
    };
    try {
      await axios.patch(`/api/course/${courseId}/video-api`, values);

      toast.success("video updated");

      toggleEdit();
      setVideos("");
      router.refresh();
      setUploading(false);
    } catch (error) {
      toast.error("Image not send!");
      setUploading(false);
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter video
        <Button variant="ghost" onClick={toggleEdit}>
          {isEidting && <>Cancel</>}
          {!isEidting && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}
        </Button>
      </div>
      {!isEidting &&
        (!initialData.videoUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
           Video uploaded
          </div>
        ))}
      {isEidting && (
        <form onSubmit={handleOnSubmit}>
          <label className="flex flex-col justify-center items-center border-4 h-60 rounded-md border-dotted cursor-pointer">
            {videos && (
                <div className="relative aspect-video mt-2">
               <video src={videos} width="800" height="400" controls className="object-cover rounded-md"/>
              </div>
            )}
            {!videos && (
              <h2 className="text-blue-500">Choose video file here</h2>
            )}
            <input className="hidden" onChange={handleOnChange} type="file" name="image" />
          </label>
          <div className="text-xs text-muted-foreground mt-4">
            <p>16:0 aspect ratio recommend</p>
          </div>

          {!videos ? (
            <Button type="submit" disabled={uploading} className="mt-5">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          ) : (
            <Button type="submit" disabled={uploading} className="mt-5">
            {uploading ? "Uploading..." : "Save"}
          </Button>
          )}
        </form>
      )}
    </div>
  );
};
