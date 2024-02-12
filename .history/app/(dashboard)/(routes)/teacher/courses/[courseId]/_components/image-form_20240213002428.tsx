"use client";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, PlusCircle, Upload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";

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

export const ImageForm = ({ initialData, courseId, }: ImageFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

  async function UploadImages(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const files = e.target?.files;
  
    if (files && files.length > 0) {
      setIsUploading(true); // Assuming setIsUploading and setImages are properly declared elsewhere
      const data = new FormData();
      for (const file of Array.from(files)) {
        data.append("file", file);
      }
      try {
        const res = await axios.post<{ links: string[] }>("/api/upload", data);
        setImages((images: string[]) => {
          return [...images, ...res.data.links];
        });
        setIsUploading(false);
      } catch (error) {
        console.error('Error uploading images:', error);
        setIsUploading(false); // Make sure to handle error state properly
      }
    }
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axios.patch(`/api/course/${courseId}`, values);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Someting went wrong!");
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
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-1 w-10 text-slate-50" />
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
        <div className="h-full bg-slate-100 p-4 border-2">
          <div className="text-xs text-center text-muted-foreground justify-center items-center">
            <div className="h-60 flex flex-col justify-around items-center">
            
                <Upload className="size-28"/>
              
              <p>16:0 aspect ratio recommend</p>
            </div>
          </div>
          <input type="file" className="hidden" onChange={UploadImages} />
          <Button>
            Upload
          </Button>
        </div>
      )}
    </div>
  );
};
