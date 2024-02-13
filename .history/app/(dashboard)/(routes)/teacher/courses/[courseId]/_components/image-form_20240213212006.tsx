"use client";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { ImageIcon, Pencil, PlusCircle, Target, Upload } from "lucide-react";
import { useState } from "react";
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
  imgId: string;
}

interface Image {
  url: string;
}

export const ImageForm = ({ initialData, imgId }: ImageFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [images, setImages] = useState<Image>();
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
  console.log(images)
  // const { isSubmitting, isValid } = form.formState;

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   if (!file) return;
  //   setUploading(true);
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const res = await axios.post(`/api/uploadimage/`, formData);
  //     setImages(res.data.link)
  //     await axios.patch(`/api/course/${imgId}`, img);
   
  //     toast.success("Course updated");
  //     toggleEdit();
  //     router.refresh();
  //   } catch {
  //     toast.error("Someting went wrong!");
  //     setUploading(false);
  //   }
  // }

  async function handleOnSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    
    if (!file) return;
    setUploading(true);
   
    const formData = new FormData();
    formData.append("file", file);
    const img = images

    try {
      const res = await axios.post(`/api/uploadimage/`, formData);
      setImages(res.data.link)
      await axios.put(`/api/course/${imgId}`, img);
 
      toast.success("Course updated");
      setUploading(false);
    } catch (error) { 
      toast.error("Image not send!");
      setUploading(false);
    }
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
      setFile(e.currentTarget.files?.[0]);
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
            <ImageIcon className="h-10 w-10 text-slate-500" />
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
        //   <Form {...form}>
        //   <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        //     <FormField
        //       control={form.control}
        //       name="imageUrl"
        //       render={({ field }) => (
        //         <FormItem className="flex justify-center items-center border-4 h-60 rounded-md border-dotted">
        //           <FormControl>
        //             <Input
        //               type="file"
        //               placeholder="e.g. 'Computer science' "
        //               disabled={isSubmitting}
        //               {...field}
        //             />
        //           </FormControl>
        //           <FormDescription>
        //             This is your public display name.
        //           </FormDescription>
        //           <FormMessage />
        //         </FormItem>
        //       )}
        //     />
        //     <div className="flex gap-x-2">
        //       <Button type="submit" disabled={!isValid || isSubmitting}>
        //         Save
        //       </Button>
        //     </div>
        //   </form>
        // </Form>
        <form onSubmit={handleOnSubmit}>
          <div className="flex justify-center items-center border-4 h-60 rounded-md border-dotted">
            <h2 className="text-blue-500">Drang and drop file here</h2>
            <input
              onChange={handleOnChange}
              type="file"
              name="image"
              accept="image/*" 
            />
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            <p>16:0 aspect ratio recommend</p>
          </div>
          <button type="submit" disabled={!file}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        </form>
      )}
    </div>
  );
};
