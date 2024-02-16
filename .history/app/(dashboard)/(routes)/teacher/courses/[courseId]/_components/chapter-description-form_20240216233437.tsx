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

const formSchema = z.object({
  description: z.string().min(2, {
    message: "description is required",
  }),
});

interface DesciptionFormProps {
  initialData: {
    description: string
  };
    courseId: string;
  };
  

export const DesciptionForm = ({ initialData, courseId}: DesciptionFormProps) => {
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
     await axios.patch(`/api/course/${courseId}`, values)
     toast.success("Course updated");
     toggleEdit();
     router.refresh();
    } catch {
      toast.error("Someting went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course description
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
        <p className={cn(
          "text-sm mt-2", 
        !initialData.description && "text-slate-500 italic")}>
         {initialData.description || "No description"}
        </p>
       
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
                  <Textarea 
                  placeholder="e.g. 'Computer science' "
                  disabled={isSubmitting}
                  {...field} />
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
