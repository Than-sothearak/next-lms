"use client";
import { LoadingButton } from "@/components/ui/loading-button";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

interface ChapterAccessFormProps {
  initialData: {
    isFree: boolean;
  };
  courseId: string;
  chapterId: string;
}

export const ChapterAccessForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterAccessFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData?.isFree,
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const isFree = form.watch("isFree");
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axios.patch(
        `/api/course/${courseId}/chapters/${chapterId}`,
        values
      );
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
        Chapter access
        <Button variant="ghost" onClick={toggleEdit}>
          {isEidting ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit access
            </>
          )}
        </Button>
      </div>
      {!isEidting && (
        <div
          className={cn(
            "text-sm mt-2 italic",
            !initialData?.isFree ? "text-red-500" : "text-green-500"
          )}
        >
         <p>
         {initialData?.isFree ? (
            <>This chapter is free</>
          ): (
            <>This chapter is not free</>
          )}
         </p>
        </div>
      )}
      {isEidting && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <label className="flex flex-row items-start gap-3 rounded-md border p-4">
              <Checkbox
                checked={isFree}
                onCheckedChange={(checked) => form.setValue("isFree", checked === true, { shouldValidate: true })}
              />
              <span className="text-sm leading-none">Check this box to make this chapter free</span>
            </label>
            <div className="flex gap-x-2">
              <LoadingButton type="submit" loading={isSubmitting} loadingText="Saving..." disabled={!isValid}>
                Save
              </LoadingButton>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
