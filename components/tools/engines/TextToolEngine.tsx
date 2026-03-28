"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Tool } from "@/lib/tools";

// ── Morse code maps ──
const CHAR_TO_MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.",
  "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
  "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", _: "..--.-", '"': ".-..-.",
  $: "...-..-", "@": ".--.-.",
};
const MORSE_TO_CHAR: Record<string, string> = {};
for (const [c, m] of Object.entries(CHAR_TO_MORSE)) MORSE_TO_CHAR[m] = c;

// ── Unicode fancy text maps ──
const BOLD_MAP: Record<string, string> = {};
const ITALIC_MAP: Record<string, string> = {};
const BOLD_ITALIC_MAP: Record<string, string> = {};
const MONO_MAP: Record<string, string> = {};
(() => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const boldUpper = "\uD835\uDC00\uD835\uDC01\uD835\uDC02\uD835\uDC03\uD835\uDC04\uD835\uDC05\uD835\uDC06\uD835\uDC07\uD835\uDC08\uD835\uDC09\uD835\uDC0A\uD835\uDC0B\uD835\uDC0C\uD835\uDC0D\uD835\uDC0E\uD835\uDC0F\uD835\uDC10\uD835\uDC11\uD835\uDC12\uD835\uDC13\uD835\uDC14\uD835\uDC15\uD835\uDC16\uD835\uDC17\uD835\uDC18\uD835\uDC19";
  const boldLower = "\uD835\uDC1A\uD835\uDC1B\uD835\uDC1C\uD835\uDC1D\uD835\uDC1E\uD835\uDC1F\uD835\uDC20\uD835\uDC21\uD835\uDC22\uD835\uDC23\uD835\uDC24\uD835\uDC25\uD835\uDC26\uD835\uDC27\uD835\uDC28\uD835\uDC29\uD835\uDC2A\uD835\uDC2B\uD835\uDC2C\uD835\uDC2D\uD835\uDC2E\uD835\uDC2F\uD835\uDC30\uD835\uDC31\uD835\uDC32\uD835\uDC33";
  const italicUpper = "\uD835\uDC34\uD835\uDC35\uD835\uDC36\uD835\uDC37\uD835\uDC38\uD835\uDC39\uD835\uDC3A\uD835\uDC3B\uD835\uDC3C\uD835\uDC3D\uD835\uDC3E\uD835\uDC3F\uD835\uDC40\uD835\uDC41\uD835\uDC42\uD835\uDC43\uD835\uDC44\uD835\uDC45\uD835\uDC46\uD835\uDC47\uD835\uDC48\uD835\uDC49\uD835\uDC4A\uD835\uDC4B\uD835\uDC4C\uD835\uDC4D";
  const italicLower = "\uD835\uDC4E\uD835\uDC4F\uD835\uDC50\uD835\uDC51\uD835\uDC52\uD835\uDC53\uD835\uDC54\uD835\uDC55\uD835\uDC56\uD835\uDC57\uD835\uDC58\uD835\uDC59\uD835\uDC5A\uD835\uDC5B\uD835\uDC5C\uD835\uDC5D\uD835\uDC5E\uD835\uDC5F\uD835\uDC60\uD835\uDC61\uD835\uDC62\uD835\uDC63\uD835\uDC64\uD835\uDC65\uD835\uDC66\uD835\uDC67";
  const biUpper = "\uD835\uDC68\uD835\uDC69\uD835\uDC6A\uD835\uDC6B\uD835\uDC6C\uD835\uDC6D\uD835\uDC6E\uD835\uDC6F\uD835\uDC70\uD835\uDC71\uD835\uDC72\uD835\uDC73\uD835\uDC74\uD835\uDC75\uD835\uDC76\uD835\uDC77\uD835\uDC78\uD835\uDC79\uD835\uDC7A\uD835\uDC7B\uD835\uDC7C\uD835\uDC7D\uD835\uDC7E\uD835\uDC7F\uD835\uDC80\uD835\uDC81";
  const biLower = "\uD835\uDC82\uD835\uDC83\uD835\uDC84\uD835\uDC85\uD835\uDC86\uD835\uDC87\uD835\uDC88\uD835\uDC89\uD835\uDC8A\uD835\uDC8B\uD835\uDC8C\uD835\uDC8D\uD835\uDC8E\uD835\uDC8F\uD835\uDC90\uD835\uDC91\uD835\uDC92\uD835\uDC93\uD835\uDC94\uD835\uDC95\uD835\uDC96\uD835\uDC97\uD835\uDC98\uD835\uDC99\uD835\uDC9A\uD835\uDC9B";
  const monoUpper = "\uD835\uDE70\uD835\uDE71\uD835\uDE72\uD835\uDE73\uD835\uDE74\uD835\uDE75\uD835\uDE76\uD835\uDE77\uD835\uDE78\uD835\uDE79\uD835\uDE7A\uD835\uDE7B\uD835\uDE7C\uD835\uDE7D\uD835\uDE7E\uD835\uDE7F\uD835\uDE80\uD835\uDE81\uD835\uDE82\uD835\uDE83\uD835\uDE84\uD835\uDE85\uD835\uDE86\uD835\uDE87\uD835\uDE88\uD835\uDE89";
  const monoLower = "\uD835\uDE8A\uD835\uDE8B\uD835\uDE8C\uD835\uDE8D\uD835\uDE8E\uD835\uDE8F\uD835\uDE90\uD835\uDE91\uD835\uDE92\uD835\uDE93\uD835\uDE94\uD835\uDE95\uD835\uDE96\uD835\uDE97\uD835\uDE98\uD835\uDE99\uD835\uDE9A\uD835\uDE9B\uD835\uDE9C\uD835\uDE9D\uD835\uDE9E\uD835\uDE9F\uD835\uDEA0\uD835\uDEA1\uD835\uDEA2\uD835\uDEA3";
  const boldDigits = "\uD835\uDFCE\uD835\uDFCF\uD835\uDFD0\uD835\uDFD1\uD835\uDFD2\uD835\uDFD3\uD835\uDFD4\uD835\uDFD5\uD835\uDFD6\uD835\uDFD7";
  const monoDigits = "\uD835\uDFF6\uD835\uDFF7\uD835\uDFF8\uD835\uDFF9\uD835\uDFFA\uD835\uDFFB\uD835\uDFFC\uD835\uDFFD\uD835\uDFFE\uD835\uDFFF";

  const bU = [...boldUpper], bL = [...boldLower];
  const iU = [...italicUpper], iL = [...italicLower];
  const biU = [...biUpper], biL = [...biLower];
  const mU = [...monoUpper], mL = [...monoLower];
  const bD = [...boldDigits], mD = [...monoDigits];

  for (let i = 0; i < 26; i++) {
    BOLD_MAP[upper[i]] = bU[i]; BOLD_MAP[lower[i]] = bL[i];
    ITALIC_MAP[upper[i]] = iU[i]; ITALIC_MAP[lower[i]] = iL[i];
    BOLD_ITALIC_MAP[upper[i]] = biU[i]; BOLD_ITALIC_MAP[lower[i]] = biL[i];
    MONO_MAP[upper[i]] = mU[i]; MONO_MAP[lower[i]] = mL[i];
  }
  for (let i = 0; i < 10; i++) {
    BOLD_MAP[digits[i]] = bD[i];
    MONO_MAP[digits[i]] = mD[i];
  }
})();

