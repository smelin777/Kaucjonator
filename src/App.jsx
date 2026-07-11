import React, { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "./storage.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DEFAULT_GOAL = 50;

const DEFAULT_TYPES = [
  { id: "pet", label: "PET", emoji: "🧴", rate: 0.5, color: "#3fa9de" },
  { id: "puszka", label: "Puszka", emoji: "🥫", rate: 0.5, color: "#f2a33e" },
  { id: "szklo", label: "Szkło", emoji: "🍾", rate: 1.0, color: "#7a4a2b" },
];

const emptyCounts = () => ({ pet: 0, puszka: 0, szklo: 0 });

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

/* ---------- Urocze, komiksowe ikony opakowań ---------- */

function Sparkle({ x, y, size = 6, opacity = 0.85 }) {
  return (
    <path
      d={`M${x} ${y - size} L${x + size * 0.28} ${y - size * 0.28} L${x + size} ${y} L${x + size * 0.28} ${y + size * 0.28} L${x} ${y + size} L${x - size * 0.28} ${y + size * 0.28} L${x - size} ${y} L${x - size * 0.28} ${y - size * 0.28} Z`}
      fill="#ffffff"
      opacity={opacity}
    />
  );
}

function CutePet({ size = 90, animated = false }) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 130 200" style={animated ? { animation: "bottleBob 3s ease-in-out infinite" } : undefined}>
      <defs>
        <linearGradient id="petCap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5fc2ee" />
          <stop offset="100%" stopColor="#2f8fc4" />
        </linearGradient>
        <linearGradient id="petBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#eaf7fd" />
          <stop offset="55%" stopColor="#cdeaf7" />
          <stop offset="100%" stopColor="#a9daf0" />
        </linearGradient>
        <linearGradient id="petLabel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5fc2ee" />
          <stop offset="100%" stopColor="#3fa9de" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="40" r="4" fill="#ffffff" opacity="0.8" />
      <circle cx="15" cy="65" r="3" fill="#ffffff" opacity="0.7" />
      <circle cx="112" cy="55" r="5" fill="#ffffff" opacity="0.6" stroke="#dff1fb" strokeWidth="1" />
      <circle cx="118" cy="90" r="3" fill="#ffffff" opacity="0.7" />
      <rect x="45" y="8" width="40" height="26" rx="6" fill="url(#petCap)" stroke="#0a0a0a" strokeWidth="4" />
      <line x1="52" y1="10" x2="52" y2="32" stroke="#0a3550" strokeWidth="1.5" opacity="0.4" />
      <line x1="60" y1="10" x2="60" y2="32" stroke="#0a3550" strokeWidth="1.5" opacity="0.4" />
      <line x1="68" y1="10" x2="68" y2="32" stroke="#0a3550" strokeWidth="1.5" opacity="0.4" />
      <line x1="76" y1="10" x2="76" y2="32" stroke="#0a3550" strokeWidth="1.5" opacity="0.4" />
      <path
        d="M45 34 L45 55 C45 65 33 68 33 85 L33 168 C33 180 42 190 55 190 L75 190 C88 190 97 180 97 168 L97 85 C97 68 85 65 85 55 L85 34 Z"
        fill="url(#petBody)"
        stroke="#0a0a0a"
        strokeWidth="4.5"
      />
      <rect x="33" y="100" width="64" height="52" fill="url(#petLabel)" stroke="#0a0a0a" strokeWidth="4" />
      <path d="M48 122 C50 114 58 114 60 122" stroke="#0a0a0a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M70 122 C72 114 80 114 82 122" stroke="#0a0a0a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M52 133 C58 141 72 141 78 133" stroke="#0a0a0a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M42 90 C40 105 40 135 42 165" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.5" fill="none" />
    </svg>
  );
}

