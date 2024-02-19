"use client";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { cn } from '@/lib/utils';
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
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";

const formSchema = z.object({
  description: z.string().min(1),
});

interface ChapterChapterDesciptionFormProps {
  initialData: {
    description: string
  };
    courseId: string;
    chapterId: string;
  };
  

export const ChapterDesciptionForm = ({ initialData, courseId, chapterId}: ChapterChapterDesciptionFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
     await axios.patch(`/api/course/${courseId}/chapters/${chapterId}`, values)
     toast.success("Chapter updated");
     toggleEdit();
     router.refresh();
    } catch {
      toast.error("Someting went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter description
        <Button variant="ghost" onClick={toggleEdit}>
          {isEidting ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit description
            </>
          )}
        </Button>
      </div>
      {!isEidting && (
        <div className={cn(
          "text-sm mt-2", 
        !initialData?.description && "text-slate-500 italic")}>
         {!initialData?.description && "No description"}
         {initialData?.description && (
          <Preview value={initialData?.description}/>
         )}
        </div>
       
      )}
      {isEidting && (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
           
                <FormControl>
                  <Editor 
                   {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-x-2">
           
            <Button type="submit" disabled={!isValid || isSubmitting}>Save</Button>
          </div>
        </form>
      </Form>
      )}
    </div>
  );
};