function applyMap(text: string, map: Record<string, string>): string {
  return [...text].map((c) => map[c] ?? c).join("");
}

function strikethrough(text: string): string {
  return [...text].map((c) => c + "\u0336").join("");
}

function underline(text: string): string {
  return [...text].map((c) => c + "\u0332").join("");
}

// ── Lorem Ipsum Data ──
const LOREM_SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus.",
  "Nulla gravida orci a odio.",
  "Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
  "Integer in mauris eu nibh euismod gravida.",
  "Duis ac tellus et risus vulputate vehicula.",
  "Donec lobortis risus a elit.",
  "Etiam tempor.",
  "Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis.",
  "Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.",
  "Aliquam erat volutpat.",
  "Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.",
  "Phasellus ultrices nulla quis nibh.",
  "Quisque a lectus.",
  "Donec consectetuer ligula vulputate sem tristique cursus.",
  "Fusce commodo aliquam arcu.",
];

function generateLorem(paragraphs: number): string {
  const result: string[] = [];
  for (let p = 0; p < paragraphs; p++) {
    const sentCount = 4 + Math.floor(Math.random() * 4);
    const sents: string[] = [];
    for (let s = 0; s < sentCount; s++) {
      sents.push(LOREM_SENTENCES[(p * 7 + s) % LOREM_SENTENCES.length]);
    }
    if (p === 0 && sents[0] !== LOREM_SENTENCES[0]) {
      sents[0] = LOREM_SENTENCES[0];
    }
    result.push(sents.join(" "));
  }
  return result.join("\n\n");
}