function CuteGlass({ size = 90, animated = false }) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 130 200" style={animated ? { animation: "bottleBob 3s ease-in-out infinite" } : undefined}>
      <defs>
        <linearGradient id="glassNeck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#bfe7e0" />
          <stop offset="100%" stopColor="#8fd0c6" />
        </linearGradient>
        <linearGradient id="glassLiquid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b45a1e" />
          <stop offset="55%" stopColor="#7a3a12" />
          <stop offset="100%" stopColor="#5c2b0d" />
        </linearGradient>
      </defs>
      <rect x="48" y="6" width="34" height="20" rx="5" fill="#c9ccce" stroke="#0a0a0a" strokeWidth="4" />
      <line x1="53" y1="8" x2="53" y2="24" stroke="#555" strokeWidth="1.5" opacity="0.5" />
      <line x1="60" y1="8" x2="60" y2="24" stroke="#555" strokeWidth="1.5" opacity="0.5" />
      <line x1="67" y1="8" x2="67" y2="24" stroke="#555" strokeWidth="1.5" opacity="0.5" />
      <line x1="74" y1="8" x2="74" y2="24" stroke="#555" strokeWidth="1.5" opacity="0.5" />
      <path
        d="M50 26 L50 52 C50 62 42 66 42 80 L42 172 C42 182 50 190 60 190 L72 190 C82 190 90 182 90 172 L90 80 C90 66 82 62 82 52 L82 26 Z"
        fill="url(#glassNeck)"
        stroke="#0a0a0a"
        strokeWidth="4.5"
      />
      <path
        d="M43 72 L89 72 L89 172 C89 181 81 189 71 189 L61 189 C51 189 43 181 43 172 Z"
        fill="url(#glassLiquid)"
      />
      <circle cx="58" cy="140" r="3" fill="#ffb877" opacity="0.85" />
      <circle cx="70" cy="110" r="2.5" fill="#ffb877" opacity="0.75" />
      <circle cx="64" cy="160" r="2" fill="#ffb877" opacity="0.8" />
      <rect x="40" y="108" width="52" height="46" rx="4" fill="#f4ecd8" stroke="#0a0a0a" strokeWidth="4" />
      <path d="M53 128 C55 120 62 120 64 128" stroke="#0a0a0a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M70 128 C72 120 79 120 81 128" stroke="#0a0a0a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M56 138 C61 145 74 145 79 138" stroke="#0a0a0a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <ellipse cx="49" cy="139" rx="5" ry="3.5" fill="#f5a3a3" opacity="0.8" />
      <ellipse cx="86" cy="139" rx="5" ry="3.5" fill="#f5a3a3" opacity="0.8" />
      <path d="M50 80 C48 95 48 130 50 165" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.4" fill="none" />
    </svg>
  );
}

function CuteCan({ size = 90, animated = false }) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 130 200" style={animated ? { animation: "bottleBob 3s ease-in-out infinite" } : undefined}>
      <defs>
        <linearGradient id="canBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd84d" />
          <stop offset="55%" stopColor="#f6a53a" />
          <stop offset="100%" stopColor="#ef7a2c" />
        </linearGradient>
        <linearGradient id="canRim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e6e9eb" />
          <stop offset="100%" stopColor="#b7bdc2" />
        </linearGradient>
      </defs>
      <path
        d="M28 34 C28 24 38 18 65 18 C92 18 102 24 102 34 L102 172 C102 182 92 188 65 188 C38 188 28 182 28 172 Z"
        fill="url(#canBody)"
        stroke="#0a0a0a"
        strokeWidth="4.5"
      />
      <ellipse cx="65" cy="34" rx="37" ry="12" fill="url(#canRim)" stroke="#0a0a0a" strokeWidth="4" />
      <ellipse cx="65" cy="31" rx="26" ry="6" fill="#d7dadc" stroke="#0a0a0a" strokeWidth="2.5" />
      <ellipse cx="70" cy="30" rx="9" ry="4" fill="none" stroke="#0a0a0a" strokeWidth="2.5" />
      <ellipse cx="65" cy="172" rx="37" ry="10" fill="url(#canRim)" stroke="#0a0a0a" strokeWidth="3.5" opacity="0.9" />
      <path d="M40 55 L40 150" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
      <circle cx="65" cy="118" r="34" fill="#ffe08a" stroke="#0a0a0a" strokeWidth="4" />
      <path d="M50 112 C52 104 60 104 62 112" stroke="#0a0a0a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M68 112 C70 104 78 104 80 112" stroke="#0a0a0a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M53 124 C58 132 72 132 77 124" stroke="#0a0a0a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <Sparkle x={38} y={60} size={5} />
      <Sparkle x={94} y={78} size={4} />
      <Sparkle x={92} y={150} size={5} />
    </svg>
  );
}

