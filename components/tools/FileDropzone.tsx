"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  label?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({
  onFilesSelected,
  accept,
  maxSize = 500 * 1024 * 1024,
  multiple = false,
  label,
}: FileDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const acceptObj = accept
    ? Object.fromEntries(accept.split(",").map((t) => [t.trim(), []]))
    : undefined;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedFiles(acceptedFiles);
      onFilesSelected(acceptedFiles);
    },
    accept: acceptObj,
    maxSize,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-xl border-2 border-dashed bg-bg-card cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "dropzone-active border-primary"
          : "border-border hover:border-primary/50"
      }`}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <div className="flex flex-col items-center gap-3">
          <Upload className="w-12 h-12 text-primary animate-bounce" />
          <p className="text-lg font-semibold text-primary">Drop it!</p>
        </div>
      ) : selectedFiles.length > 0 ? (
        <div className="flex flex-col items-center gap-3">
          <FileText className="w-12 h-12 text-primary" />
          {selectedFiles.map((file, i) => (
            <p key={i} className="text-sm text-text-primary">
              {file.name}{" "}
              <span className="text-text-secondary">
                ({formatFileSize(file.size)})
              </span>
            </p>
          ))}
          <p className="text-xs text-text-muted">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="w-12 h-12 text-text-muted" />
          <p className="text-lg font-medium text-text-primary">
            {label || "Drag & drop your file here"}
          </p>
          <p className="text-sm text-text-muted">
            or click to browse &mdash; max {formatFileSize(maxSize)}
          </p>
        </div>
      )}
    </div>
  );
}