// ── Shared tiny components ──

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };
  return (
    <button
      onClick={copy}
      className="text-xs px-3 py-1 rounded-lg bg-border text-text-secondary hover:text-text-primary transition-all duration-300"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ActionButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
      style={{ background: "var(--gradient-primary)" }}
    >
      {children}
    </button>
  );
}

function StyledTextarea({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className="w-full min-h-[200px] bg-bg-base border border-border text-text-primary rounded-xl p-4 resize-y focus:outline-none focus:border-primary transition-all duration-300 font-mono text-sm"
    />
  );
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-secondary mt-1">{label}</div>
    </div>
  );
}

// ── Helpers ──

function countWords(t: string): number {
  const w = t.trim().match(/\S+/g);
  return w ? w.length : 0;
}

function countSentences(t: string): number {
  const s = t.match(/[^.!?]*[.!?]+/g);
  return s ? s.length : 0;
}

function countParagraphs(t: string): number {
  if (!t.trim()) return 0;
  return t.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (t.trim() ? 1 : 0);
}

function toTitleCase(t: string): string {
  const minor = new Set([
    "a","an","the","and","but","or","for","nor","on","at","to","by","in","of","up","as","is","it","so","no",
  ]);
  return t
    .split(/\s+/)
    .map((w, i) => {
      if (i === 0 || !minor.has(w.toLowerCase())) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }
      return w.toLowerCase();
    })
    .join(" ");
}

