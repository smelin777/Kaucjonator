import React, { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { storage } from "./storage.js";

const DEFAULT_RATE = 0.5;
const DEFAULT_GOAL = 50;

const todayKey = () => {
  const d = new Date();
  return `day:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};
const todayLabel = () => {
  const d = new Date();
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" });
};

const BOTTLE_NECK_PATH =
  "M40 18 L40 40 C40 46 34 48 34 58 L34 66 L66 66 L66 58 C66 48 60 46 60 40 L60 18 Z";
const BOTTLE_BODY_PATH =
  "M34 66 L22 82 C18 88 16 96 16 106 L16 148 C16 158 24 166 34 166 L66 166 C76 166 84 158 84 148 L84 106 C84 96 82 88 78 82 L66 66 Z";
const BOTTLE_CAP = { x: 42, y: 4, w: 16, h: 14 };

function Bottle({ size = 64, animated = false }) {
  return (
    <svg
      width={size}
      height={size * 1.7}
      viewBox="0 0 100 170"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: "bottleBob 3s ease-in-out infinite" } : undefined}
    >
      <defs>
        <linearGradient id="bottleGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d7a4f" />
          <stop offset="45%" stopColor="#2fbf80" />
          <stop offset="100%" stopColor="#0a5c3c" />
        </linearGradient>
        <linearGradient id="bottleCap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e0a92a" />
          <stop offset="100%" stopColor="#b4801a" />
        </linearGradient>
      </defs>
      <g>
        <rect x={BOTTLE_CAP.x} y={BOTTLE_CAP.y} width={BOTTLE_CAP.w} height={BOTTLE_CAP.h} rx="3" fill="url(#bottleCap)" stroke="#0a0a0a" strokeWidth="2" />
        <path d={BOTTLE_NECK_PATH} fill="url(#bottleGlass)" stroke="#0a0a0a" strokeWidth="2.5" />
        <path d={BOTTLE_BODY_PATH} fill="url(#bottleGlass)" stroke="#0a0a0a" strokeWidth="2.5" />
        <rect x="20" y="108" width="60" height="30" rx="3" fill="#f4f7f2" stroke="#0a0a0a" strokeWidth="1.5" />
        <text x="50" y="128" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0d7a4f" fontFamily="Verdana, sans-serif">
          50g
        </text>
        <path d="M26 84 C22 96 22 118 24 150" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.35" fill="none" />
      </g>
    </svg>
  );
}

const glassCard = {
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.55)",
  boxShadow: "0 8px 24px rgba(10,50,60,0.18)",
};

function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 24 });
  const emojis = ["🎉", "✨", "🍾", "💰", "🟢"];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 30 }}>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 1.6 + Math.random() * 1.2;
        const size = 16 + Math.random() * 14;
        const emoji = emojis[i % emojis.length];
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: "-30px",
              fontSize: size,
              animation: `confettiFall ${duration}s ease-in ${delay}s forwards`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}

export default function Kaucjonator() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [ready, setReady] = useState(false);
  const [bump, setBump] = useState(null);
  const [sumPulse, setSumPulse] = useState(false);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [showSettings, setShowSettings] = useState(false);
  const [rateInput, setRateInput] = useState(String(DEFAULT_RATE));
  const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL));
  const [confirmReset, setConfirmReset] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const prevCountRef = useRef(0);
  const canvasRef = useRef(null);

  const money = useCallback((n) => (n * rate).toFixed(2).replace(".", ","), [rate]);

  useEffect(() => {
    (async () => {
      try {
        const key = todayKey();
        let todayCount = 0;
        try {
          const res = await storage.get(key, false);
          if (res) todayCount = JSON.parse(res.value).bottles || 0;
        } catch (e) {
          todayCount = 0;
        }
        setCount(todayCount);
        prevCountRef.current = todayCount;

        try {
          const settings = await storage.get("settings", false);
          if (settings) {
            const val = JSON.parse(settings.value);
            if (val.rate) {
              setRate(val.rate);
              setRateInput(String(val.rate));
            }
            if (val.goal) {
              setGoal(val.goal);
              setGoalInput(String(val.goal));
            }
          }
        } catch (e) {
          /* brak ustawień - użyj domyślnych */
        }

        let days = [];
        try {
          const list = await storage.get("days-list", false);
          if (list) days = JSON.parse(list.value);
        } catch (e) {
          days = [];
        }

        const entries = [];
        for (const d of days) {
          try {
            const res = await storage.get(`day:${d}`, false);
            if (res) {
              const val = JSON.parse(res.value);
              entries.push({ date: d, bottles: val.bottles || 0 });
            }
          } catch (e) {
            /* pomiń brakujący dzień */
          }
        }
        entries.sort((a, b) => (a.date < b.date ? 1 : -1));
        setHistory(entries);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (newCount) => {
    const key = todayKey();
    const dateStr = key.slice(4);
    try {
      await storage.set(key, JSON.stringify({ bottles: newCount }), false);
      let days = [];
      try {
        const list = await storage.get("days-list", false);
        if (list) days = JSON.parse(list.value);
      } catch (e) {
        days = [];
      }
      if (!days.includes(dateStr)) {
        days.push(dateStr);
        await storage.set("days-list", JSON.stringify(days), false);
      }
    } catch (e) {
      console.error("Błąd zapisu", e);
    }
  }, []);

  const saveSettings = useCallback(async (newRate, newGoal) => {
    try {
      await storage.set("settings", JSON.stringify({ rate: newRate, goal: newGoal }), false);
    } catch (e) {
      console.error("Błąd zapisu ustawień", e);
    }
  }, []);

  const updateHistoryToday = useCallback((newCount) => {
    const dateStr = todayKey().slice(4);
    setHistory((prev) => {
      const exists = prev.find((e) => e.date === dateStr);
      if (exists) {
        return prev.map((e) => (e.date === dateStr ? { ...e, bottles: newCount } : e));
      }
      return [{ date: dateStr, bottles: newCount }, ...prev];
    });
  }, []);

  const pulseSum = () => {
    setSumPulse(true);
    setTimeout(() => setSumPulse(false), 220);
  };

  const checkGoalCross = (n) => {
    if (goal > 0 && prevCountRef.current < goal && n >= goal) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2200);
    }
    prevCountRef.current = n;
  };

  const add = () => {
    const n = count + 1;
    setCount(n);
    persist(n);
    updateHistoryToday(n);
    setBump("plus");
    pulseSum();
    checkGoalCross(n);
    setTimeout(() => setBump(null), 180);
  };

  const subtract = () => {
    const n = Math.max(0, count - 1);
    setCount(n);
    persist(n);
    updateHistoryToday(n);
    setBump("minus");
    pulseSum();
    prevCountRef.current = n;
    setTimeout(() => setBump(null), 180);
  };

  const doResetDay = () => {
    setCount(0);
    persist(0);
    updateHistoryToday(0);
    setConfirmReset(false);
    prevCountRef.current = 0;
    pulseSum();
  };

  const applySettings = () => {
    let r = parseFloat(rateInput.replace(",", "."));
    let g = parseInt(goalInput, 10);
    if (isNaN(r) || r <= 0) r = rate;
    if (isNaN(g) || g <= 0) g = goal;
    setRate(r);
    setGoal(g);
    setRateInput(String(r));
    setGoalInput(String(g));
    saveSettings(r, g);
    setShowSettings(false);
  };

  const totalBottles = history.reduce((s, e) => s + e.bottles, 0);
  const totalMoney = totalBottles * rate;
  const sumColor = count > 0 ? "#12a24a" : "#111111";
  const progressPct = Math.min(100, Math.round((count / Math.max(1, goal)) * 100));
  const goalReached = count >= goal;

  const chartData = [...history]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-10)
    .map((e) => ({
      label: new Date(e.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }),
      butelki: e.bottles,
    }));

  const drawBottleOnCanvas = (ctx, cx, cy, scale) => {
    ctx.save();
    ctx.translate(cx - 50 * scale, cy - 85 * scale);
    ctx.scale(scale, scale);
    const grad = ctx.createLinearGradient(0, 0, 100, 0);
    grad.addColorStop(0, "#0d7a4f");
    grad.addColorStop(0.45, "#2fbf80");
    grad.addColorStop(1, "#0a5c3c");
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 2.5;

    const cap = new Path2D();
    cap.rect(BOTTLE_CAP.x, BOTTLE_CAP.y, BOTTLE_CAP.w, BOTTLE_CAP.h);
    ctx.fillStyle = "#c98f22";
    ctx.fill(cap);
    ctx.stroke(cap);

    const neck = new Path2D(BOTTLE_NECK_PATH);
    const body = new Path2D(BOTTLE_BODY_PATH);
    ctx.fillStyle = grad;
    ctx.fill(neck);
    ctx.stroke(neck);
    ctx.fill(body);
    ctx.stroke(body);

    ctx.fillStyle = "#f4f7f2";
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.5;
    const label = new Path2D();
    label.rect(20, 108, 60, 30);
    ctx.fill(label);
    ctx.stroke(label);
    ctx.fillStyle = "#0d7a4f";
    ctx.font = "bold 13px Verdana";
    ctx.textAlign = "center";
    ctx.fillText("50g", 50, 128);
    ctx.restore();
  };

  const generateShareImage = () =>
    new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");

      const bg = ctx.createRadialGradient(200, 0, 50, 320, 400, 700);
      bg.addColorStop(0, "#8fd8f5");
      bg.addColorStop(0.35, "#5fc2ee");
      bg.addColorStop(0.7, "#3fa9de");
      bg.addColorStop(1, "#2f8fc4");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";
      ctx.lineJoin = "round";
      ctx.font = "900 58px 'Arial Black', Impact, sans-serif";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#0a0a0a";
      ctx.strokeText("KAUCJONATOR", canvas.width / 2, 110);
      ctx.fillStyle = "#1fae5a";
      ctx.fillText("KAUCJONATOR", canvas.width / 2, 110);

      drawBottleOnCanvas(ctx, canvas.width / 2, 320, 2.1);

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      const cardX = 60, cardY = 470, cardW = 520, cardH = 220;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 24) : ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();

      ctx.fillStyle = "#3a4a49";
      ctx.font = "bold 20px 'Trebuchet MS', sans-serif";
      ctx.fillText("DZISIAJ ZEBRAŁEM", canvas.width / 2, cardY + 44);

      ctx.fillStyle = count > 0 ? "#12a24a" : "#111111";
      ctx.font = "900 56px 'Trebuchet MS', sans-serif";
      ctx.fillText(`${count} but.`, canvas.width / 2, cardY + 112);

      ctx.font = "800 38px 'Trebuchet MS', sans-serif";
      ctx.fillText(`${money(count)} zł`, canvas.width / 2, cardY + 168);

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.font = "16px 'Trebuchet MS', sans-serif";
      ctx.fillText(todayLabel(), canvas.width / 2, cardY + 202);

      canvas.toBlob((blob) => resolve(blob), "image/png");
    });

  const shareResult = async () => {
    setSharing(true);
    setShareMsg("");
    try {
      const blob = await generateShareImage();
      const file = new File([blob], "kaucjonator.png", { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Kaucjonator",
          text: `Dzisiaj zebrałem ${count} butelek i ${money(count)} zł kaucji! 🍾`,
        });
        setShareMsg("Udostępniono!");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kaucjonator-wynik.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        setShareMsg("Obrazek zapisany!");
      }
    } catch (e) {
      setShareMsg("Nie udało się udostępnić.");
    } finally {
      setSharing(false);
      setTimeout(() => setShareMsg(""), 2500);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "radial-gradient(circle at 30% 0%, #8fd8f5 0%, #5fc2ee 35%, #3fa9de 70%, #2f8fc4 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
        padding: "28px 16px 40px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes bottleBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-2deg); }
        }
        @keyframes sumPulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes confettiFall {
          from { transform: translateY(0) rotate(0deg); opacity: 1; }
          to { transform: translateY(110vh) rotate(360deg); opacity: 0.9; }
        }
        .kj-btn:hover { filter: brightness(1.04); box-shadow: 0 8px 20px rgba(0,0,0,0.28) !important; }
        .kj-btn:active { filter: brightness(0.97); }
        .kj-link-btn:hover { background: rgba(255,255,255,0.95) !important; }
      `}</style>

      <Confetti active={celebrate} />

      <button
        onClick={() => setShowSettings((s) => !s)}
        aria-label="Ustawienia kaucji"
        className="kj-link-btn"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "2px solid rgba(10,10,10,0.7)",
          background: "rgba(255,255,255,0.75)",
          cursor: "pointer",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s ease",
        }}
      >
        ⚙️
      </button>

      {showSettings && (
        <div
          style={{
            position: "absolute",
            top: 62,
            right: 16,
            ...glassCard,
            borderRadius: 14,
            padding: "14px 16px",
            zIndex: 10,
            animation: "fadeSlideIn 0.18s ease",
            width: 200,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0a5c3c", marginBottom: 6 }}>
            Stawka kaucji (zł)
          </div>
          <input
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1.5px solid #0a5c3c",
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 10,
              outline: "none",
            }}
          />
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0a5c3c", marginBottom: 6 }}>
            Cel dzienny (butelki)
          </div>
          <input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1.5px solid #0a5c3c",
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 10,
              outline: "none",
            }}
          />
          <button
            onClick={applySettings}
            className="kj-btn"
            style={{
              width: "100%",
              background: "#1eb85c",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 0",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Zapisz
          </button>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 420, marginBottom: 6 }}>
        <svg viewBox="0 0 420 110" width="100%" height="110">
          <defs>
            <path id="arcPath" d="M 15 100 Q 210 10 405 100" fill="none" />
          </defs>
          <text fontSize="46" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif" letterSpacing="2">
            <textPath href="#arcPath" startOffset="50%" textAnchor="middle">
              <tspan fill="#1fae5a" stroke="#0a0a0a" strokeWidth="2.2" paintOrder="stroke">
                KAUCJONATOR
              </tspan>
            </textPath>
          </text>
        </svg>
      </div>

      <div style={{ marginBottom: 10 }}>
        <Bottle size={88} animated />
      </div>

      <div style={{ display: "flex", gap: 22, marginTop: 6, marginBottom: 18 }}>
        <button
          onClick={add}
          aria-label="Dodaj butelkę"
          className="kj-btn"
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            border: "5px solid #1eb85c",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: bump === "plus" ? "0 0 0 8px rgba(30,184,92,0.3)" : "0 6px 14px rgba(0,0,0,0.22)",
            transform: bump === "plus" ? "scale(0.94)" : "scale(1)",
            transition: "all 0.15s ease",
            position: "relative",
          }}
        >
          <div style={{ position: "relative" }}>
            <Bottle size={44} />
            <span style={{ position: "absolute", top: -8, right: -14, fontSize: 30, fontWeight: 900, color: "#1eb85c", textShadow: "0 0 3px #0a0a0a" }}>
              +
            </span>
          </div>
        </button>

        <button
          onClick={subtract}
          aria-label="Odejmij butelkę"
          className="kj-btn"
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            border: "5px solid #e23b3b",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: bump === "minus" ? "0 0 0 8px rgba(226,59,59,0.3)" : "0 6px 14px rgba(0,0,0,0.22)",
            transform: bump === "minus" ? "scale(0.94)" : "scale(1)",
            transition: "all 0.15s ease",
            position: "relative",
          }}
        >
          <div style={{ position: "relative" }}>
            <Bottle size={44} />
            <span style={{ position: "absolute", top: -8, right: -14, fontSize: 30, fontWeight: 900, color: "#e23b3b", textShadow: "0 0 3px #0a0a0a" }}>
              −
            </span>
          </div>
        </button>
      </div>

      {/* Pasek celu dziennego */}
      <div style={{ width: "100%", maxWidth: 260, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "rgba(10,10,10,0.65)", marginBottom: 4 }}>
          <span>Cel dnia</span>
          <span>{count} / {goal}</span>
        </div>
        <div style={{ height: 12, borderRadius: 8, background: "rgba(255,255,255,0.5)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.6)" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: goalReached ? "linear-gradient(90deg,#ffd93b,#1eb85c)" : "linear-gradient(90deg,#2fbf80,#1eb85c)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        {goalReached && (
          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "#0a5c3c", marginTop: 4 }}>
            🎉 Cel osiągnięty!
          </div>
        )}
      </div>

      {/* Pole SUMA */}
      <div
        style={{
          ...glassCard,
          borderRadius: 18,
          padding: "16px 34px",
          textAlign: "center",
          minWidth: 220,
          animation: sumPulse ? "sumPulse 0.22s ease" : undefined,
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: 1, color: "#3a4a49", fontWeight: 700, marginBottom: 2 }}>
          SUMA
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: sumColor, lineHeight: 1.1 }}>
          {count} {count === 1 ? "butelka" : count >= 2 && count <= 4 ? "butelki" : "butelek"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: sumColor }}>{money(count)} zł</div>
      </div>

      {/* Udostępnij wynik */}
      <button
        onClick={shareResult}
        disabled={sharing}
        className="kj-btn"
        style={{
          marginTop: 14,
          background: "linear-gradient(90deg,#1eb85c,#12a24a)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "10px 22px",
          fontWeight: 800,
          fontSize: 14,
          cursor: sharing ? "default" : "pointer",
          opacity: sharing ? 0.7 : 1,
          boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
          transition: "all 0.15s ease",
        }}
      >
        {sharing ? "Generuję…" : "📤 Udostępnij wynik"}
      </button>
      {shareMsg && (
        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "#0a5c3c" }}>{shareMsg}</div>
      )}

      <button
        onClick={() => setConfirmReset(true)}
        className="kj-link-btn"
        style={{
          marginTop: 12,
          background: "transparent",
          border: "none",
          color: "rgba(10,10,10,0.6)",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Resetuj dzisiejszy dzień
      </button>

      {confirmReset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
          <div style={{ ...glassCard, background: "rgba(255,255,255,0.96)", borderRadius: 16, padding: "22px 24px", maxWidth: 300, textAlign: "center", animation: "modalPop 0.18s ease" }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14, color: "#111" }}>
              Zresetować dzisiejszą liczbę butelek do zera?
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={doResetDay} className="kj-btn" style={{ background: "#e23b3b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 800, cursor: "pointer" }}>
                Resetuj
              </button>
              <button onClick={() => setConfirmReset(false)} className="kj-btn" style={{ background: "#eee", color: "#333", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 800, cursor: "pointer" }}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowStats((s) => !s)}
        className="kj-link-btn"
        style={{ marginTop: 18, ...glassCard, background: "rgba(255,255,255,0.8)", borderRadius: 12, padding: "10px 20px", fontWeight: 800, fontSize: 15, color: "#0a5c3c", cursor: "pointer", transition: "background 0.15s ease" }}
      >
        {showStats ? "Ukryj statystyki" : "📊 Pokaż statystyki"}
      </button>

      {showStats && (
        <div style={{ marginTop: 16, ...glassCard, borderRadius: 16, padding: "16px 20px", width: "100%", maxWidth: 400, boxSizing: "border-box", animation: "fadeSlideIn 0.2s ease" }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: "#0a5c3c", marginBottom: 10, textAlign: "center" }}>
            Statystyki zbierania
          </div>

          {!ready && <div style={{ textAlign: "center", color: "#666" }}>Wczytywanie…</div>}
          {ready && history.length === 0 && (
            <div style={{ textAlign: "center", color: "#666" }}>Brak jeszcze żadnych zebranych butelek.</div>
          )}

          {ready && history.length > 0 && (
            <>
              <div style={{ width: "100%", height: 160, marginBottom: 14 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#3a4a49" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#3a4a49" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #ccc" }} formatter={(v) => [`${v} but.`, "Zebrano"]} />
                    <Bar dataKey="butelki" fill="#1fae5a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                {history.map((e) => (
                  <div key={e.date} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: e.date === todayKey().slice(4) ? "rgba(30,184,92,0.14)" : "rgba(0,0,0,0.035)", borderRadius: 8, fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: "#333" }}>
                      {new Date(e.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                    <span style={{ color: "#0a5c3c", fontWeight: 700 }}>
                      {e.bottles} szt. · {money(e.bottles)} zł
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, borderTop: "2px dashed rgba(0,0,0,0.2)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 16, color: "#0a0a0a" }}>
                <span>Razem:</span>
                <span>
                  {totalBottles} szt. · {totalMoney.toFixed(2).replace(".", ",")} zł
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 18, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>{todayLabel()}</div>
    </div>
  );
}
