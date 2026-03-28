"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Tool } from "@/lib/tools";

// ─── Shared styles ───────────────────────────────────────────────────────────

const inputClass =
  "w-full bg-bg-base border border-border text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors";
const numberInputClass =
  "w-full bg-bg-base border border-border text-text-primary rounded-xl px-4 py-3 text-right focus:outline-none focus:border-primary transition-colors";
const selectClass =
  "w-full bg-bg-base border border-border text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none";
const btnClass =
  "text-white font-semibold rounded-xl px-6 py-3 transition-all hover:opacity-90 active:scale-[0.98]";
const btnGradient = "linear-gradient(135deg, #7C3AED, #06B6D4)";
const labelClass = "block text-text-secondary text-sm mb-1";

function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glow-card rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function GradientValue({ value, label }: { value: string; label?: string }) {
  return (
    <div className="text-center">
      {label && <p className="text-text-secondary text-sm mb-1">{label}</p>}
      <p className="text-2xl font-bold gradient-text">{value}</p>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className="text-text-primary font-semibold">{String(value)}</span>
    </div>
  );
}

// ─── 1. Scientific Calculator ────────────────────────────────────────────────

function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState(0);
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleDigit = (d: string) => {
    if (isNewNumber) {
      setDisplay(d);
      setIsNewNumber(false);
    } else {
      setDisplay((prev) => (prev === "0" ? d : prev + d));
    }
  };

  const handleDot = () => {
    if (isNewNumber) {
      setDisplay("0.");
      setIsNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  };

  const handleOp = (op: string) => {
    setExpression((prev) => prev + display + " " + op + " ");
    setIsNewNumber(true);
  };

  const handleEquals = () => {
    const full = expression + display;
    try {
      // Replace math symbols for evaluation
      const sanitized = full
        .replace(/\s+/g, "")
        .replace(/[^0-9+\-*/.%()eE]/g, "");
      // eslint-disable-next-line no-eval
      const result = Function('"use strict"; return (' + sanitized + ")")();
      setDisplay(String(parseFloat(Number(result).toPrecision(12))));
    } catch {
      setDisplay("Error");
    }
    setExpression("");
    setIsNewNumber(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
    setIsNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay((prev) => prev.slice(0, -1));
    } else {
      setDisplay("0");
      setIsNewNumber(true);
    }
  };

  const handleScientific = (fn: string) => {
    const val = parseFloat(display);
    let result: number;
    switch (fn) {
      case "sin": result = Math.sin((val * Math.PI) / 180); break;
      case "cos": result = Math.cos((val * Math.PI) / 180); break;
      case "tan": result = Math.tan((val * Math.PI) / 180); break;
      case "log": result = Math.log10(val); break;
      case "ln": result = Math.log(val); break;
      case "sqrt": result = Math.sqrt(val); break;
      case "pow": result = val * val; break;
      case "pi": result = Math.PI; break;
      case "e": result = Math.E; break;
      case "1/x": result = 1 / val; break;
      case "+/-": result = -val; break;
      case "fact": {
        let f = 1;
        for (let i = 2; i <= val; i++) f *= i;
        result = f;
        break;
      }
      default: result = val;
    }
    setDisplay(String(parseFloat(result.toPrecision(12))));
    setIsNewNumber(true);
  };

  const sciButtons = ["sin", "cos", "tan", "log", "ln", "sqrt", "pow", "pi", "e", "1/x", "+/-", "fact"];

  return (
    <GlowCard>
      {/* Display */}
      <div className="bg-bg-base rounded-xl p-4 mb-4 border border-border">
        <div className="text-text-secondary text-xs h-5 text-right font-mono overflow-hidden">
          {expression}
        </div>
        <div className="text-text-primary text-3xl font-mono text-right overflow-x-auto">
          {display}
        </div>
      </div>

      {/* Scientific buttons */}
      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {sciButtons.map((fn) => (
          <button
            key={fn}
            onClick={() => handleScientific(fn)}
            className="bg-bg-base border border-border text-text-secondary rounded-lg py-2 text-xs font-mono hover:border-primary hover:text-primary transition-colors"
          >
            {fn}
          </button>
        ))}
      </div>

      {/* Main buttons */}
      <div className="grid grid-cols-4 gap-2">
        {["C", "\u232B", "%", "/",
          "7", "8", "9", "*",
          "4", "5", "6", "-",
          "1", "2", "3", "+",
          "+/-", "0", ".", "=",
        ].map((btn) => {
          const isOp = ["/", "*", "-", "+", "%"].includes(btn);
          const isEquals = btn === "=";
          const isClear = btn === "C";
          const isBackspace = btn === "\u232B";
          return (
            <button
              key={btn}
              onClick={() => {
                if (isClear) handleClear();
                else if (isBackspace) handleBackspace();
                else if (isEquals) handleEquals();
                else if (isOp) handleOp(btn);
                else if (btn === ".") handleDot();
                else if (btn === "+/-") handleScientific("+/-");
                else handleDigit(btn);
              }}
              className={`rounded-xl py-3 font-semibold text-lg transition-all active:scale-95 ${
                isEquals
                  ? "text-white col-span-1"
                  : isOp
                  ? "bg-bg-base border border-primary text-primary"
                  : isClear
                  ? "bg-bg-base border border-danger text-danger"
                  : "bg-bg-base border border-border text-text-primary hover:border-primary"
              }`}
              style={isEquals ? { background: btnGradient } : undefined}
            >
              {btn}
            </button>
          );
        })}
      </div>
    </GlowCard>
  );
}

// ─── 2. Percentage Calculator ────────────────────────────────────────────────