function toCamelCase(t: string): string {
  return t
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function toSnakeCase(t: string): string {
  return t
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function toSentenceCase(t: string): string {
  return t
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}

function toAlternating(t: string): string {
  let i = 0;
  return [...t]
    .map((c) => {
      if (/[a-zA-Z]/.test(c)) {
        return i++ % 2 === 0 ? c.toLowerCase() : c.toUpperCase();
      }
      return c;
    })
    .join("");
}

function toInverse(t: string): string {
  return [...t]
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

function xorEncrypt(text: string, key: string): string {
  const result: number[] = [];
  for (let i = 0; i < text.length; i++) {
    result.push(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(String.fromCharCode(...result));
}

function xorDecrypt(encoded: string, key: string): string {
  try {
    const decoded = atob(encoded);
    const result: number[] = [];
    for (let i = 0; i < decoded.length; i++) {
      result.push(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return String.fromCharCode(...result);
  } catch {
    return "[Error: invalid encoded text]";
  }
}

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((c) => {
      if (c === " ") return "/";
      return CHAR_TO_MORSE[c] ?? c;
    })
    .join(" ");
}

function morseToText(morse: string): string {
  return morse
    .split(" ")
    .map((m) => {
      if (m === "/" || m === "") return " ";
      return MORSE_TO_CHAR[m] ?? m;
    })
    .join("")
    .replace(/ +/g, " ");
}

function textToBinary(text: string): string {
  return [...text]
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

function binaryToText(bin: string): string {
  return bin
    .replace(/[^01\s]/g, "")
    .trim()
    .split(/\s+/)
    .map((b) => String.fromCharCode(parseInt(b, 2)))
    .join("");
}

// ── Main component ──

interface Props {
  tool: Tool;
}

export default function TextToolEngine({ tool }: Props) {
  switch (tool.id) {
    case "word-counter":
      return <WordCounter />;
    case "character-counter":
      return <CharacterCounter />;
    case "sentence-counter":
      return <SentenceCounter />;
    case "reading-time":
      return <ReadingTime />;
    case "remove-duplicate-lines":
      return <RemoveDuplicateLines />;
    case "sort-lines":
      return <SortLines />;
    case "reverse-text":
      return <ReverseText />;
    case "uppercase-lowercase":
      return <UppercaseLowercase />;
    case "title-case":
      return <TitleCaseTool />;
    case "camel-case":
      return <CamelCaseTool />;
    case "snake-case":
      return <SnakeCaseTool />;
    case "remove-extra-spaces":
      return <RemoveExtraSpaces />;
    case "remove-line-breaks":
      return <RemoveLineBreaks />;
    case "find-replace":
      return <FindReplace />;
    case "lorem-ipsum":
      return <LoremIpsum />;
    case "fancy-text":
      return <FancyText />;
    case "emoji-remover":
      return <EmojiRemover />;
    case "text-encrypt":
      return <TextEncrypt />;
    case "morse-code":
      return <MorseCode />;
    case "binary-to-text":
      return <BinaryToText />;
    case "text-to-binary":
      return <TextToBinary />;
    case "text-diff":
      return <TextDiff />;
    case "text-summarizer":
      return <TextSummarizer />;
    case "text-to-speech":
      return <TextToSpeech />;
    case "speech-to-text":
      return <SpeechToText />;
    default:
      return <GenericTextTool tool={tool} />;
  }
}

// ══════════════════════════════════════
// 1. Word Counter
// ══════════════════════════════════════
function WordCounter() {
  const [text, setText] = useState("");
  const words = countWords(text);
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = countSentences(text);
  const paragraphs = countParagraphs(text);
  const readingMin = Math.ceil(words / 200);

  return (
    <div className="space-y-6">
      <StyledTextarea value={text} onChange={setText} placeholder="Type or paste your text here..." />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <StatBadge label="Words" value={words} />
        <StatBadge label="Characters" value={chars} />
        <StatBadge label="No Spaces" value={charsNoSpaces} />
        <StatBadge label="Sentences" value={sentences} />
        <StatBadge label="Paragraphs" value={paragraphs} />
        <StatBadge label="Reading Time" value={`${readingMin}m`} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 2. Character Counter
// ══════════════════════════════════════
function CharacterCounter() {
  const [text, setText] = useState("");
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = countWords(text);
  const lines = text ? text.split("\n").length : 0;

  return (
    <div className="space-y-6">
      <StyledTextarea value={text} onChange={setText} placeholder="Type or paste your text here..." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBadge label="Characters" value={chars} />
        <StatBadge label="No Spaces" value={charsNoSpaces} />
        <StatBadge label="Words" value={words} />
        <StatBadge label="Lines" value={lines} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 3. Sentence Counter
// ══════════════════════════════════════
function SentenceCounter() {
  const [text, setText] = useState("");
  const sentences = countSentences(text);
  const paragraphs = countParagraphs(text);
  const words = countWords(text);
  const avgWordsPerSentence = sentences > 0 ? (words / sentences).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <StyledTextarea value={text} onChange={setText} placeholder="Type or paste your text here..." />
      <div className="grid grid-cols-3 gap-4">
        <StatBadge label="Sentences" value={sentences} />
        <StatBadge label="Paragraphs" value={paragraphs} />
        <StatBadge label="Avg Words/Sentence" value={avgWordsPerSentence} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 4. Reading Time
// ══════════════════════════════════════
function ReadingTime() {
  const [text, setText] = useState("");
  const words = countWords(text);

  const fmt = (wpm: number) => {
    const mins = words / wpm;
    if (mins < 1) return `${Math.ceil(mins * 60)}s`;
    return `${Math.floor(mins)}m ${Math.ceil((mins % 1) * 60)}s`;
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={text} onChange={setText} placeholder="Type or paste your text here..." />
      <div className="grid grid-cols-3 gap-4">
        <StatBadge label="Slow (200 wpm)" value={fmt(200)} />
        <StatBadge label="Average (250 wpm)" value={fmt(250)} />
        <StatBadge label="Fast (300 wpm)" value={fmt(300)} />
      </div>
      <div className="text-center text-text-secondary text-sm">{words} words total</div>
    </div>
  );
}

// ══════════════════════════════════════
// 5. Remove Duplicate Lines
// ══════════════════════════════════════
function RemoveDuplicateLines() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [removed, setRemoved] = useState(0);

  const process = () => {
    const lines = input.split("\n");
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const line of lines) {
      if (!seen.has(line)) {
        seen.add(line);
        unique.push(line);
      }
    }
    setRemoved(lines.length - unique.length);
    setOutput(unique.join("\n"));
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Paste text with duplicate lines..." />
      <div className="flex items-center gap-4">
        <ActionButton onClick={process}>Remove Duplicates</ActionButton>
        {removed > 0 && <span className="text-text-secondary text-sm">{removed} duplicate line{removed !== 1 ? "s" : ""} removed</span>}
      </div>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 6. Sort Lines
// ══════════════════════════════════════
function SortLines() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"az" | "za" | "short" | "long">("az");

  const sort = () => {
    const lines = input.split("\n").filter((l) => l.trim());
    switch (mode) {
      case "az":
        lines.sort((a, b) => a.localeCompare(b));
        break;
      case "za":
        lines.sort((a, b) => b.localeCompare(a));
        break;
      case "short":
        lines.sort((a, b) => a.length - b.length);
        break;
      case "long":
        lines.sort((a, b) => b.length - a.length);
        break;
    }
    setOutput(lines.join("\n"));
  };

  const options = [
    { value: "az", label: "A-Z" },
    { value: "za", label: "Z-A" },
    { value: "short", label: "Shortest First" },
    { value: "long", label: "Longest First" },
  ] as const;

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Enter lines to sort..." />
      <div className="flex flex-wrap items-center gap-3">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => setMode(o.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              mode === o.value
                ? "text-white"
                : "bg-bg-card border border-border text-text-secondary hover:text-text-primary"
            }`}
            style={mode === o.value ? { background: "var(--gradient-primary)" } : undefined}
          >
            {o.label}
          </button>
        ))}
        <ActionButton onClick={sort}>Sort</ActionButton>
      </div>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 7. Reverse Text
// ══════════════════════════════════════
function ReverseText() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chars" | "words" | "lines">("chars");

  const getOutput = () => {
    if (!input) return "";
    switch (mode) {
      case "chars":
        return [...input].reverse().join("");
      case "words":
        return input.split(/\s+/).reverse().join(" ");
      case "lines":
        return input.split("\n").reverse().join("\n");
    }
  };

  const output = getOutput();
  const options = [
    { value: "chars", label: "Reverse Characters" },
    { value: "words", label: "Reverse Words" },
    { value: "lines", label: "Reverse Lines" },
  ] as const;

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Enter text to reverse..." />
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => setMode(o.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              mode === o.value
                ? "text-white"
                : "bg-bg-card border border-border text-text-secondary hover:text-text-primary"
            }`}
            style={mode === o.value ? { background: "var(--gradient-primary)" } : undefined}
          >
            {o.label}
          </button>
        ))}
      </div>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 8. Uppercase / Lowercase
// ══════════════════════════════════════
function UppercaseLowercase() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const transforms = [
    { label: "UPPERCASE", fn: (t: string) => t.toUpperCase() },
    { label: "lowercase", fn: (t: string) => t.toLowerCase() },
    { label: "Title Case", fn: toTitleCase },
    { label: "Sentence case", fn: toSentenceCase },
    { label: "aLtErNaTiNg", fn: toAlternating },
    { label: "iNVERSE", fn: toInverse },
  ];

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Enter text to transform..." />
      <div className="flex flex-wrap gap-3">
        {transforms.map((t) => (
          <ActionButton key={t.label} onClick={() => setOutput(t.fn(input))}>
            {t.label}
          </ActionButton>
        ))}
      </div>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 9. Title Case
// ══════════════════════════════════════
function TitleCaseTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Enter text to convert to Title Case..." />
      <ActionButton onClick={() => setOutput(toTitleCase(input))}>Convert to Title Case</ActionButton>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 10. camelCase
// ══════════════════════════════════════
function CamelCaseTool() {
  const [input, setInput] = useState("");
  const output = input ? toCamelCase(input) : "";

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Enter text to convert to camelCase..." />
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 11. snake_case
// ══════════════════════════════════════
function SnakeCaseTool() {
  const [input, setInput] = useState("");
  const output = input ? toSnakeCase(input) : "";

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Enter text to convert to snake_case..." />
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 12. Remove Extra Spaces
// ══════════════════════════════════════
function RemoveExtraSpaces() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const process = () => {
    setOutput(
      input
        .split("\n")
        .map((line) => line.replace(/ {2,}/g, " ").trim())
        .join("\n")
    );
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Paste text with extra spaces..." />
      <ActionButton onClick={process}>Remove Extra Spaces</ActionButton>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 13. Remove Line Breaks
// ══════════════════════════════════════
function RemoveLineBreaks() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const process = () => {
    setOutput(input.replace(/\r?\n/g, " ").replace(/ {2,}/g, " ").trim());
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Paste text with line breaks..." />
      <ActionButton onClick={process}>Remove Line Breaks</ActionButton>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 14. Find & Replace
// ══════════════════════════════════════
function FindReplace() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [useRegex, setUseRegex] = useState(false);
  const [output, setOutput] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  const doReplace = () => {
    if (!find) return;
    try {
      let pattern: RegExp;
      if (useRegex) {
        pattern = new RegExp(find, caseSensitive ? "g" : "gi");
      } else {
        const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        pattern = new RegExp(escaped, caseSensitive ? "g" : "gi");
      }
      const matches = text.match(pattern);
      setMatchCount(matches ? matches.length : 0);
      setOutput(text.replace(pattern, replace));
    } catch {
      setOutput("[Invalid regex pattern]");
      setMatchCount(0);
    }
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={text} onChange={setText} placeholder="Enter your text..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Find..."
          className="bg-bg-base border border-border text-text-primary rounded-xl p-4 focus:outline-none focus:border-primary transition-all duration-300"
        />
        <input
          type="text"
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="Replace with..."
          className="bg-bg-base border border-border text-text-primary rounded-xl p-4 focus:outline-none focus:border-primary transition-all duration-300"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="accent-primary"
          />
          Case Sensitive
        </label>
        <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={useRegex}
            onChange={(e) => setUseRegex(e.target.checked)}
            className="accent-primary"
          />
          Regex
        </label>
        <ActionButton onClick={doReplace}>Replace All</ActionButton>
        {matchCount > 0 && <span className="text-text-secondary text-sm">{matchCount} match{matchCount !== 1 ? "es" : ""} found</span>}
      </div>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 15. Lorem Ipsum Generator
// ══════════════════════════════════════
function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(3);
  const [output, setOutput] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-text-secondary text-sm">Paragraphs:</label>
        <input
          type="number"
          min={1}
          max={50}
          value={paragraphs}
          onChange={(e) => setParagraphs(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
          className="w-24 bg-bg-base border border-border text-text-primary rounded-xl p-3 text-center focus:outline-none focus:border-primary transition-all duration-300"
        />
        <ActionButton onClick={() => setOutput(generateLorem(paragraphs))}>Generate</ActionButton>
      </div>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 16. Fancy Text
// ══════════════════════════════════════
function FancyText() {
  const [input, setInput] = useState("");

  const styles = [
    { label: "Bold", fn: (t: string) => applyMap(t, BOLD_MAP) },
    { label: "Italic", fn: (t: string) => applyMap(t, ITALIC_MAP) },
    { label: "Bold Italic", fn: (t: string) => applyMap(t, BOLD_ITALIC_MAP) },
    { label: "Monospace", fn: (t: string) => applyMap(t, MONO_MAP) },
    { label: "Underline", fn: underline },
    { label: "Strikethrough", fn: strikethrough },
  ];

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Type text to generate fancy styles..." />
      {input && (
        <div className="space-y-3">
          {styles.map((s) => {
            const result = s.fn(input);
            return (
              <div key={s.label} className="flex items-center justify-between bg-bg-card border border-border rounded-xl p-4">
                <div>
                  <div className="text-xs text-text-secondary mb-1">{s.label}</div>
                  <div className="text-text-primary break-all">{result}</div>
                </div>
                <CopyButton text={result} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 17. Emoji Remover
// ══════════════════════════════════════
function EmojiRemover() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const process = () => {
    const cleaned = input
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu,
        ""
      )
      .replace(/ {2,}/g, " ")
      .trim();
    setOutput(cleaned);
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Paste text with emojis..." />
      <ActionButton onClick={process}>Remove Emojis</ActionButton>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 18. Text Encrypt (XOR + Base64)
// ══════════════════════════════════════
function TextEncrypt() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [isEncrypt, setIsEncrypt] = useState(true);
  const [output, setOutput] = useState("");

  const process = () => {
    if (!password) return;
    setOutput(isEncrypt ? xorEncrypt(input, password) : xorDecrypt(input, password));
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder={isEncrypt ? "Enter text to encrypt..." : "Enter encrypted text to decrypt..."} />
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password / Key"
          className="bg-bg-base border border-border text-text-primary rounded-xl p-4 focus:outline-none focus:border-primary transition-all duration-300 flex-1 min-w-[200px]"
        />
        <div className="flex rounded-xl overflow-hidden border border-border">
          <button
            onClick={() => setIsEncrypt(true)}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${isEncrypt ? "text-white" : "text-text-secondary bg-bg-card"}`}
            style={isEncrypt ? { background: "var(--gradient-primary)" } : undefined}
          >
            Encrypt
          </button>
          <button
            onClick={() => setIsEncrypt(false)}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${!isEncrypt ? "text-white" : "text-text-secondary bg-bg-card"}`}
            style={!isEncrypt ? { background: "var(--gradient-primary)" } : undefined}
          >
            Decrypt
          </button>
        </div>
        <ActionButton onClick={process} disabled={!password}>
          {isEncrypt ? "Encrypt" : "Decrypt"}
        </ActionButton>
      </div>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 19. Morse Code
// ══════════════════════════════════════
function MorseCode() {
  const [input, setInput] = useState("");
  const [toMorse, setToMorse] = useState(true);
  const output = input ? (toMorse ? textToMorse(input) : morseToText(input)) : "";

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl overflow-hidden border border-border w-fit">
        <button
          onClick={() => setToMorse(true)}
          className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${toMorse ? "text-white" : "text-text-secondary bg-bg-card"}`}
          style={toMorse ? { background: "var(--gradient-primary)" } : undefined}
        >
          Text to Morse
        </button>
        <button
          onClick={() => setToMorse(false)}
          className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${!toMorse ? "text-white" : "text-text-secondary bg-bg-card"}`}
          style={!toMorse ? { background: "var(--gradient-primary)" } : undefined}
        >
          Morse to Text
        </button>
      </div>
      <StyledTextarea
        value={input}
        onChange={setInput}
        placeholder={toMorse ? "Enter text to convert to Morse code..." : "Enter Morse code (dots, dashes, spaces, / for word breaks)..."}
      />
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 20. Binary to Text
// ══════════════════════════════════════
function BinaryToText() {
  const [input, setInput] = useState("");
  const output = input ? binaryToText(input) : "";

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Enter binary (e.g. 01001000 01101001)..." />
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 21. Text to Binary
// ══════════════════════════════════════
function TextToBinary() {
  const [input, setInput] = useState("");
  const output = input ? textToBinary(input) : "";

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Enter text to convert to binary..." />
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 22. Text Diff
// ══════════════════════════════════════
function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<{ type: "same" | "added" | "removed"; text: string }[]>([]);

  const compare = () => {
    const lLines = left.split("\n");
    const rLines = right.split("\n");
    const maxLen = Math.max(lLines.length, rLines.length);
    const result: { type: "same" | "added" | "removed"; text: string }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const l = lLines[i];
      const r = rLines[i];
      if (l === undefined && r !== undefined) {
        result.push({ type: "added", text: r });
      } else if (r === undefined && l !== undefined) {
        result.push({ type: "removed", text: l });
      } else if (l === r) {
        result.push({ type: "same", text: l });
      } else {
        result.push({ type: "removed", text: l });
        result.push({ type: "added", text: r });
      }
    }
    setDiff(result);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-text-secondary text-sm mb-2 block">Original Text</label>
          <StyledTextarea value={left} onChange={setLeft} placeholder="Paste original text..." />
        </div>
        <div>
          <label className="text-text-secondary text-sm mb-2 block">Modified Text</label>
          <StyledTextarea value={right} onChange={setRight} placeholder="Paste modified text..." />
        </div>
      </div>
      <ActionButton onClick={compare}>Compare</ActionButton>
      {diff.length > 0 && (
        <div className="bg-bg-base border border-border rounded-xl p-4 font-mono text-sm overflow-auto max-h-[400px]">
          {diff.map((d, i) => (
            <div
              key={i}
              className={`px-2 py-0.5 ${
                d.type === "added"
                  ? "bg-success/20 text-success"
                  : d.type === "removed"
                  ? "bg-danger/20 text-danger"
                  : "text-text-secondary"
              }`}
            >
              {d.type === "added" ? "+ " : d.type === "removed" ? "- " : "  "}
              {d.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 23. Text Summarizer
// ══════════════════════════════════════
function TextSummarizer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const summarize = () => {
    const paragraphs = input.split(/\n\s*\n/).filter((p) => p.trim());
    const summary = paragraphs
      .map((p) => {
        const firstSentence = p.trim().match(/^[^.!?]*[.!?]/);
        return firstSentence ? firstSentence[0].trim() : p.trim().split("\n")[0];
      })
      .join("\n\n");
    setOutput(summary);
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={input} onChange={setInput} placeholder="Paste text to summarize (extracts first sentence of each paragraph)..." />
      <ActionButton onClick={summarize}>Summarize</ActionButton>
      {output && (
        <div className="relative">
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
          <StyledTextarea value={output} readOnly />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 24. Text to Speech
// ══════════════════════════════════════
function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() ?? [];
      setVoices(v);
      if (v.length > 0 && !selectedVoice) setSelectedVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, [selectedVoice]);

  const speak = () => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <div className="space-y-6">
      <StyledTextarea value={text} onChange={setText} placeholder="Enter text to speak..." />
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="bg-bg-base border border-border text-text-primary rounded-xl p-3 focus:outline-none focus:border-primary transition-all duration-300 max-w-[250px]"
        >
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-text-secondary text-sm">Rate: {rate.toFixed(1)}</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="accent-primary"
          />
        </div>
        {speaking ? (
          <ActionButton onClick={stop}>Stop</ActionButton>
        ) : (
          <ActionButton onClick={speak} disabled={!text}>Speak</ActionButton>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 25. Speech to Text
// ══════════════════════════════════════
function SpeechToText() {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) setSupported(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = createRecognition();
    if (!recognition) {
      setSupported(false);
      return;
    }

    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = text;

    recognition.onresult = (event: { resultIndex: number; results: { length: number; [key: number]: { isFinal: boolean; [key: number]: { transcript: string } } } }) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setText(finalTranscript + interim);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    setListening(true);
  }, [listening, text]);

  if (!supported) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center space-y-3">
        <span className="text-4xl">🎙️</span>
        <p className="text-text-primary font-semibold">Open in Chrome or Edge</p>
        <p className="text-text-secondary text-sm">Speech Recognition uses the Web Speech API which is available in Chrome and Edge browsers. Open this page in one of those browsers to use this tool.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ActionButton onClick={toggle}>
          {listening ? "Stop Listening" : "Start Listening"}
        </ActionButton>
        {listening && (
          <span className="flex items-center gap-2 text-danger text-sm">
            <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
            Listening...
          </span>
        )}
      </div>
      <div className="relative">
        {text && <div className="absolute top-2 right-2"><CopyButton text={text} /></div>}
        <StyledTextarea value={text} onChange={setText} placeholder="Transcribed text will appear here..." />
      </div>
    </div>
  );
}

function createRecognition() {
  const SpeechRecognition =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (SpeechRecognition as any)();
}

// ══════════════════════════════════════
// Fallback: Generic Text Tool
// ══════════════════════════════════════
function GenericTextTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const words = countWords(text);
  const chars = text.length;
  const name = (tool.name || tool.id || "").toLowerCase();

  const processText = () => {
    if (!text.trim()) return;
    let result = text;

    if (name.includes("extract")) {
      const emails = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [];
      const urls = text.match(/https?:\/\/[^\s)]+/g) || [];
      const numbers = text.match(/\b\d+(\.\d+)?\b/g) || [];
      const parts: string[] = [];
      if (emails.length) parts.push("Emails:\n" + emails.join("\n"));
      if (urls.length) parts.push("URLs:\n" + urls.join("\n"));
      if (numbers.length) parts.push("Numbers:\n" + numbers.join(", "));
      if (!parts.length) parts.push("No emails, URLs, or numbers found.");
      result = parts.join("\n\n");
    } else if (name.includes("convert") || name.includes("transform")) {
      result = text
        .split("\n")
        .map((line, i) => `${i + 1}. ${line}`)
        .join("\n");
    } else if (name.includes("remove") || name.includes("clean") || name.includes("strip")) {
      result = text
        .replace(/[^\w\s.,!?;:'"()\-]/g, "")
        .replace(/[ \t]+/g, " ")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n");
    } else if (name.includes("generate") || name.includes("create")) {
      const wordsArr = text.trim().split(/\s+/);
      const shuffled = [...wordsArr].sort(() => Math.random() - 0.5);
      result = shuffled.join(" ");
    } else if (name.includes("sort")) {
      result = text.split("\n").sort((a, b) => a.localeCompare(b)).join("\n");
    } else if (name.includes("reverse")) {
      result = text.split("").reverse().join("");
    } else if (name.includes("upper")) {
      result = text.toUpperCase();
    } else if (name.includes("lower")) {
      result = text.toLowerCase();
    } else if (name.includes("count") || name.includes("stat") || name.includes("analy")) {
      const lines = text.split("\n").length;
      const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
      const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size;
      const avgWordLen = text.trim()
        ? ((text.match(/\b\w+\b/g) || []).reduce((s, w) => s + w.length, 0) /
            ((text.match(/\b\w+\b/g) || []).length || 1)).toFixed(1)
        : "0";
      result = [
        `Characters: ${chars}`,
        `Characters (no spaces): ${text.replace(/\s/g, "").length}`,
        `Words: ${words}`,
        `Unique words: ${uniqueWords}`,
        `Sentences: ${countSentences(text)}`,
        `Lines: ${lines}`,
        `Paragraphs: ${paragraphs}`,
        `Avg word length: ${avgWordLen}`,
      ].join("\n");
    } else {
      // Default: trim lines, normalize whitespace, provide stats as a header
      const cleaned = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n");
      const lineCount = cleaned.split("\n").length;
      result = `--- Stats: ${words} words | ${chars} chars | ${lineCount} lines ---\n\n${cleaned}`;
    }

    setOutput(result);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <StyledTextarea value={text} onChange={setText} placeholder="Type or paste your text here..." />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <StatBadge label="Words" value={words} />
          <StatBadge label="Characters" value={chars} />
        </div>
      </div>
      <div className="flex gap-3">
        <ActionButton onClick={processText} disabled={!text.trim()}>Process</ActionButton>
        {output && (
          <button
            onClick={copyOutput}
            className="text-xs px-3 py-1 rounded-lg bg-border text-text-secondary hover:text-text-primary transition-all duration-300"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      {output && (
        <div>
          <StyledTextarea value={output} readOnly placeholder="" />
        </div>
      )}
    </div>
  );
}
