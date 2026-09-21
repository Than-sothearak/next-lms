"use client";
import axios from "axios";
import { useRouter } from "next/navigation";

import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageFormProps {
  initialData: {
    imageUrl: string;
  };
  courseId: string;
}

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

  async function handleUpload() {
    if (!imageFile) return;
    setUploading(true); // Indicate that the upload has started
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadResponse = await axios.post("/api/upload-image", formData);
      const uploadedUrl = uploadResponse.data?.link;

      if (!uploadedUrl) throw new Error("Image upload did not return a URL");

      setImageUrl(uploadedUrl);
      await axios.patch(`/api/course/${courseId}/image`, { imageFile: uploadedUrl });
      setUploading(false);
      toggleEdit();
      toast.success("Image updated");
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Image not sent!");
      setUploading(false);
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course image
        <Button variant="ghost" onClick={toggleEdit}>
          {isEidting && <>Cancel</>}
          {!isEidting && !initialData.imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an image
            </>
          )}

          {!isEidting && initialData.imageUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit image
            </>
          )}
        </Button>
      </div>
      {!isEidting &&
        (!initialData.imageUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md gap-x-2">
            <ImageIcon className="h-10 w-10 text-slate-500" />
            <p className="text-muted-foreground">No image</p>
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              alt="Uplaod"
              fill
              className="object-cover rounded-md"
              src={initialData.imageUrl}
            />
          </div>
        ))}
      {isEidting && (
        <div className="mt-4">
          <label className="flex flex-col justify-center items-center border-4 h-60 rounded-md border-dotted cursor-pointer">
            <span className="text-blue-500">
              {imageFile ? imageFile.name : "Choose image file here"}
            </span>
            <input
              className="hidden"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
          </label>
          <Button type="button" onClick={handleUpload} disabled={!imageFile || uploading} className="mt-5">
            {uploading ? "Uploading..." : "Upload image"}
          </Button>
        </div>
      )}
    </div>
  );
};
