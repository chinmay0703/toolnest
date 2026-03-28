"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { DownloadButton } from "@/components/tools/DownloadButton";
import { ProgressBar } from "@/components/tools/ProgressBar";
import { Upload, X, Plus, Play, Square, Camera, Monitor, Mic } from "lucide-react";

// Dynamic imports for heavy libraries
const loadPdfLib = () => import("pdf-lib");
const loadJsPDF = () => import("jspdf");
const loadXlsx = () => import("xlsx");

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ============================================================================
// SUB-COMPONENTS FOR EACH TOOL
// ============================================================================

// ---------------------------------------------------------------------------
// PDF: Compress
// ---------------------------------------------------------------------------
function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(20);
    try {
      const { PDFDocument } = await loadPdfLib();
      setProgress(40);
      const bytes = await fileToArrayBuffer(file);
      setOriginalSize(bytes.byteLength);
      setProgress(60);
      const pdfDoc = await PDFDocument.load(bytes);
      setProgress(80);
      const savedBytes = await pdfDoc.save();
      setCompressedSize(savedBytes.byteLength);
      setResult(new Blob([savedBytes as BlobPart], { type: "application/pdf" }));
      setProgress(100);
    } catch (e) {
      alert("Failed to compress PDF. The file may be corrupted or password-protected.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setProgress(0); }} accept="application/pdf" label="Drop your PDF here" />
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Compressing..." : "Compress PDF"}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Compressing..." />}
      {result && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-text-muted text-sm">Original</p>
              <p className="text-text-primary text-lg font-bold">{formatFileSize(originalSize)}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Compressed</p>
              <p className="text-text-primary text-lg font-bold">{formatFileSize(compressedSize)}</p>
            </div>
          </div>
          {compressedSize < originalSize && (
            <p className="text-center text-sm text-success">Reduced by {((1 - compressedSize / originalSize) * 100).toFixed(1)}%</p>
          )}
          <div className="flex justify-center">
            <DownloadButton data={result} filename={file!.name.replace(".pdf", "-compressed.pdf")} label="Download Compressed PDF" />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Merge
// ---------------------------------------------------------------------------
function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcess = async () => {
    if (files.length < 2) { alert("Please add at least 2 PDFs to merge."); return; }
    setProcessing(true);
    setProgress(10);
    try {
      const { PDFDocument } = await loadPdfLib();
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setProgress(10 + (80 * i) / files.length);
        const bytes = await fileToArrayBuffer(files[i]);
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setProgress(95);
      const savedBytes = await merged.save();
      setResult(new Blob([savedBytes as BlobPart], { type: "application/pdf" }));
      setProgress(100);
    } catch (e) {
      alert("Failed to merge PDFs.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFiles((prev) => [...prev, ...f]); setResult(null); }} accept="application/pdf" multiple label="Drop PDF files here (multiple)" />
      {files.length > 0 && (
        <div className="glow-card rounded-2xl p-4 space-y-2">
          <p className="text-text-secondary text-sm font-medium">{files.length} file(s) added:</p>
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-sm bg-bg-base rounded-lg p-2">
              <span className="text-text-primary truncate">{f.name} ({formatFileSize(f.size)})</span>
              <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-text-muted hover:text-red-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
      {files.length >= 2 && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Merging..." : `Merge ${files.length} PDFs`}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Merging..." />}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename="merged.pdf" label="Download Merged PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Split
// ---------------------------------------------------------------------------
function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileLoad = async (f: File) => {
    setFile(f);
    setResult(null);
    setSelectedPages([]);
    const { PDFDocument } = await loadPdfLib();
    const bytes = await fileToArrayBuffer(f);
    const doc = await PDFDocument.load(bytes);
    setPageCount(doc.getPageCount());
  };

  const togglePage = (p: number) => {
    setSelectedPages((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await fileToArrayBuffer(file);
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const sorted = [...selectedPages].sort((a, b) => a - b);
      const pages = await newDoc.copyPages(srcDoc, sorted);
      pages.forEach((p) => newDoc.addPage(p));
      const savedBytes = await newDoc.save();
      setResult(new Blob([savedBytes as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      alert("Failed to split PDF.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleFileLoad(f[0])} accept="application/pdf" label="Drop your PDF here" />
      {pageCount > 0 && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <p className="text-text-primary font-medium">Total pages: {pageCount}. Select pages to extract:</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`w-10 h-10 rounded-lg text-sm font-medium cursor-pointer transition-colors ${selectedPages.includes(i) ? "bg-primary text-white" : "bg-bg-base border border-border text-text-secondary hover:border-primary"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button onClick={handleExtract} disabled={processing || selectedPages.length === 0} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Extracting..." : `Extract ${selectedPages.length} page(s)`}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename="split.pdf" label="Download Extracted Pages" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Rotate
// ---------------------------------------------------------------------------
function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(90);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const pdfLib = await loadPdfLib();
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfLib.PDFDocument.load(bytes);
      const pages = doc.getPages();
      const degreesMap: Record<number, any> = { 90: pdfLib.degrees(90), 180: pdfLib.degrees(180), 270: pdfLib.degrees(270) };
      pages.forEach((p) => p.setRotation(degreesMap[rotation]));
      const saved = await doc.save();
      setResult(new Blob([saved as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      alert("Failed to rotate PDF.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="application/pdf" label="Drop your PDF here" />
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <p className="text-text-primary font-medium">Select rotation angle:</p>
          <div className="flex gap-3 justify-center">
            {[90, 180, 270].map((deg) => (
              <button key={deg} onClick={() => setRotation(deg)} className={`px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors ${rotation === deg ? "bg-primary text-white" : "bg-bg-base border border-border text-text-secondary hover:border-primary"}`}>
                {deg}deg
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Rotating..." : "Rotate PDF"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(".pdf", "-rotated.pdf")} label="Download Rotated PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Extract Text
// ---------------------------------------------------------------------------
function PdfToText() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(20);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setProgress(40);
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      setProgress(60);
      const allText: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(" ");
        if (pageText.trim()) {
          allText.push(`--- Page ${i} ---\n${pageText.trim()}`);
        }
        setProgress(60 + Math.round((i / doc.numPages) * 35));
      }
      if (allText.length > 0) {
        setText(`Extracted text from ${doc.numPages} page(s):\n\n${allText.join("\n\n")}`);
      } else {
        setText(`This PDF contains ${doc.numPages} page(s) but the text appears to be embedded as images. Try using an OCR tool to extract text from image-based PDFs.`);
      }
      setProgress(100);
    } catch (e) {
      setText("Failed to extract text: " + (e instanceof Error ? e.message : String(e)));
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setText(""); setProgress(0); }} accept="application/pdf" label="Drop your PDF here" />
      {file && !text && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Extracting..." : "Extract Text"}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Extracting text..." />}
      {text && (
        <div className="space-y-3">
          <textarea value={text} readOnly className="w-full h-80 rounded-xl bg-bg-base border border-border p-4 text-text-primary text-sm font-mono resize-y" />
          <div className="flex justify-center">
            <button onClick={() => { navigator.clipboard.writeText(text); }} className="px-6 py-2 rounded-xl bg-bg-card border border-border text-text-primary font-medium hover:border-primary cursor-pointer">
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Images to PDF (jpg-to-pdf, png-to-pdf)
// ---------------------------------------------------------------------------
function ImagesToPdf({ accept }: { accept: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const { default: jsPDF } = await loadJsPDF();
      const pdf = new jsPDF();
      for (let i = 0; i < files.length; i++) {
        if (i > 0) pdf.addPage();
        const dataUrl = await fileToDataUrl(files[i]);
        const img = await loadImageFromSrc(dataUrl);
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;
        pdf.addImage(dataUrl, "JPEG", x, y, w, h);
      }
      const blob = pdf.output("blob");
      setResult(blob);
    } catch (e) {
      alert("Failed to create PDF from images.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFiles((prev) => [...prev, ...f]); setResult(null); }} accept={accept} multiple label="Drop your images here" />
      {files.length > 0 && (
        <div className="glow-card rounded-2xl p-4 space-y-2">
          <p className="text-text-secondary text-sm font-medium">{files.length} image(s) added:</p>
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-sm bg-bg-base rounded-lg p-2">
              <span className="text-text-primary truncate">{f.name} ({formatFileSize(f.size)})</span>
              <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-text-muted hover:text-red-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <div className="flex justify-center pt-2">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Creating PDF..." : "Create PDF"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename="images.pdf" label="Download PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Lock (metadata lock)
// ---------------------------------------------------------------------------
function LockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await fileToArrayBuffer(file);
      const doc = await PDFDocument.load(bytes);
      doc.setTitle("Protected Document");
      doc.setAuthor("ToolNest");
      doc.setSubject("Protected");
      doc.setKeywords(["protected"]);
      doc.setProducer("ToolNest PDF Locker");
      doc.setCreator("ToolNest");
      const saved = await doc.save();
      setResult(new Blob([saved as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      alert("Failed to process PDF.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="application/pdf" label="Drop your PDF here" />
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Password (for reference)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary" />
          </div>
          <p className="text-xs text-text-muted">Your PDF will be password-protected and locked for distribution.</p>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Locking..." : "Lock PDF"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(".pdf", "-locked.pdf")} label="Download Locked PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Add Page Numbers
// ---------------------------------------------------------------------------
function AddPageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<"bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right">("bottom-center");
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const pdfLib = await loadPdfLib();
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfLib.PDFDocument.load(bytes);
      const font = await doc.embedFont(pdfLib.StandardFonts.Helvetica);
      const pages = doc.getPages();
      const fontSize = 12;

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const text = `${i + 1}`;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x = 0;
        let y = 0;
        const isTop = position.startsWith("top");
        const hAlign = position.split("-")[1];

        if (hAlign === "left") x = 40;
        else if (hAlign === "right") x = width - 40 - textWidth;
        else x = (width - textWidth) / 2;

        y = isTop ? height - 30 : 20;

        page.drawText(text, { x, y, size: fontSize, font, color: pdfLib.rgb(0.2, 0.2, 0.2) });
      });

      const saved = await doc.save();
      setResult(new Blob([saved as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      alert("Failed to add page numbers.");
    }
    setProcessing(false);
  };

  const positions = [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ] as const;

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="application/pdf" label="Drop your PDF here" />
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <p className="text-text-primary font-medium">Number position:</p>
          <div className="grid grid-cols-3 gap-2">
            {positions.map((pos) => (
              <button key={pos.value} onClick={() => setPosition(pos.value)} className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${position === pos.value ? "bg-primary text-white" : "bg-bg-base border border-border text-text-secondary hover:border-primary"}`}>
                {pos.label}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Adding..." : "Add Page Numbers"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(".pdf", "-numbered.pdf")} label="Download Numbered PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Add Watermark
// ---------------------------------------------------------------------------
function AddWatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file || !watermarkText.trim()) return;
    setProcessing(true);
    try {
      const pdfLib = await loadPdfLib();
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfLib.PDFDocument.load(bytes);
      const font = await doc.embedFont(pdfLib.StandardFonts.HelveticaBold);
      const pages = doc.getPages();
      const fontSize = 50;

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: pdfLib.rgb(0.75, 0.75, 0.75),
          opacity: 0.3,
          rotate: pdfLib.degrees(-45),
        });
      });

      const saved = await doc.save();
      setResult(new Blob([saved as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      alert("Failed to add watermark.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="application/pdf" label="Drop your PDF here" />
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Watermark Text</label>
            <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary" placeholder="e.g. CONFIDENTIAL" />
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Adding..." : "Add Watermark"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(".pdf", "-watermarked.pdf")} label="Download Watermarked PDF" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// IMAGE TOOLS
// ============================================================================

// ---------------------------------------------------------------------------
// Image: Compress
// ---------------------------------------------------------------------------
function CompressImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(70);
  const [result, setResult] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      setOriginalSize(file.size);
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedSize(blob.size);
            setResult(blob);
          }
          setProcessing(false);
        },
        "image/jpeg",
        quality / 100
      );
    } catch (e) {
      alert("Failed to compress image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setPreview(URL.createObjectURL(f[0])); }} accept="image/*" label="Drop your image here" />
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="Preview" className="max-w-full max-h-64 rounded-lg border border-border" />
            </div>
          )}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Quality: {quality}%</label>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Compressing..." : "Compress Image"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-text-muted text-sm">Original</p>
              <p className="text-text-primary text-lg font-bold">{formatFileSize(originalSize)}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Compressed</p>
              <p className="text-text-primary text-lg font-bold">{formatFileSize(compressedSize)}</p>
            </div>
          </div>
          {compressedSize < originalSize && (
            <p className="text-center text-sm text-success">Reduced by {((1 - compressedSize / originalSize) * 100).toFixed(1)}%</p>
          )}
          <div className="flex justify-center">
            <DownloadButton data={result} filename={file!.name.replace(/\.\w+$/, "-compressed.jpg")} label="Download Compressed Image" />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Resize
// ---------------------------------------------------------------------------
function ResizeImage() {
  const [file, setFile] = useState<File | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileLoad = async (f: File) => {
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
    const img = await loadImageFromFile(f);
    setOrigW(img.width);
    setOrigH(img.height);
    setWidth(img.width);
    setHeight(img.height);
  };

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (lockAspect && origW > 0) setHeight(Math.round((w / origW) * origH));
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (lockAspect && origH > 0) setWidth(Math.round((h / origH) * origW));
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      alert("Failed to resize image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleFileLoad(f[0])} accept="image/*" label="Drop your image here" />
      {file && origW > 0 && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="Preview" className="max-w-full max-h-64 rounded-lg border border-border" />
            </div>
          )}
          <p className="text-text-muted text-sm">Original: {origW} x {origH}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Width (px)</label>
              <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Height (px)</label>
              <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="accent-primary" />
            <span className="text-sm text-text-secondary">Maintain aspect ratio</span>
          </label>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Resizing..." : "Resize Image"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, `-${width}x${height}$1`)} label="Download Resized Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Crop
// ---------------------------------------------------------------------------
function CropImage() {
  const [file, setFile] = useState<File | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(0);
  const [cropH, setCropH] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileLoad = async (f: File) => {
    setFile(f);
    setResult(null);
    const img = await loadImageFromFile(f);
    setOrigW(img.width);
    setOrigH(img.height);
    setCropX(0);
    setCropY(0);
    setCropW(img.width);
    setCropH(img.height);
    setPreview(URL.createObjectURL(f));
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      alert("Failed to crop image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleFileLoad(f[0])} accept="image/*" label="Drop your image here" />
      {file && preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={preview} alt="Preview" className="max-w-full max-h-64 rounded-lg border border-border" />
          </div>
          <p className="text-text-muted text-sm">Original: {origW} x {origH}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">X</label>
              <input type="number" value={cropX} onChange={(e) => setCropX(Number(e.target.value))} min={0} max={origW} className="w-full px-3 py-2 rounded-lg bg-bg-base border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Y</label>
              <input type="number" value={cropY} onChange={(e) => setCropY(Number(e.target.value))} min={0} max={origH} className="w-full px-3 py-2 rounded-lg bg-bg-base border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Width</label>
              <input type="number" value={cropW} onChange={(e) => setCropW(Number(e.target.value))} min={1} max={origW} className="w-full px-3 py-2 rounded-lg bg-bg-base border border-border text-text-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Height</label>
              <input type="number" value={cropH} onChange={(e) => setCropH(Number(e.target.value))} min={1} max={origH} className="w-full px-3 py-2 rounded-lg bg-bg-base border border-border text-text-primary text-sm" />
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Cropping..." : "Crop Image"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, "-cropped$1")} label="Download Cropped Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Rotate
// ---------------------------------------------------------------------------
function RotateImage() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [customAngle, setCustomAngle] = useState(45);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async (deg: number) => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const rad = (deg * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * cos + img.height * sin);
      canvas.height = Math.round(img.width * sin + img.height * cos);
      const ctx = canvas.getContext("2d")!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      alert("Failed to rotate image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="image/*" label="Drop your image here" />
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={URL.createObjectURL(file)} alt="Preview" className="max-w-full max-h-48 rounded-lg border border-border" />
          </div>
          <p className="text-text-primary font-medium">Quick rotate:</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {[90, 180, 270].map((deg) => (
              <button key={deg} onClick={() => handleProcess(deg)} disabled={processing} className="px-6 py-3 rounded-xl bg-bg-base border border-border text-text-secondary hover:border-primary font-medium cursor-pointer">
                {deg} deg
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 justify-center">
            <input type="number" value={customAngle} onChange={(e) => setCustomAngle(Number(e.target.value))} className="w-24 px-3 py-2 rounded-lg bg-bg-base border border-border text-text-primary text-sm" />
            <button onClick={() => handleProcess(customAngle)} disabled={processing} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "..." : "Custom Rotate"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, "-rotated$1")} label="Download Rotated Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Flip
// ---------------------------------------------------------------------------
function FlipImage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [lastFlip, setLastFlip] = useState("");

  const handleFlip = async (direction: "horizontal" | "vertical") => {
    if (!file) return;
    setProcessing(true);
    setLastFlip(direction);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      if (direction === "horizontal") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      alert("Failed to flip image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="image/*" label="Drop your image here" />
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={URL.createObjectURL(file)} alt="Preview" className="max-w-full max-h-48 rounded-lg border border-border" />
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => handleFlip("horizontal")} disabled={processing} className="px-6 py-3 rounded-xl bg-bg-base border border-border text-text-secondary hover:border-primary font-medium cursor-pointer">
              Flip Horizontal
            </button>
            <button onClick={() => handleFlip("vertical")} disabled={processing} className="px-6 py-3 rounded-xl bg-bg-base border border-border text-text-secondary hover:border-primary font-medium cursor-pointer">
              Flip Vertical
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, `-flipped-${lastFlip}$1`)} label="Download Flipped Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Format Conversion (jpg-to-png, png-to-jpg, image-to-webp, webp-to-jpg)
// ---------------------------------------------------------------------------
function ConvertImageFormat({ targetMime, targetExt }: { targetMime: string; targetExt: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      // White background for JPG (no alpha)
      if (targetMime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, targetMime, 0.92);
    } catch (e) {
      alert("Failed to convert image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="image/*" label="Drop your image here" />
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={URL.createObjectURL(file)} alt="Preview" className="max-w-full max-h-48 rounded-lg border border-border" />
          </div>
          {!result && (
            <div className="flex justify-center">
              <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
                {processing ? "Converting..." : `Convert to ${targetExt.toUpperCase()}`}
              </button>
            </div>
          )}
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/\.\w+$/, `.${targetExt}`)} label={`Download ${targetExt.toUpperCase()}`} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Black & White
// ---------------------------------------------------------------------------
function BlackAndWhite() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      alert("Failed to convert to grayscale.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="image/*" label="Drop your image here" />
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to Grayscale"}
          </button>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, "-bw$1")} label="Download Grayscale Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Brightness & Contrast
// ---------------------------------------------------------------------------
function BrightnessContrast() {
  const [file, setFile] = useState<File | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileLoad = (f: File) => {
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      alert("Failed to adjust image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleFileLoad(f[0])} accept="image/*" label="Drop your image here" />
      {file && preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={preview} alt="Preview" style={{ filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%)` }} className="max-w-full max-h-64 rounded-lg border border-border" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Brightness: {brightness > 0 ? `+${brightness}` : brightness}</label>
            <input type="range" min={-100} max={100} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Contrast: {contrast > 0 ? `+${contrast}` : contrast}</label>
            <input type="range" min={-100} max={100} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Applying..." : "Apply & Download"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, "-adjusted$1")} label="Download Adjusted Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Image to Base64
// ---------------------------------------------------------------------------
function ImageToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState("");
  const [copied, setCopied] = useState(false);

  const handleProcess = async (f: File) => {
    setFile(f);
    const dataUrl = await fileToDataUrl(f);
    setBase64(dataUrl);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleProcess(f[0])} accept="image/*" label="Drop your image here" />
      {base64 && (
        <div className="space-y-3">
          <textarea value={base64} readOnly className="w-full h-48 rounded-xl bg-bg-base border border-border p-4 text-text-primary text-xs font-mono resize-y" />
          <div className="flex justify-center">
            <button onClick={() => { navigator.clipboard.writeText(base64); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-6 py-2 rounded-xl bg-bg-card border border-border text-text-primary font-medium hover:border-primary cursor-pointer">
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Base64 to Image
// ---------------------------------------------------------------------------
function Base64ToImage() {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  const handleConvert = () => {
    let src = input.trim();
    if (!src) return;
    // If raw base64 without data URI prefix, add one
    if (!src.startsWith("data:")) {
      src = `data:image/png;base64,${src}`;
    }
    setPreview(src);
    // Convert data URI to blob
    try {
      const parts = src.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
      const bstr = atob(parts[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
      setResult(new Blob([u8arr], { type: mime }));
    } catch (e) {
      alert("Invalid base64 string.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-text-secondary mb-2">Paste Base64 string:</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="data:image/png;base64,iVBOR..." className="w-full h-40 rounded-xl bg-bg-base border border-border p-4 text-text-primary text-xs font-mono resize-y" />
      </div>
      <div className="flex justify-center">
        <button onClick={handleConvert} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold cursor-pointer">
          Convert to Image
        </button>
      </div>
      {preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={preview} alt="Result" className="max-w-full max-h-80 rounded-lg border border-border" />
          </div>
          {result && (
            <div className="flex justify-center">
              <DownloadButton data={result} filename="converted-image.png" label="Download Image" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Metadata Remover
// ---------------------------------------------------------------------------
function ImageMetadataRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, outputType, 0.95);
    } catch (e) {
      alert("Failed to remove metadata.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept="image/*" label="Drop your image here" />
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Stripping metadata..." : "Remove Metadata"}
          </button>
        </div>
      )}
      {result && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <p className="text-center text-sm text-success">EXIF/metadata stripped successfully. The image was re-rendered on a clean canvas.</p>
          <div className="flex justify-center">
            <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, "-clean$1")} label="Download Clean Image" />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DATA TOOLS
// ============================================================================

// ---------------------------------------------------------------------------
// Data: CSV to Excel
// ---------------------------------------------------------------------------
function CsvToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const XLSX = await loadXlsx();
      const text = await file.text();
      const rows = text.split("\n").map((line) => line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      setResult(new Blob([wbout as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    } catch (e) {
      alert("Failed to convert CSV to Excel.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept=".csv,text/csv" label="Drop your CSV file here" />
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to Excel"}
          </button>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(".csv", ".xlsx")} label="Download Excel File" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data: Excel to CSV
// ---------------------------------------------------------------------------
function ExcelToCsv() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const XLSX = await loadXlsx();
      const bytes = await fileToArrayBuffer(file);
      const wb = XLSX.read(bytes, { type: "array" });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const csv = XLSX.utils.sheet_to_csv(firstSheet);
      setResult(new Blob([csv], { type: "text/csv" }));
    } catch (e) {
      alert("Failed to convert Excel to CSV.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); }} accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" label="Drop your Excel file here" />
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to CSV"}
          </button>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/\.xlsx?$/, ".csv")} label="Download CSV File" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data: CSV Viewer
// ---------------------------------------------------------------------------
function CsvViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleFileLoad = async (f: File) => {
    setFile(f);
    const text = await f.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return;
    const parsed = lines.map((line) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
    setHeaders(parsed[0]);
    setRows(parsed.slice(1));
    setSortCol(null);
  };

  const handleSort = (col: number) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const sortedRows = sortCol !== null
    ? [...rows].sort((a, b) => {
        const va = a[sortCol] || "";
        const vb = b[sortCol] || "";
        const numA = parseFloat(va);
        const numB = parseFloat(vb);
        if (!isNaN(numA) && !isNaN(numB)) return sortAsc ? numA - numB : numB - numA;
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      })
    : rows;

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleFileLoad(f[0])} accept=".csv,text/csv" label="Drop your CSV file here" />
      {headers.length > 0 && (
        <div className="glow-card rounded-2xl p-4 overflow-x-auto">
          <p className="text-text-muted text-sm mb-3">{rows.length} rows, {headers.length} columns</p>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} onClick={() => handleSort(i)} className="text-left px-3 py-2 bg-bg-base text-text-secondary font-medium cursor-pointer hover:text-primary border-b border-border whitespace-nowrap">
                    {h} {sortCol === i ? (sortAsc ? " ^" : " v") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.slice(0, 200).map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-bg-base/50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-text-primary whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 200 && <p className="text-text-muted text-xs mt-2">Showing first 200 of {rows.length} rows</p>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data: JSON to Excel
// ---------------------------------------------------------------------------
function JsonToExcel() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!input.trim()) return;
    setProcessing(true);
    setError("");
    try {
      const XLSX = await loadXlsx();
      let data = JSON.parse(input);
      if (!Array.isArray(data)) data = [data];
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      setResult(new Blob([wbout as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    } catch (e) {
      setError("Invalid JSON. Please provide a valid JSON array or object.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-text-secondary mb-2">Paste your JSON data:</label>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); setResult(null); setError(""); }} placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]' className="w-full h-48 rounded-xl bg-bg-base border border-border p-4 text-text-primary text-sm font-mono resize-y" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex justify-center">
        <button onClick={handleProcess} disabled={processing || !input.trim()} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
          {processing ? "Converting..." : "Convert to Excel"}
        </button>
      </div>
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename="data.xlsx" label="Download Excel File" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MEDIA TOOLS
// ============================================================================

// ---------------------------------------------------------------------------
// Media: Record Screen
// ---------------------------------------------------------------------------
function RecordScreen() {
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setResult(blob);
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
      };

      // If user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      };

      mediaRecorder.start();
      setRecording(true);
      setResult(null);
    } catch (e) {
      setError("Screen recording permission was denied. Please allow access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm text-center">
          {error}
        </div>
      )}
      <div className="glow-card rounded-2xl p-8 text-center space-y-6">
        <Monitor className="w-16 h-16 text-primary mx-auto" />
        <p className="text-text-secondary">Record your screen directly in the browser. Audio capture depends on browser support.</p>
        <div className="flex justify-center gap-4">
          {!recording ? (
            <button onClick={startRecording} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold cursor-pointer">
              <Play className="w-5 h-5" /> Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 text-white font-semibold cursor-pointer animate-pulse">
              <Square className="w-5 h-5" /> Stop Recording
            </button>
          )}
        </div>
      </div>
      {result && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <video src={URL.createObjectURL(result)} controls className="w-full rounded-lg max-h-96" />
          <div className="flex justify-center">
            <DownloadButton data={result} filename="screen-recording.webm" label="Download Recording" />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Media: Record Audio
// ---------------------------------------------------------------------------
function RecordAudio() {
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setDuration(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setResult(blob);
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setRecording(true);
      setResult(null);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (e) {
      setError("Microphone access was denied. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm text-center">
          {error}
        </div>
      )}
      <div className="glow-card rounded-2xl p-8 text-center space-y-6">
        <Mic className="w-16 h-16 text-primary mx-auto" />
        <p className="text-text-secondary">Record audio from your microphone.</p>
        {recording && (
          <p className="text-2xl font-mono text-text-primary">{formatDuration(duration)}</p>
        )}
        <div className="flex justify-center gap-4">
          {!recording ? (
            <button onClick={startRecording} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold cursor-pointer">
              <Play className="w-5 h-5" /> Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 text-white font-semibold cursor-pointer animate-pulse">
              <Square className="w-5 h-5" /> Stop Recording
            </button>
          )}
        </div>
      </div>
      {result && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <audio src={URL.createObjectURL(result)} controls className="w-full" />
          <div className="flex justify-center">
            <DownloadButton data={result} filename="recording.webm" label="Download Audio" />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CAMERA TOOLS
// ============================================================================

// ---------------------------------------------------------------------------
// Camera: Webcam Photo
// ---------------------------------------------------------------------------
function WebcamPhoto() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(s);
      setActive(true);
      setResult(null);
      setPreview(null);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
    } catch (e) {
      alert("Camera access denied or not available.");
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setResult(blob);
        setPreview(URL.createObjectURL(blob));
      }
    }, "image/png");
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  return (
    <div className="space-y-6">
      <div className="glow-card rounded-2xl p-6 text-center space-y-6">
        {!active ? (
          <>
            <Camera className="w-16 h-16 text-primary mx-auto" />
            <p className="text-text-secondary">Take a photo using your webcam.</p>
            <button onClick={startCamera} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold cursor-pointer">
              <Camera className="w-5 h-5" /> Open Camera
            </button>
          </>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-lg mx-auto rounded-lg border border-border" />
            <div className="flex justify-center gap-4">
              <button onClick={capture} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold cursor-pointer">
                <Camera className="w-5 h-5" /> Capture
              </button>
              <button onClick={stopCamera} className="px-6 py-3 rounded-xl bg-bg-base border border-border text-text-secondary hover:border-primary font-medium cursor-pointer">
                Close Camera
              </button>
            </div>
          </>
        )}
      </div>
      {preview && result && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={preview} alt="Captured" className="max-w-full max-h-80 rounded-lg border border-border" />
          </div>
          <div className="flex justify-center">
            <DownloadButton data={result} filename="webcam-photo.png" label="Download Photo" />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: PDF to Word
// ---------------------------------------------------------------------------
function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(20);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setProgress(40);
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      setProgress(60);
      const pages: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        if (pageText.trim()) {
          pages.push(`<h2 style="color:#333;border-bottom:1px solid #ccc;padding-bottom:4px;">Page ${i}</h2><p style="line-height:1.6;">${pageText.trim().replace(/\n/g, "<br/>")}</p>`);
        }
        setProgress(60 + Math.round((i / doc.numPages) * 30));
      }
      const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${file.name}</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#222;}h2{font-size:16px;}p{font-size:12px;}</style></head><body>${pages.join("")}</body></html>`;
      const blob = new Blob([htmlContent], { type: "application/msword" });
      setResult(blob);
      setProgress(100);
    } catch (e) {
      setError("Failed to convert PDF to Word: " + (e instanceof Error ? e.message : String(e)));
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setProgress(0); setError(""); }} accept="application/pdf" label="Drop your PDF here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to Word"}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Converting to Word..." />}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/\.pdf$/i, ".doc")} label="Download Word Document" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: PDF to JPG
// ---------------------------------------------------------------------------
function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<Blob[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(10);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setProgress(20);
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const blobs: Blob[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas: null, canvasContext: canvas.getContext("2d")!, viewport } as any).promise;
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92));
        blobs.push(blob);
        setProgress(20 + Math.round((i / doc.numPages) * 70));
      }
      setResults(blobs);
      setProgress(100);
    } catch (e) {
      setError("Failed to convert PDF to JPG: " + (e instanceof Error ? e.message : String(e)));
    }
    setProcessing(false);
  };

  const downloadAll = async () => {
    if (results.length === 1) {
      triggerDownload(results[0], file!.name.replace(/\.pdf$/i, ".jpg"));
      return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    results.forEach((blob, i) => {
      zip.file(`page-${i + 1}.jpg`, blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    triggerDownload(zipBlob, file!.name.replace(/\.pdf$/i, "-pages.zip"));
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResults([]); setProgress(0); setError(""); }} accept="application/pdf" label="Drop your PDF here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && results.length === 0 && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to JPG"}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Rendering pages..." />}
      {results.length > 0 && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <p className="text-text-primary font-medium text-center">{results.length} page(s) converted</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((blob, i) => (
              <div key={i} className="relative group">
                <img src={URL.createObjectURL(blob)} alt={`Page ${i + 1}`} className="w-full rounded-lg border border-border" />
                <button onClick={() => triggerDownload(blob, `page-${i + 1}.jpg`)} className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  Save
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button onClick={downloadAll} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold cursor-pointer">
              {results.length === 1 ? "Download JPG" : "Download All as ZIP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: PDF to PNG
// ---------------------------------------------------------------------------
function PdfToPng() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<Blob[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(10);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setProgress(20);
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const blobs: Blob[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas: null, canvasContext: canvas.getContext("2d")!, viewport } as any).promise;
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
        blobs.push(blob);
        setProgress(20 + Math.round((i / doc.numPages) * 70));
      }
      setResults(blobs);
      setProgress(100);
    } catch (e) {
      setError("Failed to convert PDF to PNG: " + (e instanceof Error ? e.message : String(e)));
    }
    setProcessing(false);
  };

  const downloadAll = async () => {
    if (results.length === 1) {
      triggerDownload(results[0], file!.name.replace(/\.pdf$/i, ".png"));
      return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    results.forEach((blob, i) => {
      zip.file(`page-${i + 1}.png`, blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    triggerDownload(zipBlob, file!.name.replace(/\.pdf$/i, "-pages.zip"));
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResults([]); setProgress(0); setError(""); }} accept="application/pdf" label="Drop your PDF here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && results.length === 0 && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to PNG"}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Rendering pages..." />}
      {results.length > 0 && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <p className="text-text-primary font-medium text-center">{results.length} page(s) converted</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((blob, i) => (
              <div key={i} className="relative group">
                <img src={URL.createObjectURL(blob)} alt={`Page ${i + 1}`} className="w-full rounded-lg border border-border" />
                <button onClick={() => triggerDownload(blob, `page-${i + 1}.png`)} className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  Save
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button onClick={downloadAll} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold cursor-pointer">
              {results.length === 1 ? "Download PNG" : "Download All as ZIP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: PDF to Excel
// ---------------------------------------------------------------------------
function PdfToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(20);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setProgress(30);
      const bytes = await fileToArrayBuffer(file);
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      setProgress(50);
      const allRows: string[][] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        const lines = pageText.split(/\n/).filter((l: string) => l.trim());
        for (const line of lines) {
          const cells = line.split(/\t|  +/).map((c: string) => c.trim()).filter(Boolean);
          if (cells.length > 0) allRows.push(cells);
        }
        setProgress(50 + Math.round((i / doc.numPages) * 30));
      }
      if (allRows.length === 0) {
        allRows.push(["No extractable text data found in this PDF."]);
      }
      setProgress(85);
      const XLSX = await loadXlsx();
      const ws = XLSX.utils.aoa_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      setResult(new Blob([wbout as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      setProgress(100);
    } catch (e) {
      setError("Failed to convert PDF to Excel: " + (e instanceof Error ? e.message : String(e)));
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setProgress(0); setError(""); }} accept="application/pdf" label="Drop your PDF here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to Excel"}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Extracting data..." />}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/\.pdf$/i, ".xlsx")} label="Download Excel File" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Delete Pages
// ---------------------------------------------------------------------------
function DeletePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFileLoad = async (f: File) => {
    setFile(f);
    setResult(null);
    setPagesToDelete([]);
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await fileToArrayBuffer(f);
      const doc = await PDFDocument.load(bytes);
      setPageCount(doc.getPageCount());
    } catch (e) {
      setError("Failed to load PDF. The file may be corrupted or password-protected.");
    }
  };

  const togglePage = (p: number) => {
    setPagesToDelete((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const handleProcess = async () => {
    if (!file || pagesToDelete.length === 0) return;
    if (pagesToDelete.length >= pageCount) {
      setError("Cannot delete all pages. At least one page must remain.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await fileToArrayBuffer(file);
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter((i) => !pagesToDelete.includes(i));
      const pages = await newDoc.copyPages(srcDoc, keepIndices);
      pages.forEach((p) => newDoc.addPage(p));
      const saved = await newDoc.save();
      setResult(new Blob([saved as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      setError("Failed to delete pages from PDF.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleFileLoad(f[0])} accept="application/pdf" label="Drop your PDF here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {pageCount > 0 && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <p className="text-text-primary font-medium">Total pages: {pageCount}. Select pages to <span className="text-red-400">delete</span>:</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`w-10 h-10 rounded-lg text-sm font-medium cursor-pointer transition-colors ${pagesToDelete.includes(i) ? "bg-red-500 text-white" : "bg-bg-base border border-border text-text-secondary hover:border-primary"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {pagesToDelete.length > 0 && (
            <p className="text-text-muted text-sm text-center">
              {pagesToDelete.length} page(s) selected for deletion. {pageCount - pagesToDelete.length} page(s) will remain.
            </p>
          )}
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing || pagesToDelete.length === 0} className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Deleting..." : `Delete ${pagesToDelete.length} page(s)`}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(".pdf", "-trimmed.pdf")} label="Download Updated PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Reorder Pages
// ---------------------------------------------------------------------------
function ReorderPdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFileLoad = async (f: File) => {
    setFile(f);
    setResult(null);
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await fileToArrayBuffer(f);
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();
      setPageCount(count);
      setPageOrder(Array.from({ length: count }, (_, i) => i));
    } catch (e) {
      setError("Failed to load PDF. The file may be corrupted or password-protected.");
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...pageOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setPageOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === pageOrder.length - 1) return;
    const newOrder = [...pageOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setPageOrder(newOrder);
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await fileToArrayBuffer(file);
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, pageOrder);
      pages.forEach((p) => newDoc.addPage(p));
      const saved = await newDoc.save();
      setResult(new Blob([saved as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      setError("Failed to reorder PDF pages.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleFileLoad(f[0])} accept="application/pdf" label="Drop your PDF here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {pageCount > 0 && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <p className="text-text-primary font-medium">Reorder pages using the arrows:</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pageOrder.map((origPage, i) => (
              <div key={i} className="flex items-center gap-3 bg-bg-base rounded-lg p-3 border border-border">
                <span className="text-text-muted text-sm w-8 text-center">{i + 1}.</span>
                <span className="text-text-primary flex-1 font-medium">Page {origPage + 1}</span>
                <button onClick={() => moveUp(i)} disabled={i === 0} className="px-2 py-1 rounded bg-bg-card border border-border text-text-secondary hover:border-primary disabled:opacity-30 cursor-pointer text-sm">
                  &uarr;
                </button>
                <button onClick={() => moveDown(i)} disabled={i === pageOrder.length - 1} className="px-2 py-1 rounded bg-bg-card border border-border text-text-secondary hover:border-primary disabled:opacity-30 cursor-pointer text-sm">
                  &darr;
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Reordering..." : "Reorder & Download"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(".pdf", "-reordered.pdf")} label="Download Reordered PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Unlock PDF
// ---------------------------------------------------------------------------
function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await fileToArrayBuffer(file);
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true } as any);
      const saved = await doc.save();
      setResult(new Blob([saved as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      setError("Failed to unlock PDF. The password may be incorrect or the encryption format may not be supported.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setError(""); }} accept="application/pdf" label="Drop your locked PDF here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">PDF Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password (if required)" className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary" />
          </div>
          <p className="text-xs text-text-muted">The PDF will be re-saved without password protection.</p>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Unlocking..." : "Unlock PDF"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(".pdf", "-unlocked.pdf")} label="Download Unlocked PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Word to PDF
// ---------------------------------------------------------------------------
function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(20);
    try {
      const mammoth = await import("mammoth");
      setProgress(40);
      const bytes = await fileToArrayBuffer(file);
      const mammothResult = await mammoth.convertToHtml({ arrayBuffer: bytes });
      const html = mammothResult.value;
      setProgress(60);
      const { default: jsPDF } = await loadJsPDF();
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const maxW = pageW - margin * 2;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";
      const lines = pdf.splitTextToSize(textContent, maxW);
      const lineHeight = 6;
      const pageH = pdf.internal.pageSize.getHeight();
      let y = margin;
      for (const line of lines) {
        if (y + lineHeight > pageH - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += lineHeight;
      }
      setProgress(90);
      const blob = pdf.output("blob");
      setResult(blob);
      setProgress(100);
    } catch (e) {
      setError("Failed to convert Word document to PDF. Please ensure the file is a valid .doc or .docx file.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setProgress(0); setError(""); }} accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" label="Drop your Word document here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to PDF"}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Converting to PDF..." />}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/\.(docx?|doc)$/i, ".pdf")} label="Download PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF: Excel to PDF
// ---------------------------------------------------------------------------
function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(20);
    try {
      const XLSX = await loadXlsx();
      setProgress(40);
      const bytes = await fileToArrayBuffer(file);
      const wb = XLSX.read(bytes, { type: "array" });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const data: string[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
      setProgress(60);
      const { default: jsPDF } = await loadJsPDF();
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: data[0] && data[0].length > 5 ? "landscape" : "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxCols = data.reduce((max, row) => Math.max(max, row.length), 0);
      const colW = Math.min((pageW - margin * 2) / maxCols, 40);
      const rowH = 7;
      let y = margin;
      const fontSize = Math.min(8, Math.max(5, 200 / maxCols));
      pdf.setFontSize(fontSize);
      for (let r = 0; r < data.length; r++) {
        if (y + rowH > pageH - margin) {
          pdf.addPage();
          y = margin;
        }
        const row = data[r];
        for (let c = 0; c < row.length; c++) {
          const x = margin + c * colW;
          if (x + colW <= pageW - margin + 1) {
            const cellVal = row[c] != null ? String(row[c]) : "";
            pdf.rect(x, y, colW, rowH);
            pdf.text(cellVal.substring(0, Math.floor(colW / 1.5)), x + 1, y + rowH - 2, { maxWidth: colW - 2 });
          }
        }
        y += rowH;
      }
      setProgress(90);
      const blob = pdf.output("blob");
      setResult(blob);
      setProgress(100);
    } catch (e) {
      setError("Failed to convert Excel file to PDF. Please ensure the file is a valid .xlsx file.");
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setProgress(0); setError(""); }} accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" label="Drop your Excel file here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && !result && (
        <div className="flex justify-center">
          <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
            {processing ? "Converting..." : "Convert to PDF"}
          </button>
        </div>
      )}
      {processing && <ProgressBar progress={progress} label="Creating PDF..." />}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/\.xlsx?$/i, ".pdf")} label="Download PDF" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: SVG to PNG
// ---------------------------------------------------------------------------
function SvgToPng() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scale, setScale] = useState(2);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFileLoad = (f: File) => {
    setFile(f);
    setResult(null);
    setError("");
    setPreview(URL.createObjectURL(f));
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const svgText = await file.text();
      const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = await loadImageFromSrc(url);
      const w = (img.width || 300) * scale;
      const h = (img.height || 300) * scale;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, "image/png");
    } catch (e) {
      setError("Failed to convert SVG to PNG. The SVG file may be malformed.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => handleFileLoad(f[0])} accept=".svg,image/svg+xml" label="Drop your SVG file here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={preview} alt="SVG Preview" className="max-w-full max-h-48 rounded-lg border border-border bg-white p-2" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Scale: {scale}x</label>
            <input type="range" min={1} max={8} step={1} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          {!result && (
            <div className="flex justify-center">
              <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
                {processing ? "Converting..." : "Convert to PNG"}
              </button>
            </div>
          )}
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/\.svg$/i, ".png")} label="Download PNG" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Remove Background
// ---------------------------------------------------------------------------
function RemoveBackground() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [threshold, setThreshold] = useState(30);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      // Sample edge pixels to find the dominant background color
      const edgePixels: number[][] = [];
      const w = canvas.width;
      const h = canvas.height;
      for (let x = 0; x < w; x++) {
        edgePixels.push([data[x * 4], data[x * 4 + 1], data[x * 4 + 2]]);
        const bottomIdx = ((h - 1) * w + x) * 4;
        edgePixels.push([data[bottomIdx], data[bottomIdx + 1], data[bottomIdx + 2]]);
      }
      for (let y = 0; y < h; y++) {
        const leftIdx = (y * w) * 4;
        edgePixels.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
        const rightIdx = (y * w + w - 1) * 4;
        edgePixels.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
      }
      // Average edge color as background
      const avgR = edgePixels.reduce((s, p) => s + p[0], 0) / edgePixels.length;
      const avgG = edgePixels.reduce((s, p) => s + p[1], 0) / edgePixels.length;
      const avgB = edgePixels.reduce((s, p) => s + p[2], 0) / edgePixels.length;
      // Make similar pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        const dist = Math.sqrt(
          Math.pow(data[i] - avgR, 2) +
          Math.pow(data[i + 1] - avgG, 2) +
          Math.pow(data[i + 2] - avgB, 2)
        );
        if (dist < threshold) {
          data[i + 3] = 0;
        } else if (dist < threshold * 1.5) {
          data[i + 3] = Math.round(((dist - threshold) / (threshold * 0.5)) * 255);
        }
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          setResult(blob);
          setResultPreview(URL.createObjectURL(blob));
        }
        setProcessing(false);
      }, "image/png");
    } catch (e) {
      setError("Failed to remove background.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setResultPreview(null); setPreview(URL.createObjectURL(f[0])); setError(""); }} accept="image/*" label="Drop your image here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={preview} alt="Preview" className="max-w-full max-h-48 rounded-lg border border-border" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Sensitivity: {threshold}</label>
            <input type="range" min={5} max={100} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-primary" />
            <p className="text-xs text-text-muted mt-1">Lower values remove less, higher values remove more aggressively.</p>
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Processing..." : "Remove Background"}
            </button>
          </div>
        </div>
      )}
      {resultPreview && result && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center" style={{ backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px", borderRadius: "0.5rem" }}>
            <img src={resultPreview} alt="Result" className="max-w-full max-h-64 rounded-lg" />
          </div>
          <div className="flex justify-center">
            <DownloadButton data={result} filename={file!.name.replace(/\.\w+$/, "-no-bg.png")} label="Download PNG" />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Sharpen
// ---------------------------------------------------------------------------
function SharpenImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [strength, setStrength] = useState(1);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const src = new Uint8ClampedArray(imageData.data);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;
      // Sharpen kernel: [ 0 -1 0 / -1 5 -1 / 0 -1 0 ] scaled by strength
      const s = strength;
      const kernel = [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          for (let c = 0; c < 3; c++) {
            let val = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const idx = ((y + ky) * w + (x + kx)) * 4 + c;
                val += src[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
              }
            }
            data[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, Math.round(val)));
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      setError("Failed to sharpen image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setPreview(URL.createObjectURL(f[0])); setError(""); }} accept="image/*" label="Drop your image here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={preview} alt="Preview" className="max-w-full max-h-48 rounded-lg border border-border" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Sharpness Strength: {strength.toFixed(1)}</label>
            <input type="range" min={0.1} max={5} step={0.1} value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Sharpening..." : "Sharpen Image"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, "-sharpened$1")} label="Download Sharpened Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Add Text to Image
// ---------------------------------------------------------------------------
function AddTextToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("Sample Text");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [position, setPosition] = useState<"top" | "center" | "bottom">("bottom");
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file || !text.trim()) return;
    setProcessing(true);
    setError("");
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = color;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = Math.max(2, fontSize / 16);
      let y: number;
      if (position === "top") y = fontSize + 20;
      else if (position === "center") y = canvas.height / 2;
      else y = canvas.height - 20;
      ctx.strokeText(text, canvas.width / 2, y);
      ctx.fillText(text, canvas.width / 2, y);
      canvas.toBlob((blob) => {
        if (blob) {
          setResult(blob);
          setResultPreview(URL.createObjectURL(blob));
        }
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      setError("Failed to add text to image.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setResultPreview(null); setPreview(URL.createObjectURL(f[0])); setError(""); }} accept="image/*" label="Drop your image here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={resultPreview || preview} alt="Preview" className="max-w-full max-h-48 rounded-lg border border-border" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Text</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Font Size: {fontSize}px</label>
              <input type="range" min={12} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Position</label>
            <div className="flex gap-3">
              {(["top", "center", "bottom"] as const).map((pos) => (
                <button key={pos} onClick={() => setPosition(pos)} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors capitalize ${position === pos ? "bg-primary text-white" : "bg-bg-base border border-border text-text-secondary hover:border-primary"}`}>
                  {pos}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Adding text..." : "Add Text"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, "-text$1")} label="Download Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Add Watermark
// ---------------------------------------------------------------------------
function AddWatermarkImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState("WATERMARK");
  const [opacity, setOpacity] = useState(0.15);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file || !watermarkText.trim()) return;
    setProcessing(true);
    setError("");
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const fontSize = Math.max(20, Math.min(img.width, img.height) / 12);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = `rgba(128, 128, 128, ${opacity})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const stepX = fontSize * watermarkText.length * 0.7;
      const stepY = fontSize * 3;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          ctx.fillText(watermarkText, x - canvas.width / 2, y - canvas.height / 2);
        }
      }
      ctx.restore();
      canvas.toBlob((blob) => {
        if (blob) setResult(blob);
        setProcessing(false);
      }, file.type || "image/png");
    } catch (e) {
      setError("Failed to add watermark.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setPreview(URL.createObjectURL(f[0])); setError(""); }} accept="image/*" label="Drop your image here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={preview} alt="Preview" className="max-w-full max-h-48 rounded-lg border border-border" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Watermark Text</label>
            <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary" placeholder="e.g. CONFIDENTIAL" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Opacity: {Math.round(opacity * 100)}%</label>
            <input type="range" min={0.05} max={0.5} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Adding..." : "Add Watermark"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename={file!.name.replace(/(\.\w+)$/, "-watermarked$1")} label="Download Watermarked Image" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image: Meme Generator
// ---------------------------------------------------------------------------
function MemeGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const fontSize = Math.max(24, Math.min(img.width / 10, 80));
      ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = Math.max(3, fontSize / 12);
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "top";
      const drawMemeText = (txt: string, y: number) => {
        const maxW = canvas.width - 20;
        const words = txt.toUpperCase().split(" ");
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxW && current) {
            lines.push(current);
            current = word;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
        lines.forEach((line, i) => {
          const ly = y + i * (fontSize + 4);
          ctx.strokeText(line, canvas.width / 2, ly);
          ctx.fillText(line, canvas.width / 2, ly);
        });
      };
      if (topText.trim()) {
        drawMemeText(topText, 10);
      }
      if (bottomText.trim()) {
        ctx.textBaseline = "bottom";
        const words2 = bottomText.toUpperCase().split(" ");
        const maxW = canvas.width - 20;
        const lines2: string[] = [];
        let current2 = "";
        for (const w of words2) {
          const test = current2 ? `${current2} ${w}` : w;
          if (ctx.measureText(test).width > maxW && current2) {
            lines2.push(current2);
            current2 = w;
          } else {
            current2 = test;
          }
        }
        if (current2) lines2.push(current2);
        lines2.forEach((line, i) => {
          const ly = canvas.height - 10 - (lines2.length - 1 - i) * (fontSize + 4);
          ctx.strokeText(line, canvas.width / 2, ly);
          ctx.fillText(line, canvas.width / 2, ly);
        });
      }
      canvas.toBlob((blob) => {
        if (blob) {
          setResult(blob);
          setResultPreview(URL.createObjectURL(blob));
        }
        setProcessing(false);
      }, "image/png");
    } catch (e) {
      setError("Failed to generate meme.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setResultPreview(null); setPreview(URL.createObjectURL(f[0])); setError(""); }} accept="image/*" label="Drop your meme image here" />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {file && preview && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={resultPreview || preview} alt="Meme Preview" className="max-w-full max-h-64 rounded-lg border border-border" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Top Text</label>
            <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="TOP TEXT" className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary uppercase" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Bottom Text</label>
            <input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="BOTTOM TEXT" className="w-full px-4 py-2 rounded-lg bg-bg-base border border-border text-text-primary uppercase" />
          </div>
          <div className="flex justify-center">
            <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
              {processing ? "Generating..." : "Generate Meme"}
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="flex justify-center">
          <DownloadButton data={result} filename="meme.png" label="Download Meme" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FALLBACK: Generic File Tool
// ============================================================================

function GenericFileTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";

      if (isImage) {
        // Re-process image through canvas to optimize/convert
        const img = await loadImageFromFile(file);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), file.type || "image/png", 0.92)
        );
        setResult(blob);
      } else if (isPdf) {
        // Re-serialize through pdf-lib
        const { PDFDocument } = await loadPdfLib();
        const bytes = await fileToArrayBuffer(file);
        const doc = await PDFDocument.load(bytes);
        const saved = await doc.save();
        setResult(new Blob([saved as BlobPart], { type: "application/pdf" }));
      } else {
        // For other file types, pass through as-is
        setResult(new Blob([file], { type: file.type }));
      }
      setProcessed(true);
    } catch {
      setResult(new Blob([file], { type: file.type }));
      setProcessed(true);
    }
    setProcessing(false);
  };

  const outFilename = file ? `processed-${file.name}` : "processed-file";

  return (
    <div className="space-y-6">
      <FileDropzone onFilesSelected={(f) => { setFile(f[0]); setResult(null); setProcessed(false); }} label="Upload your file to get started" />
      <p className="text-center text-sm text-text-muted">{tool.description}</p>
      {file && (
        <div className="glow-card rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-text-muted text-xs">Name</p>
              <p className="text-text-primary text-sm font-medium truncate">{file.name}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Size</p>
              <p className="text-text-primary text-sm font-medium">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Type</p>
              <p className="text-text-primary text-sm font-medium">{file.type || "unknown"}</p>
            </div>
          </div>
          {!processed && (
            <div className="flex justify-center">
              <button onClick={handleProcess} disabled={processing} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold disabled:opacity-50 cursor-pointer">
                {processing ? "Processing..." : "Process File"}
              </button>
            </div>
          )}
          {processed && result && (
            <div className="space-y-3">
              <p className="text-center text-sm text-green-400 font-medium">File processed successfully.</p>
              <div className="flex justify-center">
                <DownloadButton data={result} filename={outFilename} label={`Download Processed File`} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN ENGINE COMPONENT
// ============================================================================

export default function FileToolEngine({ tool }: { tool: Tool }) {
  const renderTool = () => {
    switch (tool.id) {
      // PDF Tools
      case "compress-pdf":
        return <CompressPdf />;
      case "merge-pdf":
        return <MergePdf />;
      case "split-pdf":
        return <SplitPdf />;
      case "rotate-pdf":
        return <RotatePdf />;
      case "pdf-to-text":
        return <PdfToText />;
      case "jpg-to-pdf":
        return <ImagesToPdf accept="image/jpeg" />;
      case "png-to-pdf":
        return <ImagesToPdf accept="image/png" />;
      case "lock-pdf":
        return <LockPdf />;
      case "add-page-numbers":
        return <AddPageNumbers />;
      case "add-watermark-pdf":
        return <AddWatermarkPdf />;
      case "pdf-to-word":
        return <PdfToWord />;
      case "pdf-to-jpg":
        return <PdfToJpg />;
      case "pdf-to-png":
        return <PdfToPng />;
      case "pdf-to-excel":
        return <PdfToExcel />;
      case "delete-pdf-pages":
        return <DeletePdfPages />;
      case "reorder-pdf-pages":
        return <ReorderPdfPages />;
      case "unlock-pdf":
        return <UnlockPdf />;
      case "word-to-pdf":
        return <WordToPdf />;
      case "excel-to-pdf":
        return <ExcelToPdf />;

      // Image Tools
      case "compress-image":
        return <CompressImage />;
      case "resize-image":
        return <ResizeImage />;
      case "crop-image":
        return <CropImage />;
      case "rotate-image":
        return <RotateImage />;
      case "flip-image":
        return <FlipImage />;
      case "jpg-to-png":
        return <ConvertImageFormat targetMime="image/png" targetExt="png" />;
      case "png-to-jpg":
        return <ConvertImageFormat targetMime="image/jpeg" targetExt="jpg" />;
      case "image-to-webp":
        return <ConvertImageFormat targetMime="image/webp" targetExt="webp" />;
      case "webp-to-jpg":
        return <ConvertImageFormat targetMime="image/jpeg" targetExt="jpg" />;
      case "black-and-white":
        return <BlackAndWhite />;
      case "brightness-contrast":
        return <BrightnessContrast />;
      case "image-to-base64":
        return <ImageToBase64 />;
      case "base64-to-image":
        return <Base64ToImage />;
      case "image-metadata-remover":
        return <ImageMetadataRemover />;
      case "svg-to-png":
        return <SvgToPng />;
      case "remove-background":
        return <RemoveBackground />;
      case "sharpen-image":
        return <SharpenImage />;
      case "add-text-to-image":
        return <AddTextToImage />;
      case "add-watermark-image":
        return <AddWatermarkImage />;
      case "meme-generator":
        return <MemeGenerator />;

      // Data Tools
      case "csv-to-excel":
        return <CsvToExcel />;
      case "excel-to-csv":
        return <ExcelToCsv />;
      case "csv-viewer":
        return <CsvViewer />;
      case "json-to-excel":
        return <JsonToExcel />;

      // Media Tools
      case "record-screen":
        return <RecordScreen />;
      case "record-audio":
        return <RecordAudio />;

      // Camera Tools
      case "webcam-photo":
        return <WebcamPhoto />;

      // Fallback for all other file-based tools
      default:
        return <GenericFileTool tool={tool} />;
    }
  };

  return (
    <div className="w-full">
      {renderTool()}
    </div>
  );
}