function TypeIcon({ id, size = 70, animated = false }) {
  if (id === "pet") return <CutePet size={size} animated={animated} />;
  if (id === "szklo") return <CuteGlass size={size} animated={animated} />;
  return <CuteCan size={size} animated={animated} />;
}

/* ---------- Reszta komponentów ---------- */

const glassCard = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow: "0 8px 24px rgba(30,80,50,0.16)",
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
          <span key={i} style={{ position: "absolute", left: `${left}%`, top: "-30px", fontSize: size, animation: `confettiFall ${duration}s ease-in ${delay}s forwards` }}>
            {emoji}
          </span>
        );
      })}
    </div>
  );
}

export default function Kaucjonator() {
  const [counts, setCounts] = useState(emptyCounts());
  const [selectedType, setSelectedType] = useState("pet");
  const [types, setTypes] = useState(DEFAULT_TYPES);
  const [history, setHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [ready, setReady] = useState(false);
  const [bump, setBump] = useState(null);
  const [sumPulse, setSumPulse] = useState(false);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [showSettings, setShowSettings] = useState(false);
  const [rateInputs, setRateInputs] = useState({ pet: "0.5", puszka: "0.5", szklo: "1" });
  const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL));
  const [confirmReset, setConfirmReset] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const prevTotalRef = useRef(0);

  const rateOf = useCallback((id) => (types.find((t) => t.id === id) || {}).rate || 0, [types]);

  const totalBottles = counts.pet + counts.puszka + counts.szklo;
  const totalMoneyNum = counts.pet * rateOf("pet") + counts.puszka * rateOf("puszka") + counts.szklo * rateOf("szklo");
  const totalMoney = totalMoneyNum.toFixed(2).replace(".", ",");

  useEffect(() => {
    (async () => {
      try {
        const key = todayKey();
        let todayCounts = emptyCounts();
        try {
          const res = await storage.get(key, false);
          if (res) {
            const parsed = JSON.parse(res.value);
            todayCounts = { pet: parsed.pet || 0, puszka: parsed.puszka || 0, szklo: parsed.szklo || 0 };
          }
        } catch (e) {
          todayCounts = emptyCounts();
        }
        setCounts(todayCounts);
        prevTotalRef.current = todayCounts.pet + todayCounts.puszka + todayCounts.szklo;

        try {
          const settings = await storage.get("settings", false);
          if (settings) {
            const val = JSON.parse(settings.value);
            if (val.goal) {
              setGoal(val.goal);
              setGoalInput(String(val.goal));
            }
            if (val.rates) {
              setTypes((prev) => prev.map((t) => ({ ...t, rate: val.rates[t.id] ?? t.rate })));
              setRateInputs({
                pet: String(val.rates.pet ?? 0.5),
                puszka: String(val.rates.puszka ?? 0.5),
                szklo: String(val.rates.szklo ?? 1),
              });
            }
          }
        } catch (e) {
          /* brak ustawień */
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
              entries.push({
                date: d,
                counts: { pet: val.pet || 0, puszka: val.puszka || 0, szklo: val.szklo || 0 },
              });
            }
          } catch (e) {
            /* pomiń */
          }
        }
        entries.sort((a, b) => (a.date < b.date ? 1 : -1));
        setHistory(entries);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (newCounts) => {
    const key = todayKey();
    const dateStr = key.slice(4);
    try {
      await storage.set(key, JSON.stringify(newCounts), false);
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

  const saveSettings = useCallback(async (newRates, newGoal) => {
    try {
      await storage.set("settings", JSON.stringify({ rates: newRates, goal: newGoal }), false);
    } catch (e) {
      console.error("Błąd zapisu ustawień", e);
    }
  }, []);

  const updateHistoryToday = useCallback((newCounts) => {
    const dateStr = todayKey().slice(4);
    setHistory((prev) => {
      const exists = prev.find((e) => e.date === dateStr);
      if (exists) {
        return prev.map((e) => (e.date === dateStr ? { ...e, counts: newCounts } : e));
      }
      return [{ date: dateStr, counts: newCounts }, ...prev];
    });
  }, []);

  const pulseSum = () => {
    setSumPulse(true);
    setTimeout(() => setSumPulse(false), 220);
  };

  const checkGoalCross = (newTotal) => {
    if (goal > 0 && prevTotalRef.current < goal && newTotal >= goal) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2200);
    }
    prevTotalRef.current = newTotal;
  };

  const add = () => {
    const newCounts = { ...counts, [selectedType]: counts[selectedType] + 1 };
    setCounts(newCounts);
    persist(newCounts);
    updateHistoryToday(newCounts);
    setBump("plus");
    pulseSum();
    checkGoalCross(newCounts.pet + newCounts.puszka + newCounts.szklo);
    setTimeout(() => setBump(null), 180);
  };

  const subtract = () => {
    const newCounts = { ...counts, [selectedType]: Math.max(0, counts[selectedType] - 1) };
    setCounts(newCounts);
    persist(newCounts);
    updateHistoryToday(newCounts);
    setBump("minus");
    pulseSum();
    prevTotalRef.current = newCounts.pet + newCounts.puszka + newCounts.szklo;
    setTimeout(() => setBump(null), 180);
  };

  const doResetDay = () => {
    const zero = emptyCounts();
    setCounts(zero);
    persist(zero);
    updateHistoryToday(zero);
    setConfirmReset(false);
    prevTotalRef.current = 0;
    pulseSum();
  };

  const applySettings = () => {
    const newRates = {};
    for (const t of types) {
      const parsed = parseFloat((rateInputs[t.id] || "").replace(",", "."));
      newRates[t.id] = !isNaN(parsed) && parsed > 0 ? parsed : t.rate;
    }
    let g = parseInt(goalInput, 10);
    if (isNaN(g) || g <= 0) g = goal;

    setTypes((prev) => prev.map((t) => ({ ...t, rate: newRates[t.id] })));
    setGoal(g);
    setGoalInput(String(g));
    setRateInputs({ pet: String(newRates.pet), puszka: String(newRates.puszka), szklo: String(newRates.szklo) });
    saveSettings(newRates, g);
    setShowSettings(false);
  };

  const totalBottlesAll = history.reduce((s, e) => s + e.counts.pet + e.counts.puszka + e.counts.szklo, 0);
  const totalMoneyAll = history.reduce(
    (s, e) => s + e.counts.pet * rateOf("pet") + e.counts.puszka * rateOf("puszka") + e.counts.szklo * rateOf("szklo"),
    0
  );
  const sumColor = totalBottles > 0 ? "#0f8f3f" : "#111111";
  const progressPct = Math.min(100, Math.round((totalBottles / Math.max(1, goal)) * 100));
  const goalReached = totalBottles >= goal;

  const chartData = [...history]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-10)
    .map((e) => ({
      label: new Date(e.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }),
      butelki: e.counts.pet + e.counts.puszka + e.counts.szklo,
    }));

  const generateShareImage = () =>
    new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 880;
      const ctx = canvas.getContext("2d");

      const bg = ctx.createRadialGradient(200, 0, 50, 320, 400, 700);
      bg.addColorStop(0, "#e4f7e9");
      bg.addColorStop(0.4, "#c3ecd0");
      bg.addColorStop(0.75, "#9edcb3");
      bg.addColorStop(1, "#7ccb98");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";
      ctx.lineJoin = "round";
      ctx.font = "900 58px 'Arial Black', Impact, sans-serif";
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#123";
      ctx.strokeText("KAUCJONATOR", canvas.width / 2, 110);
      ctx.fillStyle = "#2fae5a";
      ctx.fillText("KAUCJONATOR", canvas.width / 2, 110);

      ctx.font = "70px serif";
      ctx.fillText("🧴 🍾 🥫", canvas.width / 2, 300);

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      const cardX = 60, cardY = 420, cardW = 520, cardH = 290;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 24) : ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();

      ctx.fillStyle = "#2b3a35";
      ctx.font = "bold 20px 'Trebuchet MS', sans-serif";
      ctx.fillText("DZISIAJ ZEBRAŁEM", canvas.width / 2, cardY + 40);

      ctx.fillStyle = totalBottles > 0 ? "#0f8f3f" : "#111111";
      ctx.font = "900 52px 'Trebuchet MS', sans-serif";
      ctx.fillText(`${totalBottles} but.`, canvas.width / 2, cardY + 100);

      ctx.font = "800 36px 'Trebuchet MS', sans-serif";
      ctx.fillText(`${totalMoney} zł`, canvas.width / 2, cardY + 150);

      ctx.font = "600 20px 'Trebuchet MS', sans-serif";
      ctx.fillStyle = "#2b3a35";
      ctx.fillText(
        `🧴 ${counts.pet} PET   🥫 ${counts.puszka} Puszka   🍾 ${counts.szklo} Szkło`,
        canvas.width / 2,
        cardY + 195
      );

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.font = "16px 'Trebuchet MS', sans-serif";
      ctx.fillText(todayLabel(), canvas.width / 2, cardY + 235);

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
          text: `Dzisiaj zebrałem ${totalBottles} butelek i ${totalMoney} zł kaucji! 🍾`,
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

  const activeType = types.find((t) => t.id === selectedType) || types[0];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "radial-gradient(circle at 30% 0%, #eef9f0 0%, #d8f0dd 35%, #bfe6c9 70%, #a3d8b3 100%)",
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
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&display=swap');
        @keyframes bottleBob { 0%,100%{transform:translateY(0) rotate(0);} 50%{transform:translateY(-6px) rotate(-2deg);} }
        @keyframes sumPulse { 0%{transform:scale(1);} 40%{transform:scale(1.06);} 100%{transform:scale(1);} }
        @keyframes fadeSlideIn { from{opacity:0; transform:translateY(-8px);} to{opacity:1; transform:translateY(0);} }
        @keyframes modalPop { from{opacity:0; transform:scale(0.9);} to{opacity:1; transform:scale(1);} }
        @keyframes confettiFall { from{transform:translateY(0) rotate(0deg); opacity:1;} to{transform:translateY(110vh) rotate(360deg); opacity:0.9;} }
        @keyframes titleWiggle { 0%,100%{transform:rotate(-0.6deg);} 50%{transform:rotate(0.6deg);} }
        .kj-btn:hover { filter: brightness(1.04); box-shadow: 0 8px 20px rgba(0,0,0,0.28) !important; }
        .kj-btn:active { filter: brightness(0.97); }
        .kj-link-btn:hover { background: rgba(255,255,255,0.95) !important; }
        .kj-settings-btn { -webkit-tap-highlight-color: transparent; }
        .kj-settings-btn:hover { background: rgba(255,255,255,0.95) !important; }
        .kj-settings-btn:active { transform: scale(0.9); background: rgba(230,255,238,0.95) !important; }
        .kj-type:active { transform: scale(0.96); }
        .kj-title { font-family: 'Baloo 2', 'Comic Sans MS', 'Trebuchet MS', sans-serif; animation: titleWiggle 4s ease-in-out infinite; transform-origin: center; }
      `}</style>

      <Confetti active={celebrate} />

      <button
        onClick={() => setShowSettings((s) => !s)}
        aria-label="Ustawienia kaucji"
        type="button"
        className="kj-settings-btn"
        style={{ position: "absolute", top: 12, right: 12, width: 52, height: 52, borderRadius: "50%", border: "2px solid rgba(10,10,10,0.7)", background: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s ease, transform 0.1s ease", zIndex: 50, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      >
        ⚙️
      </button>

      {showSettings && (
        <div style={{ position: "absolute", top: 68, right: 12, ...glassCard, borderRadius: 14, padding: "14px 16px", zIndex: 51, animation: "fadeSlideIn 0.18s ease", width: 220 }}>
          {types.map((t) => (
            <div key={t.id} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0a5c3c", marginBottom: 4 }}>
                {t.emoji} {t.label} — kaucja (zł)
              </div>
              <input
                value={rateInputs[t.id]}
                onChange={(e) => setRateInputs((prev) => ({ ...prev, [t.id]: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", padding: "7px 9px", borderRadius: 8, border: "1.5px solid #0a5c3c", fontSize: 14, fontWeight: 700, outline: "none" }}
              />
            </div>
          ))}
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0a5c3c", marginTop: 6, marginBottom: 4 }}>
            Cel dzienny (łącznie butelek)
          </div>
          <input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "7px 9px", borderRadius: 8, border: "1.5px solid #0a5c3c", fontSize: 14, fontWeight: 700, marginBottom: 10, outline: "none" }}
          />
          <button onClick={applySettings} className="kj-btn" style={{ width: "100%", background: "#1eb85c", color: "#fff", border: "none", borderRadius: 8, padding: "8px 0", fontWeight: 800, cursor: "pointer", transition: "all 0.15s ease" }}>
            Zapisz
          </button>
        </div>
      )}

      <div className="kj-title" style={{ width: "100%", maxWidth: 420, marginBottom: 4 }}>
        <svg viewBox="0 0 420 120" width="100%" height="120">
          <defs>
            <path id="arcPath" d="M 10 105 Q 210 5 410 105" fill="none" />
            <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffd93b" />
              <stop offset="35%" stopColor="#5fd97a" />
              <stop offset="70%" stopColor="#2fae5a" />
              <stop offset="100%" stopColor="#1e8f6b" />
            </linearGradient>
            <filter id="titleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#0a3a2a" floodOpacity="0.35" />
            </filter>
          </defs>
          <text fontSize="50" fontWeight="800" fontFamily="'Baloo 2','Comic Sans MS',sans-serif" letterSpacing="1" filter="url(#titleShadow)">
            <textPath href="#arcPath" startOffset="50%" textAnchor="middle">
              <tspan fill="url(#titleGrad)" stroke="#123321" strokeWidth="3" paintOrder="stroke">
                Kaucjonator
              </tspan>
            </textPath>
          </text>
        </svg>
      </div>

      <div style={{ marginBottom: 6 }}>
        <TypeIcon id={selectedType} size={92} animated />
      </div>

      {/* Selektor typu opakowania */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, width: "100%", maxWidth: 380 }}>
        {types.map((t) => {
          const active = t.id === selectedType;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className="kj-type"
              style={{
                flex: 1,
                ...glassCard,
                background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                border: active ? `2.5px solid ${t.color}` : "1px solid rgba(255,255,255,0.55)",
                borderRadius: 14,
                padding: "8px 4px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <TypeIcon id={t.id} size={34} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1a2a29" }}>{t.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#3a4a49" }}>{t.rate.toFixed(2).replace(".", ",")} zł</span>
            </button>
          );
        })}
      </div>

      {/* Licznik dla wybranego typu */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(10,10,10,0.6)" }}>
          {activeType.label} dzisiaj
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: counts[selectedType] > 0 ? "#0f8f3f" : "#111" }}>
          {counts[selectedType]}
        </div>
      </div>

      <div style={{ display: "flex", gap: 22, marginTop: 2, marginBottom: 18 }}>
        <button
          onClick={add}
          aria-label="Dodaj butelkę"
          className="kj-btn"
          style={{ width: 90, height: 90, borderRadius: 22, border: "5px solid #1eb85c", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: bump === "plus" ? "0 0 0 8px rgba(30,184,92,0.3)" : "0 6px 14px rgba(0,0,0,0.22)", transform: bump === "plus" ? "scale(0.94)" : "scale(1)", transition: "all 0.15s ease", position: "relative" }}
        >
          <span style={{ fontSize: 40, fontWeight: 900, color: "#1eb85c" }}>+</span>
        </button>

        <button
          onClick={subtract}
          aria-label="Odejmij butelkę"
          className="kj-btn"
          style={{ width: 90, height: 90, borderRadius: 22, border: "5px solid #e23b3b", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: bump === "minus" ? "0 0 0 8px rgba(226,59,59,0.3)" : "0 6px 14px rgba(0,0,0,0.22)", transform: bump === "minus" ? "scale(0.94)" : "scale(1)", transition: "all 0.15s ease", position: "relative" }}
        >
          <span style={{ fontSize: 40, fontWeight: 900, color: "#e23b3b" }}>−</span>
        </button>
      </div>

      {/* Pasek celu dziennego */}
      <div style={{ width: "100%", maxWidth: 280, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "rgba(10,10,10,0.65)", marginBottom: 4 }}>
          <span>Cel dnia</span>
          <span>{totalBottles} / {goal}</span>
        </div>
        <div style={{ height: 12, borderRadius: 8, background: "rgba(255,255,255,0.5)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.6)" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: goalReached ? "linear-gradient(90deg,#ffd93b,#1eb85c)" : "linear-gradient(90deg,#2fbf80,#1eb85c)", transition: "width 0.3s ease" }} />
        </div>
        {goalReached && (
          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "#0a5c3c", marginTop: 4 }}>
            🎉 Cel osiągnięty!
          </div>
        )}
      </div>

      {/* Pole SUMA */}
      <div style={{ ...glassCard, borderRadius: 18, padding: "16px 34px", textAlign: "center", minWidth: 240, animation: sumPulse ? "sumPulse 0.22s ease" : undefined }}>
        <div style={{ fontSize: 14, letterSpacing: 1, color: "#3a4a49", fontWeight: 700, marginBottom: 2 }}>
          SUMA DZIŚ
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: sumColor, lineHeight: 1.1 }}>
          {totalBottles} {totalBottles === 1 ? "butelka" : totalBottles >= 2 && totalBottles <= 4 ? "butelki" : "butelek"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: sumColor, marginBottom: 10 }}>{totalMoney} zł</div>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, fontSize: 13, fontWeight: 700, color: "#3a4a49", borderTop: "1px dashed rgba(0,0,0,0.15)", paddingTop: 10 }}>
          {types.map((t) => (
            <span key={t.id}>
              {t.emoji} {counts[t.id]} {t.label}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={shareResult}
        disabled={sharing}
        className="kj-btn"
        style={{ marginTop: 14, background: "linear-gradient(90deg,#1eb85c,#12a24a)", color: "#fff", border: "none", borderRadius: 12, padding: "10px 22px", fontWeight: 800, fontSize: 14, cursor: sharing ? "default" : "pointer", opacity: sharing ? 0.7 : 1, boxShadow: "0 6px 14px rgba(0,0,0,0.2)", transition: "all 0.15s ease" }}
      >
        {sharing ? "Generuję…" : "📤 Udostępnij wynik"}
      </button>
      {shareMsg && <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "#0a5c3c" }}>{shareMsg}</div>}

      <button
        onClick={() => setConfirmReset(true)}
        className="kj-link-btn"
        style={{ marginTop: 12, background: "transparent", border: "none", color: "rgba(10,10,10,0.6)", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
      >
        Resetuj dzisiejszy dzień
      </button>

      {confirmReset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
          <div style={{ ...glassCard, background: "rgba(255,255,255,0.96)", borderRadius: 16, padding: "22px 24px", maxWidth: 300, textAlign: "center", animation: "modalPop 0.18s ease" }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14, color: "#111" }}>
              Zresetować dzisiejsze liczniki (wszystkie typy) do zera?
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

              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                {history.map((e) => {
                  const dayTotal = e.counts.pet + e.counts.puszka + e.counts.szklo;
                  const dayMoney = (
                    e.counts.pet * rateOf("pet") +
                    e.counts.puszka * rateOf("puszka") +
                    e.counts.szklo * rateOf("szklo")
                  ).toFixed(2).replace(".", ",");
                  return (
                    <div key={e.date} style={{ padding: "8px 10px", background: e.date === todayKey().slice(4) ? "rgba(30,184,92,0.14)" : "rgba(0,0,0,0.035)", borderRadius: 8, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#333" }}>
                        <span>{new Date(e.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                        <span style={{ color: "#0a5c3c" }}>{dayTotal} szt. · {dayMoney} zł</span>
                      </div>
                      <div style={{ color: "#5a6b6a", fontSize: 11, marginTop: 2 }}>
                        🧴{e.counts.pet} · 🥫{e.counts.puszka} · 🍾{e.counts.szklo}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, borderTop: "2px dashed rgba(0,0,0,0.2)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 16, color: "#0a0a0a" }}>
                <span>Razem:</span>
                <span>{totalBottlesAll} szt. · {totalMoneyAll.toFixed(2).replace(".", ",")} zł</span>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 18, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>{todayLabel()}</div>
      <div style={{ marginTop: 4, fontSize: 11, color: "rgba(0,0,0,0.4)" }}>Dane przechowywane lokalnie na Twoim urządzeniu.</div>
    </div>
  );
}