function PercentageCalculator() {
  const [mode, setMode] = useState<"of" | "whatPercent" | "change">("of");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const xn = parseFloat(x);
    const yn = parseFloat(y);
    if (isNaN(xn) || isNaN(yn)) return;
    switch (mode) {
      case "of":
        setResult(`${((xn / 100) * yn).toFixed(2)}`);
        break;
      case "whatPercent":
        setResult(`${((xn / yn) * 100).toFixed(2)}%`);
        break;
      case "change":
        setResult(`${(((yn - xn) / xn) * 100).toFixed(2)}% ${yn >= xn ? "increase" : "decrease"}`);
        break;
    }
  };

  const modes = [
    { id: "of" as const, label: "X% of Y" },
    { id: "whatPercent" as const, label: "X is what % of Y" },
    { id: "change" as const, label: "% Change" },
  ];

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setResult(null); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === m.id ? "text-white" : "bg-bg-base border border-border text-text-secondary"
            }`}
            style={mode === m.id ? { background: btnGradient } : undefined}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>
            {mode === "of" ? "Percentage (%)" : mode === "whatPercent" ? "Value (X)" : "Original Value"}
          </label>
          <input type="number" value={x} onChange={(e) => setX(e.target.value)} className={numberInputClass} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>
            {mode === "of" ? "Total Value (Y)" : mode === "whatPercent" ? "Total (Y)" : "New Value"}
          </label>
          <input type="number" value={y} onChange={(e) => setY(e.target.value)} className={numberInputClass} placeholder="0" />
        </div>
      </div>

      <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
        Calculate
      </button>

      {result && (
        <div className="mt-6">
          <GlowCard>
            <GradientValue value={result} label="Result" />
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 3. Age Calculator ──────────────────────────────────────────────────────

function AgeCalculator() {
  const [birthdate, setBirthdate] = useState("");
  const [result, setResult] = useState<{ years: number; months: number; days: number; nextBirthday: string; daysUntil: number } | null>(null);

  const calculate = () => {
    const bd = new Date(birthdate);
    if (isNaN(bd.getTime())) return;
    const now = new Date();

    let years = now.getFullYear() - bd.getFullYear();
    let months = now.getMonth() - bd.getMonth();
    let days = now.getDate() - bd.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Next birthday
    let nextBd = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
    if (nextBd <= now) {
      nextBd = new Date(now.getFullYear() + 1, bd.getMonth(), bd.getDate());
    }
    const daysUntil = Math.ceil((nextBd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      nextBirthday: nextBd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      daysUntil,
    });
  };

  return (
    <GlowCard>
      <label className={labelClass}>Date of Birth</label>
      <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className={inputClass + " mb-4"} />

      <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
        Calculate Age
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <GlowCard className="text-center">
              <p className="text-3xl font-bold gradient-text">{result.years}</p>
              <p className="text-text-secondary text-sm">Years</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-3xl font-bold gradient-text">{result.months}</p>
              <p className="text-text-secondary text-sm">Months</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-3xl font-bold gradient-text">{result.days}</p>
              <p className="text-text-secondary text-sm">Days</p>
            </GlowCard>
          </div>
          <GlowCard>
            <ResultRow label="Next Birthday" value={result.nextBirthday} />
            <ResultRow label="Days Until" value={`${result.daysUntil} days`} />
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 4. BMI Calculator ──────────────────────────────────────────────────────

function BMICalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<{ bmi: number; category: string; color: string } | null>(null);

  const calculate = () => {
    let h: number, w: number;
    if (unit === "metric") {
      h = parseFloat(height) / 100; // cm to m
      w = parseFloat(weight);
    } else {
      h = (parseFloat(heightFt) * 12 + parseFloat(heightIn || "0")) * 0.0254;
      w = parseFloat(weight) * 0.453592;
    }
    if (!h || !w || h <= 0) return;
    const bmi = w / (h * h);

    let category: string;
    let color: string;
    if (bmi < 18.5) { category = "Underweight"; color = "#06B6D4"; }
    else if (bmi < 25) { category = "Normal"; color = "#10B981"; }
    else if (bmi < 30) { category = "Overweight"; color = "#F59E0B"; }
    else { category = "Obese"; color = "#EF4444"; }

    setResult({ bmi: parseFloat(bmi.toFixed(1)), category, color });
  };

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              unit === u ? "text-white" : "bg-bg-base border border-border text-text-secondary"
            }`}
            style={unit === u ? { background: btnGradient } : undefined}
          >
            {u === "metric" ? "Metric (cm/kg)" : "Imperial (ft/lbs)"}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-4">
        {unit === "metric" ? (
          <div>
            <label className={labelClass}>Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={numberInputClass} placeholder="170" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Height (ft)</label>
              <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className={numberInputClass} placeholder="5" />
            </div>
            <div>
              <label className={labelClass}>Height (in)</label>
              <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className={numberInputClass} placeholder="10" />
            </div>
          </div>
        )}
        <div>
          <label className={labelClass}>Weight ({unit === "metric" ? "kg" : "lbs"})</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={numberInputClass} placeholder={unit === "metric" ? "70" : "154"} />
        </div>
      </div>

      <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
        Calculate BMI
      </button>

      {result && (
        <div className="mt-6">
          <GlowCard>
            <GradientValue value={String(result.bmi)} label="Your BMI" />
            <div className="text-center mt-3">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: result.color + "22", color: result.color, border: `1px solid ${result.color}55` }}>
                {result.category}
              </span>
            </div>
            {/* BMI scale bar */}
            <div className="mt-4 relative h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #06B6D4, #10B981, #F59E0B, #EF4444)" }}>
              <div
                className="absolute top-0 w-1 h-full bg-white rounded shadow-lg"
                style={{ left: `${Math.min(Math.max(((result.bmi - 15) / 25) * 100, 0), 100)}%`, transform: "translateX(-50%)" }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
            </div>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 5. EMI Calculator ──────────────────────────────────────────────────────

function EMICalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [result, setResult] = useState<{ emi: number; totalInterest: number; totalPayment: number; schedule: { month: number; principal: number; interest: number; balance: number }[] } | null>(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const N = parseFloat(tenure);
    if (!P || !annualRate || !N) return;

    const r = annualRate / 12 / 100;
    const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    // Amortization schedule
    const schedule: { month: number; principal: number; interest: number; balance: number }[] = [];
    let balance = P;
    for (let i = 1; i <= N && i <= 60; i++) {
      const interestPart = balance * r;
      const principalPart = emi - interestPart;
      balance -= principalPart;
      schedule.push({
        month: i,
        principal: parseFloat(principalPart.toFixed(2)),
        interest: parseFloat(interestPart.toFixed(2)),
        balance: parseFloat(Math.max(balance, 0).toFixed(2)),
      });
    }

    setResult({ emi: parseFloat(emi.toFixed(2)), totalInterest: parseFloat(totalInterest.toFixed(2)), totalPayment: parseFloat(totalPayment.toFixed(2)), schedule });
  };

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Loan Amount (Principal)</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className={numberInputClass} placeholder="500000" />
        </div>
        <div>
          <label className={labelClass}>Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className={numberInputClass} placeholder="8.5" step="0.1" />
        </div>
        <div>
          <label className={labelClass}>Tenure (months)</label>
          <input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} className={numberInputClass} placeholder="60" />
        </div>
      </div>

      <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
        Calculate EMI
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <GlowCard className="text-center">
              <p className="text-xl font-bold gradient-text">{result.emi.toLocaleString()}</p>
              <p className="text-text-secondary text-xs">Monthly EMI</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-xl font-bold gradient-text">{result.totalInterest.toLocaleString()}</p>
              <p className="text-text-secondary text-xs">Total Interest</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-xl font-bold gradient-text">{result.totalPayment.toLocaleString()}</p>
              <p className="text-text-secondary text-xs">Total Payment</p>
            </GlowCard>
          </div>

          {/* Amortization table */}
          <GlowCard>
            <p className="text-text-primary font-semibold mb-3">Amortization Schedule {result.schedule.length < parseFloat(tenure) ? `(first ${result.schedule.length} months)` : ""}</p>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-bg-card">
                  <tr className="text-text-secondary border-b border-border">
                    <th className="py-2 text-left">Month</th>
                    <th className="py-2 text-right">Principal</th>
                    <th className="py-2 text-right">Interest</th>
                    <th className="py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.month} className="border-b border-border/50">
                      <td className="py-1.5 text-text-primary">{row.month}</td>
                      <td className="py-1.5 text-right text-success">{row.principal.toLocaleString()}</td>
                      <td className="py-1.5 text-right text-danger">{row.interest.toLocaleString()}</td>
                      <td className="py-1.5 text-right text-text-secondary">{row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 6. GST Calculator ──────────────────────────────────────────────────────

function GSTCalculator() {
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [inclusive, setInclusive] = useState(false);
  const [result, setResult] = useState<{ baseAmount: number; gstAmount: number; total: number } | null>(null);

  const calculate = () => {
    const amt = parseFloat(amount);
    const rate = parseFloat(gstRate);
    if (!amt || !rate) return;

    if (inclusive) {
      const base = amt / (1 + rate / 100);
      setResult({ baseAmount: parseFloat(base.toFixed(2)), gstAmount: parseFloat((amt - base).toFixed(2)), total: amt });
    } else {
      const gst = amt * (rate / 100);
      setResult({ baseAmount: amt, gstAmount: parseFloat(gst.toFixed(2)), total: parseFloat((amt + gst).toFixed(2)) });
    }
  };

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setInclusive(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${!inclusive ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`}
            style={!inclusive ? { background: btnGradient } : undefined}
          >
            GST Exclusive
          </button>
          <button
            onClick={() => setInclusive(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${inclusive ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`}
            style={inclusive ? { background: btnGradient } : undefined}
          >
            GST Inclusive
          </button>
        </div>
        <div>
          <label className={labelClass}>Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={numberInputClass} placeholder="10000" />
        </div>
        <div>
          <label className={labelClass}>GST Rate</label>
          <div className="flex gap-2">
            {["5", "12", "18", "28"].map((r) => (
              <button
                key={r}
                onClick={() => setGstRate(r)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  gstRate === r ? "text-white" : "bg-bg-base border border-border text-text-secondary"
                }`}
                style={gstRate === r ? { background: btnGradient } : undefined}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
        Calculate GST
      </button>

      {result && (
        <div className="mt-6">
          <GlowCard>
            <ResultRow label="Base Amount" value={`\u20B9 ${result.baseAmount.toLocaleString()}`} />
            <ResultRow label={`GST (${gstRate}%)`} value={`\u20B9 ${result.gstAmount.toLocaleString()}`} />
            <div className="pt-3 mt-2 border-t border-border">
              <GradientValue value={`\u20B9 ${result.total.toLocaleString()}`} label="Total Amount" />
            </div>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 7. Discount Calculator ─────────────────────────────────────────────────

function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [result, setResult] = useState<{ savings: number; finalPrice: number } | null>(null);

  const calculate = () => {
    const p = parseFloat(price);
    const d = parseFloat(discount);
    if (!p || isNaN(d)) return;
    const savings = p * (d / 100);
    setResult({ savings: parseFloat(savings.toFixed(2)), finalPrice: parseFloat((p - savings).toFixed(2)) });
  };

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Original Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={numberInputClass} placeholder="1000" />
        </div>
        <div>
          <label className={labelClass}>Discount (%)</label>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className={numberInputClass} placeholder="20" />
        </div>
      </div>

      <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
        Calculate
      </button>

      {result && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <GlowCard className="text-center">
            <p className="text-2xl font-bold text-danger">{result.savings.toLocaleString()}</p>
            <p className="text-text-secondary text-sm">You Save</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className="text-2xl font-bold gradient-text">{result.finalPrice.toLocaleString()}</p>
            <p className="text-text-secondary text-sm">Final Price</p>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 8. Tip Calculator ──────────────────────────────────────────────────────

function TipCalculator() {
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [people, setPeople] = useState("1");

  const billAmt = parseFloat(bill) || 0;
  const tip = billAmt * (parseFloat(tipPercent) || 0) / 100;
  const total = billAmt + tip;
  const numPeople = Math.max(parseInt(people) || 1, 1);

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Bill Amount</label>
          <input type="number" value={bill} onChange={(e) => setBill(e.target.value)} className={numberInputClass} placeholder="50.00" />
        </div>
        <div>
          <label className={labelClass}>Tip Percentage</label>
          <div className="flex gap-2 mb-2">
            {["10", "15", "18", "20", "25"].map((t) => (
              <button
                key={t}
                onClick={() => setTipPercent(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tipPercent === t ? "text-white" : "bg-bg-base border border-border text-text-secondary"
                }`}
                style={tipPercent === t ? { background: btnGradient } : undefined}
              >
                {t}%
              </button>
            ))}
          </div>
          <input type="number" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} className={numberInputClass} placeholder="15" />
        </div>
        <div>
          <label className={labelClass}>Number of People</label>
          <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} className={numberInputClass} placeholder="1" min="1" />
        </div>
      </div>

      {billAmt > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <GlowCard className="text-center">
            <p className="text-xl font-bold gradient-text">${tip.toFixed(2)}</p>
            <p className="text-text-secondary text-xs">Total Tip</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className="text-xl font-bold gradient-text">${total.toFixed(2)}</p>
            <p className="text-text-secondary text-xs">Total</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className="text-xl font-bold gradient-text">${(tip / numPeople).toFixed(2)}</p>
            <p className="text-text-secondary text-xs">Tip / Person</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className="text-xl font-bold gradient-text">${(total / numPeople).toFixed(2)}</p>
            <p className="text-text-secondary text-xs">Total / Person</p>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 9. Unit Converter ──────────────────────────────────────────────────────

const unitData: Record<string, { name: string; units: { id: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[] }> = {
  length: {
    name: "Length",
    units: [
      { id: "mm", label: "Millimeter", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "cm", label: "Centimeter", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: "m", label: "Meter", toBase: (v) => v, fromBase: (v) => v },
      { id: "km", label: "Kilometer", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "in", label: "Inch", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: "ft", label: "Foot", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: "yd", label: "Yard", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: "mi", label: "Mile", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ],
  },
  weight: {
    name: "Weight",
    units: [
      { id: "mg", label: "Milligram", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      { id: "g", label: "Gram", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "kg", label: "Kilogram", toBase: (v) => v, fromBase: (v) => v },
      { id: "lb", label: "Pound", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      { id: "oz", label: "Ounce", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: "ton", label: "Metric Ton", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  temperature: {
    name: "Temperature",
    units: [
      { id: "c", label: "Celsius", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", label: "Fahrenheit", toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
      { id: "k", label: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  speed: {
    name: "Speed",
    units: [
      { id: "mps", label: "m/s", toBase: (v) => v, fromBase: (v) => v },
      { id: "kmph", label: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: "mph", label: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: "knot", label: "Knot", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
  area: {
    name: "Area",
    units: [
      { id: "sqm", label: "sq meter", toBase: (v) => v, fromBase: (v) => v },
      { id: "sqkm", label: "sq km", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: "sqft", label: "sq foot", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: "acre", label: "Acre", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { id: "ha", label: "Hectare", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
  volume: {
    name: "Volume",
    units: [
      { id: "ml", label: "Milliliter", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "l", label: "Liter", toBase: (v) => v, fromBase: (v) => v },
      { id: "gal", label: "US Gallon", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: "qt", label: "US Quart", toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
      { id: "cup", label: "US Cup", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      { id: "floz", label: "US Fl Oz", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    ],
  },
  data: {
    name: "Data",
    units: [
      { id: "bit", label: "Bit", toBase: (v) => v, fromBase: (v) => v },
      { id: "byte", label: "Byte", toBase: (v) => v * 8, fromBase: (v) => v / 8 },
      { id: "kb", label: "Kilobyte", toBase: (v) => v * 8000, fromBase: (v) => v / 8000 },
      { id: "mb", label: "Megabyte", toBase: (v) => v * 8e6, fromBase: (v) => v / 8e6 },
      { id: "gb", label: "Gigabyte", toBase: (v) => v * 8e9, fromBase: (v) => v / 8e9 },
      { id: "tb", label: "Terabyte", toBase: (v) => v * 8e12, fromBase: (v) => v / 8e12 },
    ],
  },
  time: {
    name: "Time",
    units: [
      { id: "ms", label: "Millisecond", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "s", label: "Second", toBase: (v) => v, fromBase: (v) => v },
      { id: "min", label: "Minute", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: "hr", label: "Hour", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: "day", label: "Day", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: "week", label: "Week", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: "year", label: "Year", toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    ],
  },
};

function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [value, setValue] = useState("");

  const cat = unitData[category];
  const from = cat.units.find((u) => u.id === fromUnit) || cat.units[0];
  const to = cat.units.find((u) => u.id === toUnit) || cat.units[1];

  const inputVal = parseFloat(value) || 0;
  const baseVal = from.toBase(inputVal);
  const outputVal = to.fromBase(baseVal);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const units = unitData[newCat].units;
    setFromUnit(units[0].id);
    setToUnit(units[1]?.id || units[0].id);
    setValue("");
  };

  return (
    <GlowCard>
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(unitData).map(([key, val]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              category === key ? "text-white" : "bg-bg-base border border-border text-text-secondary"
            }`}
            style={category === key ? { background: btnGradient } : undefined}
          >
            {val.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>From</label>
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className={selectClass + " mb-2"}>
            {cat.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={numberInputClass} placeholder="Enter value" />
        </div>
        <div>
          <label className={labelClass}>To</label>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className={selectClass + " mb-2"}>
            {cat.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
          <div className={`${numberInputClass} flex items-center justify-end min-h-[48px]`}>
            {value ? parseFloat(outputVal.toPrecision(10)) : ""}
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

// ─── 10. Date Calculator ────────────────────────────────────────────────────

function DateCalculator() {
  const [mode, setMode] = useState<"diff" | "add">("diff");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [addDays, setAddDays] = useState("");
  const [addSubtract, setAddSubtract] = useState<"add" | "subtract">("add");
  const [result, setResult] = useState<{ days?: number; weeks?: number; months?: number; years?: number; resultDate?: string } | null>(null);

  const calculate = () => {
    if (mode === "diff") {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return;
      const diffMs = Math.abs(d2.getTime() - d1.getTime());
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(days / 7);

      let years = Math.abs(d2.getFullYear() - d1.getFullYear());
      let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
      months = Math.abs(months);

      setResult({ days, weeks, months, years });
    } else {
      const d = new Date(date1);
      const numDays = parseInt(addDays);
      if (isNaN(d.getTime()) || isNaN(numDays)) return;
      const newDate = new Date(d);
      newDate.setDate(newDate.getDate() + (addSubtract === "add" ? numDays : -numDays));
      setResult({ resultDate: newDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) });
    }
  };

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        <button onClick={() => { setMode("diff"); setResult(null); }} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "diff" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "diff" ? { background: btnGradient } : undefined}>
          Date Difference
        </button>
        <button onClick={() => { setMode("add"); setResult(null); }} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "add" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "add" ? { background: btnGradient } : undefined}>
          Add/Subtract Days
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>{mode === "diff" ? "Start Date" : "Date"}</label>
          <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className={inputClass} />
        </div>
        {mode === "diff" ? (
          <div>
            <label className={labelClass}>End Date</label>
            <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className={inputClass} />
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <button onClick={() => setAddSubtract("add")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${addSubtract === "add" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={addSubtract === "add" ? { background: btnGradient } : undefined}>
                Add
              </button>
              <button onClick={() => setAddSubtract("subtract")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${addSubtract === "subtract" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={addSubtract === "subtract" ? { background: btnGradient } : undefined}>
                Subtract
              </button>
            </div>
            <div>
              <label className={labelClass}>Number of Days</label>
              <input type="number" value={addDays} onChange={(e) => setAddDays(e.target.value)} className={numberInputClass} placeholder="30" />
            </div>
          </>
        )}
      </div>

      <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
        Calculate
      </button>

      {result && (
        <div className="mt-6">
          {mode === "diff" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <GlowCard className="text-center"><p className="text-2xl font-bold gradient-text">{result.days}</p><p className="text-text-secondary text-xs">Days</p></GlowCard>
              <GlowCard className="text-center"><p className="text-2xl font-bold gradient-text">{result.weeks}</p><p className="text-text-secondary text-xs">Weeks</p></GlowCard>
              <GlowCard className="text-center"><p className="text-2xl font-bold gradient-text">{result.months}</p><p className="text-text-secondary text-xs">Months</p></GlowCard>
              <GlowCard className="text-center"><p className="text-2xl font-bold gradient-text">{result.years}</p><p className="text-text-secondary text-xs">Years</p></GlowCard>
            </div>
          ) : (
            <GlowCard>
              <GradientValue value={result.resultDate || ""} label="Result Date" />
            </GlowCard>
          )}
        </div>
      )}
    </GlowCard>
  );
}

// ─── 11. Roman Numeral Converter ────────────────────────────────────────────

function RomanNumeralConverter() {
  const [mode, setMode] = useState<"toRoman" | "fromRoman">("toRoman");
  const [input, setInput] = useState("");

  const toRoman = (num: number): string => {
    if (num <= 0 || num > 3999) return "Out of range (1-3999)";
    const map: [number, string][] = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    let result = "";
    let remaining = num;
    for (const [value, symbol] of map) {
      while (remaining >= value) {
        result += symbol;
        remaining -= value;
      }
    }
    return result;
  };

  const fromRoman = (s: string): string => {
    const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const upper = s.toUpperCase().trim();
    if (!upper || !/^[IVXLCDM]+$/.test(upper)) return "Invalid Roman numeral";
    let result = 0;
    for (let i = 0; i < upper.length; i++) {
      const curr = map[upper[i]];
      const next = map[upper[i + 1]];
      if (next && curr < next) result -= curr;
      else result += curr;
    }
    return String(result);
  };

  const output = input
    ? mode === "toRoman"
      ? toRoman(parseInt(input) || 0)
      : fromRoman(input)
    : "";

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        <button onClick={() => { setMode("toRoman"); setInput(""); }} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "toRoman" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "toRoman" ? { background: btnGradient } : undefined}>
          Number to Roman
        </button>
        <button onClick={() => { setMode("fromRoman"); setInput(""); }} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "fromRoman" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "fromRoman" ? { background: btnGradient } : undefined}>
          Roman to Number
        </button>
      </div>

      <label className={labelClass}>{mode === "toRoman" ? "Enter Number (1-3999)" : "Enter Roman Numeral"}</label>
      <input
        type={mode === "toRoman" ? "number" : "text"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className={mode === "toRoman" ? numberInputClass : inputClass}
        placeholder={mode === "toRoman" ? "42" : "XLII"}
      />

      {output && (
        <div className="mt-6">
          <GlowCard>
            <GradientValue value={output} label="Result" />
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 12. Binary/Hex Converter ───────────────────────────────────────────────

function BinaryHexConverter() {
  const [input, setInput] = useState("");
  const [inputBase, setInputBase] = useState<"decimal" | "binary" | "octal" | "hex">("decimal");

  const parseInput = (): number | null => {
    try {
      const trimmed = input.trim();
      if (!trimmed) return null;
      switch (inputBase) {
        case "decimal": return parseInt(trimmed, 10);
        case "binary": return parseInt(trimmed, 2);
        case "octal": return parseInt(trimmed, 8);
        case "hex": return parseInt(trimmed, 16);
      }
    } catch {
      return null;
    }
  };

  const num = parseInput();
  const isValid = num !== null && !isNaN(num);

  return (
    <GlowCard>
      <label className={labelClass}>Input Base</label>
      <div className="flex gap-2 mb-4">
        {(["decimal", "binary", "octal", "hex"] as const).map((b) => (
          <button
            key={b}
            onClick={() => { setInputBase(b); setInput(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize ${inputBase === b ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`}
            style={inputBase === b ? { background: btnGradient } : undefined}
          >
            {b}
          </button>
        ))}
      </div>

      <label className={labelClass}>Enter Value</label>
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className={inputClass + " font-mono mb-4"} placeholder={inputBase === "binary" ? "1010" : inputBase === "hex" ? "FF" : inputBase === "octal" ? "12" : "255"} />

      {isValid && (
        <div className="grid grid-cols-2 gap-3">
          <GlowCard>
            <p className="text-text-secondary text-xs mb-1">Decimal</p>
            <p className="text-text-primary font-mono text-lg break-all">{num.toString(10)}</p>
          </GlowCard>
          <GlowCard>
            <p className="text-text-secondary text-xs mb-1">Binary</p>
            <p className="text-text-primary font-mono text-lg break-all">{num.toString(2)}</p>
          </GlowCard>
          <GlowCard>
            <p className="text-text-secondary text-xs mb-1">Octal</p>
            <p className="text-text-primary font-mono text-lg break-all">{num.toString(8)}</p>
          </GlowCard>
          <GlowCard>
            <p className="text-text-secondary text-xs mb-1">Hexadecimal</p>
            <p className="text-text-primary font-mono text-lg break-all uppercase">{num.toString(16).toUpperCase()}</p>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 13. Area Calculator ────────────────────────────────────────────────────

function AreaCalculator() {
  const [shape, setShape] = useState("square");
  const [values, setValues] = useState<Record<string, string>>({});

  const shapes: Record<string, { label: string; fields: { key: string; label: string }[]; calc: (v: Record<string, number>) => number }> = {
    square: {
      label: "Square",
      fields: [{ key: "side", label: "Side Length" }],
      calc: (v) => v.side * v.side,
    },
    rectangle: {
      label: "Rectangle",
      fields: [{ key: "length", label: "Length" }, { key: "width", label: "Width" }],
      calc: (v) => v.length * v.width,
    },
    circle: {
      label: "Circle",
      fields: [{ key: "radius", label: "Radius" }],
      calc: (v) => Math.PI * v.radius * v.radius,
    },
    triangle: {
      label: "Triangle",
      fields: [{ key: "base", label: "Base" }, { key: "height", label: "Height" }],
      calc: (v) => 0.5 * v.base * v.height,
    },
    trapezoid: {
      label: "Trapezoid",
      fields: [{ key: "a", label: "Side A (top)" }, { key: "b", label: "Side B (bottom)" }, { key: "height", label: "Height" }],
      calc: (v) => 0.5 * (v.a + v.b) * v.height,
    },
  };

  const current = shapes[shape];
  const nums: Record<string, number> = {};
  let allFilled = true;
  for (const f of current.fields) {
    const n = parseFloat(values[f.key] || "");
    if (isNaN(n) || n <= 0) allFilled = false;
    nums[f.key] = n;
  }
  const area = allFilled ? current.calc(nums) : null;

  return (
    <GlowCard>
      <label className={labelClass}>Shape</label>
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(shapes).map(([key, s]) => (
          <button
            key={key}
            onClick={() => { setShape(key); setValues({}); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${shape === key ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`}
            style={shape === key ? { background: btnGradient } : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-4">
        {current.fields.map((f) => (
          <div key={f.key}>
            <label className={labelClass}>{f.label}</label>
            <input
              type="number"
              value={values[f.key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className={numberInputClass}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {area !== null && (
        <GlowCard>
          <GradientValue value={area.toFixed(4)} label={`Area of ${current.label}`} />
        </GlowCard>
      )}
    </GlowCard>
  );
}

// ─── 14. Fuel Cost Calculator ───────────────────────────────────────────────

function FuelCostCalculator() {
  const [distance, setDistance] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<"kml" | "mpg">("kml");

  const dist = parseFloat(distance) || 0;
  const eff = parseFloat(efficiency) || 0;
  const pr = parseFloat(price) || 0;

  let fuelNeeded = 0;
  let totalCost = 0;
  if (eff > 0) {
    if (unit === "kml") {
      fuelNeeded = dist / eff;
    } else {
      // mpg: miles per gallon
      fuelNeeded = dist / eff;
    }
    totalCost = fuelNeeded * pr;
  }

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setUnit("kml")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${unit === "kml" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={unit === "kml" ? { background: btnGradient } : undefined}>
          km/L
        </button>
        <button onClick={() => setUnit("mpg")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${unit === "mpg" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={unit === "mpg" ? { background: btnGradient } : undefined}>
          MPG
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Distance ({unit === "kml" ? "km" : "miles"})</label>
          <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={numberInputClass} placeholder="500" />
        </div>
        <div>
          <label className={labelClass}>Fuel Efficiency ({unit === "kml" ? "km/L" : "MPG"})</label>
          <input type="number" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} className={numberInputClass} placeholder="15" />
        </div>
        <div>
          <label className={labelClass}>Fuel Price per {unit === "kml" ? "Liter" : "Gallon"}</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={numberInputClass} placeholder="1.50" />
        </div>
      </div>

      {eff > 0 && dist > 0 && pr > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <GlowCard className="text-center">
            <p className="text-2xl font-bold gradient-text">{fuelNeeded.toFixed(2)}</p>
            <p className="text-text-secondary text-xs">Fuel Needed ({unit === "kml" ? "L" : "gal"})</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className="text-2xl font-bold gradient-text">${totalCost.toFixed(2)}</p>
            <p className="text-text-secondary text-xs">Total Cost</p>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 15. Salary Calculator ──────────────────────────────────────────────────

function SalaryCalculator() {
  const [mode, setMode] = useState<"annual" | "monthly">("annual");
  const [salary, setSalary] = useState("");

  const val = parseFloat(salary) || 0;
  const annual = mode === "annual" ? val : val * 12;
  const monthly = mode === "monthly" ? val : val / 12;

  // Simple US-style progressive tax brackets (2024 single filer)
  const brackets = [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ];

  let tax = 0;
  let remaining = annual;
  const bracketBreakdown: { range: string; rate: number; tax: number }[] = [];
  for (const b of brackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, b.max - b.min);
    const t = taxable * (b.rate / 100);
    tax += t;
    remaining -= taxable;
    if (taxable > 0) {
      bracketBreakdown.push({
        range: `$${b.min.toLocaleString()} - ${b.max === Infinity ? "+" : "$" + b.max.toLocaleString()}`,
        rate: b.rate,
        tax: parseFloat(t.toFixed(2)),
      });
    }
  }

  const takeHome = annual - tax;

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("annual")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "annual" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "annual" ? { background: btnGradient } : undefined}>
          Annual
        </button>
        <button onClick={() => setMode("monthly")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "monthly" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "monthly" ? { background: btnGradient } : undefined}>
          Monthly
        </button>
      </div>

      <label className={labelClass}>{mode === "annual" ? "Annual" : "Monthly"} Salary</label>
      <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className={numberInputClass + " mb-4"} placeholder="75000" />

      {val > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <GlowCard className="text-center">
              <p className="text-lg font-bold gradient-text">${annual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Annual</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold gradient-text">${monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Monthly</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold gradient-text">${(monthly / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Bi-Weekly</p>
            </GlowCard>
          </div>

          <GlowCard>
            <p className="text-text-primary font-semibold mb-3">Tax Bracket Breakdown</p>
            {bracketBreakdown.map((b, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0 text-sm">
                <span className="text-text-secondary">{b.range} @ {b.rate}%</span>
                <span className="text-danger">${b.tax.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-border">
              <span className="text-text-primary font-semibold">Total Tax</span>
              <span className="text-danger font-semibold">${tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </GlowCard>

          <GlowCard>
            <GradientValue value={`$${takeHome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} label="Estimated Take-Home (Annual)" />
            <p className="text-center text-text-secondary text-sm mt-2">
              ~${(takeHome / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })} / month
            </p>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 16. SIP Calculator ────────────────────────────────────────────────────

function SIPCalculator() {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const M = parseFloat(monthly) || 0;
  const r = (parseFloat(rate) || 0) / 12 / 100;
  const n = (parseFloat(years) || 0) * 12;

  const futureValue = r > 0 && n > 0 ? M * (((Math.pow(1 + r, n) - 1) / r) * (1 + r)) : M * n;
  const totalInvested = M * n;
  const wealthGained = futureValue - totalInvested;

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Monthly Investment</label>
          <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} className={numberInputClass} placeholder="5000" />
        </div>
        <div>
          <label className={labelClass}>Expected Return Rate (% per year)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className={numberInputClass} placeholder="12" step="0.5" />
        </div>
        <div>
          <label className={labelClass}>Time Period (years)</label>
          <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className={numberInputClass} placeholder="10" />
        </div>
      </div>

      {M > 0 && n > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <GlowCard className="text-center">
              <p className="text-lg font-bold text-text-primary">{totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Invested</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold text-success">{wealthGained.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Wealth Gained</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold gradient-text">{futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Future Value</p>
            </GlowCard>
          </div>

          {/* Visual bar */}
          <GlowCard>
            <p className="text-text-secondary text-sm mb-2">Investment vs Returns</p>
            <div className="h-8 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full flex items-center justify-center text-xs text-white font-semibold" style={{ width: `${(totalInvested / futureValue) * 100}%` }}>
                {((totalInvested / futureValue) * 100).toFixed(0)}%
              </div>
              <div className="h-full flex items-center justify-center text-xs text-white font-semibold" style={{ width: `${(wealthGained / futureValue) * 100}%`, background: "#10B981" }}>
                {((wealthGained / futureValue) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>Invested</span>
              <span>Returns</span>
            </div>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 17. FD Calculator ──────────────────────────────────────────────────────

function FDCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [compounding, setCompounding] = useState("4"); // quarterly

  const P = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const t = parseFloat(tenure) || 0;
  const n = parseInt(compounding) || 4;

  const maturityAmount = P * Math.pow(1 + r / (n * 100), n * t);
  const interestEarned = maturityAmount - P;

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Principal Amount</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className={numberInputClass} placeholder="100000" />
        </div>
        <div>
          <label className={labelClass}>Interest Rate (% per year)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className={numberInputClass} placeholder="7" step="0.1" />
        </div>
        <div>
          <label className={labelClass}>Tenure (years)</label>
          <input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} className={numberInputClass} placeholder="5" />
        </div>
        <div>
          <label className={labelClass}>Compounding Frequency</label>
          <select value={compounding} onChange={(e) => setCompounding(e.target.value)} className={selectClass}>
            <option value="1">Annually</option>
            <option value="2">Semi-Annually</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
          </select>
        </div>
      </div>

      {P > 0 && t > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <GlowCard className="text-center">
            <p className="text-xl font-bold gradient-text">{maturityAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-text-secondary text-xs">Maturity Amount</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className="text-xl font-bold text-success">{interestEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-text-secondary text-xs">Interest Earned</p>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 18. Compound Interest Calculator ───────────────────────────────────────

function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("12");

  const P = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const t = parseFloat(time) || 0;
  const n = parseInt(frequency) || 12;

  const amount = P * Math.pow(1 + r / (n * 100), n * t);
  const interest = amount - P;

  // Year-by-year growth
  const growth: { year: number; amount: number }[] = [];
  for (let y = 1; y <= t && y <= 30; y++) {
    growth.push({ year: y, amount: P * Math.pow(1 + r / (n * 100), n * y) });
  }

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Principal</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className={numberInputClass} placeholder="10000" />
        </div>
        <div>
          <label className={labelClass}>Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className={numberInputClass} placeholder="8" step="0.1" />
        </div>
        <div>
          <label className={labelClass}>Time (years)</label>
          <input type="number" value={time} onChange={(e) => setTime(e.target.value)} className={numberInputClass} placeholder="5" />
        </div>
        <div>
          <label className={labelClass}>Compounding Frequency</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={selectClass}>
            <option value="1">Annually</option>
            <option value="2">Semi-Annually</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </select>
        </div>
      </div>

      {P > 0 && t > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <GlowCard className="text-center">
              <p className="text-lg font-bold text-text-primary">{P.toLocaleString()}</p>
              <p className="text-text-secondary text-xs">Principal</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold text-success">{interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Interest</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold gradient-text">{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Total</p>
            </GlowCard>
          </div>

          {growth.length > 0 && (
            <GlowCard>
              <p className="text-text-primary font-semibold mb-3">Growth Over Time</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {growth.map((g) => {
                  const pct = ((g.amount - P) / P) * 100;
                  return (
                    <div key={g.year} className="flex items-center gap-3">
                      <span className="text-text-secondary text-xs w-12">Yr {g.year}</span>
                      <div className="flex-1 bg-bg-base rounded-full h-5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((g.amount / amount) * 100, 100)}%`, background: btnGradient }} />
                      </div>
                      <span className="text-text-primary text-xs w-24 text-right">{g.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  );
                })}
              </div>
            </GlowCard>
          )}
        </div>
      )}
    </GlowCard>
  );
}

// ─── 19. Profit/Loss Calculator ─────────────────────────────────────────────

function ProfitLossCalculator() {
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const cp = parseFloat(costPrice) || 0;
  const sp = parseFloat(sellingPrice) || 0;
  const diff = sp - cp;
  const pct = cp > 0 ? (diff / cp) * 100 : 0;
  const isProfit = diff >= 0;

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Cost Price</label>
          <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className={numberInputClass} placeholder="500" />
        </div>
        <div>
          <label className={labelClass}>Selling Price</label>
          <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className={numberInputClass} placeholder="650" />
        </div>
      </div>

      {cp > 0 && sp > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <GlowCard className="text-center">
            <p className={`text-2xl font-bold ${isProfit ? "text-success" : "text-danger"}`}>
              {isProfit ? "+" : ""}{diff.toFixed(2)}
            </p>
            <p className="text-text-secondary text-sm">{isProfit ? "Profit" : "Loss"}</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className={`text-2xl font-bold ${isProfit ? "text-success" : "text-danger"}`}>
              {isProfit ? "+" : ""}{pct.toFixed(2)}%
            </p>
            <p className="text-text-secondary text-sm">{isProfit ? "Profit" : "Loss"} %</p>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 20. Tax Calculator ─────────────────────────────────────────────────────

function TaxCalculator() {
  const [income, setIncome] = useState("");
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");

  const val = parseFloat(income) || 0;

  const singleBrackets = [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ];

  const marriedBrackets = [
    { min: 0, max: 23200, rate: 10 },
    { min: 23200, max: 94300, rate: 12 },
    { min: 94300, max: 201050, rate: 22 },
    { min: 201050, max: 383900, rate: 24 },
    { min: 383900, max: 487450, rate: 32 },
    { min: 487450, max: 731200, rate: 35 },
    { min: 731200, max: Infinity, rate: 37 },
  ];

  const brackets = filingStatus === "single" ? singleBrackets : marriedBrackets;

  let tax = 0;
  let remaining = val;
  const breakdown: { range: string; rate: number; taxed: number }[] = [];
  for (const b of brackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, b.max - b.min);
    const t = taxable * (b.rate / 100);
    tax += t;
    remaining -= taxable;
    if (taxable > 0) {
      breakdown.push({
        range: `$${b.min.toLocaleString()} - ${b.max === Infinity ? "+" : "$" + b.max.toLocaleString()}`,
        rate: b.rate,
        taxed: parseFloat(t.toFixed(2)),
      });
    }
  }

  const effectiveRate = val > 0 ? (tax / val) * 100 : 0;

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilingStatus("single")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${filingStatus === "single" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={filingStatus === "single" ? { background: btnGradient } : undefined}>
          Single
        </button>
        <button onClick={() => setFilingStatus("married")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${filingStatus === "married" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={filingStatus === "married" ? { background: btnGradient } : undefined}>
          Married Filing Jointly
        </button>
      </div>

      <label className={labelClass}>Taxable Income</label>
      <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className={numberInputClass + " mb-4"} placeholder="85000" />

      {val > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <GlowCard className="text-center">
              <p className="text-lg font-bold text-danger">${tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Total Tax</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold gradient-text">${(val - tax).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">After Tax</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold text-accent">{effectiveRate.toFixed(1)}%</p>
              <p className="text-text-secondary text-xs">Effective Rate</p>
            </GlowCard>
          </div>

          <GlowCard>
            <p className="text-text-primary font-semibold mb-3">Tax Brackets</p>
            {breakdown.map((b, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b border-border/50 last:border-0 text-sm">
                <span className="text-text-secondary">{b.range} @ {b.rate}%</span>
                <span className="text-danger">${b.taxed.toLocaleString()}</span>
              </div>
            ))}
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 21. Mortgage Calculator ────────────────────────────────────────────────

function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("30");

  const hp = parseFloat(homePrice) || 0;
  const dp = parseFloat(downPayment) || 0;
  const loanAmount = hp - dp;
  const r = (parseFloat(rate) || 0) / 12 / 100;
  const n = (parseInt(term) || 30) * 12;

  let monthlyPayment = 0;
  if (r > 0 && n > 0 && loanAmount > 0) {
    monthlyPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  } else if (loanAmount > 0 && n > 0) {
    monthlyPayment = loanAmount / n;
  }

  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - loanAmount;

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Home Price</label>
          <input type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} className={numberInputClass} placeholder="400000" />
        </div>
        <div>
          <label className={labelClass}>Down Payment</label>
          <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className={numberInputClass} placeholder="80000" />
        </div>
        <div>
          <label className={labelClass}>Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className={numberInputClass} placeholder="6.5" step="0.1" />
        </div>
        <div>
          <label className={labelClass}>Loan Term (years)</label>
          <div className="flex gap-2">
            {["15", "20", "30"].map((t) => (
              <button
                key={t}
                onClick={() => setTerm(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold ${term === t ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`}
                style={term === t ? { background: btnGradient } : undefined}
              >
                {t} yr
              </button>
            ))}
          </div>
        </div>
      </div>

      {loanAmount > 0 && (
        <div className="space-y-4">
          <GlowCard>
            <GradientValue value={`$${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} label="Monthly Payment" />
          </GlowCard>
          <div className="grid grid-cols-3 gap-3">
            <GlowCard className="text-center">
              <p className="text-lg font-bold text-text-primary">${loanAmount.toLocaleString()}</p>
              <p className="text-text-secondary text-xs">Loan Amount</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold text-danger">${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Total Interest</p>
            </GlowCard>
            <GlowCard className="text-center">
              <p className="text-lg font-bold gradient-text">${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-text-secondary text-xs">Total Cost</p>
            </GlowCard>
          </div>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 22. GPA Calculator ────────────────────────────────────────────────────

function GPACalculator() {
  const [courses, setCourses] = useState<{ name: string; grade: string; credits: string }[]>([
    { name: "", grade: "4.0", credits: "3" },
  ]);

  const gradePoints: Record<string, number> = {
    "4.0": 4.0, "3.7": 3.7, "3.3": 3.3, "3.0": 3.0, "2.7": 2.7,
    "2.3": 2.3, "2.0": 2.0, "1.7": 1.7, "1.3": 1.3, "1.0": 1.0, "0.0": 0.0,
  };

  const gradeLabels: Record<string, string> = {
    "4.0": "A", "3.7": "A-", "3.3": "B+", "3.0": "B", "2.7": "B-",
    "2.3": "C+", "2.0": "C", "1.7": "C-", "1.3": "D+", "1.0": "D", "0.0": "F",
  };

  const addCourse = () => setCourses((prev) => [...prev, { name: "", grade: "4.0", credits: "3" }]);
  const removeCourse = (i: number) => setCourses((prev) => prev.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, field: string, value: string) => {
    setCourses((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  let totalPoints = 0;
  let totalCredits = 0;
  for (const c of courses) {
    const cr = parseFloat(c.credits) || 0;
    totalCredits += cr;
    totalPoints += cr * (gradePoints[c.grade] ?? 0);
  }
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return (
    <GlowCard>
      <div className="space-y-3 mb-4">
        {courses.map((course, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              {i === 0 && <label className={labelClass}>Course</label>}
              <input type="text" value={course.name} onChange={(e) => updateCourse(i, "name", e.target.value)} className={inputClass} placeholder={`Course ${i + 1}`} />
            </div>
            <div className="w-24">
              {i === 0 && <label className={labelClass}>Grade</label>}
              <select value={course.grade} onChange={(e) => updateCourse(i, "grade", e.target.value)} className={selectClass}>
                {Object.entries(gradeLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label} ({val})</option>
                ))}
              </select>
            </div>
            <div className="w-20">
              {i === 0 && <label className={labelClass}>Credits</label>}
              <input type="number" value={course.credits} onChange={(e) => updateCourse(i, "credits", e.target.value)} className={numberInputClass} placeholder="3" />
            </div>
            <button onClick={() => removeCourse(i)} className="text-danger hover:text-red-400 pb-3 text-xl" title="Remove">
              &times;
            </button>
          </div>
        ))}
      </div>

      <button onClick={addCourse} className="w-full py-2 rounded-xl border border-dashed border-border text-text-secondary hover:border-primary hover:text-primary transition-colors mb-4">
        + Add Course
      </button>

      <GlowCard>
        <GradientValue value={gpa.toFixed(2)} label="Your GPA" />
        <p className="text-center text-text-secondary text-sm mt-1">
          Total Credits: {totalCredits}
        </p>
      </GlowCard>
    </GlowCard>
  );
}

// ─── 23. Love Calculator ───────────────────────────────────────────────────

function LoveCalculator() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const calculate = () => {
    if (!name1.trim() || !name2.trim()) return;
    // Generate a deterministic but fun score based on names
    const combined = (name1 + name2).toLowerCase().replace(/\s/g, "");
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
    }
    const result = Math.abs(hash % 101); // 0-100
    setScore(result);
  };

  const getMessage = (s: number) => {
    if (s >= 90) return "A perfect match made in heaven!";
    if (s >= 70) return "Strong connection! Great potential.";
    if (s >= 50) return "There is a spark! Worth exploring.";
    if (s >= 30) return "Friendship vibes, but who knows?";
    return "Opposites attract... sometimes!";
  };

  const getColor = (s: number) => {
    if (s >= 70) return "#10B981";
    if (s >= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Your Name</label>
          <input type="text" value={name1} onChange={(e) => setName1(e.target.value)} className={inputClass} placeholder="Enter your name" />
        </div>
        <div className="text-center text-3xl">+</div>
        <div>
          <label className={labelClass}>Their Name</label>
          <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} className={inputClass} placeholder="Enter their name" />
        </div>
      </div>

      <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
        Calculate Love Score
      </button>

      {score !== null && (
        <div className="mt-6 text-center">
          <GlowCard>
            <p className="text-6xl font-bold mb-2" style={{ color: getColor(score) }}>
              {score}%
            </p>
            <p className="text-text-secondary text-sm">{getMessage(score)}</p>
            {/* Heart bar */}
            <div className="mt-4 h-4 rounded-full bg-bg-base overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: `linear-gradient(90deg, #EF4444, ${getColor(score)})` }} />
            </div>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 24. Aspect Ratio Calculator ────────────────────────────────────────────

function AspectRatioCalculator() {
  const [mode, setMode] = useState<"calculate" | "resize">("calculate");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [knownDim, setKnownDim] = useState<"width" | "height">("width");
  const [knownValue, setKnownValue] = useState("");

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  // Mode 1: Calculate ratio
  const w = parseInt(width) || 0;
  const h = parseInt(height) || 0;
  let ratioStr = "";
  if (w > 0 && h > 0) {
    const g = gcd(w, h);
    ratioStr = `${w / g}:${h / g}`;
  }

  // Mode 2: Resize
  const [rw, rh] = ratio.split(":").map(Number);
  const kv = parseInt(knownValue) || 0;
  let otherDim = 0;
  if (rw && rh && kv) {
    otherDim = knownDim === "width" ? Math.round((kv / rw) * rh) : Math.round((kv / rh) * rw);
  }

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("calculate")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "calculate" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "calculate" ? { background: btnGradient } : undefined}>
          Calculate Ratio
        </button>
        <button onClick={() => setMode("resize")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "resize" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "resize" ? { background: btnGradient } : undefined}>
          Resize by Ratio
        </button>
      </div>

      {mode === "calculate" ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Width</label>
              <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className={numberInputClass} placeholder="1920" />
            </div>
            <div>
              <label className={labelClass}>Height</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={numberInputClass} placeholder="1080" />
            </div>
          </div>
          {ratioStr && (
            <GlowCard>
              <GradientValue value={ratioStr} label="Aspect Ratio" />
            </GlowCard>
          )}
        </>
      ) : (
        <>
          <div className="space-y-4 mb-4">
            <div>
              <label className={labelClass}>Aspect Ratio</label>
              <select value={ratio} onChange={(e) => setRatio(e.target.value)} className={selectClass}>
                {["16:9", "4:3", "21:9", "1:1", "3:2", "5:4", "9:16"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setKnownDim("width")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${knownDim === "width" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={knownDim === "width" ? { background: btnGradient } : undefined}>
                Know Width
              </button>
              <button onClick={() => setKnownDim("height")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${knownDim === "height" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={knownDim === "height" ? { background: btnGradient } : undefined}>
                Know Height
              </button>
            </div>
            <div>
              <label className={labelClass}>{knownDim === "width" ? "Width" : "Height"}</label>
              <input type="number" value={knownValue} onChange={(e) => setKnownValue(e.target.value)} className={numberInputClass} placeholder="1920" />
            </div>
          </div>
          {otherDim > 0 && (
            <GlowCard>
              <GradientValue value={`${knownDim === "width" ? kv : otherDim} x ${knownDim === "height" ? kv : otherDim}`} label="Dimensions" />
            </GlowCard>
          )}
        </>
      )}
    </GlowCard>
  );
}

// ─── 25. Pixel/Rem Converter ────────────────────────────────────────────────

function PixelRemConverter() {
  const [mode, setMode] = useState<"pxToRem" | "remToPx">("pxToRem");
  const [value, setValue] = useState("");
  const [base, setBase] = useState("16");

  const val = parseFloat(value) || 0;
  const baseSize = parseFloat(base) || 16;
  const result = mode === "pxToRem" ? val / baseSize : val * baseSize;

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("pxToRem")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "pxToRem" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "pxToRem" ? { background: btnGradient } : undefined}>
          PX to REM
        </button>
        <button onClick={() => setMode("remToPx")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${mode === "remToPx" ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`} style={mode === "remToPx" ? { background: btnGradient } : undefined}>
          REM to PX
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Base Font Size (px)</label>
          <input type="number" value={base} onChange={(e) => setBase(e.target.value)} className={numberInputClass} placeholder="16" />
        </div>
        <div>
          <label className={labelClass}>{mode === "pxToRem" ? "Pixels (px)" : "REM"}</label>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={numberInputClass} placeholder={mode === "pxToRem" ? "16" : "1"} step="any" />
        </div>
      </div>

      {val > 0 && (
        <GlowCard>
          <GradientValue value={`${parseFloat(result.toFixed(4))} ${mode === "pxToRem" ? "rem" : "px"}`} label="Result" />
        </GlowCard>
      )}
    </GlowCard>
  );
}

// ─── 26. Bytes Converter ────────────────────────────────────────────────────

function BytesConverter() {
  const [bytes, setBytes] = useState("");

  const b = parseFloat(bytes) || 0;

  const units = [
    { label: "Bytes", value: b },
    { label: "KB", value: b / 1024 },
    { label: "MB", value: b / (1024 * 1024) },
    { label: "GB", value: b / (1024 * 1024 * 1024) },
    { label: "TB", value: b / (1024 * 1024 * 1024 * 1024) },
  ];

  return (
    <GlowCard>
      <label className={labelClass}>Enter Bytes</label>
      <input type="number" value={bytes} onChange={(e) => setBytes(e.target.value)} className={numberInputClass + " mb-4"} placeholder="1073741824" />

      {b > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {units.map((u) => (
            <GlowCard key={u.label} className="text-center">
              <p className="text-lg font-bold gradient-text">
                {u.value < 0.01 && u.value > 0 ? u.value.toExponential(2) : parseFloat(u.value.toPrecision(6)).toLocaleString()}
              </p>
              <p className="text-text-secondary text-xs">{u.label}</p>
            </GlowCard>
          ))}
        </div>
      )}
    </GlowCard>
  );
}

// ─── 27. Temperature Converter ──────────────────────────────────────────────

function TemperatureConverter() {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<"C" | "F" | "K">("C");

  const val = parseFloat(value);
  const hasValue = !isNaN(val);

  let celsius = 0, fahrenheit = 0, kelvin = 0;
  if (hasValue) {
    switch (unit) {
      case "C": celsius = val; fahrenheit = val * 9 / 5 + 32; kelvin = val + 273.15; break;
      case "F": celsius = (val - 32) * 5 / 9; fahrenheit = val; kelvin = (val - 32) * 5 / 9 + 273.15; break;
      case "K": celsius = val - 273.15; fahrenheit = (val - 273.15) * 9 / 5 + 32; kelvin = val; break;
    }
  }

  return (
    <GlowCard>
      <div className="flex gap-2 mb-6">
        {(["C", "F", "K"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${unit === u ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`}
            style={unit === u ? { background: btnGradient } : undefined}
          >
            {u === "C" ? "Celsius" : u === "F" ? "Fahrenheit" : "Kelvin"}
          </button>
        ))}
      </div>

      <label className={labelClass}>Temperature ({unit === "C" ? "\u00B0C" : unit === "F" ? "\u00B0F" : "K"})</label>
      <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={numberInputClass + " mb-4"} placeholder="100" />

      {hasValue && (
        <div className="grid grid-cols-3 gap-3">
          <GlowCard className="text-center">
            <p className="text-2xl font-bold gradient-text">{parseFloat(celsius.toFixed(2))}</p>
            <p className="text-text-secondary text-xs">&deg;C</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className="text-2xl font-bold gradient-text">{parseFloat(fahrenheit.toFixed(2))}</p>
            <p className="text-text-secondary text-xs">&deg;F</p>
          </GlowCard>
          <GlowCard className="text-center">
            <p className="text-2xl font-bold gradient-text">{parseFloat(kelvin.toFixed(2))}</p>
            <p className="text-text-secondary text-xs">K</p>
          </GlowCard>
        </div>
      )}
    </GlowCard>
  );
}

// ─── 28. Cooking Converter ──────────────────────────────────────────────────

function CookingConverter() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("cup");
  const [toUnit, setToUnit] = useState("ml");

  // All units in ml for volume, grams for weight
  const volumeUnits: Record<string, { label: string; ml: number }> = {
    tsp: { label: "Teaspoon", ml: 4.929 },
    tbsp: { label: "Tablespoon", ml: 14.787 },
    floz: { label: "Fl Oz", ml: 29.574 },
    cup: { label: "Cup", ml: 236.588 },
    pint: { label: "Pint", ml: 473.176 },
    quart: { label: "Quart", ml: 946.353 },
    gallon: { label: "Gallon", ml: 3785.41 },
    ml: { label: "Milliliter", ml: 1 },
    l: { label: "Liter", ml: 1000 },
  };

  const weightUnits: Record<string, { label: string; g: number }> = {
    g: { label: "Gram", g: 1 },
    kg: { label: "Kilogram", g: 1000 },
    oz: { label: "Ounce", g: 28.3495 },
    lb: { label: "Pound", g: 453.592 },
  };

  const allUnits = { ...volumeUnits, ...weightUnits };
  const isVolumeFrom = fromUnit in volumeUnits;
  const isVolumeTo = toUnit in volumeUnits;

  const val = parseFloat(value) || 0;
  let result = 0;
  let canConvert = true;

  if (isVolumeFrom && isVolumeTo) {
    const fromMl = volumeUnits[fromUnit].ml;
    const toMl = volumeUnits[toUnit].ml;
    result = (val * fromMl) / toMl;
  } else if (!isVolumeFrom && !isVolumeTo) {
    const fromG = weightUnits[fromUnit].g;
    const toG = weightUnits[toUnit].g;
    result = (val * fromG) / toG;
  } else {
    canConvert = false;
  }

  return (
    <GlowCard>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>From</label>
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className={selectClass + " mb-2"}>
            <optgroup label="Volume">
              {Object.entries(volumeUnits).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </optgroup>
            <optgroup label="Weight">
              {Object.entries(weightUnits).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </optgroup>
          </select>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={numberInputClass} placeholder="1" />
        </div>
        <div>
          <label className={labelClass}>To</label>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className={selectClass + " mb-2"}>
            <optgroup label="Volume">
              {Object.entries(volumeUnits).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </optgroup>
            <optgroup label="Weight">
              {Object.entries(weightUnits).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </optgroup>
          </select>
          <div className={`${numberInputClass} flex items-center justify-end min-h-[48px]`}>
            {!canConvert ? (
              <span className="text-danger text-sm">Cannot convert volume to weight</span>
            ) : val > 0 ? (
              parseFloat(result.toPrecision(6))
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

// ─── Generic Fallback Calculator ────────────────────────────────────────────

function GenericCalculator({ tool }: { tool: Tool }) {
  const name = (tool.name || tool.id || "").toLowerCase();
  const isConverter = name.includes("convert");

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [op, setOp] = useState("+");
  const [result, setResult] = useState("");

  const calculate = () => {
    const va = parseFloat(a) || 0;
    const vb = parseFloat(b) || 0;
    const vc = parseFloat(c) || 0;

    if (isConverter) {
      // Generic conversion: treat field A as value, field B as multiplier/rate
      const rate = vb || 1;
      setResult(`${va} x ${rate} = ${parseFloat((va * rate).toPrecision(10))}`);
      return;
    }

    // Multi-input calculator
    let r = 0;
    switch (op) {
      case "+": r = va + vb + vc; break;
      case "-": r = va - vb - vc; break;
      case "*": r = va * vb * (vc || 1); break;
      case "/": r = vb !== 0 ? (vc !== 0 ? va / vb / vc : va / vb) : 0; break;
      case "%": r = vb !== 0 ? (va / vb) * 100 : 0; break;
      case "^": r = Math.pow(va, vb); break;
    }
    setResult(parseFloat(r.toPrecision(10)).toString());
  };

  if (isConverter) {
    return (
      <GlowCard>
        <div className="space-y-4 mb-4">
          <div>
            <label className={labelClass}>Value</label>
            <input type="number" value={a} onChange={(e) => setA(e.target.value)} className={numberInputClass} placeholder="Enter value" />
          </div>
          <div>
            <label className={labelClass}>Conversion Rate / Multiplier</label>
            <input type="number" value={b} onChange={(e) => setB(e.target.value)} className={numberInputClass} placeholder="Enter rate" />
          </div>
          <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
            Convert
          </button>
        </div>
        {result && (
          <GlowCard>
            <GradientValue value={result} label="Converted Result" />
          </GlowCard>
        )}
      </GlowCard>
    );
  }

  return (
    <GlowCard>
      <div className="space-y-4 mb-4">
        <div>
          <label className={labelClass}>Number 1</label>
          <input type="number" value={a} onChange={(e) => setA(e.target.value)} className={numberInputClass} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>Operation</label>
          <div className="flex gap-2 flex-wrap">
            {["+", "-", "*", "/", "%", "^"].map((o) => (
              <button
                key={o}
                onClick={() => setOp(o)}
                className={`flex-1 min-w-[48px] py-3 rounded-xl text-lg font-bold ${op === o ? "text-white" : "bg-bg-base border border-border text-text-secondary"}`}
                style={op === o ? { background: btnGradient } : undefined}
              >
                {o === "%" ? "%" : o === "^" ? "xⁿ" : o}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Number 2</label>
          <input type="number" value={b} onChange={(e) => setB(e.target.value)} className={numberInputClass} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>Number 3 (optional)</label>
          <input type="number" value={c} onChange={(e) => setC(e.target.value)} className={numberInputClass} placeholder="0" />
        </div>
        <button onClick={calculate} className={`w-full ${btnClass}`} style={{ background: btnGradient }}>
          Calculate
        </button>
      </div>

      {result && (
        <GlowCard>
          <GradientValue value={result} label="Result" />
        </GlowCard>
      )}
    </GlowCard>
  );
}

// ─── Main Engine Component ──────────────────────────────────────────────────

interface CalculatorToolEngineProps {
  tool: Tool;
}

export default function CalculatorToolEngine({ tool }: CalculatorToolEngineProps) {
  const renderTool = () => {
    switch (tool.id) {
      case "scientific-calculator":
        return <ScientificCalculator />;
      case "percentage-calculator":
        return <PercentageCalculator />;
      case "age-calculator":
        return <AgeCalculator />;
      case "bmi-calculator":
      case "bmi-calculator-health":
        return <BMICalculator />;
      case "emi-calculator":
        return <EMICalculator />;
      case "gst-calculator":
        return <GSTCalculator />;
      case "discount-calculator":
        return <DiscountCalculator />;
      case "tip-calculator":
        return <TipCalculator />;
      case "unit-converter":
        return <UnitConverter />;
      case "date-calculator":
        return <DateCalculator />;
      case "roman-numeral":
        return <RomanNumeralConverter />;
      case "binary-hex-converter":
        return <BinaryHexConverter />;
      case "area-calculator":
        return <AreaCalculator />;
      case "fuel-cost-calculator":
        return <FuelCostCalculator />;
      case "salary-calculator":
        return <SalaryCalculator />;
      case "sip-calculator":
        return <SIPCalculator />;
      case "fd-calculator":
        return <FDCalculator />;
      case "compound-interest":
        return <CompoundInterestCalculator />;
      case "profit-loss-calculator":
        return <ProfitLossCalculator />;
      case "tax-calculator":
        return <TaxCalculator />;
      case "mortgage-calculator":
        return <MortgageCalculator />;
      case "gpa-calculator":
        return <GPACalculator />;
      case "love-calculator":
        return <LoveCalculator />;
      case "aspect-ratio-calculator":
        return <AspectRatioCalculator />;
      case "pixel-to-rem":
      case "rem-to-pixel":
        return <PixelRemConverter />;
      case "bytes-converter":
        return <BytesConverter />;
      case "temperature-converter":
        return <TemperatureConverter />;
      case "cooking-converter":
        return <CookingConverter />;
      default:
        return <GenericCalculator tool={tool} />;
    }
  };

  return <div className="max-w-2xl mx-auto">{renderTool()}</div>;
}
