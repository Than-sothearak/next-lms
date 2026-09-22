"use client";
import axios from "axios";

import { useRouter } from "next/navigation";

import { FileCheck, Headphones, Pencil, PlusCircle, Video } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";

interface ChapterVideoProps {
  initialData: {
    videoUrl: string;
    title: string;
  };
  courseId: string;
  chapterId: string;
}

export const ChapterVideo = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [videos, setVideos] = useState<any>("");
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

  async function uploadMedia(file: File) {
    if (uploading || saving) return;
    if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      toast.error("Please choose a video or audio file");
      return;
    }
    try {
      setUploading(true);
      setVideos("");
      const { data } = await axios.post("/api/upload-video", {
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("S3 upload failed");
      }

      if (!data.link) throw new Error("Upload did not return a URL");
      setVideos(data.link);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined;
      toast.error(message || "Video upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void uploadMedia(file);
    }
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (uploading || saving) return;
    const file = e.dataTransfer.files[0];
    if (file) {
      void uploadMedia(file);
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
            {/\.(mp3|wav|ogg|m4a|aac|flac)(?:[?#]|$)/i.test(initialData.videoUrl) ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 text-white">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
                  <Headphones className="h-12 w-12 text-blue-200" />
                </div>
                <h2 className="text-center text-xl font-semibold">
                  {initialData.title || "Audio lesson"}
                </h2>
                <audio
                  src={initialData.videoUrl}
                  controls
                  className="w-full max-w-xl"
                />
              </div>
            ) : (
              <video
                src={initialData.videoUrl}
                controls
                className="h-full w-full object-contain"
              />
            )}
          </div>
        ))}
      {isEidting && (
        <form onSubmit={handleOnSubmit}>
          <label
            className="flex flex-col justify-center items-center border-4 h-60 rounded-md border-dotted cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
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
                 <h2 className="text-blue-500">
                   Choose or drag a video/audio file here
                 </h2>
               )}
              </div>
            )}
            <input
              disabled={uploading || saving}
              className="hidden"
              onChange={handleOnChange}
              type="file"
              name="media"
              accept="video/*,audio/*"
            />
          </label>
          <div className="text-xs text-muted-foreground mt-4">
            <p>Video or audio files are supported</p>
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
