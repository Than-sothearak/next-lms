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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/format";

const formSchema = z.object({
  price: z.string().min(2, {
    message: "price is required",
  }),
});

interface PriceFormProps {
  initialData: {
    price: number
  };
    courseId: string;
  };
  

export const PriceForm = ({ initialData, courseId}: PriceFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: initialData?.price?.toString() || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
     await axios.patch(`/api/course/${courseId}`, values)
     toast.success("Price updated");
     toggleEdit();
     router.refresh();
    } catch (error){
      toast.error("Someting went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course price
        <Button variant="ghost" onClick={toggleEdit}>
          {isEidting ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit price
            </>
          )}
        </Button>
      </div>
      {!isEidting && (
        <p className={cn(
          "text-sm mt-2", 
        !initialData.price && "text-slate-500 italic")}>
         {initialData.price
         ?  formatPrice(initialData.price)
         : "No price"}
        
        </p>
     
       
      )}
      {isEidting && (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
           
                <FormControl>
                  <Input 
                    placeholder="e.g. '29$' "
                    disabled={isSubmitting}
                    {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display price.
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
