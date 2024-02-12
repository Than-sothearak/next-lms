"use client";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
import { ImageIcon, Pencil, PlusCircle, Upload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
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

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

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
      {!isEidting && (
       !initialData.imageUrl ? (
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
       )
      )}
      {isEidting && (
        <div className="h-60 bg-slate-100 p-4 border-2">
          <div className="text-xs text-center text-muted-foreground mt-4">
            <Upload />
            <p>16:0 aspect ratio recommend</p>
          </div>
        </div>
      )}
    </div>
  );
};
