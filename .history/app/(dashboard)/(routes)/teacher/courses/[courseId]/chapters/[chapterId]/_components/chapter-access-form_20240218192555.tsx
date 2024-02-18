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
  FormisFree,
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
  isFree: z.boolean().default(false),
});

interface ChapterAccessFormProps {
  initialData: {
    isFree: string
  };
    courseId: string;
    chapterId: string;
  };
  

export const ChapterAccessForm = ({ initialData, courseId, chapterId}: ChapterAccessFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData.isFree
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
        Chapter isFree
        <Button variant="ghost" onClick={toggleEdit}>
          {isEidting ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit isFree
            </>
          )}
        </Button>
      </div>
      {!isEidting && (
        <div className={cn(
          "text-sm mt-2", 
        !initialData.isFree && "text-slate-500 italic")}>
         {!initialData.isFree && "No isFree"}
         {initialData.isFree && (
          <Preview value={initialData.isFree}/>
         )}
        </div>
       
      )}
      {isEidting && (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
           
                <FormControl>
                 
                </FormControl>
                <FormisFree>
                  This is your public display name.
                </FormisFree>
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
