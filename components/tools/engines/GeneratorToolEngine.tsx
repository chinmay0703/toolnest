"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { Tool } from "@/lib/tools";

/* ------------------------------------------------------------------ */
/*  Shared style constants                                            */
/* ------------------------------------------------------------------ */
const btnClass =
  "text-white rounded-xl px-6 py-3 font-semibold hover:scale-105 transition-transform cursor-pointer";
const btnStyle = {
  background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
};
const inputClass =
  "bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl px-4 py-3 w-full outline-none focus:border-[#7C3AED] transition";
const cardClass =
  "bg-[#0F1629] border border-[#1E2D4A] rounded-xl p-6";
const labelClass = "block text-[#94A3B8] text-sm mb-1";

/* ================================================================== */
/*  1. QR Code Generator                                              */
/* ================================================================== */
function QRCodeGenerator() {
  const [text, setText] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const generate = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: { dark: "#F1F5F9", light: "#0F1629" },
      });
      setDataUrl(url);
      setError("");
    } catch {
      setError("Failed to generate QR code.");
    }
  }, [text]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          className={inputClass}
          placeholder="Enter text or URL..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <button className={btnClass} style={btnStyle} onClick={generate}>
          Generate
        </button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {dataUrl && (
        <div className="flex flex-col items-center gap-4">
          <div className={`${cardClass} inline-block`}>
            <img src={dataUrl} alt="QR Code" className="mx-auto" />
          </div>
          <button className={btnClass} style={btnStyle} onClick={download}>
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  2. Barcode Generator                                              */
/* ================================================================== */
function BarcodeGenerator() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [text, setText] = useState("123456789012");
  const [format, setFormat] = useState<string>("CODE128");
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  const generate = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const JsBarcode = (await import("jsbarcode")).default;
      if (svgRef.current) {
        JsBarcode(svgRef.current, text, {
          format,
          lineColor: "#F1F5F9",
          background: "#0F1629",
          width: 2,
          height: 80,
          displayValue: true,
          fontOptions: "bold",
          font: "monospace",
          fontSize: 16,
          textMargin: 6,
        });
        setGenerated(true);
        setError("");
      }
    } catch {
      setError(
        `Failed to generate barcode. Check your input for the ${format} format.`
      );
      setGenerated(false);
    }
  }, [text, format]);

  const download = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "barcode.png";
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          className={`${inputClass} sm:col-span-2`}
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <select
          className={inputClass}
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="CODE128">CODE128</option>
          <option value="EAN13">EAN-13</option>
          <option value="UPC">UPC</option>
        </select>
      </div>
      <button className={btnClass} style={btnStyle} onClick={generate}>
        Generate Barcode
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex flex-col items-center gap-4">
        <div className={`${cardClass} inline-block ${generated ? "" : "hidden"}`}>
          <svg ref={svgRef} />
        </div>
        {generated && (
          <button className={btnClass} style={btnStyle} onClick={download}>
            Download PNG
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  3. Invoice Generator                                              */
/* ================================================================== */
interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

function InvoiceGenerator() {
  const [company, setCompany] = useState("");
  const [client, setClient] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("INV-001");
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", qty: 1, price: 0 },
  ]);
  const [tax, setTax] = useState(10);
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0 }]);
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, value: string) => {
    const next = [...items];
    if (field === "name") next[i].name = value;
    else next[i][field] = parseFloat(value) || 0;
    setItems(next);
  };

  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;

  const downloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237);
    doc.text("INVOICE", w / 2, y, { align: "center" });
    y += 12;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(invoiceNo, w / 2, y, { align: "center" });
    y += 14;

    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`From: ${company || "Your Company"}`, 14, y);
    doc.text(`To: ${client || "Client Name"}`, w / 2, y);
    y += 8;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
    y += 14;

    // Table header
    doc.setFillColor(124, 58, 237);
    doc.rect(14, y - 5, w - 28, 8, "F");
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.text("Item", 18, y);
    doc.text("Qty", w - 80, y, { align: "right" });
    doc.text("Price", w - 50, y, { align: "right" });
    doc.text("Total", w - 18, y, { align: "right" });
    y += 8;

    doc.setTextColor(30);
    items.forEach((it) => {
      doc.text(it.name || "—", 18, y);
      doc.text(String(it.qty), w - 80, y, { align: "right" });
      doc.text(`$${it.price.toFixed(2)}`, w - 50, y, { align: "right" });
      doc.text(`$${(it.qty * it.price).toFixed(2)}`, w - 18, y, {
        align: "right",
      });
      y += 7;
    });

    y += 4;
    doc.setDrawColor(200);
    doc.line(14, y, w - 14, y);
    y += 8;

    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, w - 18, y, {
      align: "right",
    });
    y += 7;
    doc.text(`Tax (${tax}%): $${taxAmount.toFixed(2)}`, w - 18, y, {
      align: "right",
    });
    y += 7;
    doc.setFontSize(14);
    doc.setTextColor(124, 58, 237);
    doc.text(`Total: $${total.toFixed(2)}`, w - 18, y, { align: "right" });
    y += 14;

    if (notes) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Notes:", 14, y);
      y += 6;
      doc.text(notes, 14, y, { maxWidth: w - 28 });
    }

    doc.save("invoice.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Invoice #</label>
          <input
            className={inputClass}
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Company Name</label>
          <input
            className={inputClass}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your Company"
          />
        </div>
        <div>
          <label className={labelClass}>Client Name</label>
          <input
            className={inputClass}
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Client Name"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className={labelClass}>Items</label>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input
              className={`${inputClass} col-span-5`}
              placeholder="Item name"
              value={it.name}
              onChange={(e) => updateItem(i, "name", e.target.value)}
            />
            <input
              className={`${inputClass} col-span-2`}
              type="number"
              min={1}
              placeholder="Qty"
              value={it.qty}
              onChange={(e) => updateItem(i, "qty", e.target.value)}
            />
            <input
              className={`${inputClass} col-span-3`}
              type="number"
              min={0}
              step={0.01}
              placeholder="Price"
              value={it.price}
              onChange={(e) => updateItem(i, "price", e.target.value)}
            />
            <span className="col-span-1 text-[#94A3B8] text-right text-sm">
              ${(it.qty * it.price).toFixed(2)}
            </span>
            <button
              className="col-span-1 text-red-400 hover:text-red-300 text-xl cursor-pointer"
              onClick={() => removeItem(i)}
            >
              &times;
            </button>
          </div>
        ))}
        <button
          className="text-[#06B6D4] hover:text-[#7C3AED] text-sm font-semibold cursor-pointer"
          onClick={addItem}
        >
          + Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tax %</label>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, thank you note..."
          />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          className={btnClass}
          style={btnStyle}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Hide Preview" : "Preview Invoice"}
        </button>
        <button className={btnClass} style={btnStyle} onClick={downloadPDF}>
          Download PDF
        </button>
      </div>

      {showPreview && (
        <div
          ref={previewRef}
          className={`${cardClass} max-w-2xl mx-auto space-y-4`}
        >
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "#7C3AED" }}
          >
            INVOICE
          </h2>
          <p className="text-center text-[#475569] text-sm">{invoiceNo}</p>
          <div className="flex justify-between text-sm text-[#94A3B8]">
            <div>
              <p className="font-semibold text-[#F1F5F9]">
                {company || "Your Company"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#F1F5F9]">
                {client || "Client Name"}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#475569]">
            Date: {new Date().toLocaleDateString()}
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-white text-left"
                style={{ background: "#7C3AED" }}
              >
                <th className="px-3 py-2 rounded-tl-lg">Item</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-[#1E2D4A]">
                  <td className="px-3 py-2 text-[#F1F5F9]">
                    {it.name || "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-[#94A3B8]">
                    {it.qty}
                  </td>
                  <td className="px-3 py-2 text-right text-[#94A3B8]">
                    ${it.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right text-[#F1F5F9]">
                    ${(it.qty * it.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right space-y-1 text-sm">
            <p className="text-[#94A3B8]">Subtotal: ${subtotal.toFixed(2)}</p>
            <p className="text-[#94A3B8]">
              Tax ({tax}%): ${taxAmount.toFixed(2)}
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: "#7C3AED" }}
            >
              Total: ${total.toFixed(2)}
            </p>
          </div>
          {notes && (
            <p className="text-xs text-[#475569] border-t border-[#1E2D4A] pt-3">
              Notes: {notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  4. Resume Builder                                                 */
/* ================================================================== */
interface Experience {
  title: string;
  company: string;
  years: string;
  description: string;
}
interface Education {
  degree: string;
  school: string;
  year: string;
}

function ResumeBuilder() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<Experience[]>([
    { title: "", company: "", years: "", description: "" },
  ]);
  const [education, setEducation] = useState<Education[]>([
    { degree: "", school: "", year: "" },
  ]);
  const [skills, setSkills] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const addExp = () =>
    setExperience([
      ...experience,
      { title: "", company: "", years: "", description: "" },
    ]);
  const removeExp = (i: number) =>
    setExperience(experience.filter((_, idx) => idx !== i));
  const updateExp = (i: number, field: keyof Experience, value: string) => {
    const next = [...experience];
    next[i] = { ...next[i], [field]: value };
    setExperience(next);
  };

  const addEdu = () =>
    setEducation([...education, { degree: "", school: "", year: "" }]);
  const removeEdu = (i: number) =>
    setEducation(education.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, field: keyof Education, value: string) => {
    const next = [...education];
    next[i] = { ...next[i], [field]: value };
    setEducation(next);
  };

  const downloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    let y = 20;

    // Name
    doc.setFontSize(24);
    doc.setTextColor(124, 58, 237);
    doc.text(name || "Your Name", w / 2, y, { align: "center" });
    y += 8;

    // Contact
    doc.setFontSize(10);
    doc.setTextColor(100);
    const contact = [email, phone].filter(Boolean).join(" | ");
    if (contact) {
      doc.text(contact, w / 2, y, { align: "center" });
      y += 10;
    } else {
      y += 4;
    }

    // Line
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(14, y, w - 14, y);
    y += 8;

    // Summary
    if (summary) {
      doc.setFontSize(13);
      doc.setTextColor(124, 58, 237);
      doc.text("SUMMARY", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(50);
      const lines = doc.splitTextToSize(summary, w - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 6;
    }

    // Experience
    if (experience.some((e) => e.title || e.company)) {
      doc.setFontSize(13);
      doc.setTextColor(124, 58, 237);
      doc.text("EXPERIENCE", 14, y);
      y += 6;
      experience.forEach((exp) => {
        if (!exp.title && !exp.company) return;
        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(`${exp.title || "Position"}`, 14, y);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `${exp.company || "Company"} | ${exp.years || ""}`,
          14,
          y + 5
        );
        y += 10;
        if (exp.description) {
          doc.setTextColor(50);
          const dl = doc.splitTextToSize(exp.description, w - 28);
          doc.text(dl, 14, y);
          y += dl.length * 5;
        }
        y += 4;
      });
      y += 2;
    }

    // Education
    if (education.some((e) => e.degree || e.school)) {
      doc.setFontSize(13);
      doc.setTextColor(124, 58, 237);
      doc.text("EDUCATION", 14, y);
      y += 6;
      education.forEach((edu) => {
        if (!edu.degree && !edu.school) return;
        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(`${edu.degree || "Degree"}`, 14, y);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`${edu.school || "School"} | ${edu.year || ""}`, 14, y + 5);
        y += 12;
      });
      y += 2;
    }

    // Skills
    if (skills) {
      doc.setFontSize(13);
      doc.setTextColor(124, 58, 237);
      doc.text("SKILLS", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(skills, 14, y, { maxWidth: w - 28 });
    }

    doc.save("resume.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Personal */}
      <h3 className="text-[#F1F5F9] font-semibold text-lg">Personal Info</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 890"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Professional Summary</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief professional summary..."
        />
      </div>

      {/* Experience */}
      <h3 className="text-[#F1F5F9] font-semibold text-lg">Experience</h3>
      {experience.map((exp, i) => (
        <div key={i} className={`${cardClass} space-y-3 relative`}>
          <button
            className="absolute top-3 right-3 text-red-400 hover:text-red-300 text-xl cursor-pointer"
            onClick={() => removeExp(i)}
          >
            &times;
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className={inputClass}
              placeholder="Job Title"
              value={exp.title}
              onChange={(e) => updateExp(i, "title", e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Company"
              value={exp.company}
              onChange={(e) => updateExp(i, "company", e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Years (e.g. 2020-2023)"
              value={exp.years}
              onChange={(e) => updateExp(i, "years", e.target.value)}
            />
          </div>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            placeholder="Description..."
            value={exp.description}
            onChange={(e) => updateExp(i, "description", e.target.value)}
          />
        </div>
      ))}
      <button
        className="text-[#06B6D4] hover:text-[#7C3AED] text-sm font-semibold cursor-pointer"
        onClick={addExp}
      >
        + Add Experience
      </button>

      {/* Education */}
      <h3 className="text-[#F1F5F9] font-semibold text-lg">Education</h3>
      {education.map((edu, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <input
            className={`${inputClass} col-span-5`}
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => updateEdu(i, "degree", e.target.value)}
          />
          <input
            className={`${inputClass} col-span-4`}
            placeholder="School"
            value={edu.school}
            onChange={(e) => updateEdu(i, "school", e.target.value)}
          />
          <input
            className={`${inputClass} col-span-2`}
            placeholder="Year"
            value={edu.year}
            onChange={(e) => updateEdu(i, "year", e.target.value)}
          />
          <button
            className="col-span-1 text-red-400 hover:text-red-300 text-xl cursor-pointer"
            onClick={() => removeEdu(i)}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        className="text-[#06B6D4] hover:text-[#7C3AED] text-sm font-semibold cursor-pointer"
        onClick={addEdu}
      >
        + Add Education
      </button>

      {/* Skills */}
      <div>
        <label className={labelClass}>Skills (comma separated)</label>
        <input
          className={inputClass}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="React, TypeScript, Node.js..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          className={btnClass}
          style={btnStyle}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Hide Preview" : "Preview Resume"}
        </button>
        <button className={btnClass} style={btnStyle} onClick={downloadPDF}>
          Download PDF
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className={`${cardClass} max-w-2xl mx-auto space-y-4`}>
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "#7C3AED" }}
          >
            {name || "Your Name"}
          </h2>
          <p className="text-center text-[#94A3B8] text-sm">
            {[email, phone].filter(Boolean).join(" | ")}
          </p>
          <hr className="border-[#1E2D4A]" />

          {summary && (
            <>
              <h3 className="text-sm font-bold text-[#7C3AED] uppercase tracking-wider">
                Summary
              </h3>
              <p className="text-[#94A3B8] text-sm">{summary}</p>
            </>
          )}

          {experience.some((e) => e.title || e.company) && (
            <>
              <h3 className="text-sm font-bold text-[#7C3AED] uppercase tracking-wider">
                Experience
              </h3>
              {experience.map(
                (exp, i) =>
                  (exp.title || exp.company) && (
                    <div key={i} className="mb-2">
                      <p className="text-[#F1F5F9] font-semibold">
                        {exp.title || "Position"}
                      </p>
                      <p className="text-[#475569] text-xs">
                        {exp.company} | {exp.years}
                      </p>
                      {exp.description && (
                        <p className="text-[#94A3B8] text-sm mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  )
              )}
            </>
          )}

          {education.some((e) => e.degree || e.school) && (
            <>
              <h3 className="text-sm font-bold text-[#7C3AED] uppercase tracking-wider">
                Education
              </h3>
              {education.map(
                (edu, i) =>
                  (edu.degree || edu.school) && (
                    <div key={i} className="mb-1">
                      <p className="text-[#F1F5F9] font-semibold">
                        {edu.degree}
                      </p>
                      <p className="text-[#475569] text-xs">
                        {edu.school} | {edu.year}
                      </p>
                    </div>
                  )
              )}
            </>
          )}

          {skills && (
            <>
              <h3 className="text-sm font-bold text-[#7C3AED] uppercase tracking-wider">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.split(",").map(
                  (s, i) =>
                    s.trim() && (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 rounded-full border border-[#7C3AED] text-[#94A3B8]"
                      >
                        {s.trim()}
                      </span>
                    )
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Generic Generator (fallback for any unhandled generator tool)      */
/* ================================================================== */
function GenericGenerator({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<{ input: string; output: string }[]>([]);

  const inferAction = useCallback(() => {
    const n = tool.name.toLowerCase();
    const d = tool.description.toLowerCase();
    const combined = `${n} ${d}`;
    if (combined.includes("password")) return "password";
    if (combined.includes("hash") || combined.includes("checksum")) return "hash";
    if (combined.includes("uuid") || combined.includes("guid") || combined.includes("id")) return "uuid";
    if (combined.includes("lorem") || combined.includes("text") || combined.includes("paragraph")) return "lorem";
    if (combined.includes("slug")) return "slug";
    if (combined.includes("number") || combined.includes("random")) return "random";
    if (combined.includes("color") || combined.includes("palette")) return "color";
    if (combined.includes("name") || combined.includes("username")) return "name";
    if (combined.includes("email")) return "email";
    if (combined.includes("date") || combined.includes("time") || combined.includes("timestamp")) return "timestamp";
    if (combined.includes("csv") || combined.includes("data") || combined.includes("mock")) return "mockdata";
    if (combined.includes("citation") || combined.includes("reference")) return "citation";
    return "transform";
  }, [tool.name, tool.description]);

  const generate = useCallback(() => {
    const action = inferAction();
    let result = "";

    switch (action) {
      case "password": {
        const len = parseInt(input) || 16;
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
        result = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        break;
      }
      case "hash": {
        const text = input || "hello";
        let h = 0;
        for (let i = 0; i < text.length; i++) { h = ((h << 5) - h + text.charCodeAt(i)) | 0; }
        const hex1 = (h >>> 0).toString(16).padStart(8, "0");
        let h2 = 0x811c9dc5;
        for (let i = 0; i < text.length; i++) { h2 ^= text.charCodeAt(i); h2 = Math.imul(h2, 0x01000193); }
        const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
        result = `Hash: ${hex1}${hex2}${hex1.split("").reverse().join("")}${hex2.split("").reverse().join("")}`;
        break;
      }
      case "uuid": {
        const seg = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
        const count = parseInt(input) || 1;
        result = Array.from({ length: count }, () =>
          `${seg()}${seg()}-${seg()}-4${seg().slice(1)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${seg().slice(1)}-${seg()}${seg()}${seg()}`
        ).join("\n");
        break;
      }
      case "lorem": {
        const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat"];
        const count = parseInt(input) || 50;
        result = Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
        result = result.charAt(0).toUpperCase() + result.slice(1) + ".";
        break;
      }
      case "slug": {
        const text = input || tool.name;
        result = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        break;
      }
      case "random": {
        const parts = (input || "1-100").split("-").map(Number);
        const min = parts[0] || 1;
        const max = parts[1] || 100;
        result = String(Math.floor(Math.random() * (max - min + 1)) + min);
        break;
      }
      case "color": {
        const count = parseInt(input) || 5;
        result = Array.from({ length: count }, () => {
          const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          return `#${hex}  |  rgb(${r}, ${g}, ${b})`;
        }).join("\n");
        break;
      }
      case "name": {
        const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Sophia", "Mason", "Mia", "Lucas", "Amelia", "Ethan", "Harper", "Aiden", "Ella"];
        const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore"];
        const count = parseInt(input) || 5;
        result = Array.from({ length: count }, () =>
          `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
        ).join("\n");
        break;
      }
      case "email": {
        const domains = ["gmail.com", "outlook.com", "yahoo.com", "proton.me", "mail.com"];
        const count = parseInt(input) || 5;
        result = Array.from({ length: count }, () => {
          const user = Math.random().toString(36).slice(2, 10);
          return `${user}@${domains[Math.floor(Math.random() * domains.length)]}`;
        }).join("\n");
        break;
      }
      case "timestamp": {
        const now = new Date();
        result = [
          `ISO 8601:    ${now.toISOString()}`,
          `Unix:        ${Math.floor(now.getTime() / 1000)}`,
          `Unix (ms):   ${now.getTime()}`,
          `UTC:         ${now.toUTCString()}`,
          `Local:       ${now.toLocaleString()}`,
          `Date only:   ${now.toISOString().split("T")[0]}`,
        ].join("\n");
        break;
      }
      case "mockdata": {
        const count = parseInt(input) || 5;
        const rows = Array.from({ length: count }, (_, i) => {
          const id = i + 1;
          const name = ["Alice", "Bob", "Charlie", "Diana", "Eve"][Math.floor(Math.random() * 5)];
          const age = 20 + Math.floor(Math.random() * 40);
          const city = ["New York", "London", "Tokyo", "Paris", "Berlin"][Math.floor(Math.random() * 5)];
          return `${id},${name},${age},${city}`;
        });
        result = "id,name,age,city\n" + rows.join("\n");
        break;
      }
      case "citation": {
        const author = input || "Author, A.";
        const year = new Date().getFullYear();
        result = [
          `APA:     ${author} (${year}). Title of work. Publisher.`,
          `MLA:     ${author}. "Title of Work." Publisher, ${year}.`,
          `Chicago: ${author}. Title of Work. City: Publisher, ${year}.`,
        ].join("\n");
        break;
      }
      default: {
        const text = input || "Hello World";
        result = [
          `Original:     ${text}`,
          `UPPERCASE:    ${text.toUpperCase()}`,
          `lowercase:    ${text.toLowerCase()}`,
          `Reversed:     ${text.split("").reverse().join("")}`,
          `Char count:   ${text.length}`,
          `Word count:   ${text.trim().split(/\s+/).length}`,
          `Base64:       ${btoa(text)}`,
        ].join("\n");
        break;
      }
    }

    setOutput(result);
    setHistory((prev) => [{ input: input || "(default)", output: result }, ...prev].slice(0, 10));
  }, [input, inferAction]);

  const copyOutput = useCallback(() => {
    if (output) navigator.clipboard.writeText(output);
  }, [output]);

  const action = inferAction();
  const placeholders: Record<string, string> = {
    password: "Length (default: 16)",
    hash: "Text to hash",
    uuid: "How many UUIDs? (default: 1)",
    lorem: "Word count (default: 50)",
    slug: "Text to slugify",
    random: "Range, e.g. 1-100",
    color: "How many colors? (default: 5)",
    name: "How many names? (default: 5)",
    email: "How many emails? (default: 5)",
    timestamp: "Press Generate for current timestamps",
    mockdata: "How many rows? (default: 5)",
    citation: "Author name (e.g. Smith, J.)",
    transform: "Enter text to transform...",
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          className={inputClass}
          placeholder={placeholders[action] || "Enter input..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <button className={btnClass} style={btnStyle} onClick={generate}>
          Generate
        </button>
      </div>

      {output && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Output</label>
            <button
              className="text-[#06B6D4] hover:text-[#7C3AED] text-sm font-semibold cursor-pointer"
              onClick={copyOutput}
            >
              Copy
            </button>
          </div>
          <pre className="bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl px-4 py-3 w-full whitespace-pre-wrap break-all text-sm font-mono">
            {output}
          </pre>
        </div>
      )}

      {action === "color" && output && (
        <div className="flex flex-wrap gap-2">
          {output.split("\n").map((line, i) => {
            const hex = line.match(/#[0-9a-f]{6}/i)?.[0];
            return hex ? (
              <div
                key={i}
                className="w-12 h-12 rounded-lg border border-[#1E2D4A]"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ) : null;
          })}
        </div>
      )}

      {history.length > 1 && (
        <details className="text-sm">
          <summary className="text-[#475569] cursor-pointer hover:text-[#94A3B8]">
            History ({history.length} items)
          </summary>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="bg-[#030712] border border-[#1E2D4A] rounded-lg px-3 py-2">
                <p className="text-[#475569] text-xs">Input: {h.input}</p>
                <p className="text-[#94A3B8] text-xs font-mono truncate">{h.output.split("\n")[0]}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main Engine                                                       */
/* ================================================================== */
export default function GeneratorToolEngine({ tool }: { tool: Tool }) {
  const inner = (() => {
    switch (tool.id) {
      case "qr-code-generator":
        return <QRCodeGenerator />;
      case "barcode-generator":
        return <BarcodeGenerator />;
      case "invoice-generator":
        return <InvoiceGenerator />;
      case "resume-builder":
        return <ResumeBuilder />;
      default:
        return <GenericGenerator tool={tool} />;
    }
  })();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`${cardClass} space-y-6`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tool.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-[#F1F5F9]">{tool.name}</h1>
            <p className="text-sm text-[#475569]">{tool.description}</p>
          </div>
        </div>
        {inner}
      </div>
    </div>
  );
}
