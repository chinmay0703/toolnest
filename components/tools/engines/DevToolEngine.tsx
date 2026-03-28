"use client";

import { Tool } from "@/lib/tools";
import { useState, useEffect, useCallback, useMemo } from "react";

// ─── MD5 Implementation ────────────────────────────────────────────────────────
function md5(input: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function binlMD5(x: number[], len: number) {
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = md5ff(a, b, c, d, x[i], 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i + 0], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = md5ii(a, b, c, d, x[i], 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }
  function rstrMD5(s: string) {
    const bin = binlMD5(str2binl(s), s.length * 8);
    let r = "";
    for (let i = 0; i < bin.length * 32; i += 8) {
      r += String.fromCharCode((bin[i >> 5] >>> i % 32) & 0xff);
    }
    return r;
  }
  function str2binl(str: string) {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << i % 32;
    }
    return bin;
  }
  function rstr2hex(input: string) {
    const hexTab = "0123456789abcdef";
    let output = "";
    for (let i = 0; i < input.length; i++) {
      const x = input.charCodeAt(i);
      output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
    }
    return output;
  }
  // Convert Unicode string to UTF-8 bytes manually
  let utf8 = "";
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c < 128) {
      utf8 += String.fromCharCode(c);
    } else if (c < 2048) {
      utf8 += String.fromCharCode(192 | (c >> 6), 128 | (c & 63));
    } else {
      utf8 += String.fromCharCode(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
  }
  return rstr2hex(rstrMD5(utf8));
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function shaHash(text: string, algo: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHash(text: string, key: string, algo: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: algo },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(text));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function generatePassword(length: number, upper: boolean, lower: boolean, numbers: boolean, symbols: boolean): string {
  let chars = "";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (numbers) chars += "0123456789";
  if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";
  let pwd = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    pwd += chars[arr[i] % chars.length];
  }
  return pwd;
}

function passwordStrength(pwd: string): { label: string; score: number; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  if (score <= 2) return { label: "Weak", score: 25, color: "#EF4444" };
  if (score <= 4) return { label: "Medium", score: 50, color: "#F59E0B" };
  if (score <= 5) return { label: "Strong", score: 75, color: "#10B981" };
  return { label: "Very Strong", score: 100, color: "#06B6D4" };
}

function simpleMarkdownToHtml(md: string): string {
  let html = md;
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Headers
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  // Bold/Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Links & images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>");
  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");
  // Line breaks (remaining lines)
  html = html.replace(/\n/g, "<br />");
  return html;
}

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function identifyCard(num: string): string {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "Visa";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "American Express";
  if (/^6(?:011|5)/.test(d)) return "Discover";
  if (/^3(?:0[0-5]|[68])/.test(d)) return "Diners Club";
  if (/^35/.test(d)) return "JCB";
  return "Unknown";
}

function fleschKincaid(text: string): { score: number; grade: string; sentences: number; words: number; syllables: number } {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const words = text.split(/\s+/).filter((w) => w.length > 0).length || 1;
  const syllableCount = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    let count = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
      .replace(/^y/, "")
      .match(/[aeiouy]{1,2}/g);
    return count ? count.length : 1;
  };
  const totalSyllables = text.split(/\s+/).filter((w) => w.length > 0).reduce((acc, w) => acc + syllableCount(w), 0);
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words);
  let grade = "Very Difficult";
  if (score >= 90) grade = "Very Easy";
  else if (score >= 80) grade = "Easy";
  else if (score >= 70) grade = "Fairly Easy";
  else if (score >= 60) grade = "Standard";
  else if (score >= 50) grade = "Fairly Difficult";
  else if (score >= 30) grade = "Difficult";
  return { score: Math.round(score * 10) / 10, grade, sentences, words, syllables: totalSyllables };
}

