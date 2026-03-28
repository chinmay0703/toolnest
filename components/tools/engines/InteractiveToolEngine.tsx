"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { Tool } from "@/lib/tools";

/* ------------------------------------------------------------------ */
/*  Shared style constants                                            */
/* ------------------------------------------------------------------ */
const btnClass =
  "text-white rounded-xl px-6 py-3 font-semibold hover:scale-105 transition-transform cursor-pointer";
const btnStyle = {
  background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
};
const btnSmClass =
  "text-white rounded-lg px-4 py-2 text-sm font-semibold hover:scale-105 transition-transform cursor-pointer";
const inputClass =
  "bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl px-4 py-3 w-full outline-none focus:border-[#7C3AED] transition";
const cardClass = "bg-[#0F1629] border border-[#1E2D4A] rounded-xl p-6";
const labelClass = "block text-[#94A3B8] text-sm mb-1";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
}

function playBeep(frequency = 800, duration = 300) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {}
}

function formatTime(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ml = Math.floor((ms % 1000) / 10);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ml).padStart(2, "0")}`;
}

/* ================================================================== */
/*  PRODUCTIVITY                                                      */
/* ================================================================== */

/* 1. Pomodoro Timer ------------------------------------------------ */
function PomodoroTimer() {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = mode === "work" ? 25 * 60 : 5 * 60;
  const progress = ((total - seconds) / total) * 100;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            playBeep(880, 500);
            if (mode === "work") {
              setMode("break");
              setCycles((c) => c + 1);
              return 5 * 60;
            } else {
              setMode("work");
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setMode("work");
    setSeconds(25 * 60);
    setCycles(0);
  };

  const circumference = 2 * Math.PI * 90;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#1E2D4A" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="90" fill="none"
            stroke={mode === "work" ? "#7C3AED" : "#06B6D4"}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
            {mm}:{ss}
          </span>
          <span className="text-[#94A3B8] text-sm mt-1 uppercase tracking-wider">
            {mode === "work" ? "Focus" : "Break"}
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <button className={btnClass} style={btnStyle} onClick={() => setRunning(!running)}>
          {running ? "Pause" : "Start"}
        </button>
        <button className={btnClass} style={{ background: "#1E2D4A" }} onClick={reset}>
          Reset
        </button>
      </div>
      <p className="text-[#475569] text-sm">Completed cycles: {cycles}</p>
    </div>
  );
}

/* 2. Stopwatch ----------------------------------------------------- */
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef<number>(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (running) {
      startRef.current = performance.now() - elapsedRef.current;
      const tick = () => {
        elapsedRef.current = performance.now() - startRef.current;
        setElapsed(elapsedRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setLaps([]);
  };

  const lap = () => setLaps([elapsed, ...laps]);

  return (
    <div className="flex flex-col items-center gap-6">
      <span className="font-mono text-5xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
        {formatTime(elapsed)}
      </span>
      <div className="flex gap-3">
        <button className={btnClass} style={btnStyle} onClick={() => setRunning(!running)}>
          {running ? "Stop" : "Start"}
        </button>
        {running && (
          <button className={btnClass} style={{ background: "#1E2D4A" }} onClick={lap}>
            Lap
          </button>
        )}
        <button className={btnClass} style={{ background: "#1E2D4A" }} onClick={reset}>
          Reset
        </button>
      </div>
      {laps.length > 0 && (
        <div className="w-full max-w-md space-y-1">
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between text-sm px-4 py-2 rounded-lg bg-[#030712] border border-[#1E2D4A]">
              <span className="text-[#94A3B8]">Lap {laps.length - i}</span>
              <span className="font-mono text-[#F1F5F9]">{formatTime(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* 3. Countdown Timer ----------------------------------------------- */
function CountdownTimer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [secs, setSecs] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    const total = hours * 3600 + minutes * 60 + secs;
    if (total <= 0) return;
    setRemaining(total);
    setRunning(true);
    setDone(false);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false);
            setDone(true);
            playBeep(660, 500);
            setTimeout(() => playBeep(880, 500), 600);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setRemaining(0);
    setDone(false);
  };

  const rh = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const rm = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const rs = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-6">
      {!running && remaining === 0 && !done ? (
        <div className="flex gap-3 items-end">
          <div>
            <label className={labelClass}>Hours</label>
            <input className={`${inputClass} w-20 text-center`} type="number" min={0} max={99} value={hours} onChange={(e) => setHours(+e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Minutes</label>
            <input className={`${inputClass} w-20 text-center`} type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(+e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Seconds</label>
            <input className={`${inputClass} w-20 text-center`} type="number" min={0} max={59} value={secs} onChange={(e) => setSecs(+e.target.value)} />
          </div>
        </div>
      ) : (
        <span className={`font-mono text-5xl font-bold ${done ? "text-red-400 animate-pulse" : "bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent"}`}>
          {rh}:{rm}:{rs}
        </span>
      )}
      {done && <p className="text-red-400 font-semibold animate-pulse">Time is up!</p>}
      <div className="flex gap-3">
        {!running && remaining === 0 && !done ? (
          <button className={btnClass} style={btnStyle} onClick={start}>Start</button>
        ) : (
          <>
            <button className={btnClass} style={btnStyle} onClick={() => setRunning(!running)}>
              {running ? "Pause" : "Resume"}
            </button>
            <button className={btnClass} style={{ background: "#1E2D4A" }} onClick={reset}>Reset</button>
          </>
        )}
      </div>
    </div>
  );
}

/* 4. World Clock --------------------------------------------------- */
const CITIES: { name: string; tz: string }[] = [
  { name: "New York", tz: "America/New_York" },
  { name: "London", tz: "Europe/London" },
  { name: "Tokyo", tz: "Asia/Tokyo" },
  { name: "Sydney", tz: "Australia/Sydney" },
  { name: "Dubai", tz: "Asia/Dubai" },
  { name: "Mumbai", tz: "Asia/Kolkata" },
];

function WorldClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CITIES.map((c) => {
        const time = now.toLocaleTimeString("en-US", { timeZone: c.tz, hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const date = now.toLocaleDateString("en-US", { timeZone: c.tz, weekday: "short", month: "short", day: "numeric" });
        return (
          <div key={c.tz} className={`${cardClass} text-center`}>
            <p className="text-[#94A3B8] text-sm mb-1">{c.name}</p>
            <p className="font-mono text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
              {time}
            </p>
            <p className="text-[#475569] text-xs mt-1">{date}</p>
          </div>
        );
      })}
    </div>
  );
}

/* 5. Todo List ----------------------------------------------------- */
interface TodoItem { id: string; text: string; done: boolean; }

function TodoList() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>("toolnest-todos", []);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const add = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), text: input.trim(), done: false }]);
    setInput("");
  };
  const toggle = (id: string) => setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTodos(todos.filter((t) => t.id !== id));

  const filtered = todos.filter((t) => (filter === "all" ? true : filter === "active" ? !t.done : t.done));

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input className={inputClass} placeholder="Add a task..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className={btnClass} style={btnStyle} onClick={add}>Add</button>
      </div>
      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <button key={f} className={`${btnSmClass} capitalize`} style={filter === f ? btnStyle : { background: "#1E2D4A" }} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-[#475569] text-sm text-center py-4">No tasks here.</p>}
        {filtered.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#030712] border border-[#1E2D4A]">
            <button className="cursor-pointer text-lg" onClick={() => toggle(t.id)}>
              {t.done ? <span className="text-[#06B6D4]">&#10003;</span> : <span className="text-[#475569]">&#9675;</span>}
            </button>
            <span className={`flex-1 text-sm ${t.done ? "line-through text-[#475569]" : "text-[#F1F5F9]"}`}>{t.text}</span>
            <button className="text-red-400 hover:text-red-300 cursor-pointer" onClick={() => remove(t.id)}>&times;</button>
          </div>
        ))}
      </div>
      <p className="text-[#475569] text-xs">{todos.filter((t) => !t.done).length} tasks remaining</p>
    </div>
  );
}

/* 6. Quick Notes --------------------------------------------------- */
function QuickNotes() {
  const [text, setText] = useLocalStorage("toolnest-notes", "");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;

  return (
    <div className="space-y-3">
      <textarea className={`${inputClass} resize-y min-h-[200px]`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Start typing your notes..." rows={10} />
      <div className="flex justify-between text-xs text-[#475569]">
        <span>Auto-saved to localStorage</span>
        <span>{words} words &middot; {chars} characters</span>
      </div>
    </div>
  );
}

/* 7. Typing Speed Test --------------------------------------------- */
const TYPING_TEXTS = [
  "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
  "Technology is best when it brings people together. Innovation distinguishes between a leader and a follower. The only way to do great work is to love what you do.",
  "In the middle of every difficulty lies opportunity. Life is what happens when you are busy making other plans. The purpose of our lives is to be happy and spread joy.",
];

function TypingSpeedTest() {
  const [textIndex, setTextIndex] = useState(0);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const target = TYPING_TEXTS[textIndex];

  const handleChange = (val: string) => {
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }
    setInput(val);
    if (val.length >= target.length) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const wordCount = target.split(/\s+/).length;
      setWpm(Math.round(wordCount / elapsed));
      let correct = 0;
      for (let i = 0; i < target.length; i++) {
        if (val[i] === target[i]) correct++;
      }
      setAccuracy(Math.round((correct / target.length) * 100));
      setFinished(true);
    }
  };

  const restart = () => {
    setInput("");
    setStarted(false);
    setFinished(false);
    setTextIndex((textIndex + 1) % TYPING_TEXTS.length);
  };

  return (
    <div className="space-y-6">
      <div className={`${cardClass} font-mono text-sm leading-relaxed`}>
        {target.split("").map((ch, i) => {
          let color = "#475569";
          if (i < input.length) color = input[i] === ch ? "#06B6D4" : "#EF4444";
          return <span key={i} style={{ color }}>{ch}</span>;
        })}
      </div>
      <textarea className={`${inputClass} font-mono resize-none`} value={input} onChange={(e) => handleChange(e.target.value)} disabled={finished} placeholder="Start typing here..." rows={4} />
      {finished && (
        <div className="flex gap-6 justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">{wpm}</p>
            <p className="text-[#94A3B8] text-xs">WPM</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">{accuracy}%</p>
            <p className="text-[#94A3B8] text-xs">Accuracy</p>
          </div>
        </div>
      )}
      {finished && (
        <div className="flex justify-center">
          <button className={btnClass} style={btnStyle} onClick={restart}>Try Again</button>
        </div>
      )}
    </div>
  );
}

/* 8. Breathing Exercise -------------------------------------------- */
function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [timer, setTimer] = useState(4);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setPhase((p) => {
            if (p === "in") return "hold";
            if (p === "hold") return "out";
            setCycles((c) => c + 1);
            return "in";
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  const reset = () => {
    setActive(false);
    setPhase("in");
    setTimer(4);
    setCycles(0);
  };

  const scale = phase === "in" ? 1 + (4 - timer) * 0.15 : phase === "hold" ? 1.6 : 1 + timer * 0.15;
  const label = phase === "in" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out";
  const color = phase === "in" ? "#7C3AED" : phase === "hold" ? "#06B6D4" : "#7C3AED";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-52 h-52 flex items-center justify-center">
        <div
          className="rounded-full transition-transform duration-1000 ease-in-out"
          style={{
            width: 120,
            height: 120,
            transform: `scale(${scale})`,
            background: `radial-gradient(circle, ${color}66, ${color}22)`,
            border: `2px solid ${color}`,
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[#F1F5F9] font-semibold text-lg">{active ? label : "Ready"}</span>
          {active && <span className="font-mono text-2xl font-bold text-[#F1F5F9] mt-1">{timer}</span>}
        </div>
      </div>
      <div className="flex gap-3">
        <button className={btnClass} style={btnStyle} onClick={() => setActive(!active)}>
          {active ? "Pause" : "Start"}
        </button>
        <button className={btnClass} style={{ background: "#1E2D4A" }} onClick={reset}>Reset</button>
      </div>
      <p className="text-[#475569] text-sm">Completed cycles: {cycles}</p>
    </div>
  );
}

/* ================================================================== */
/*  DESIGN                                                            */
/* ================================================================== */

/* 9. Contrast Ratio Checker ---------------------------------------- */
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function relativeLuminance(r: number, g: number, b: number) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function ContrastRatioChecker() {
  const [fg, setFg] = useState("#F1F5F9");
  const [bg, setBg] = useState("#0F1629");

  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const l1 = relativeLuminance(...(fgRgb as [number, number, number]));
  const l2 = relativeLuminance(...(bgRgb as [number, number, number]));
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const ratioStr = ratio.toFixed(2);
  const aaLarge = ratio >= 3;
  const aa = ratio >= 4.5;
  const aaaLarge = ratio >= 4.5;
  const aaa = ratio >= 7;

  const Pass = () => <span className="text-green-400 font-semibold">Pass</span>;
  const Fail = () => <span className="text-red-400 font-semibold">Fail</span>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Foreground</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            <input className={inputClass} value={fg} onChange={(e) => setFg(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Background</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            <input className={inputClass} value={bg} onChange={(e) => setBg(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-8 text-center" style={{ backgroundColor: bg, color: fg }}>
        <p className="text-2xl font-bold">Sample Text</p>
        <p className="text-sm mt-1">The quick brown fox jumps over the lazy dog.</p>
      </div>

      <div className="text-center">
        <p className="text-4xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">{ratioStr}:1</p>
        <p className="text-[#94A3B8] text-sm mt-1">Contrast Ratio</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-sm">
        <div className="flex justify-between px-4 py-2 rounded-lg bg-[#030712] border border-[#1E2D4A]">
          <span className="text-[#94A3B8]">AA Normal</span>{aa ? <Pass /> : <Fail />}
        </div>
        <div className="flex justify-between px-4 py-2 rounded-lg bg-[#030712] border border-[#1E2D4A]">
          <span className="text-[#94A3B8]">AA Large</span>{aaLarge ? <Pass /> : <Fail />}
        </div>
        <div className="flex justify-between px-4 py-2 rounded-lg bg-[#030712] border border-[#1E2D4A]">
          <span className="text-[#94A3B8]">AAA Normal</span>{aaa ? <Pass /> : <Fail />}
        </div>
        <div className="flex justify-between px-4 py-2 rounded-lg bg-[#030712] border border-[#1E2D4A]">
          <span className="text-[#94A3B8]">AAA Large</span>{aaaLarge ? <Pass /> : <Fail />}
        </div>
      </div>
    </div>
  );
}

/* 10. Typography Scale --------------------------------------------- */
function TypographyScale() {
  const [base, setBase] = useState(16);
  const [ratio, setRatio] = useState(1.25);
  const RATIOS = [
    { label: "Minor Third (1.2)", v: 1.2 },
    { label: "Major Third (1.25)", v: 1.25 },
    { label: "Perfect Fourth (1.333)", v: 1.333 },
    { label: "Augmented Fourth (1.414)", v: 1.414 },
    { label: "Perfect Fifth (1.5)", v: 1.5 },
    { label: "Golden Ratio (1.618)", v: 1.618 },
  ];
  const labels = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
  const sizes = labels.map((_, i) => base * Math.pow(ratio, i - 2));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Base Size (px)</label>
          <input className={inputClass} type="number" min={8} max={48} value={base} onChange={(e) => setBase(+e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Ratio</label>
          <select className={inputClass} value={ratio} onChange={(e) => setRatio(+e.target.value)}>
            {RATIOS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-3">
        {sizes.map((s, i) => (
          <div key={i} className="flex items-baseline gap-4 px-4 py-2 rounded-lg bg-[#030712] border border-[#1E2D4A]">
            <span className="text-[#7C3AED] font-mono text-xs w-12">{labels[i]}</span>
            <span className="text-[#475569] font-mono text-xs w-16">{s.toFixed(1)}px</span>
            <span className="text-[#F1F5F9]" style={{ fontSize: `${s}px`, lineHeight: 1.3 }}>The quick brown fox</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 11. Font Previewer ------------------------------------------------ */
const FONTS = [
  "Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS",
  "Times New Roman", "Georgia", "Garamond", "Courier New",
  "Brush Script MT", "Impact", "Comic Sans MS", "Lucida Console",
  "Palatino Linotype", "Segoe UI", "system-ui", "monospace",
];

function FontPreviewer() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  const [font, setFont] = useState("Arial");
  const sizes = [12, 16, 20, 24, 32, 48];

  return (
    <div className="space-y-6">
      <input className={inputClass} value={text} onChange={(e) => setText(e.target.value)} placeholder="Preview text..." />
      <select className={inputClass} value={font} onChange={(e) => setFont(e.target.value)}>
        {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <div className="space-y-3">
        {sizes.map((s) => (
          <div key={s} className="px-4 py-3 rounded-lg bg-[#030712] border border-[#1E2D4A]">
            <span className="text-[#475569] text-xs font-mono block mb-1">{s}px</span>
            <span className="text-[#F1F5F9]" style={{ fontFamily: font, fontSize: s }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  FUN                                                               */
/* ================================================================== */

/* 12. Dice Roller -------------------------------------------------- */
function DiceRoller() {
  const [count, setCount] = useState(2);
  const [results, setResults] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    setRolling(true);
    let ticks = 0;
    const id = setInterval(() => {
      setResults(Array.from({ length: count }, () => Math.ceil(Math.random() * 6)));
      ticks++;
      if (ticks >= 10) {
        clearInterval(id);
        setRolling(false);
      }
    }, 80);
  };

  const DOTS: Record<number, number[][]> = {
    1: [[1,1]], 2: [[0,0],[2,2]], 3: [[0,0],[1,1],[2,2]],
    4: [[0,0],[0,2],[2,0],[2,2]], 5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
    6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <label className="text-[#94A3B8] text-sm">Number of dice:</label>
        <select className={`${inputClass} w-20`} value={count} onChange={(e) => setCount(+e.target.value)}>
          {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <button className={btnClass} style={btnStyle} onClick={roll} disabled={rolling}>
        {rolling ? "Rolling..." : "Roll Dice"}
      </button>
      {results.length > 0 && (
        <div className="flex gap-4 flex-wrap justify-center">
          {results.map((val, i) => (
            <div key={i} className={`w-16 h-16 rounded-xl border-2 border-[#7C3AED] bg-[#030712] relative ${rolling ? "animate-bounce" : ""}`}>
              {(DOTS[val] || []).map(([r, c], di) => (
                <div key={di} className="absolute w-3 h-3 rounded-full bg-[#F1F5F9]" style={{ top: `${8 + r * 18}px`, left: `${8 + c * 18}px` }} />
              ))}
            </div>
          ))}
        </div>
      )}
      {results.length > 0 && !rolling && (
        <p className="text-[#94A3B8] text-sm">Total: <span className="font-bold text-[#F1F5F9]">{results.reduce((a, b) => a + b, 0)}</span></p>
      )}
    </div>
  );
}

