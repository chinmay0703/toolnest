"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

interface DownloadButtonProps {
  data: Blob | null;
  filename: string;
  label?: string;
  disabled?: boolean;
}

export function DownloadButton({
  data,
  filename,
  label = "Download",
  disabled = false,
}: DownloadButtonProps) {
  const handleDownload = useCallback(() => {
    if (!data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data, filename]);

  return (
    <motion.button
      onClick={handleDownload}
      disabled={disabled || !data}
      className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-shadow hover:shadow-xl"
      whileHover={!disabled && data ? { scale: 1.05 } : {}}
      whileTap={!disabled && data ? { scale: 0.97 } : {}}
      animate={
        !disabled && data
          ? { y: [0, -4, 0] }
          : {}
      }
      transition={
        !disabled && data
          ? { y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }
          : {}
      }
    >
      <Download className="w-6 h-6" />
      {label}
    </motion.button>
  );
}