function computeDiff(a: string, b: string): { type: "same" | "add" | "del"; text: string }[] {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const result: { type: "same" | "add" | "del"; text: string }[] = [];
  let i = 0, j = 0;
  while (i < linesA.length || j < linesB.length) {
    if (i < linesA.length && j < linesB.length && linesA[i] === linesB[j]) {
      result.push({ type: "same", text: linesA[i] });
      i++; j++;
    } else if (j < linesB.length && (i >= linesA.length || !linesA.slice(i).includes(linesB[j]))) {
      result.push({ type: "add", text: linesB[j] });
      j++;
    } else if (i < linesA.length) {
      result.push({ type: "del", text: linesA[i] });
      i++;
    }
  }
  return result;
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const inputStyle = "w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-[#7C3AED] transition-all duration-300 resize-y";
const btnStyle = "text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:opacity-90 cursor-pointer";
const btnGradient = "background: linear-gradient(135deg, #7C3AED, #06B6D4)";
const smallBtnStyle = "text-[#94A3B8] hover:text-[#7C3AED] text-sm cursor-pointer transition-all duration-300";
const labelStyle = "block text-[#94A3B8] text-sm mb-2";
const cardStyle = "bg-[#0F1629] border border-[#1E2D4A] rounded-xl p-6 transition-all duration-300";

// ─── JSON syntax highlight ──────────────────────────────────────────────────────
function highlightJSON(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, '<span style="color:#7C3AED">"$1"</span>:')
    .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span style="color:#10B981">"$1"</span>')
    .replace(/\b(true|false)\b/g, '<span style="color:#F59E0B">$1</span>')
    .replace(/\b(null)\b/g, '<span style="color:#EF4444">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#06B6D4">$1</span>');
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function DevToolEngine({ tool }: { tool: Tool }) {
  const id = tool.id;

  // Generic state
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // JSON formatter
  const [jsonIndent, setJsonIndent] = useState(2);

  // Base64 / URL / HTML encode states reuse input/output

  // JWT decoder
  const [jwtHeader, setJwtHeader] = useState("");
  const [jwtPayload, setJwtPayload] = useState("");
  const [jwtExpiry, setJwtExpiry] = useState("");

  // Regex tester
  const [regexPattern, setRegexPattern] = useState("");
  const [regexFlags, setRegexFlags] = useState({ g: true, i: false, m: false, s: false });
  const [regexMatches, setRegexMatches] = useState<{ count: number; groups: string[][]; highlighted: string }>({ count: 0, groups: [], highlighted: "" });

  // UUID
  const [uuidCount, setUuidCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);

  // Password generator
  const [pwdLength, setPwdLength] = useState(16);
  const [pwdUpper, setPwdUpper] = useState(true);
  const [pwdLower, setPwdLower] = useState(true);
  const [pwdNumbers, setPwdNumbers] = useState(true);
  const [pwdSymbols, setPwdSymbols] = useState(true);
  const [generatedPwd, setGeneratedPwd] = useState("");

  // Color picker
  const [colorHex, setColorHex] = useState("#7C3AED");
  const [colorRgb, setColorRgb] = useState("124, 58, 237");
  const [colorHsl, setColorHsl] = useState("263, 70%, 58%");

  // Hash
  const [hashOutput, setHashOutput] = useState("");

  // SHA
  const [shaAlgo, setShaAlgo] = useState("SHA-256");

  // Diff
  const [diffResult, setDiffResult] = useState<{ type: "same" | "add" | "del"; text: string }[]>([]);

  // Chmod
  const [chmodPerms, setChmodPerms] = useState([
    [true, true, true],   // owner rwx
    [true, false, true],  // group r-x
    [true, false, true],  // others r-x
  ]);

  // Cron
  const [cronParts, setCronParts] = useState(["*", "*", "*", "*", "*"]);

  // Box shadow
  const [shadowX, setShadowX] = useState(5);
  const [shadowY, setShadowY] = useState(5);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowSpread, setShadowSpread] = useState(0);
  const [shadowColor, setShadowColor] = useState("#000000");

  // Gradient
  const [gradColor1, setGradColor1] = useState("#7C3AED");
  const [gradColor2, setGradColor2] = useState("#06B6D4");
  const [gradAngle, setGradAngle] = useState(135);

  // Meta tag
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaAuthor, setMetaAuthor] = useState("");

  // Robots.txt
  const [robotsRules, setRobotsRules] = useState({
    allowAll: true,
    disallowAll: false,
    disallowAdmin: true,
    disallowApi: false,
    disallowPrivate: true,
    sitemap: "",
  });

  // AES
  const [aesPassword, setAesPassword] = useState("");

  // HMAC
  const [hmacKey, setHmacKey] = useState("");
  const [hmacAlgo, setHmacAlgo] = useState("SHA-256");

  // Random key
  const [rkLength, setRkLength] = useState(32);
  const [rkFormat, setRkFormat] = useState("hex");

  // UTM
  const [utmUrl, setUtmUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");

  // Password strength standalone
  const [strengthResult, setStrengthResult] = useState<{ label: string; score: number; color: string } | null>(null);

  const doCopy = useCallback((text: string) => {
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  // ─── Cron readable ────────────────────────────────────────────────────────────
  const cronExpression = cronParts.join(" ");
  const cronReadable = useMemo(() => {
    const [min, hour, dom, mon, dow] = cronParts;
    const parts: string[] = [];
    if (min === "*") parts.push("every minute");
    else parts.push(`at minute ${min}`);
    if (hour === "*") parts.push("every hour");
    else parts.push(`past hour ${hour}`);
    if (dom === "*" && dow === "*") parts.push("every day");
    else {
      if (dom !== "*") parts.push(`on day ${dom} of the month`);
      if (dow !== "*") {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        parts.push(`on ${days[parseInt(dow)] || dow}`);
      }
    }
    if (mon !== "*") parts.push(`in month ${mon}`);
    return parts.join(", ");
  }, [cronParts]);

  // ─── Robots.txt output ────────────────────────────────────────────────────────
  const robotsOutput = useMemo(() => {
    let lines = ["User-agent: *"];
    if (robotsRules.disallowAll) {
      lines.push("Disallow: /");
    } else if (robotsRules.allowAll) {
      lines.push("Allow: /");
    }
    if (robotsRules.disallowAdmin) lines.push("Disallow: /admin/");
    if (robotsRules.disallowApi) lines.push("Disallow: /api/");
    if (robotsRules.disallowPrivate) lines.push("Disallow: /private/");
    if (robotsRules.sitemap) lines.push("", `Sitemap: ${robotsRules.sitemap}`);
    return lines.join("\n");
  }, [robotsRules]);

  // ─── UTM output ───────────────────────────────────────────────────────────────
  const utmOutput = useMemo(() => {
    if (!utmUrl) return "";
    const params = new URLSearchParams();
    if (utmSource) params.set("utm_source", utmSource);
    if (utmMedium) params.set("utm_medium", utmMedium);
    if (utmCampaign) params.set("utm_campaign", utmCampaign);
    if (utmTerm) params.set("utm_term", utmTerm);
    if (utmContent) params.set("utm_content", utmContent);
    const sep = utmUrl.includes("?") ? "&" : "?";
    return `${utmUrl}${sep}${params.toString()}`;
  }, [utmUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  // ─── Chmod output ─────────────────────────────────────────────────────────────
  const chmodNumeric = useMemo(() => {
    return chmodPerms.map((p) => (p[0] ? 4 : 0) + (p[1] ? 2 : 0) + (p[2] ? 1 : 0)).join("");
  }, [chmodPerms]);

  const chmodSymbolic = useMemo(() => {
    return chmodPerms.map((p) => (p[0] ? "r" : "-") + (p[1] ? "w" : "-") + (p[2] ? "x" : "-")).join("");
  }, [chmodPerms]);

  // ─── Regex live ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if ((id === "regex-tester") && regexPattern && input) {
      try {
        const flags = Object.entries(regexFlags).filter(([, v]) => v).map(([k]) => k).join("");
        const re = new RegExp(regexPattern, flags);
        const allMatches: RegExpExecArray[] = [];
        let m: RegExpExecArray | null;
        if (flags.includes("g")) {
          while ((m = re.exec(input)) !== null) {
            allMatches.push(m);
            if (!m[0].length) re.lastIndex++;
          }
        } else {
          m = re.exec(input);
          if (m) allMatches.push(m);
        }
        const groups = allMatches.map((m) => Array.from(m));
        // Build highlighted string
        let highlighted = "";
        let lastIndex = 0;
        const sortedMatches = [...allMatches].sort((a, b) => a.index - b.index);
        for (const match of sortedMatches) {
          const idx = match.index;
          highlighted += input.slice(lastIndex, idx)
            .replace(/</g, "&lt;").replace(/>/g, "&gt;");
          highlighted += `<mark style="background:#7C3AED;color:white;padding:1px 2px;border-radius:3px">${match[0].replace(/</g, "&lt;").replace(/>/g, "&gt;")}</mark>`;
          lastIndex = idx + match[0].length;
        }
        highlighted += input.slice(lastIndex).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        setRegexMatches({ count: allMatches.length, groups, highlighted });
        setError("");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Invalid regex");
        setRegexMatches({ count: 0, groups: [], highlighted: "" });
      }
    }
  }, [id, regexPattern, regexFlags, input]);

  // ─── Color sync from hex ──────────────────────────────────────────────────────
  const updateColorFromHex = useCallback((hex: string) => {
    setColorHex(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      setColorRgb(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setColorHsl(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
    }
  }, []);

  // ─── AES Encrypt/Decrypt ──────────────────────────────────────────────────────
  const aesEncrypt = useCallback(async () => {
    try {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(aesPassword), "PBKDF2", false, ["deriveBits", "deriveKey"]);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(input));
      // Combine salt + iv + ciphertext
      const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(encrypted).length);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      setOutput(btoa(String.fromCharCode(...combined)));
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Encryption failed");
    }
  }, [input, aesPassword]);

  const aesDecrypt = useCallback(async () => {
    try {
      const enc = new TextEncoder();
      const dec = new TextDecoder();
      const raw = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
      const salt = raw.slice(0, 16);
      const iv = raw.slice(16, 28);
      const ciphertext = raw.slice(28);
      const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(aesPassword), "PBKDF2", false, ["deriveBits", "deriveKey"]);
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
      setOutput(dec.decode(decrypted));
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Decryption failed (wrong password or corrupted data)");
    }
  }, [input, aesPassword]);

  // ─── Tool Renderers ──────────────────────────────────────────────────────────

  // JSON Formatter
  if (id === "json-formatter") {
    return (
      <div className={cardStyle}>
        <div className="flex items-center gap-4 mb-4">
          <label className={labelStyle}>Indent:</label>
          <select
            value={jsonIndent}
            onChange={(e) => setJsonIndent(Number(e.target.value))}
            className="bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
        <textarea
          className={inputStyle}
          rows={10}
          placeholder="Paste your JSON here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button
            className={btnStyle}
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
            onClick={() => {
              try {
                const parsed = JSON.parse(input);
                const formatted = JSON.stringify(parsed, null, jsonIndent);
                setOutput(formatted);
                setError("");
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Invalid JSON");
                setOutput("");
              }
            }}
          >
            Format
          </button>
          {output && (
            <button className={smallBtnStyle} onClick={() => doCopy(output)}>
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        {error && <div className="mt-3 text-red-400 text-sm font-mono">{error}</div>}
        {output && (
          <div className="mt-4">
            <pre
              className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-sm font-mono overflow-auto max-h-96 text-[#F1F5F9]"
              dangerouslySetInnerHTML={{ __html: highlightJSON(output) }}
            />
          </div>
        )}
      </div>
    );
  }

  // Base64
  if (id === "base64-encode") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Input</label>
        <textarea className={inputStyle} rows={6} placeholder="Enter text..." value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="flex gap-3 mt-4">
          <button
            className={btnStyle}
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
            onClick={() => {
              try {
                const bytes = new TextEncoder().encode(input);
                const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
                setOutput(btoa(binary));
                setError("");
              } catch (e: unknown) { setError(e instanceof Error ? e.message : "Encoding failed"); }
            }}
          >
            Encode
          </button>
          <button
            className={btnStyle}
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
            onClick={() => {
              try {
                const binary = atob(input);
                const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
                setOutput(new TextDecoder().decode(bytes));
                setError("");
              } catch (e: unknown) { setError(e instanceof Error ? e.message : "Decoding failed"); }
            }}
          >
            Decode
          </button>
          {output && <button className={smallBtnStyle} onClick={() => doCopy(output)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        <label className={`${labelStyle} mt-4`}>Output</label>
        <textarea className={inputStyle} rows={6} readOnly value={output} />
      </div>
    );
  }

  // URL Encode
  if (id === "url-encode") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Input</label>
        <textarea className={inputStyle} rows={4} placeholder="Enter text..." value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="flex gap-3 mt-4">
          <button className={btnStyle} style={{ background: btnGradient }} onClick={() => { setOutput(encodeURIComponent(input)); setError(""); }}>Encode</button>
          <button className={btnStyle} style={{ background: btnGradient }} onClick={() => { try { setOutput(decodeURIComponent(input)); setError(""); } catch { setError("Invalid URL encoding"); } }}>Decode</button>
          {output && <button className={smallBtnStyle} onClick={() => doCopy(output)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        <label className={`${labelStyle} mt-4`}>Output</label>
        <textarea className={inputStyle} rows={4} readOnly value={output} />
      </div>
    );
  }

  // HTML Encode
  if (id === "html-encode") {
    const htmlEntities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    const reverseEntities: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Input</label>
        <textarea className={inputStyle} rows={4} placeholder="Enter HTML..." value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="flex gap-3 mt-4">
          <button className={btnStyle} style={{ background: btnGradient }} onClick={() => setOutput(input.replace(/[&<>"']/g, (c) => htmlEntities[c] || c))}>Encode</button>
          <button className={btnStyle} style={{ background: btnGradient }} onClick={() => setOutput(input.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (c) => reverseEntities[c] || c))}>Decode</button>
          {output && <button className={smallBtnStyle} onClick={() => doCopy(output)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        <label className={`${labelStyle} mt-4`}>Output</label>
        <textarea className={inputStyle} rows={4} readOnly value={output} />
      </div>
    );
  }

  // JWT Decoder
  if (id === "jwt-decoder") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>JWT Token</label>
        <textarea
          className={inputStyle}
          rows={4}
          placeholder="Paste JWT token..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            try {
              const parts = e.target.value.split(".");
              if (parts.length !== 3) throw new Error("Invalid JWT format");
              const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
              const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
              setJwtHeader(JSON.stringify(header, null, 2));
              setJwtPayload(JSON.stringify(payload, null, 2));
              if (payload.exp) {
                const expDate = new Date(payload.exp * 1000);
                const now = new Date();
                setJwtExpiry(`${expDate.toLocaleString()} (${expDate > now ? "valid" : "expired"})`);
              } else {
                setJwtExpiry("No expiry claim");
              }
              setError("");
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : "Invalid JWT");
              setJwtHeader("");
              setJwtPayload("");
              setJwtExpiry("");
            }
          }}
        />
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        {jwtHeader && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Header</label>
                <button className={smallBtnStyle} onClick={() => doCopy(jwtHeader)}>{copied ? "Copied!" : "Copy"}</button>
              </div>
              <pre className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-sm font-mono text-[#F1F5F9] overflow-auto" dangerouslySetInnerHTML={{ __html: highlightJSON(jwtHeader) }} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Payload</label>
                <button className={smallBtnStyle} onClick={() => doCopy(jwtPayload)}>Copy</button>
              </div>
              <pre className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-sm font-mono text-[#F1F5F9] overflow-auto" dangerouslySetInnerHTML={{ __html: highlightJSON(jwtPayload) }} />
            </div>
            <div>
              <label className={labelStyle}>Expiry</label>
              <div className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-sm text-[#F1F5F9]">{jwtExpiry}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regex Tester
  if (id === "regex-tester") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Pattern</label>
        <input
          type="text"
          className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-[#7C3AED] transition-all duration-300"
          placeholder="Enter regex pattern..."
          value={regexPattern}
          onChange={(e) => setRegexPattern(e.target.value)}
        />
        <div className="flex gap-4 mt-3">
          {(["g", "i", "m", "s"] as const).map((flag) => (
            <label key={flag} className="flex items-center gap-2 text-[#94A3B8] text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={regexFlags[flag]}
                onChange={(e) => setRegexFlags((f) => ({ ...f, [flag]: e.target.checked }))}
                className="accent-[#7C3AED]"
              />
              {flag}
            </label>
          ))}
        </div>
        <label className={`${labelStyle} mt-4`}>Test String</label>
        <textarea className={inputStyle} rows={6} placeholder="Enter test string..." value={input} onChange={(e) => setInput(e.target.value)} />
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        {regexMatches.count > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-[#94A3B8]">
              <span className="text-[#06B6D4] font-semibold">{regexMatches.count}</span> match{regexMatches.count !== 1 ? "es" : ""} found
            </div>
            <div className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-sm font-mono text-[#F1F5F9] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: regexMatches.highlighted }} />
            {regexMatches.groups.length > 0 && regexMatches.groups.some((g) => g.length > 1) && (
              <div>
                <label className={labelStyle}>Groups</label>
                {regexMatches.groups.map((group, i) => (
                  <div key={i} className="bg-[#030712] border border-[#1E2D4A] rounded-lg p-2 mb-2 text-xs font-mono text-[#F1F5F9]">
                    {group.map((g, j) => (
                      <div key={j}><span className="text-[#94A3B8]">[{j}]:</span> {g}</div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // UUID Generator
  if (id === "uuid-generator") {
    return (
      <div className={cardStyle}>
        <div className="flex items-center gap-4 mb-4">
          <label className={labelStyle}>Quantity:</label>
          <input
            type="number"
            min={1}
            max={100}
            value={uuidCount}
            onChange={(e) => setUuidCount(Math.min(100, Math.max(1, Number(e.target.value))))}
            className="bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm w-20"
          />
        </div>
        <div className="flex gap-3">
          <button
            className={btnStyle}
            style={{ background: btnGradient }}
            onClick={() => {
              const ids: string[] = [];
              for (let i = 0; i < uuidCount; i++) ids.push(crypto.randomUUID());
              setUuids(ids);
            }}
          >
            Generate
          </button>
          {uuids.length > 0 && (
            <button className={smallBtnStyle} onClick={() => doCopy(uuids.join("\n"))}>{copied ? "Copied All!" : "Copy All"}</button>
          )}
        </div>
        {uuids.length > 0 && (
          <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] max-h-96 overflow-auto">
            {uuids.map((u, i) => (
              <div key={i} className="flex items-center justify-between py-1 hover:bg-[#1E2D4A] px-2 rounded">
                <span>{u}</span>
                <button className={smallBtnStyle} onClick={() => doCopy(u)}>Copy</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Password Generator
  if (id === "password-generator-dev" || id === "password-generator-sec") {
    const str = generatedPwd ? passwordStrength(generatedPwd) : null;
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Length: {pwdLength}</label>
        <input type="range" min={8} max={128} value={pwdLength} onChange={(e) => setPwdLength(Number(e.target.value))} className="w-full accent-[#7C3AED]" />
        <div className="flex flex-wrap gap-4 mt-4">
          {[
            { label: "Uppercase", val: pwdUpper, set: setPwdUpper },
            { label: "Lowercase", val: pwdLower, set: setPwdLower },
            { label: "Numbers", val: pwdNumbers, set: setPwdNumbers },
            { label: "Symbols", val: pwdSymbols, set: setPwdSymbols },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 text-[#94A3B8] text-sm cursor-pointer">
              <input type="checkbox" checked={opt.val} onChange={(e) => opt.set(e.target.checked)} className="accent-[#7C3AED]" />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className={btnStyle}
            style={{ background: btnGradient }}
            onClick={() => setGeneratedPwd(generatePassword(pwdLength, pwdUpper, pwdLower, pwdNumbers, pwdSymbols))}
          >
            Generate
          </button>
          {generatedPwd && <button className={smallBtnStyle} onClick={() => doCopy(generatedPwd)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        {generatedPwd && (
          <div className="mt-4">
            <div className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] break-all">{generatedPwd}</div>
            {str && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#94A3B8]">Strength:</span>
                  <span style={{ color: str.color }}>{str.label}</span>
                </div>
                <div className="w-full bg-[#1E2D4A] rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${str.score}%`, backgroundColor: str.color }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Color Picker
  if (id === "color-picker") {
    return (
      <div className={cardStyle}>
        <div className="flex gap-6 items-start flex-wrap">
          <div>
            <input
              type="color"
              value={colorHex}
              onChange={(e) => updateColorFromHex(e.target.value)}
              className="w-20 h-20 rounded-xl border border-[#1E2D4A] cursor-pointer"
            />
            <div className="w-20 h-20 rounded-xl border border-[#1E2D4A] mt-3" style={{ backgroundColor: colorHex }} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className={labelStyle}>HEX</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => { const v = e.target.value; setColorHex(v); if (/^#[0-9a-f]{6}$/i.test(v)) updateColorFromHex(v); }}
                  className="flex-1 bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm font-mono"
                />
                <button className={smallBtnStyle} onClick={() => doCopy(colorHex)}>Copy</button>
              </div>
            </div>
            <div>
              <label className={labelStyle}>RGB</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorRgb}
                  onChange={(e) => {
                    setColorRgb(e.target.value);
                    const parts = e.target.value.split(",").map((s) => parseInt(s.trim()));
                    if (parts.length === 3 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
                      const hex = rgbToHex(parts[0], parts[1], parts[2]);
                      setColorHex(hex);
                      const hsl = rgbToHsl(parts[0], parts[1], parts[2]);
                      setColorHsl(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
                    }
                  }}
                  className="flex-1 bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm font-mono"
                />
                <button className={smallBtnStyle} onClick={() => doCopy(`rgb(${colorRgb})`)}>Copy</button>
              </div>
            </div>
            <div>
              <label className={labelStyle}>HSL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorHsl}
                  readOnly
                  className="flex-1 bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm font-mono"
                />
                <button className={smallBtnStyle} onClick={() => doCopy(`hsl(${colorHsl})`)}>Copy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hex to RGB
  if (id === "hex-to-rgb") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Hex Color</label>
        <input type="text" className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 font-mono text-sm" placeholder="#7C3AED" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className={`${btnStyle} mt-4`} style={{ background: btnGradient }} onClick={() => {
          const rgb = hexToRgb(input.startsWith("#") ? input : `#${input}`);
          if (rgb) {
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            setOutput(`RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}\nHSL: ${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
            setError("");
          } else { setError("Invalid hex color"); setOutput(""); }
        }}>Convert</button>
        <label className={`${labelStyle} mt-4`}>RGB Input (r,g,b)</label>
        <input type="text" className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 font-mono text-sm" placeholder="124, 58, 237" value={input2} onChange={(e) => setInput2(e.target.value)} />
        <button className={`${btnStyle} mt-4`} style={{ background: btnGradient }} onClick={() => {
          const parts = input2.split(",").map(s => parseInt(s.trim()));
          if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
            setOutput(`HEX: ${rgbToHex(parts[0], parts[1], parts[2])}`);
            setError("");
          } else { setError("Invalid RGB values"); }
        }}>Convert RGB to Hex</button>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        {output && <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] whitespace-pre-wrap">{output}</div>}
      </div>
    );
  }

  // MD5 Hash
  if (id === "md5-generator" || id === "md5-hash") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Input Text</label>
        <textarea className={inputStyle} rows={4} placeholder="Enter text to hash..." value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="flex gap-3 mt-4">
          <button className={btnStyle} style={{ background: btnGradient }} onClick={() => setHashOutput(md5(input))}>Generate MD5</button>
          {hashOutput && <button className={smallBtnStyle} onClick={() => doCopy(hashOutput)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        {hashOutput && <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] break-all">{hashOutput}</div>}
      </div>
    );
  }

  // SHA Hash
  if (id === "sha-generator" || id === "sha-hash") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Input Text</label>
        <textarea className={inputStyle} rows={4} placeholder="Enter text to hash..." value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="flex items-center gap-4 mt-4">
          <select value={shaAlgo} onChange={(e) => setShaAlgo(e.target.value)} className="bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm">
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-384">SHA-384</option>
            <option value="SHA-512">SHA-512</option>
          </select>
          <button className={btnStyle} style={{ background: btnGradient }} onClick={async () => setHashOutput(await shaHash(input, shaAlgo))}>Generate Hash</button>
          {hashOutput && <button className={smallBtnStyle} onClick={() => doCopy(hashOutput)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        {hashOutput && <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] break-all">{hashOutput}</div>}
      </div>
    );
  }

  // Diff Checker
  if (id === "diff-checker") {
    return (
      <div className={cardStyle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Original</label>
            <textarea className={inputStyle} rows={10} placeholder="Original text..." value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <label className={labelStyle}>Modified</label>
            <textarea className={inputStyle} rows={10} placeholder="Modified text..." value={input2} onChange={(e) => setInput2(e.target.value)} />
          </div>
        </div>
        <button className={`${btnStyle} mt-4`} style={{ background: btnGradient }} onClick={() => setDiffResult(computeDiff(input, input2))}>Compare</button>
        {diffResult.length > 0 && (
          <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm overflow-auto max-h-96">
            {diffResult.map((line, i) => (
              <div
                key={i}
                className="px-2 py-0.5"
                style={{
                  backgroundColor: line.type === "add" ? "rgba(16,185,129,0.15)" : line.type === "del" ? "rgba(239,68,68,0.15)" : "transparent",
                  color: line.type === "add" ? "#10B981" : line.type === "del" ? "#EF4444" : "#F1F5F9",
                }}
              >
                <span className="select-none mr-2">{line.type === "add" ? "+" : line.type === "del" ? "-" : " "}</span>
                {line.text}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Chmod Calculator
  if (id === "chmod-calculator") {
    const labels = ["Owner", "Group", "Others"];
    const permLabels = ["Read", "Write", "Execute"];
    return (
      <div className={cardStyle}>
        <div className="space-y-4">
          {labels.map((label, i) => (
            <div key={label}>
              <label className={labelStyle}>{label}</label>
              <div className="flex gap-4">
                {permLabels.map((pl, j) => (
                  <label key={pl} className="flex items-center gap-2 text-[#94A3B8] text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chmodPerms[i][j]}
                      onChange={(e) => {
                        const newPerms = chmodPerms.map((row) => [...row]);
                        newPerms[i][j] = e.target.checked;
                        setChmodPerms(newPerms);
                      }}
                      className="accent-[#7C3AED]"
                    />
                    {pl}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4">
            <label className={labelStyle}>Numeric</label>
            <div className="text-2xl font-mono text-[#7C3AED] font-bold">{chmodNumeric}</div>
          </div>
          <div className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4">
            <label className={labelStyle}>Symbolic</label>
            <div className="text-2xl font-mono text-[#06B6D4] font-bold">{chmodSymbolic}</div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className={smallBtnStyle} onClick={() => doCopy(chmodNumeric)}>Copy Numeric</button>
          <button className={smallBtnStyle} onClick={() => doCopy(chmodSymbolic)}>Copy Symbolic</button>
        </div>
      </div>
    );
  }

  // Cron Builder
  if (id === "cron-builder") {
    const cronLabels = ["Minute", "Hour", "Day (Month)", "Month", "Day (Week)"];
    const cronOptions = [
      ["*", ...Array.from({ length: 60 }, (_, i) => String(i))],
      ["*", ...Array.from({ length: 24 }, (_, i) => String(i))],
      ["*", ...Array.from({ length: 31 }, (_, i) => String(i + 1))],
      ["*", ...Array.from({ length: 12 }, (_, i) => String(i + 1))],
      ["*", "0", "1", "2", "3", "4", "5", "6"],
    ];
    return (
      <div className={cardStyle}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cronLabels.map((label, i) => (
            <div key={label}>
              <label className={labelStyle}>{label}</label>
              <select
                value={cronParts[i]}
                onChange={(e) => {
                  const newParts = [...cronParts];
                  newParts[i] = e.target.value;
                  setCronParts(newParts);
                }}
                className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm"
              >
                {cronOptions[i].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4">
          <label className={labelStyle}>Cron Expression</label>
          <div className="text-xl font-mono text-[#7C3AED] font-bold">{cronExpression}</div>
        </div>
        <div className="mt-3 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4">
          <label className={labelStyle}>Human Readable</label>
          <div className="text-sm text-[#F1F5F9]">{cronReadable}</div>
        </div>
        <button className={`${smallBtnStyle} mt-3`} onClick={() => doCopy(cronExpression)}>{copied ? "Copied!" : "Copy Expression"}</button>
      </div>
    );
  }

  // Markdown to HTML / Markdown Preview
  if (id === "markdown-to-html" || id === "markdown-preview") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Markdown</label>
        <textarea className={inputStyle} rows={10} placeholder="Enter markdown..." value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="flex gap-3 mt-4">
          <button className={smallBtnStyle} onClick={() => doCopy(simpleMarkdownToHtml(input))}>{copied ? "Copied HTML!" : "Copy HTML"}</button>
        </div>
        {input && (
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelStyle}>Preview</label>
              <div
                className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-[#F1F5F9] prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(input) }}
              />
            </div>
            <div>
              <label className={labelStyle}>HTML Output</label>
              <pre className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] overflow-auto whitespace-pre-wrap">{simpleMarkdownToHtml(input)}</pre>
            </div>
          </div>
        )}
      </div>
    );
  }

  // CSS Box Shadow
  if (id === "css-box-shadow") {
    const shadowCSS = `box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`;
    return (
      <div className={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "X Offset", val: shadowX, set: setShadowX, min: -50, max: 50 },
            { label: "Y Offset", val: shadowY, set: setShadowY, min: -50, max: 50 },
            { label: "Blur", val: shadowBlur, set: setShadowBlur, min: 0, max: 100 },
            { label: "Spread", val: shadowSpread, set: setShadowSpread, min: -50, max: 50 },
          ].map((s) => (
            <div key={s.label}>
              <label className={labelStyle}>{s.label}: {s.val}px</label>
              <input type="range" min={s.min} max={s.max} value={s.val} onChange={(e) => s.set(Number(e.target.value))} className="w-full accent-[#7C3AED]" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className={labelStyle}>Color</label>
          <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="w-12 h-8 rounded border border-[#1E2D4A] cursor-pointer" />
        </div>
        <div className="mt-6 flex items-center justify-center p-12 bg-[#030712] border border-[#1E2D4A] rounded-xl">
          <div
            className="w-32 h-32 bg-[#1E2D4A] rounded-xl transition-all duration-300"
            style={{ boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}` }}
          />
        </div>
        <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9]">{shadowCSS}</div>
        <button className={`${smallBtnStyle} mt-2`} onClick={() => doCopy(shadowCSS)}>{copied ? "Copied!" : "Copy CSS"}</button>
      </div>
    );
  }

  // Gradient Generator
  if (id === "gradient-generator" || id === "css-gradient") {
    const gradCSS = `background: linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2});`;
    return (
      <div className={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Color 1</label>
            <input type="color" value={gradColor1} onChange={(e) => setGradColor1(e.target.value)} className="w-full h-10 rounded border border-[#1E2D4A] cursor-pointer" />
          </div>
          <div>
            <label className={labelStyle}>Color 2</label>
            <input type="color" value={gradColor2} onChange={(e) => setGradColor2(e.target.value)} className="w-full h-10 rounded border border-[#1E2D4A] cursor-pointer" />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelStyle}>Angle: {gradAngle}deg</label>
          <input type="range" min={0} max={360} value={gradAngle} onChange={(e) => setGradAngle(Number(e.target.value))} className="w-full accent-[#7C3AED]" />
        </div>
        <div
          className="mt-6 w-full h-32 rounded-xl border border-[#1E2D4A] transition-all duration-300"
          style={{ background: `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})` }}
        />
        <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9]">{gradCSS}</div>
        <button className={`${smallBtnStyle} mt-2`} onClick={() => doCopy(gradCSS)}>{copied ? "Copied!" : "Copy CSS"}</button>
      </div>
    );
  }

  // Meta Tag Generator
  if (id === "meta-tag-generator") {
    const metaOutput = [
      `<meta charset="UTF-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
      metaTitle ? `<title>${metaTitle}</title>` : "",
      metaTitle ? `<meta property="og:title" content="${metaTitle}">` : "",
      metaDesc ? `<meta name="description" content="${metaDesc}">` : "",
      metaDesc ? `<meta property="og:description" content="${metaDesc}">` : "",
      metaKeywords ? `<meta name="keywords" content="${metaKeywords}">` : "",
      metaAuthor ? `<meta name="author" content="${metaAuthor}">` : "",
    ].filter(Boolean).join("\n");
    return (
      <div className={cardStyle}>
        <div className="space-y-4">
          {[
            { label: "Title", val: metaTitle, set: setMetaTitle, ph: "Page Title" },
            { label: "Description", val: metaDesc, set: setMetaDesc, ph: "Page description..." },
            { label: "Keywords", val: metaKeywords, set: setMetaKeywords, ph: "keyword1, keyword2, ..." },
            { label: "Author", val: metaAuthor, set: setMetaAuthor, ph: "Author name" },
          ].map((f) => (
            <div key={f.label}>
              <label className={labelStyle}>{f.label}</label>
              <input type="text" value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7C3AED] transition-all duration-300" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className={labelStyle}>Generated Meta Tags</label>
          <pre className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] overflow-auto whitespace-pre-wrap">{metaOutput}</pre>
          <button className={`${smallBtnStyle} mt-2`} onClick={() => doCopy(metaOutput)}>{copied ? "Copied!" : "Copy"}</button>
        </div>
      </div>
    );
  }

  // Robots.txt Generator
  if (id === "robots-txt-generator") {
    return (
      <div className={cardStyle}>
        <div className="space-y-3">
          {[
            { label: "Allow All", key: "allowAll" as const },
            { label: "Disallow All", key: "disallowAll" as const },
            { label: "Disallow /admin/", key: "disallowAdmin" as const },
            { label: "Disallow /api/", key: "disallowApi" as const },
            { label: "Disallow /private/", key: "disallowPrivate" as const },
          ].map((rule) => (
            <label key={rule.key} className="flex items-center gap-2 text-[#94A3B8] text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={robotsRules[rule.key]}
                onChange={(e) => setRobotsRules((r) => ({ ...r, [rule.key]: e.target.checked }))}
                className="accent-[#7C3AED]"
              />
              {rule.label}
            </label>
          ))}
          <div>
            <label className={labelStyle}>Sitemap URL</label>
            <input
              type="text"
              value={robotsRules.sitemap}
              onChange={(e) => setRobotsRules((r) => ({ ...r, sitemap: e.target.value }))}
              placeholder="https://example.com/sitemap.xml"
              className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7C3AED] transition-all duration-300"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelStyle}>robots.txt</label>
          <pre className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] whitespace-pre-wrap">{robotsOutput}</pre>
          <button className={`${smallBtnStyle} mt-2`} onClick={() => doCopy(robotsOutput)}>{copied ? "Copied!" : "Copy"}</button>
        </div>
      </div>
    );
  }

  // Password Strength Checker
  if (id === "password-strength") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Enter Password</label>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setStrengthResult(e.target.value ? passwordStrength(e.target.value) : null); }}
          placeholder="Type a password..."
          className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-[#7C3AED] transition-all duration-300"
        />
        {strengthResult && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[#94A3B8]">Strength:</span>
              <span style={{ color: strengthResult.color }} className="font-semibold">{strengthResult.label}</span>
            </div>
            <div className="w-full bg-[#1E2D4A] rounded-full h-3">
              <div className="h-3 rounded-full transition-all duration-300" style={{ width: `${strengthResult.score}%`, backgroundColor: strengthResult.color }} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span style={{ color: input.length >= 8 ? "#10B981" : "#EF4444" }}>{input.length >= 8 ? "+" : "-"}</span>
                At least 8 characters ({input.length})
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: /[A-Z]/.test(input) ? "#10B981" : "#EF4444" }}>{/[A-Z]/.test(input) ? "+" : "-"}</span>
                Uppercase letters
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: /[a-z]/.test(input) ? "#10B981" : "#EF4444" }}>{/[a-z]/.test(input) ? "+" : "-"}</span>
                Lowercase letters
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: /[0-9]/.test(input) ? "#10B981" : "#EF4444" }}>{/[0-9]/.test(input) ? "+" : "-"}</span>
                Numbers
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: /[^a-zA-Z0-9]/.test(input) ? "#10B981" : "#EF4444" }}>{/[^a-zA-Z0-9]/.test(input) ? "+" : "-"}</span>
                Special characters
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // AES Encrypt/Decrypt
  if (id === "aes-encrypt" || id === "aes-decrypt") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Input</label>
        <textarea className={inputStyle} rows={4} placeholder={id === "aes-encrypt" ? "Enter text to encrypt..." : "Enter base64 ciphertext..."} value={input} onChange={(e) => setInput(e.target.value)} />
        <label className={`${labelStyle} mt-4`}>Password</label>
        <input type="password" value={aesPassword} onChange={(e) => setAesPassword(e.target.value)} placeholder="Enter encryption password..." className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7C3AED] transition-all duration-300" />
        <div className="flex gap-3 mt-4">
          <button className={btnStyle} style={{ background: btnGradient }} onClick={aesEncrypt}>Encrypt</button>
          <button className={btnStyle} style={{ background: btnGradient }} onClick={aesDecrypt}>Decrypt</button>
          {output && <button className={smallBtnStyle} onClick={() => doCopy(output)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        {output && (
          <div className="mt-4">
            <label className={labelStyle}>Output</label>
            <textarea className={inputStyle} rows={4} readOnly value={output} />
          </div>
        )}
      </div>
    );
  }

  // HMAC Generator
  if (id === "hmac-generator") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Input Text</label>
        <textarea className={inputStyle} rows={4} placeholder="Enter text..." value={input} onChange={(e) => setInput(e.target.value)} />
        <label className={`${labelStyle} mt-4`}>Secret Key</label>
        <input type="text" value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} placeholder="Enter secret key..." className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-[#7C3AED] transition-all duration-300" />
        <div className="flex items-center gap-4 mt-4">
          <select value={hmacAlgo} onChange={(e) => setHmacAlgo(e.target.value)} className="bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm">
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>
          <button className={btnStyle} style={{ background: btnGradient }} onClick={async () => {
            try { setHashOutput(await hmacHash(input, hmacKey, hmacAlgo)); setError(""); }
            catch (e: unknown) { setError(e instanceof Error ? e.message : "HMAC generation failed"); }
          }}>Generate HMAC</button>
          {hashOutput && <button className={smallBtnStyle} onClick={() => doCopy(hashOutput)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        {hashOutput && <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] break-all">{hashOutput}</div>}
      </div>
    );
  }

  // Random Key Generator
  if (id === "random-key") {
    return (
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className={labelStyle}>Length: {rkLength}</label>
            <input type="range" min={16} max={256} value={rkLength} onChange={(e) => setRkLength(Number(e.target.value))} className="w-48 accent-[#7C3AED]" />
          </div>
          <div>
            <label className={labelStyle}>Format</label>
            <select value={rkFormat} onChange={(e) => setRkFormat(e.target.value)} className="bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-lg px-3 py-2 text-sm">
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
              <option value="alphanumeric">Alphanumeric</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className={btnStyle} style={{ background: btnGradient }} onClick={() => {
            const bytes = new Uint8Array(rkLength);
            crypto.getRandomValues(bytes);
            if (rkFormat === "hex") {
              setOutput(Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(""));
            } else if (rkFormat === "base64") {
              setOutput(btoa(String.fromCharCode(...bytes)));
            } else {
              const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
              setOutput(Array.from(bytes).map(b => chars[b % chars.length]).join(""));
            }
          }}>Generate</button>
          {output && <button className={smallBtnStyle} onClick={() => doCopy(output)}>{copied ? "Copied!" : "Copy"}</button>}
        </div>
        {output && <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#F1F5F9] break-all">{output}</div>}
      </div>
    );
  }

  // Credit Card Validator
  if (id === "credit-card-validator") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Card Number</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^\d\s-]/g, ""))}
          placeholder="Enter card number..."
          className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 font-mono text-lg tracking-widest focus:outline-none focus:border-[#7C3AED] transition-all duration-300"
        />
        <button className={`${btnStyle} mt-4`} style={{ background: btnGradient }} onClick={() => {
          const clean = input.replace(/[\s-]/g, "");
          if (!clean || !/^\d+$/.test(clean)) { setError("Enter a valid number"); setOutput(""); return; }
          const valid = luhnCheck(clean);
          const type = identifyCard(clean);
          setOutput(`Card Type: ${type}\nLuhn Check: ${valid ? "VALID" : "INVALID"}\nDigits: ${clean.length}`);
          setError("");
        }}>Validate</button>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        {output && (
          <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-sm text-[#F1F5F9] whitespace-pre-wrap font-mono">
            {output.split("\n").map((line, i) => (
              <div key={i} className={line.includes("VALID") && !line.includes("INVALID") ? "text-green-400" : line.includes("INVALID") ? "text-red-400" : ""}>{line}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Writing tools (grammar checker, readability, headline analyzer)
  if (id === "grammar-checker" || id === "readability-score" || id === "headline-analyzer") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Enter Text</label>
        <textarea className={inputStyle} rows={8} placeholder="Paste your text here for analysis..." value={input} onChange={(e) => setInput(e.target.value)} />
        <button className={`${btnStyle} mt-4`} style={{ background: btnGradient }} onClick={() => {
          if (!input.trim()) { setError("Enter some text to analyze"); return; }
          const fk = fleschKincaid(input);
          const chars = input.length;
          const avgWordLen = (input.replace(/[^a-zA-Z]/g, "").length / fk.words).toFixed(1);
          const avgSentLen = (fk.words / fk.sentences).toFixed(1);
          const longWords = input.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, "").length > 6).length;
          setOutput([
            `Readability Score: ${fk.score} (${fk.grade})`,
            `Characters: ${chars}`,
            `Words: ${fk.words}`,
            `Sentences: ${fk.sentences}`,
            `Syllables: ${fk.syllables}`,
            `Avg Word Length: ${avgWordLen} chars`,
            `Avg Sentence Length: ${avgSentLen} words`,
            `Complex Words (>6 chars): ${longWords}`,
          ].join("\n"));
          setError("");
        }}>Analyze</button>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        {output && (
          <div className="mt-4 bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-sm text-[#F1F5F9] whitespace-pre-wrap font-mono">
            {output.split("\n").map((line, i) => {
              const [label, val] = line.split(": ");
              return (
                <div key={i} className="py-1 flex justify-between">
                  <span className="text-[#94A3B8]">{label}:</span>
                  <span className="text-[#06B6D4] font-semibold">{val}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Hashtag Generator
  if (id === "hashtag-generator") {
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Topic or Text</label>
        <textarea className={inputStyle} rows={4} placeholder="Enter topic or description..." value={input} onChange={(e) => setInput(e.target.value)} />
        <button className={`${btnStyle} mt-4`} style={{ background: btnGradient }} onClick={() => {
          if (!input.trim()) { setError("Enter a topic"); return; }
          const words = input.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2);
          const stopWords = new Set(["the", "and", "for", "are", "but", "not", "you", "all", "can", "has", "her", "was", "one", "our", "out", "this", "that", "with", "from", "have", "been", "they", "its", "than"]);
          const filtered = words.filter(w => !stopWords.has(w));
          const unique = [...new Set(filtered)];
          const hashtags = unique.slice(0, 15).map(w => `#${w}`);
          // Add some compound hashtags
          if (unique.length >= 2) {
            hashtags.push(`#${unique[0]}${unique[1]}`);
            if (unique.length >= 3) hashtags.push(`#${unique[0]}${unique[2]}`);
          }
          hashtags.push("#trending", "#viral", "#explore");
          setOutput(hashtags.join(" "));
          setError("");
        }}>Generate Hashtags</button>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        {output && (
          <div className="mt-4">
            <div className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 text-sm text-[#06B6D4] flex flex-wrap gap-2">
              {output.split(" ").map((tag, i) => (
                <span key={i} className="bg-[#1E2D4A] px-3 py-1 rounded-full cursor-pointer hover:bg-[#7C3AED] transition-all duration-300" onClick={() => doCopy(tag)}>{tag}</span>
              ))}
            </div>
            <button className={`${smallBtnStyle} mt-2`} onClick={() => doCopy(output)}>{copied ? "Copied!" : "Copy All"}</button>
          </div>
        )}
      </div>
    );
  }

  // UTM Builder
  if (id === "utm-builder") {
    return (
      <div className={cardStyle}>
        <div className="space-y-4">
          {[
            { label: "Website URL *", val: utmUrl, set: setUtmUrl, ph: "https://example.com" },
            { label: "Source *", val: utmSource, set: setUtmSource, ph: "google, newsletter, facebook" },
            { label: "Medium *", val: utmMedium, set: setUtmMedium, ph: "cpc, email, social" },
            { label: "Campaign *", val: utmCampaign, set: setUtmCampaign, ph: "spring_sale, product_launch" },
            { label: "Term", val: utmTerm, set: setUtmTerm, ph: "running+shoes (optional)" },
            { label: "Content", val: utmContent, set: setUtmContent, ph: "logolink, textlink (optional)" },
          ].map((f) => (
            <div key={f.label}>
              <label className={labelStyle}>{f.label}</label>
              <input type="text" value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} className="w-full bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl p-3 text-sm focus:outline-none focus:border-[#7C3AED] transition-all duration-300" />
            </div>
          ))}
        </div>
        {utmOutput && (
          <div className="mt-6">
            <label className={labelStyle}>Generated URL</label>
            <div className="bg-[#030712] border border-[#1E2D4A] rounded-xl p-4 font-mono text-sm text-[#06B6D4] break-all">{utmOutput}</div>
            <button className={`${smallBtnStyle} mt-2`} onClick={() => doCopy(utmOutput)}>{copied ? "Copied!" : "Copy URL"}</button>
          </div>
        )}
      </div>
    );
  }

  // Twitter Character Counter
  if (id === "twitter-counter") {
    const count = input.length;
    const remaining = 280 - count;
    const pct = Math.min(100, (count / 280) * 100);
    return (
      <div className={cardStyle}>
        <label className={labelStyle}>Tweet</label>
        <textarea className={inputStyle} rows={4} placeholder="What's happening?" value={input} onChange={(e) => setInput(e.target.value)} maxLength={280} />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-48 bg-[#1E2D4A] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor: remaining < 0 ? "#EF4444" : remaining < 20 ? "#F59E0B" : "#06B6D4",
                }}
              />
            </div>
            <span className="text-sm font-mono" style={{ color: remaining < 0 ? "#EF4444" : remaining < 20 ? "#F59E0B" : "#94A3B8" }}>
              {remaining}
            </span>
          </div>
          <span className="text-sm text-[#94A3B8]">{count}/280</span>
        </div>
      </div>
    );
  }

  // ─── Fallback / Generic Tool ──────────────────────────────────────────────────
  const toolName = (tool.name || tool.id || "").toLowerCase();

  const processGeneric = () => {
    if (!input.trim()) return;
    setError("");
    let result = input;

    try {
      if (toolName.includes("format") || toolName.includes("beautif") || toolName.includes("prettif")) {
        // Try to format as JSON first, otherwise indent lines
        try {
          result = JSON.stringify(JSON.parse(input), null, 2);
        } catch {
          result = input.split("\n").map((l) => l.trimEnd()).join("\n");
        }
      } else if (toolName.includes("minif") || toolName.includes("compress")) {
        try {
          result = JSON.stringify(JSON.parse(input));
        } catch {
          result = input.replace(/\s+/g, " ").trim();
        }
      } else if (toolName.includes("encode") || toolName.includes("base64")) {
        try {
          result = btoa(unescape(encodeURIComponent(input)));
        } catch {
          result = btoa(input);
        }
      } else if (toolName.includes("decode")) {
        try {
          result = decodeURIComponent(escape(atob(input.trim())));
        } catch {
          try { result = atob(input.trim()); } catch { result = decodeURIComponent(input); }
        }
      } else if (toolName.includes("hash") || toolName.includes("checksum")) {
        // Simple string hash
        let h = 0;
        for (let i = 0; i < input.length; i++) {
          h = ((h << 5) - h + input.charCodeAt(i)) | 0;
        }
        result = `Hash (DJB2): ${(h >>> 0).toString(16).padStart(8, "0")}\nLength: ${input.length} characters`;
      } else if (toolName.includes("escape")) {
        result = input
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t");
      } else if (toolName.includes("unescape")) {
        result = input
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
      } else if (toolName.includes("reverse")) {
        result = input.split("").reverse().join("");
      } else if (toolName.includes("sort")) {
        result = input.split("\n").sort().join("\n");
      } else if (toolName.includes("unique") || toolName.includes("dedup")) {
        result = [...new Set(input.split("\n"))].join("\n");
      } else if (toolName.includes("count") || toolName.includes("stat")) {
        const lines = input.split("\n").length;
        const words = input.trim().split(/\s+/).filter(Boolean).length;
        const chars = input.length;
        const bytes = new TextEncoder().encode(input).length;
        result = `Lines: ${lines}\nWords: ${words}\nCharacters: ${chars}\nBytes: ${bytes}`;
      } else if (toolName.includes("upper")) {
        result = input.toUpperCase();
      } else if (toolName.includes("lower")) {
        result = input.toLowerCase();
      } else if (toolName.includes("extract")) {
        const emails = input.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [];
        const urls = input.match(/https?:\/\/[^\s)]+/g) || [];
        const ips = input.match(/\b\d{1,3}(\.\d{1,3}){3}\b/g) || [];
        const parts: string[] = [];
        if (emails.length) parts.push("Emails:\n" + emails.join("\n"));
        if (urls.length) parts.push("URLs:\n" + urls.join("\n"));
        if (ips.length) parts.push("IPs:\n" + ips.join("\n"));
        result = parts.length ? parts.join("\n\n") : "No patterns (emails, URLs, IPs) found.";
      } else if (toolName.includes("convert") || toolName.includes("transform")) {
        // Convert to numbered list
        result = input.split("\n").map((line, i) => `${i + 1}. ${line}`).join("\n");
      } else if (toolName.includes("generat")) {
        // Generate lorem-style text from input words
        const words = input.trim().split(/\s+/);
        const sentences: string[] = [];
        for (let i = 0; i < 5; i++) {
          const len = 5 + Math.floor(Math.random() * 10);
          const s = Array.from({ length: len }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
          sentences.push(s.charAt(0).toUpperCase() + s.slice(1) + ".");
        }
        result = sentences.join(" ");
      } else {
        // Default: clean + provide stats header
        const cleaned = input.split("\n").map((l) => l.trimEnd()).filter(Boolean).join("\n");
        const lines = cleaned.split("\n").length;
        const words = cleaned.trim().split(/\s+/).filter(Boolean).length;
        result = `--- ${words} words | ${input.length} chars | ${lines} lines ---\n\n${cleaned}`;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Processing failed");
      return;
    }

    setOutput(result);
  };

  return (
    <div className={cardStyle}>
      <label className={labelStyle}>Input</label>
      <textarea className={inputStyle} rows={8} placeholder="Enter your input..." value={input} onChange={(e) => setInput(e.target.value)} style={{ fontFamily: "monospace" }} />
      <div className="flex gap-3 mt-4 flex-wrap">
        <button className={btnStyle} style={{ background: btnGradient }} onClick={processGeneric}>Process</button>
        {output && <button className={smallBtnStyle} onClick={() => doCopy(output)}>{copied ? "Copied!" : "Copy Output"}</button>}
        {input && <button className={smallBtnStyle} onClick={() => { setInput(""); setOutput(""); setError(""); }}>Clear</button>}
      </div>
      {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
      {output && (
        <div className="mt-4">
          <label className={labelStyle}>Output</label>
          <textarea className={inputStyle} rows={8} readOnly value={output} style={{ fontFamily: "monospace" }} />
        </div>
      )}
    </div>
  );
}
