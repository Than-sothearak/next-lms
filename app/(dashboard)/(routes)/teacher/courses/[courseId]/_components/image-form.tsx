"use client";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { ImageIcon, Pencil, PlusCircle, Target, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const formSchema = z.object({
  imageUrl: z.string().min(2, {
    message: "image is required",
  }),
});

interface ImageFormProps {
  initialData: {
    imageUrl: string;
  };
  courseId: string;
}

interface Image {
  url: string;
}

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>("");
  const [imageFile, setImageFile] = useState<any>("");
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
    setSelectedImage("");
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Save the file for upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleUpload(e: React.SyntheticEvent) {
    if (!imageFile) return;
    e.preventDefault();

    setUploading(true); // Indicate that the upload has started

    const values = {
      imageFile,
    };

    const formData = new FormData();
    formData.append("file", imageFile);

    console.log(formData);

    try {
      // POST request to upload the image file
      const res = await axios.post(`/api/upload-image/`, formData);
      setImageFile(res.data.link);
      console.log(imageFile)
      // PATCH request to update the course image info
      await axios.patch(`/api/course/${courseId}/image`, values);

      // Indicate the upload has finished
      setUploading(false);

      // Toggle edit mode and refresh the page
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
        <form onSubmit={handleUpload}>
          <label className="flex flex-col justify-center items-center border-4 h-60 rounded-md border-dotted cursor-pointer">
            <div>
              {uploading && (
                <h2 className="text-blue-500 text-muted-foreground">
                  Please wait a moment...
                </h2>
              )}
              {!uploading && (
                <h2 className="text-blue-500">Choose image file here</h2>
              )}
            </div>

            <input
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
              type="file"
              name="image"
              disabled={uploading}
            />
          </label>
          <div className="text-xs text-muted-foreground mt-4">
            <p>16:0 aspect ratio recommend</p>
          </div>
          {selectedImage && (
            <div className="mt-4">
              <Image
                width={300}
                height={300}
                src={selectedImage}
                alt="Selected Preview"
                className="max-w-full h-auto border-2 border-gray-300 rounded-lg shadow-md"
              />
            </div>
          )}

          {!imageFile ? (
            <Button type="submit" disabled className="mt-5">
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          ) : (
            <Button type="submit" disabled={uploading} className="mt-5">
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          )}
        </form>
      )}
    </div>
  );
};
