"use client";
import axios, { toFormData } from "axios";
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
import { Pencil, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import ChapterList from "./chapter-list";

const formSchema = z.object({
  title: z.string().min(1),
});

interface ChapterFormProps {
  initialData: {
    title: string;
    description: string;

  };
  chapters: [];
  courseId: string;
}

export const ChapterForm = ({ initialData, courseId, chapters }: ChapterFormProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const router = useRouter();
  const toggleCreating = () => {
    setCreating((c) => !c);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axios.post(`/api/course/${courseId}/chapters`, values);
      toast.success("Chapter created");
      toggleCreating();
      router.refresh();
    } catch (error) {
      toast.error("Someting went wrong");
    }
  }

  const onReorder = async (updateData: {_id: string; position: number;}[]) => {
   try {
     setIsUpdating(true);
     await axios.put(`/api/course/${courseId}/chapters/reorder`, {
       list: updateData
     })
     toast.success("Ordered")
     router.refresh()
   } catch {
    toast.error("Someting went wrong")
   }
  }
  
  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${id}`)
  }
  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course chapters
        <Button variant="ghost" onClick={toggleCreating}>
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a chapter
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction to computer"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-x-2">
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Create
              </Button>
            </div>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "text-sm mt-2",
            !chapters?.length && "text-slate-500 italic"
          )}
        >
          {!chapters?.length && "No chapters"}
          <ChapterList
          onEdit={onEdit}
          onReorder={onReorder}
          items={chapters || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Drag and drop to reorder the chapters
        </p>
      )}
    </div>
  );
};
