"use client";

import axios from "axios";
import { ImagePlus, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";

interface ChapterImageFormProps {
  initialData: { imageUrl?: string };
  courseId: string;
  chapterId: string;
}

export const ChapterImageForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterImageFormProps) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || "");
  const router = useRouter();

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post("/api/upload-image", formData);
      if (!data.link) throw new Error("Image upload did not return a URL");
      setImageUrl(data.link);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined;
      toast.error(message || "Image upload failed");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    void uploadImage(file);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (saving) return;
    void uploadImage(event.dataTransfer.files[0]);
  }

  async function saveImage() {
    if (!imageUrl) return;
    try {
      setSaving(true);
      await axios.patch(`/api/course/${courseId}/chapters/${chapterId}`, {
        imageUrl,
      });
      toast.success("Chapter image updated");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Could not save chapter image");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter cover image
        <Button type="button" variant="ghost" onClick={() => setEditing((value) => !value)} disabled={saving}>
          {editing ? "Cancel" : <><Pencil className="mr-2 h-4 w-4" />Edit image</>}
        </Button>
      </div>
      {!editing && imageUrl && (
        <div className="mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-slate-900">
          <img src={imageUrl} alt="Chapter cover" className="max-h-full max-w-full object-contain" />
        </div>
      )}
      {!editing && !imageUrl && (
        <div className="mt-3 flex h-40 items-center justify-center rounded-md bg-slate-200 text-slate-500">
          <ImagePlus className="h-8 w-8" />
        </div>
      )}
      {editing && (
        <>
          <label
            className="mt-3 flex h-40 cursor-pointer items-center justify-center rounded-md border-2 border-dashed"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <span className="text-blue-600">{saving ? "Uploading..." : "Choose cover image"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={saving} />
          </label>
          <LoadingButton type="button" className="mt-4" loading={saving} onClick={saveImage} disabled={!imageUrl}>
            Save image
          </LoadingButton>
        </>
      )}
    </div>
  );
};
