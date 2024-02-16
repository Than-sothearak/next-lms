"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import "react-quill/dist/react-quill.snow.css";

interface EditorProps {
    onChnage: (value: string) => void;
    value: string
}

export const Editor = ({
    onChnage,
    value
}: EditorProps
    ) => {
  const ReactQuill = useMemo(() => dynamic(()=> import("react-quill"), {ssr: false}), [])

  return (
    <div className="bg-white">
        <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChnage}
        />
    </div>
  )
}