"use client";
import axios from "axios";
import { useRouter } from "next/navigation";

import { File, ImageIcon, Loader2, Pencil, PlusCircle, Target, Upload, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";


interface AttactmentFormProps {
  course: {
    attachment: string[];
  };
  courseId: string;
  attachmentsProps: {
    _id: string,
    url: string;
    name: string;
  }[];
  attachments: string;
}
export const AttactmentForm = ({
  course,
  courseId,
  attachmentsProps,
  attachments,
}: AttactmentFormProps) => {
  const [isEidting, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<globalThis.File | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [url, setUrl] = useState<any>("");
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing((editing) => !editing);
  };
  
  const name = fileName?.name
  async function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (uploading || saving) return;
    const files = e.target.files?.[0];
    if (!files) return;
    setFileName(files || null)
    setUrl("");
    try {
      
      setUploading(true);
      const formData = new FormData();
      formData.append("file", files);
      
      const res = await axios.post(`/api/upload-attachment/`, formData);
      if (!res.data.link) throw new Error("Upload did not return a URL");
      setUrl(res.data.link);
    } catch {
      toast.error("File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleOnSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!url || uploading || saving) return;
    setSaving(true);
    const values = {
      url,
      name,
    };

    try {
      await axios.post(`/api/course/${courseId}/attachment`, values);
      toast.success("File updated");
      toggleEdit();
      setUrl("");
      setFileName(null);
      router.refresh()
    } catch (error) {
      toast.error("Could not save the file. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/course/${courseId}/attachment/${id}`);
      toast.success("Attachment deleted");
      router.refresh();
    } catch (error){
      toast.error(axios.isAxiosError(error) && typeof error.response?.data === "string" ? error.response.data : "Could not delete attachment");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course attactment
        <Button type="button" variant="ghost" onClick={toggleEdit} disabled={uploading || saving}>
          {isEidting && <>Cancel</>}
          {!isEidting && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add file
            </>
          )}
        </Button>
      </div>

      {!isEidting && (
        <>
          {attachments?.length === 0 ? (
            <p className="text-sm mt-2 text-slate-500 italic">
              No attachments yet
            </p>
          ) : (
            <div className="space-y-2">
              {attachmentsProps.map((attachment: {
                _id: string
                name: string
              }) =>  (
                <div
                  key={attachment._id}
                  className="flex items-center p-3 w-full bg-blue-100 border-blue-200 border text-blue-700 rounded-md"
                >
                  <File className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-xs line-clamp-1">
                    {attachment.name}
                  </p>
                  {deletingId === attachment._id && (
                    <div>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {deletingId !== attachment._id && (
                    <button
                      onClick={() => onDelete(attachment._id)}
                      className="ml-auto hover:opacity-75 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {isEidting && (
        <form onSubmit={handleOnSubmit}>
          <label className="flex flex-col justify-center items-center border-4 h-60 rounded-md border-dotted cursor-pointer">
            {!url && <h2 className="text-blue-500">Add file here</h2>}
            <input
              className=""
              onChange={handleOnChange}
              type="file"
              disabled={uploading || saving}
              name="image"
            />
          </label>
          <div className="text-xs text-muted-foreground mt-4">
            <p>16:0 aspect ratio recommend</p>
          </div>

          <LoadingButton type="submit" loading={uploading || saving} loadingText={uploading ? "Uploading..." : "Saving..."} disabled={!url} className="mt-5">
            Save file
          </LoadingButton>
        </form>
      )}
    </div>
  );
};
