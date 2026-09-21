"use client";
import axios from "axios";

import { useRouter } from "next/navigation";

import { FileCheck, Pencil, PlusCircle, TicketCheck, Video } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";

interface ChapterVideoProps {
  initialData: {
    videoUrl: string;
  };
  courseId: string;
  chapterId: string;
}

interface Image {
  url: string;
}

export const ChapterVideo = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<null>(null);
  const [videos, setVideos] = useState<any>("");
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

  async function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (uploading || saving) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const maxVideoSize = 10 * 1024 * 1024;
    if (file.size > maxVideoSize) {
      toast.error("Video file must be 10MB or smaller.");
      e.target.value = "";
      return;
    }
    try {
      setUploading(true);
      setVideos("");
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/upload-video", formData);
      if (!res.data.link) throw new Error("Upload did not return a URL");
      setVideos(res.data.link);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined;
      toast.error(message || "Video upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleOnSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!videos || uploading || saving) return;
    setSaving(true);
    const values = {
      videos,
    };
    try {
      await axios.patch(
        `/api/course/${courseId}/chapters/${chapterId}/videoapi`,
        values
      );

      toast.success("video updated");

      toggleEdit();
      setVideos("");
      router.refresh();
    } catch (error) {
      toast.error("Video not send!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter video
        <Button type="button" variant="ghost" onClick={toggleEdit} disabled={uploading || saving}>
          {isEidting && <>Cancel</>}
          {!isEidting && !initialData?.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}

          {!isEidting && initialData?.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Video
            </>
          )}
        </Button>
      </div>
      {!isEidting &&
        (!initialData?.videoUrl ? (
          <div className="flex items-center justify-center h-80 bg-slate-200 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative mt-2 aspect-video overflow-hidden rounded-md bg-black">
            <video
              src={initialData?.videoUrl}
              controls
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      {isEidting && (
        <form onSubmit={handleOnSubmit}>
          <label className="flex flex-col justify-center items-center border-4 h-60 rounded-md border-dotted cursor-pointer">
            {videos && (
              <div className="flex gap-x-2">
                <p>Video uploaded</p>
                <FileCheck className="text-green-500"/>
              </div>
            )}
            {!videos && (
              <div>
                {uploading && (
                  <h2 className="text-blue-500 text-muted-foreground">Please wait a moment...</h2>
                )}
               {!uploading && (
                 <h2 className="text-blue-500">Choose video file here</h2>
               )}
              </div>
            )}
            <input disabled={uploading || saving} className="hidden" onChange={handleOnChange} type="file" name="video" accept="video/*" />
          </label>
          <div className="text-xs text-muted-foreground mt-4">
            <p>16:0 aspect ratio recommend</p>
          </div>

          {!videos ? (
            <div className="flex gap-x-4">
              <LoadingButton type="submit" loading={uploading} loadingText="Uploading..." disabled={!videos} className="mt-5">
                Save video
              </LoadingButton>
         
            </div>
          ) : (
            <div className="flex items-center gap-x-2">
              <LoadingButton type="submit" loading={saving} className="mt-5">
                Save video
              </LoadingButton>
           <div className="gap-x2 flex items-center text-xs text-muted-foreground mt-5">
           <p >Click save to save the video</p>
           </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