/* 13. Coin Flipper ------------------------------------------------- */
function CoinFlipper() {
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [history, setHistory] = useState<("heads" | "tails")[]>([]);

  const flip = () => {
    setFlipping(true);
    let ticks = 0;
    const id = setInterval(() => {
      setResult(Math.random() > 0.5 ? "heads" : "tails");
      ticks++;
      if (ticks >= 12) {
        clearInterval(id);
        setFlipping(false);
        setResult((r) => {
          if (r) setHistory((h) => [r, ...h]);
          return r;
        });
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${result === "heads" ? "border-[#7C3AED]" : "border-[#06B6D4]"} bg-[#030712] ${flipping ? "animate-spin" : ""} transition-all`}>
        <span className="text-3xl font-bold text-[#F1F5F9]">{result ? (result === "heads" ? "H" : "T") : "?"}</span>
      </div>
      {result && !flipping && <p className="text-[#F1F5F9] font-semibold text-xl capitalize">{result}</p>}
      <button className={btnClass} style={btnStyle} onClick={flip} disabled={flipping}>
        {flipping ? "Flipping..." : "Flip Coin"}
      </button>
      {history.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="text-[#94A3B8] text-xs mb-2">History ({history.filter((h) => h === "heads").length}H / {history.filter((h) => h === "tails").length}T)</p>
          <div className="flex gap-1 flex-wrap">
            {history.slice(0, 50).map((h, i) => (
              <span key={i} className={`text-xs px-2 py-1 rounded ${h === "heads" ? "bg-[#7C3AED33] text-[#7C3AED]" : "bg-[#06B6D433] text-[#06B6D4]"}`}>
                {h === "heads" ? "H" : "T"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* 14. Spin the Wheel ----------------------------------------------- */
function SpinTheWheel() {
  const [itemsText, setItemsText] = useState("Pizza\nBurger\nSushi\nTacos\nPasta");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const items = itemsText.split("\n").map((s) => s.trim()).filter(Boolean);
  const COLORS = ["#7C3AED", "#06B6D4", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#6366F1", "#14B8A6"];

  const spin = () => {
    if (items.length < 2 || spinning) return;
    setSpinning(true);
    setWinner(null);
    const spins = 5 + Math.random() * 5;
    const newRotation = rotation + spins * 360;
    setRotation(newRotation);
    setTimeout(() => {
      const normalized = newRotation % 360;
      const segAngle = 360 / items.length;
      const idx = Math.floor(((360 - normalized + segAngle / 2) % 360) / segAngle) % items.length;
      setWinner(items[idx]);
      setSpinning(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <textarea className={`${inputClass} max-w-sm`} rows={5} value={itemsText} onChange={(e) => setItemsText(e.target.value)} placeholder="One item per line..." />

      {items.length >= 2 && (
        <div className="relative w-64 h-64">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 z-10"
            style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "16px solid #F1F5F9" }} />
          <svg viewBox="0 0 200 200" className="w-full h-full" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" : "none" }}>
            {items.map((item, i) => {
              const angle = (360 / items.length) * i;
              const endAngle = angle + 360 / items.length;
              const startRad = (angle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const x1 = 100 + 95 * Math.cos(startRad);
              const y1 = 100 + 95 * Math.sin(startRad);
              const x2 = 100 + 95 * Math.cos(endRad);
              const y2 = 100 + 95 * Math.sin(endRad);
              const largeArc = 360 / items.length > 180 ? 1 : 0;
              const midAngle = (angle + endAngle) / 2;
              const midRad = (midAngle * Math.PI) / 180;
              const tx = 100 + 60 * Math.cos(midRad);
              const ty = 100 + 60 * Math.sin(midRad);
              return (
                <g key={i}>
                  <path d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`} fill={COLORS[i % COLORS.length]} stroke="#0F1629" strokeWidth="1" />
                  <text x={tx} y={ty} fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${midAngle}, ${tx}, ${ty})`}>
                    {item.length > 10 ? item.slice(0, 10) + "..." : item}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <button className={btnClass} style={btnStyle} onClick={spin} disabled={spinning || items.length < 2}>
        {spinning ? "Spinning..." : "Spin!"}
      </button>

      {winner && !spinning && (
        <div className={`${cardClass} text-center`}>
          <p className="text-[#94A3B8] text-sm">Winner:</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">{winner}</p>
        </div>
      )}
    </div>
  );
}

/* 15. Random Name Picker ------------------------------------------- */
function RandomNamePicker() {
  const [namesText, setNamesText] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [picking, setPicking] = useState(false);
  const names = namesText.split("\n").map((s) => s.trim()).filter(Boolean);

  const pick = () => {
    if (names.length === 0 || picking) return;
    setPicking(true);
    setWinner(null);
    let ticks = 0;
    const total = 20;
    const id = setInterval(() => {
      setHighlightIdx(Math.floor(Math.random() * names.length));
      ticks++;
      if (ticks >= total) {
        clearInterval(id);
        const winnerIdx = Math.floor(Math.random() * names.length);
        setHighlightIdx(winnerIdx);
        setWinner(names[winnerIdx]);
        setPicking(false);
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <textarea className={inputClass} rows={5} value={namesText} onChange={(e) => setNamesText(e.target.value)} placeholder="One name per line..." />
      <div className="flex flex-wrap gap-2">
        {names.map((n, i) => (
          <span key={i} className={`px-3 py-1 rounded-lg text-sm transition-all ${i === highlightIdx ? "bg-[#7C3AED] text-white scale-110" : "bg-[#030712] border border-[#1E2D4A] text-[#94A3B8]"}`}>
            {n}
          </span>
        ))}
      </div>
      <div className="flex justify-center">
        <button className={btnClass} style={btnStyle} onClick={pick} disabled={picking || names.length === 0}>
          {picking ? "Picking..." : "Pick a Name"}
        </button>
      </div>
      {winner && !picking && (
        <div className="text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">{winner}</p>
        </div>
      )}
    </div>
  );
}

/* 16. Decision Maker ----------------------------------------------- */
function DecisionMaker() {
  const [optionsText, setOptionsText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);
  const options = optionsText.split("\n").map((s) => s.trim()).filter(Boolean);

  const decide = () => {
    if (options.length === 0 || deciding) return;
    setDeciding(true);
    setResult(null);
    let ticks = 0;
    const id = setInterval(() => {
      setResult(options[Math.floor(Math.random() * options.length)]);
      ticks++;
      if (ticks >= 15) {
        clearInterval(id);
        setResult(options[Math.floor(Math.random() * options.length)]);
        setDeciding(false);
      }
    }, 120);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <textarea className={`${inputClass} max-w-md`} rows={5} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="Enter options, one per line..." />
      <button className={btnClass} style={btnStyle} onClick={decide} disabled={deciding || options.length === 0}>
        {deciding ? "Deciding..." : "Decide For Me!"}
      </button>
      {result && (
        <div className={`${cardClass} text-center min-w-[200px] ${deciding ? "animate-pulse" : ""}`}>
          <p className="text-[#94A3B8] text-sm mb-2">The answer is:</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">{result}</p>
        </div>
      )}
    </div>
  );
}

/* 17. Memory Game -------------------------------------------------- */
const EMOJIS_POOL = ["A", "B", "C", "D", "E", "F", "G", "H"];

function MemoryGame() {
  const [cards, setCards] = useState<{ value: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const pairs = EMOJIS_POOL.slice(0, 8);
    const deck = [...pairs, ...pairs].sort(() => Math.random() - 0.5).map((v) => ({ value: v, flipped: false, matched: false }));
    setCards(deck);
    setSelected([]);
    setMoves(0);
    setStartTime(Date.now());
    setElapsed(0);
    setWon(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    if (startTime && !won) {
      const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
      return () => clearInterval(id);
    }
  }, [startTime, won]);

  const handleClick = (idx: number) => {
    if (cards[idx].flipped || cards[idx].matched || selected.length >= 2) return;
    const next = [...cards];
    next[idx].flipped = true;
    setCards(next);
    const newSel = [...selected, idx];
    setSelected(newSel);

    if (newSel.length === 2) {
      setMoves((m) => m + 1);
      if (next[newSel[0]].value === next[newSel[1]].value) {
        next[newSel[0]].matched = true;
        next[newSel[1]].matched = true;
        setCards([...next]);
        setSelected([]);
        if (next.every((c) => c.matched)) setWon(true);
      } else {
        setTimeout(() => {
          next[newSel[0]].flipped = false;
          next[newSel[1]].flipped = false;
          setCards([...next]);
          setSelected([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-6 text-sm text-[#94A3B8]">
        <span>Moves: <span className="text-[#F1F5F9] font-bold">{moves}</span></span>
        <span>Time: <span className="text-[#F1F5F9] font-bold">{elapsed}s</span></span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <button
            key={i}
            className={`w-16 h-16 rounded-xl text-xl font-bold flex items-center justify-center cursor-pointer transition-all duration-300 ${
              card.flipped || card.matched
                ? "bg-[#7C3AED] text-white scale-105"
                : "bg-[#030712] border border-[#1E2D4A] text-transparent hover:border-[#7C3AED]"
            } ${card.matched ? "opacity-60" : ""}`}
            onClick={() => handleClick(i)}
          >
            {card.flipped || card.matched ? card.value : "?"}
          </button>
        ))}
      </div>
      {won && (
        <div className="text-center">
          <p className="text-xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">You won in {moves} moves!</p>
        </div>
      )}
      <button className={btnClass} style={btnStyle} onClick={initGame}>New Game</button>
    </div>
  );
}

/* 18. Random Team Generator ---------------------------------------- */
function RandomTeamGenerator() {
  const [namesText, setNamesText] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const names = namesText.split("\n").map((s) => s.trim()).filter(Boolean);

  const generate = () => {
    if (names.length === 0) return;
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const result: string[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((n, i) => result[i % teamCount].push(n));
    setTeams(result);
  };

  return (
    <div className="space-y-6">
      <textarea className={inputClass} rows={5} value={namesText} onChange={(e) => setNamesText(e.target.value)} placeholder="One name per line..." />
      <div className="flex gap-3 items-end">
        <div>
          <label className={labelClass}>Number of Teams</label>
          <input className={`${inputClass} w-24`} type="number" min={2} max={20} value={teamCount} onChange={(e) => setTeamCount(+e.target.value)} />
        </div>
        <button className={btnClass} style={btnStyle} onClick={generate}>Generate Teams</button>
      </div>
      {teams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, i) => (
            <div key={i} className={cardClass}>
              <h3 className="font-bold text-[#7C3AED] mb-2">Team {i + 1}</h3>
              <ul className="space-y-1">
                {team.map((n, j) => <li key={j} className="text-[#F1F5F9] text-sm">{n}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* 19. Sudoku Generator --------------------------------------------- */
function generateSudoku(): { puzzle: number[][]; solution: number[][] } {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++)
        if (board[r][c] === num) return false;
    return true;
  }

  function solve(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
          for (const n of nums) {
            if (isValid(board, r, c, n)) {
              board[r][c] = n;
              if (solve(board)) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve(board);
  const solution = board.map((r) => [...r]);
  // Remove cells to create puzzle (roughly 40 cells removed)
  let removed = 0;
  while (removed < 40) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (board[r][c] !== 0) {
      board[r][c] = 0;
      removed++;
    }
  }
  return { puzzle: board.map((r) => [...r]), solution };
}

function SudokuGenerator() {
  const [data, setData] = useState<{ puzzle: number[][]; solution: number[][] } | null>(null);
  const [userGrid, setUserGrid] = useState<number[][]>([]);
  const [message, setMessage] = useState("");

  const newGame = () => {
    const d = generateSudoku();
    setData(d);
    setUserGrid(d.puzzle.map((r) => [...r]));
    setMessage("");
  };

  useEffect(() => { newGame(); }, []);

  const handleInput = (r: number, c: number, val: string) => {
    if (!data || data.puzzle[r][c] !== 0) return;
    const next = userGrid.map((row) => [...row]);
    next[r][c] = parseInt(val) || 0;
    setUserGrid(next);
  };

  const check = () => {
    if (!data) return;
    const correct = userGrid.every((row, r) => row.every((v, c) => v === data.solution[r][c]));
    setMessage(correct ? "Correct! Well done!" : "Some cells are incorrect. Keep trying!");
  };

  if (!data) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-9 gap-0 border-2 border-[#7C3AED] rounded-lg overflow-hidden">
        {userGrid.map((row, r) =>
          row.map((val, c) => {
            const isOriginal = data.puzzle[r][c] !== 0;
            const borderR = c % 3 === 2 && c < 8 ? "border-r-2 border-r-[#7C3AED]" : "border-r border-r-[#1E2D4A]";
            const borderB = r % 3 === 2 && r < 8 ? "border-b-2 border-b-[#7C3AED]" : "border-b border-b-[#1E2D4A]";
            return (
              <input
                key={`${r}-${c}`}
                className={`w-9 h-9 text-center text-sm font-bold outline-none ${borderR} ${borderB} ${
                  isOriginal ? "bg-[#1E2D4A] text-[#F1F5F9] cursor-default" : "bg-[#030712] text-[#06B6D4] cursor-text"
                }`}
                value={val || ""}
                onChange={(e) => handleInput(r, c, e.target.value)}
                readOnly={isOriginal}
                maxLength={1}
              />
            );
          })
        )}
      </div>
      <div className="flex gap-3">
        <button className={btnClass} style={btnStyle} onClick={check}>Check Solution</button>
        <button className={btnClass} style={{ background: "#1E2D4A" }} onClick={newGame}>New Puzzle</button>
      </div>
      {message && (
        <p className={`font-semibold ${message.includes("Correct") ? "text-green-400" : "text-yellow-400"}`}>{message}</p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  HEALTH                                                            */
/* ================================================================== */

/* 20. Sleep Calculator --------------------------------------------- */
function SleepCalculator() {
  const [mode, setMode] = useState<"wake" | "sleep">("wake");
  const [time, setTime] = useState("07:00");
  const [results, setResults] = useState<string[]>([]);

  const calculate = () => {
    const [h, m] = time.split(":").map(Number);
    const base = h * 60 + m;
    const cycleTimes: string[] = [];

    if (mode === "wake") {
      // Going to bed: subtract 6, 5, 4, 3 cycles (each 90 min) + 15 min to fall asleep
      for (let cycles = 6; cycles >= 3; cycles--) {
        let bedMin = base - cycles * 90 - 15;
        if (bedMin < 0) bedMin += 1440;
        const bh = Math.floor(bedMin / 60) % 24;
        const bm = bedMin % 60;
        cycleTimes.push(`${String(bh).padStart(2, "0")}:${String(bm).padStart(2, "0")} (${cycles} cycles, ${(cycles * 1.5).toFixed(1)}h)`);
      }
    } else {
      // Waking up: add 15 min + 3, 4, 5, 6 cycles
      for (let cycles = 3; cycles <= 6; cycles++) {
        let wakeMin = base + 15 + cycles * 90;
        wakeMin = wakeMin % 1440;
        const wh = Math.floor(wakeMin / 60) % 24;
        const wm = wakeMin % 60;
        cycleTimes.push(`${String(wh).padStart(2, "0")}:${String(wm).padStart(2, "0")} (${cycles} cycles, ${(cycles * 1.5).toFixed(1)}h)`);
      }
    }
    setResults(cycleTimes);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex gap-2">
        <button className={btnSmClass} style={mode === "wake" ? btnStyle : { background: "#1E2D4A" }} onClick={() => { setMode("wake"); setResults([]); }}>
          I need to wake up at...
        </button>
        <button className={btnSmClass} style={mode === "sleep" ? btnStyle : { background: "#1E2D4A" }} onClick={() => { setMode("sleep"); setResults([]); }}>
          I&apos;m going to bed at...
        </button>
      </div>
      <div>
        <label className={labelClass}>{mode === "wake" ? "Wake-up time" : "Bedtime"}</label>
        <input className={inputClass} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <button className={btnClass} style={btnStyle} onClick={calculate}>Calculate</button>
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-[#94A3B8] text-sm">{mode === "wake" ? "Recommended bedtimes:" : "Recommended wake-up times:"}</p>
          {results.map((r, i) => (
            <div key={i} className={`px-4 py-3 rounded-xl bg-[#030712] border border-[#1E2D4A] ${i === 0 ? "border-[#7C3AED]" : ""}`}>
              <span className="font-mono text-[#F1F5F9] font-bold">{r}</span>
              {i === 0 && <span className="text-[#7C3AED] text-xs ml-2">Recommended</span>}
            </div>
          ))}
          <p className="text-[#475569] text-xs">Based on 90-minute sleep cycles. Includes 15 min to fall asleep.</p>
        </div>
      )}
    </div>
  );
}

/* 21. Water Intake Tracker ----------------------------------------- */
function WaterIntakeTracker() {
  const [weight, setWeight] = useLocalStorage("toolnest-water-weight", 70);
  const [glasses, setGlasses] = useLocalStorage("toolnest-water-glasses", 0);
  const [lastDate, setLastDate] = useLocalStorage("toolnest-water-date", "");
  const recommended = Math.round(weight * 0.033 * 1000); // ml
  const glassSize = 250; // ml
  const recGlasses = Math.ceil(recommended / glassSize);
  const progress = Math.min((glasses / recGlasses) * 100, 100);

  const today = new Date().toDateString();
  useEffect(() => {
    if (lastDate !== today) {
      setGlasses(0);
      setLastDate(today);
    }
  }, [lastDate, today, setGlasses, setLastDate]);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <label className={labelClass}>Weight (kg)</label>
        <input className={inputClass} type="number" min={20} max={300} value={weight} onChange={(e) => setWeight(+e.target.value)} />
      </div>
      <p className="text-[#94A3B8] text-sm">Recommended: {recommended}ml ({recGlasses} glasses of {glassSize}ml)</p>

      <div className="relative w-full h-6 rounded-full bg-[#030712] border border-[#1E2D4A] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }} />
      </div>
      <p className="text-center text-[#F1F5F9] font-bold">{glasses} / {recGlasses} glasses ({glasses * glassSize}ml)</p>

      <div className="flex gap-3 justify-center">
        <button className={btnClass} style={btnStyle} onClick={() => setGlasses(glasses + 1)}>
          + Add Glass
        </button>
        {glasses > 0 && (
          <button className={btnClass} style={{ background: "#1E2D4A" }} onClick={() => setGlasses(glasses - 1)}>
            - Remove
          </button>
        )}
      </div>
      {progress >= 100 && <p className="text-center text-green-400 font-semibold">You hit your daily goal!</p>}
    </div>
  );
}

/* 22. Heart Rate Calculator ---------------------------------------- */
function HeartRateCalculator() {
  const [age, setAge] = useState(30);
  const maxHR = 220 - age;
  const zones = [
    { name: "Warm Up", range: [50, 60], color: "#06B6D4" },
    { name: "Fat Burn", range: [60, 70], color: "#10B981" },
    { name: "Cardio", range: [70, 80], color: "#F59E0B" },
    { name: "Peak", range: [80, 85], color: "#EF4444" },
    { name: "Max Effort", range: [85, 100], color: "#7C3AED" },
  ];

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <label className={labelClass}>Your Age</label>
        <input className={inputClass} type="number" min={10} max={120} value={age} onChange={(e) => setAge(+e.target.value)} />
      </div>
      <p className="text-[#94A3B8] text-sm">Maximum Heart Rate: <span className="text-[#F1F5F9] font-bold">{maxHR} BPM</span></p>
      <div className="space-y-3">
        {zones.map((z) => {
          const low = Math.round(maxHR * (z.range[0] / 100));
          const high = Math.round(maxHR * (z.range[1] / 100));
          return (
            <div key={z.name} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#030712] border border-[#1E2D4A]">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: z.color }} />
              <span className="text-[#F1F5F9] font-semibold flex-1">{z.name}</span>
              <span className="text-[#94A3B8] text-sm">{z.range[0]}-{z.range[1]}%</span>
              <span className="font-mono text-[#F1F5F9] font-bold">{low}-{high} BPM</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 23. Due Date Calculator ------------------------------------------ */
function DueDateCalculator() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [result, setResult] = useState<{ dueDate: Date; weeks: number; trimester: string } | null>(null);

  const calculate = () => {
    if (!lastPeriod) return;
    const lmp = new Date(lastPeriod);
    const due = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    let trimester = "First Trimester (Weeks 1-12)";
    if (weeks > 27) trimester = "Third Trimester (Weeks 28-40)";
    else if (weeks > 12) trimester = "Second Trimester (Weeks 13-27)";
    setResult({ dueDate: due, weeks, trimester });
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <label className={labelClass}>First day of last period</label>
        <input className={inputClass} type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} />
      </div>
      <button className={btnClass} style={btnStyle} onClick={calculate}>Calculate</button>
      {result && (
        <div className={`${cardClass} space-y-3`}>
          <div className="text-center">
            <p className="text-[#94A3B8] text-sm">Estimated Due Date</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
              {result.dueDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#94A3B8]">Current week:</span>
            <span className="text-[#F1F5F9] font-bold">{result.weeks} weeks</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#94A3B8]">Trimester:</span>
            <span className="text-[#F1F5F9] font-bold">{result.trimester}</span>
          </div>
          <div className="relative w-full h-4 rounded-full bg-[#030712] border border-[#1E2D4A] overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((result.weeks / 40) * 100, 100)}%`, background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }} />
          </div>
          <p className="text-[#475569] text-xs text-center">{result.weeks}/40 weeks</p>
        </div>
      )}
    </div>
  );
}

/* 24. Calorie Counter ---------------------------------------------- */
interface FoodEntry { id: string; name: string; calories: number; }

function CalorieCounter() {
  const [entries, setEntries] = useLocalStorage<FoodEntry[]>("toolnest-calories", []);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [lastDate, setLastDate] = useLocalStorage("toolnest-calories-date", "");

  const today = new Date().toDateString();
  useEffect(() => {
    if (lastDate !== today) {
      setEntries([]);
      setLastDate(today);
    }
  }, [lastDate, today, setEntries, setLastDate]);

  const add = () => {
    if (!name.trim() || calories <= 0) return;
    setEntries([...entries, { id: Date.now().toString(), name: name.trim(), calories }]);
    setName("");
    setCalories(0);
  };
  const remove = (id: string) => setEntries(entries.filter((e) => e.id !== id));
  const total = entries.reduce((s, e) => s + e.calories, 0);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="grid grid-cols-12 gap-2">
        <input className={`${inputClass} col-span-6`} placeholder="Food item" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <input className={`${inputClass} col-span-3`} type="number" min={0} placeholder="kcal" value={calories || ""} onChange={(e) => setCalories(+e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className={`${btnSmClass} col-span-3`} style={btnStyle} onClick={add}>Add</button>
      </div>

      <div className="text-center">
        <p className="text-4xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">{total}</p>
        <p className="text-[#94A3B8] text-sm">calories today</p>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && <p className="text-[#475569] text-sm text-center py-4">No food logged yet.</p>}
        {entries.map((e) => (
          <div key={e.id} className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#030712] border border-[#1E2D4A]">
            <span className="text-[#F1F5F9] text-sm">{e.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-[#94A3B8] text-sm font-mono">{e.calories} kcal</span>
              <button className="text-red-400 hover:text-red-300 cursor-pointer" onClick={() => remove(e.id)}>&times;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Generic Interactive Tool (fallback for any unhandled tool)         */
/* ================================================================== */
function GenericInteractive({ tool }: { tool: Tool }) {
  const cat = tool.category.toLowerCase();
  const name = tool.name.toLowerCase();
  const desc = tool.description.toLowerCase();
  const combined = `${name} ${desc} ${cat}`;

  /* --- Detect best UI mode --- */
  const mode = useMemo(() => {
    if (["productivity"].includes(cat) || combined.match(/timer|clock|note|task|focus|track/)) return "productivity";
    if (["design", "css", "color"].includes(cat) || combined.match(/color|design|font|css|gradient|palette|shadow/)) return "design";
    if (["fun", "game", "entertainment"].includes(cat) || combined.match(/random|game|fun|roll|flip|pick|spin|quiz|trivia/)) return "fun";
    if (["health", "fitness", "wellness"].includes(cat) || combined.match(/health|bmi|calor|heart|sleep|water|weight|fitness/)) return "health";
    if (["education", "learning", "study"].includes(cat) || combined.match(/learn|study|quiz|flash|vocab|math|education/)) return "education";
    return "productivity";
  }, [cat, combined]);

  /* ===== PRODUCTIVITY MODE: Notepad + Counter + Timer ===== */
  const [notes, setNotes] = useState("");
  const [counter, setCounter] = useState(0);
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSec((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  /* ===== DESIGN MODE: Color workspace ===== */
  const [designColor, setDesignColor] = useState("#7C3AED");
  const [designBg, setDesignBg] = useState("#0F1629");
  const [designHistory, setDesignHistory] = useState<string[]>([]);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const luminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const contrastRatio = useMemo(() => {
    const l1 = luminance(designColor);
    const l2 = luminance(designBg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }, [designColor, designBg]);

  const addColorToHistory = () => {
    setDesignHistory((prev) => [designColor, ...prev.filter((c) => c !== designColor)].slice(0, 12));
  };

  /* ===== FUN MODE: Randomizer / Picker ===== */
  const [funItems, setFunItems] = useState("Option A\nOption B\nOption C");
  const [funResult, setFunResult] = useState("");
  const [funAnimating, setFunAnimating] = useState(false);

  const pickRandom = useCallback(() => {
    const items = funItems.split("\n").map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    setFunAnimating(true);
    let ticks = 0;
    const maxTicks = 15;
    const interval = setInterval(() => {
      setFunResult(items[Math.floor(Math.random() * items.length)]);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        setFunResult(items[Math.floor(Math.random() * items.length)]);
        setFunAnimating(false);
      }
    }, 100);
  }, [funItems]);

  /* ===== HEALTH MODE: Input form with calculation ===== */
  const [healthInputs, setHealthInputs] = useState<Record<string, string>>({
    value1: "",
    value2: "",
    value3: "",
  });
  const [healthResult, setHealthResult] = useState("");

  const calculateHealth = useCallback(() => {
    const v1 = parseFloat(healthInputs.value1) || 0;
    const v2 = parseFloat(healthInputs.value2) || 0;
    const v3 = parseFloat(healthInputs.value3) || 0;

    if (combined.match(/bmi|body mass/)) {
      const bmi = v2 > 0 ? (v1 / ((v2 / 100) ** 2)).toFixed(1) : "0";
      const cat2 = parseFloat(bmi) < 18.5 ? "Underweight" : parseFloat(bmi) < 25 ? "Normal" : parseFloat(bmi) < 30 ? "Overweight" : "Obese";
      setHealthResult(`BMI: ${bmi} (${cat2})`);
    } else if (combined.match(/calor/)) {
      const bmr = 10 * v1 + 6.25 * v2 - 5 * v3 + 5;
      setHealthResult(`Estimated BMR: ${bmr.toFixed(0)} kcal/day\nMaintenance (moderate activity): ${(bmr * 1.55).toFixed(0)} kcal/day`);
    } else if (combined.match(/heart|pulse/)) {
      const maxHr = 220 - v1;
      setHealthResult(`Max Heart Rate: ${maxHr} bpm\nFat Burn Zone: ${Math.round(maxHr * 0.6)}-${Math.round(maxHr * 0.7)} bpm\nCardio Zone: ${Math.round(maxHr * 0.7)}-${Math.round(maxHr * 0.85)} bpm`);
    } else {
      const total = v1 + v2 + v3;
      const avg = [v1, v2, v3].filter((v) => v > 0);
      const mean = avg.length > 0 ? (total / avg.length).toFixed(2) : "0";
      setHealthResult(`Total: ${total}\nAverage: ${mean}\nValues entered: ${avg.length}`);
    }
  }, [healthInputs, combined]);

  /* ===== EDUCATION MODE: Flashcard / Quiz ===== */
  const [eduCards, setEduCards] = useState([
    { front: "What is 2 + 2?", back: "4" },
    { front: "Capital of France?", back: "Paris" },
    { front: "H2O is?", back: "Water" },
  ]);
  const [eduIdx, setEduIdx] = useState(0);
  const [eduFlipped, setEduFlipped] = useState(false);
  const [eduNewFront, setEduNewFront] = useState("");
  const [eduNewBack, setEduNewBack] = useState("");
  const [eduScore, setEduScore] = useState({ correct: 0, total: 0 });

  const addCard = () => {
    if (eduNewFront.trim() && eduNewBack.trim()) {
      setEduCards((prev) => [...prev, { front: eduNewFront.trim(), back: eduNewBack.trim() }]);
      setEduNewFront("");
      setEduNewBack("");
    }
  };

  const markAnswer = (correct: boolean) => {
    setEduScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setEduFlipped(false);
    setEduIdx((i) => (i + 1) % eduCards.length);
  };

  /* ===== RENDER ===== */
  if (mode === "productivity") {
    return (
      <div className="space-y-6">
        {/* Timer */}
        <div className={`${cardClass} space-y-4`}>
          <h3 className="text-[#F1F5F9] font-semibold">Timer</h3>
          <p className="text-4xl font-mono text-center text-[#F1F5F9]">{fmtTime(timerSec)}</p>
          <div className="flex justify-center gap-3">
            <button className={btnSmClass} style={btnStyle} onClick={() => setTimerRunning(!timerRunning)}>
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button className={btnSmClass} style={btnStyle} onClick={() => { setTimerRunning(false); setTimerSec(0); }}>
              Reset
            </button>
          </div>
        </div>
        {/* Counter */}
        <div className={`${cardClass} space-y-4`}>
          <h3 className="text-[#F1F5F9] font-semibold">Counter</h3>
          <p className="text-4xl font-mono text-center text-[#F1F5F9]">{counter}</p>
          <div className="flex justify-center gap-3">
            <button className={btnSmClass} style={btnStyle} onClick={() => setCounter((c) => c - 1)}>-1</button>
            <button className={btnSmClass} style={btnStyle} onClick={() => setCounter(0)}>Reset</button>
            <button className={btnSmClass} style={btnStyle} onClick={() => setCounter((c) => c + 1)}>+1</button>
          </div>
        </div>
        {/* Notepad */}
        <div className={`${cardClass} space-y-3`}>
          <h3 className="text-[#F1F5F9] font-semibold">Quick Notes</h3>
          <textarea
            className={`${inputClass} resize-none`}
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes here..."
          />
          <div className="flex justify-between text-xs text-[#475569]">
            <span>{notes.length} characters</span>
            <span>{notes.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "design") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Foreground Color</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={designColor} onChange={(e) => setDesignColor(e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-transparent" />
              <input className={inputClass} value={designColor} onChange={(e) => setDesignColor(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Background Color</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={designBg} onChange={(e) => setDesignBg(e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-transparent" />
              <input className={inputClass} value={designBg} onChange={(e) => setDesignBg(e.target.value)} />
            </div>
          </div>
        </div>
        {/* Preview */}
        <div className="rounded-xl p-8 text-center space-y-2" style={{ backgroundColor: designBg, color: designColor, border: "1px solid #1E2D4A" }}>
          <p className="text-3xl font-bold">Preview Text</p>
          <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
          <p className="text-sm">Contrast Ratio: {contrastRatio}:1</p>
          <p className="text-xs">{parseFloat(contrastRatio) >= 4.5 ? "WCAG AA Pass" : parseFloat(contrastRatio) >= 3 ? "WCAG AA Large Text Only" : "Fails WCAG AA"}</p>
        </div>
        {/* Color info */}
        <div className={`${cardClass} space-y-2`}>
          <p className="text-[#F1F5F9] text-sm"><span className="text-[#94A3B8]">HEX:</span> {designColor}</p>
          <p className="text-[#F1F5F9] text-sm"><span className="text-[#94A3B8]">RGB:</span> {(() => { const {r,g,b} = hexToRgb(designColor); return `rgb(${r}, ${g}, ${b})`; })()}</p>
          <button className="text-[#06B6D4] hover:text-[#7C3AED] text-sm font-semibold cursor-pointer" onClick={addColorToHistory}>Save to palette</button>
        </div>
        {/* Palette history */}
        {designHistory.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {designHistory.map((c, i) => (
              <button key={i} className="w-10 h-10 rounded-lg border border-[#1E2D4A] cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c }} title={c} onClick={() => setDesignColor(c)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (mode === "fun") {
    return (
      <div className="space-y-6">
        <div>
          <label className={labelClass}>Enter options (one per line)</label>
          <textarea
            className={`${inputClass} resize-none font-mono`}
            rows={6}
            value={funItems}
            onChange={(e) => setFunItems(e.target.value)}
            placeholder={"Option A\nOption B\nOption C"}
          />
        </div>
        <button className={btnClass} style={btnStyle} onClick={pickRandom}>
          Pick Random
        </button>
        {funResult && (
          <div className={`${cardClass} text-center space-y-2`}>
            <p className="text-[#94A3B8] text-sm">Result:</p>
            <p className={`text-3xl font-bold text-[#F1F5F9] ${funAnimating ? "animate-pulse" : ""}`}>
              {funResult}
            </p>
          </div>
        )}
        <div className="text-xs text-[#475569]">
          {funItems.split("\n").filter((s) => s.trim()).length} options loaded
        </div>
      </div>
    );
  }

  if (mode === "health") {
    const labels = combined.match(/bmi|body mass/)
      ? ["Weight (kg)", "Height (cm)", ""]
      : combined.match(/calor/)
      ? ["Weight (kg)", "Height (cm)", "Age (years)"]
      : combined.match(/heart|pulse/)
      ? ["Age (years)", "", ""]
      : ["Value 1", "Value 2", "Value 3"];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {labels.map((label, i) =>
            label ? (
              <div key={i}>
                <label className={labelClass}>{label}</label>
                <input
                  className={inputClass}
                  type="number"
                  value={healthInputs[`value${i + 1}`]}
                  onChange={(e) => setHealthInputs((prev) => ({ ...prev, [`value${i + 1}`]: e.target.value }))}
                  placeholder={label}
                />
              </div>
            ) : null
          )}
        </div>
        <button className={btnClass} style={btnStyle} onClick={calculateHealth}>
          Calculate
        </button>
        {healthResult && (
          <pre className="bg-[#030712] border border-[#1E2D4A] text-[#F1F5F9] rounded-xl px-4 py-3 whitespace-pre-wrap text-sm font-mono">
            {healthResult}
          </pre>
        )}
      </div>
    );
  }

  /* EDUCATION mode */
  return (
    <div className="space-y-6">
      {/* Flashcard */}
      {eduCards.length > 0 && (
        <div
          className={`${cardClass} text-center cursor-pointer min-h-[180px] flex flex-col items-center justify-center space-y-3 hover:border-[#7C3AED] transition`}
          onClick={() => setEduFlipped(!eduFlipped)}
        >
          <p className="text-xs text-[#475569]">Card {eduIdx + 1} of {eduCards.length} {eduFlipped ? "(Answer)" : "(Question)"} — click to flip</p>
          <p className="text-2xl font-bold text-[#F1F5F9]">
            {eduFlipped ? eduCards[eduIdx].back : eduCards[eduIdx].front}
          </p>
        </div>
      )}
      {/* Navigation & scoring */}
      <div className="flex justify-center gap-3 flex-wrap">
        <button className={btnSmClass} style={btnStyle} onClick={() => { setEduFlipped(false); setEduIdx((i) => (i - 1 + eduCards.length) % eduCards.length); }}>
          Previous
        </button>
        <button className={btnSmClass} style={{ background: "#16a34a" }} onClick={() => markAnswer(true)}>
          Got it
        </button>
        <button className={btnSmClass} style={{ background: "#dc2626" }} onClick={() => markAnswer(false)}>
          Missed it
        </button>
        <button className={btnSmClass} style={btnStyle} onClick={() => { setEduFlipped(false); setEduIdx((i) => (i + 1) % eduCards.length); }}>
          Next
        </button>
      </div>
      {/* Score */}
      {eduScore.total > 0 && (
        <div className="text-center text-sm text-[#94A3B8]">
          Score: {eduScore.correct}/{eduScore.total} ({Math.round((eduScore.correct / eduScore.total) * 100)}%)
        </div>
      )}
      {/* Add card */}
      <div className={`${cardClass} space-y-3`}>
        <h3 className="text-[#F1F5F9] font-semibold text-sm">Add a card</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Question / Front" value={eduNewFront} onChange={(e) => setEduNewFront(e.target.value)} />
          <input className={inputClass} placeholder="Answer / Back" value={eduNewBack} onChange={(e) => setEduNewBack(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCard()} />
        </div>
        <button className="text-[#06B6D4] hover:text-[#7C3AED] text-sm font-semibold cursor-pointer" onClick={addCard}>
          + Add Card
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Engine                                                       */
/* ================================================================== */
export default function InteractiveToolEngine({ tool }: { tool: Tool }) {
  const inner = (() => {
    switch (tool.id) {
      /* Productivity */
      case "pomodoro-timer": return <PomodoroTimer />;
      case "stopwatch": return <Stopwatch />;
      case "countdown-timer": return <CountdownTimer />;
      case "world-clock": return <WorldClock />;
      case "todo-list": return <TodoList />;
      case "quick-notes": return <QuickNotes />;
      case "typing-speed-test": return <TypingSpeedTest />;
      case "breathing-exercise": return <BreathingExercise />;
      /* Design */
      case "contrast-ratio-checker": return <ContrastRatioChecker />;
      case "typography-scale": return <TypographyScale />;
      case "font-previewer": return <FontPreviewer />;
      /* Fun */
      case "dice-roller": return <DiceRoller />;
      case "coin-flipper": return <CoinFlipper />;
      case "spin-the-wheel": return <SpinTheWheel />;
      case "random-name-picker": return <RandomNamePicker />;
      case "decision-maker": return <DecisionMaker />;
      case "memory-game": return <MemoryGame />;
      case "random-team-generator": return <RandomTeamGenerator />;
      case "sudoku-generator": return <SudokuGenerator />;
      /* Health */
      case "sleep-calculator": return <SleepCalculator />;
      case "water-intake-tracker": return <WaterIntakeTracker />;
      case "heart-rate-calculator": return <HeartRateCalculator />;
      case "due-date-calculator": return <DueDateCalculator />;
      case "calorie-counter": return <CalorieCounter />;
      default: return <GenericInteractive tool={tool} />;
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
