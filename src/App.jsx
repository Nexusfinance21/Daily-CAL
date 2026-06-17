import { useState, useEffect } from "react";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

const formatDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

const getWeekDays = (baseDate) => {
  const d = new Date(baseDate + "T12:00:00");
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({length: 7}, (_, i) => {
    const n = new Date(monday);
    n.setDate(monday.getDate() + i);
    return n;
  });
};

const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return formatDateKey(d);
};

const initialWeekData = {
  "2026-06-15": {
    chores: ["Morning stretch 10min","Reply investor email","Review Nexus roadmap"],
    schedule: [
      { time: "07:00", label: "Wake up + journal" },
      { time: "08:00", label: "Workout" },
      { time: "10:00", label: "Nexus strategy session" },
      { time: "13:00", label: "Lunch" },
      { time: "15:00", label: "Trading model review" },
      { time: "18:00", label: "Studio client call" },
      { time: "21:00", label: "Wind down" },
    ],
    journal: "Start the week with clarity. Focus on what moves the needle.",
    temp: "28°C",
  },
  "2026-06-16": {
    chores: ["Pay utility bill","Update pitch deck","30min Portuguese study"],
    schedule: [
      { time: "08:00", label: "Deep work block" },
      { time: "12:00", label: "Lunch + walk" },
      { time: "14:00", label: "NexusPay UI review" },
      { time: "19:00", label: "Reading" },
    ],
    journal: "Execute, don't overthink. One task at a time.",
    temp: "27°C",
  },
  "2026-06-17": {
    chores: ["Grocery run","Backup laptop","Call mom"],
    schedule: [
      { time: "09:00", label: "Admin morning" },
      { time: "11:00", label: "Isaac Studio client work" },
      { time: "16:00", label: "Gym" },
      { time: "20:00", label: "Dinner + relax" },
    ],
    journal: "Rest is part of the plan. Protect your energy.",
    temp: "29°C",
  },
};

const T = {
  parchment: "#F7F3EE",
  ink:       "#1A1A2E",
  indigo:    "#5B4FE9",
  terracotta:"#E8A87C",
  sage:      "#8BA888",
  mist:      "#E2DDD8",
  ghost:     "#B8B0A8",
  white:     "#FFFFFF",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${T.parchment}; color: ${T.ink}; min-height: 100vh; }

  .app { max-width: 420px; margin: 0 auto; min-height: 100vh; position: relative; overflow: hidden; }

  /* LOCK */
  .lock { background: ${T.ink}; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 32px; gap: 32px; position: relative; overflow: hidden; }
  .lock::before { content: ''; position: absolute; top: -80px; right: -80px; width: 260px; height: 260px; background: radial-gradient(circle, ${T.indigo}33 0%, transparent 70%); border-radius: 50%; }
  .lock::after { content: ''; position: absolute; bottom: -60px; left: -60px; width: 180px; height: 180px; background: radial-gradient(circle, ${T.terracotta}22 0%, transparent 70%); border-radius: 50%; }
  .lock-date { text-align: center; }
  .lock-day { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: ${T.ghost}; text-transform: uppercase; margin-bottom: 6px; }
  .lock-big { font-size: 80px; font-weight: 300; color: ${T.white}; line-height: 1; letter-spacing: -3px; }
  .lock-month { font-size: 18px; font-weight: 400; color: ${T.ghost}; letter-spacing: 0.05em; }
  .lock-temp { font-family: 'DM Mono', monospace; font-size: 32px; font-weight: 400; color: ${T.terracotta}; letter-spacing: -1px; }
  .lock-chores { width: 100%; display: flex; flex-direction: column; gap: 12px; }
  .lock-chore { display: flex; align-items: center; gap: 10px; font-size: 14px; color: ${T.mist}; font-weight: 300; }
  .lock-chore-dot { width: 6px; height: 6px; border-radius: 50%; background: ${T.indigo}; flex-shrink: 0; }
  .lock-chore.done .lock-chore-dot { background: ${T.sage}; }
  .lock-chore.done span { text-decoration: line-through; opacity: 0.4; }
  .lock-open { position: absolute; bottom: 40px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; color: ${T.ghost}; text-transform: uppercase; cursor: pointer; border: 1px solid ${T.ghost}44; background: none; padding: 10px 24px; border-radius: 20px; transition: all 0.2s; }
  .lock-open:hover { color: ${T.white}; border-color: ${T.indigo}; }

  /* MAIN */
  .main { background: ${T.parchment}; min-height: 100vh; display: flex; flex-direction: column; }

  /* TOPBAR */
  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 0; }
  .topbar-title { font-size: 13px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: ${T.ghost}; }
  .topbar-actions { display: flex; gap: 8px; }
  .icon-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid ${T.mist}; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.15s; color: ${T.ink}; }
  .icon-btn:hover { background: ${T.mist}; }
  .icon-btn.active { background: ${T.indigo}; color: white; border-color: ${T.indigo}; }

  /* WEEK STRIP */
  .week-strip { padding: 16px 20px 0; display: flex; gap: 6px; }
  .week-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 12px; cursor: pointer; transition: all 0.15s; border: 1.5px solid transparent; }
  .week-day:hover { background: ${T.mist}; }
  .week-day.selected { background: ${T.ink}; border-color: ${T.ink}; }
  .week-day.today:not(.selected) { border-color: ${T.indigo}; }
  .week-day-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.ghost}; font-family: 'DM Mono', monospace; }
  .week-day.selected .week-day-label { color: ${T.white}66; }
  .week-day-num { font-size: 18px; font-weight: 500; color: ${T.ink}; line-height: 1; }
  .week-day.selected .week-day-num { color: ${T.white}; }
  .week-day.today:not(.selected) .week-day-num { color: ${T.indigo}; }
  .week-day-dot { width: 4px; height: 4px; border-radius: 50%; background: ${T.terracotta}; }

  /* TABS */
  .tab-nav { display: flex; margin: 16px 20px 0; background: ${T.mist}; border-radius: 12px; padding: 3px; }
  .tab-btn { flex: 1; padding: 8px; border: none; background: none; border-radius: 10px; font-size: 12px; font-weight: 500; color: ${T.ghost}; cursor: pointer; transition: all 0.15s; letter-spacing: 0.03em; }
  .tab-btn.active { background: ${T.white}; color: ${T.ink}; box-shadow: 0 1px 4px ${T.ink}18; }

  /* SCROLL */
  .scroll-content { flex: 1; overflow-y: auto; padding: 16px 20px 100px; }
  .scroll-content::-webkit-scrollbar { display: none; }

  /* SECTION LABEL */
  .sec-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${T.ghost}; margin-bottom: 12px; margin-top: 20px; }
  .sec-label:first-child { margin-top: 4px; }

  /* WEATHER */
  .weather-row { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: ${T.terracotta}18; border-radius: 12px; border: 1px solid ${T.terracotta}33; margin-bottom: 4px; }
  .weather-temp { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; color: ${T.terracotta}; }
  .weather-desc { font-size: 13px; color: ${T.ghost}; }

  /* PROGRESS */
  .prog-bar { height: 3px; background: ${T.mist}; border-radius: 2px; margin-top: 6px; overflow: hidden; }
  .prog-fill { height: 100%; background: linear-gradient(90deg, ${T.indigo}, ${T.terracotta}); border-radius: 2px; transition: width 0.4s ease; }

  /* SCHEDULE / TIME RAIL */
  .schedule-list { display: flex; flex-direction: column; position: relative; }
  .schedule-list::before { content: ''; position: absolute; left: 38px; top: 8px; bottom: 8px; width: 1px; background: linear-gradient(to bottom, ${T.indigo}44, ${T.mist}88, transparent); }
  .schedule-item { display: flex; align-items: flex-start; gap: 14px; padding: 9px 0; position: relative; }
  .schedule-time { font-family: 'DM Mono', monospace; font-size: 12px; color: ${T.ghost}; width: 38px; flex-shrink: 0; padding-top: 2px; }
  .schedule-dot { position: absolute; left: 34px; top: 13px; width: 9px; height: 9px; border-radius: 50%; background: ${T.parchment}; border: 2px solid ${T.mist}; z-index: 1; }
  .schedule-item.now .schedule-dot { background: ${T.indigo}; border-color: ${T.indigo}; box-shadow: 0 0 0 3px ${T.indigo}22; }
  .schedule-item.past .schedule-dot { background: ${T.sage}; border-color: ${T.sage}; }
  .schedule-label { font-size: 14px; font-weight: 400; color: ${T.ink}; flex: 1; }
  .schedule-item.now .schedule-label { font-weight: 600; color: ${T.indigo}; }
  .schedule-item.past .schedule-label { color: ${T.ghost}; }

  /* CHORES */
  .chore-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: ${T.white}; border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.15s; border: 1.5px solid transparent; }
  .chore-item:hover { border-color: ${T.mist}; }
  .chore-item.done { opacity: 0.5; }
  .chore-check { width: 20px; height: 20px; border-radius: 6px; border: 2px solid ${T.mist}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; transition: all 0.15s; }
  .chore-item.done .chore-check { background: ${T.sage}; border-color: ${T.sage}; color: white; }
  .chore-text { font-size: 14px; font-weight: 400; flex: 1; }
  .chore-item.done .chore-text { text-decoration: line-through; }
  .add-btn { width: 100%; padding: 11px; border: 1.5px dashed ${T.mist}; border-radius: 12px; background: none; color: ${T.ghost}; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; margin-top: 4px; }
  .add-btn:hover { border-color: ${T.indigo}; color: ${T.indigo}; }
  .inline-input-wrap { display: flex; gap: 8px; margin-bottom: 8px; }
  .inline-input { flex: 1; padding: 10px 14px; border: 1.5px solid ${T.indigo}; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; background: ${T.white}; color: ${T.ink}; }
  .save-btn { padding: 10px 16px; background: ${T.indigo}; color: white; border: none; border-radius: 10px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; }

  /* JOURNAL */
  .journal-card { background: ${T.ink}; border-radius: 16px; padding: 20px; margin-top: 4px; }
  .journal-text { font-size: 15px; font-weight: 300; color: ${T.white}; line-height: 1.65; font-style: italic; margin-bottom: 14px; opacity: 0.7; }
  .journal-textarea { width: 100%; background: ${T.white}11; border: 1px solid ${T.white}22; border-radius: 10px; padding: 12px 14px; font-size: 14px; color: ${T.white}; font-family: 'DM Sans', sans-serif; resize: none; outline: none; min-height: 90px; line-height: 1.6; }
  .journal-textarea::placeholder { color: ${T.white}44; }
  .journal-save-btn { margin-top: 10px; padding: 9px 20px; background: ${T.indigo}; color: white; border: none; border-radius: 10px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; }

  /* WEEK VIEW */
  .week-card { background: ${T.white}; border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: all 0.15s; border: 1.5px solid transparent; }
  .week-card:hover { border-color: ${T.mist}; }
  .week-card.active-day { border-color: ${T.indigo}; }
  .week-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .week-card-date { display: flex; align-items: baseline; gap: 6px; }
  .week-card-dayname { font-size: 13px; font-weight: 600; color: ${T.ink}; }
  .week-card-daynum { font-family: 'DM Mono', monospace; font-size: 12px; color: ${T.ghost}; }
  .week-card-temp { font-family: 'DM Mono', monospace; font-size: 12px; color: ${T.terracotta}; }
  .week-card-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .week-tag { font-size: 11px; padding: 3px 9px; border-radius: 20px; background: ${T.parchment}; color: ${T.ghost}; }
  .week-card-chore-count { font-family: 'DM Mono', monospace; font-size: 11px; color: ${T.sage}; }
  .week-empty { text-align: center; color: ${T.ghost}; font-size: 13px; padding: 30px 0; }

  /* PLAN VIEW */
  .plan-section { margin-bottom: 24px; }
  .plan-day-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .plan-day-title { font-size: 15px; font-weight: 600; color: ${T.ink}; }
  .plan-day-sub { font-family: 'DM Mono', monospace; font-size: 11px; color: ${T.ghost}; }
  .plan-quick-btns { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .plan-quick-btn { font-size: 11px; padding: 5px 12px; border-radius: 20px; border: 1.5px solid ${T.mist}; background: none; color: ${T.ghost}; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .plan-quick-btn:hover { border-color: ${T.indigo}; color: ${T.indigo}; }
  .plan-divider { height: 1px; background: ${T.mist}; margin: 20px 0; }

  /* BOTTOM NAV */
  .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 420px; background: ${T.white}; border-top: 1px solid ${T.mist}; display: flex; padding: 10px 0 20px; z-index: 50; }
  .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; padding: 4px 0; font-size: 18px; transition: all 0.15s; }
  .nav-label { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.ghost}; font-family: 'DM Mono', monospace; }
  .nav-btn.active .nav-label { color: ${T.indigo}; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: ${T.ink}cc; display: flex; align-items: flex-end; z-index: 100; backdrop-filter: blur(4px); }
  .modal-sheet { width: 100%; max-width: 420px; margin: 0 auto; background: ${T.parchment}; border-radius: 20px 20px 0 0; padding: 24px 20px 48px; }
  .modal-handle { width: 40px; height: 4px; background: ${T.mist}; border-radius: 2px; margin: 0 auto 20px; }
  .modal-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${T.ink}; }
  .modal-subtitle { font-size: 12px; color: ${T.ghost}; margin-bottom: 16px; margin-top: -8px; }
  .modal-input { width: 100%; padding: 12px 14px; border: 1.5px solid ${T.mist}; border-radius: 12px; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; background: ${T.white}; color: ${T.ink}; margin-bottom: 12px; }
  .modal-input:focus { border-color: ${T.indigo}; }
  .modal-row { display: flex; gap: 10px; }
  .modal-btn { flex: 1; padding: 13px; border-radius: 12px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .modal-btn.primary { background: ${T.ink}; color: white; }
  .modal-btn.secondary { background: ${T.mist}; color: ${T.ink}; }

  /* TOAST */
  .toast { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); background: ${T.ink}; color: white; padding: 10px 20px; border-radius: 20px; font-size: 13px; font-family: 'DM Sans', sans-serif; z-index: 200; animation: fadeup 0.3s ease; pointer-events: none; }
  @keyframes fadeup { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
`;

function getCurrentHour() { return new Date().getHours(); }
function getMinutes() { return new Date().getMinutes(); }

function getBlockStatus(timeStr, dateKey) {
  const today = getToday();
  if (dateKey !== today) return "future";
  const h = parseInt(timeStr.split(":")[0]);
  const cur = getCurrentHour();
  if (h < cur) return "past";
  if (h === cur) return "now";
  return "future";
}

const QUICK_TASKS = ["Morning routine","Workout","Deep work","Lunch","Calls & emails","Admin","Reading","Wind down"];

export default function App() {
  const [view, setView] = useState("lock");
  const [tab, setTab] = useState("schedule");
  const [nav, setNav] = useState("today");
  const [weekData, setWeekData] = useState(() => {
    try {
      const saved = localStorage.getItem("isaac-daily-data");
      return saved ? { ...initialWeekData, ...JSON.parse(saved) } : initialWeekData;
    } catch { return initialWeekData; }
  });
  const [doneChores, setDoneChores] = useState(() => {
    try { return JSON.parse(localStorage.getItem("isaac-daily-chores") || "{}"); } catch { return {}; }
  });

  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const [addingChore, setAddingChore] = useState(false);
  const [newChore, setNewChore] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [editTime, setEditTime] = useState("");
  const [journalDraft, setJournalDraft] = useState({});
  const [toast, setToast] = useState(null);
  const [planDate, setPlanDate] = useState(addDays(today, 1));
  const [weather, setWeather] = useState({ temp: null, city: null, icon: "☀️", loading: true, error: null });

  const weekDays = getWeekDays(selectedDate);
  const dayData = weekData[selectedDate] || { chores: [], schedule: [], journal: "", temp: "--°C" };
  const planData = weekData[planDate] || { chores: [], schedule: [], journal: "", temp: "--°C" };

  // Persist
  useEffect(() => {
    try { localStorage.setItem("isaac-daily-data", JSON.stringify(weekData)); } catch {}
  }, [weekData]);
  useEffect(() => {
    try { localStorage.setItem("isaac-daily-chores", JSON.stringify(doneChores)); } catch {}
  }, [doneChores]);

  // Live weather + location
  useEffect(() => {
    if (!navigator.geolocation) {
      setWeather(w => ({ ...w, loading: false, error: "Geolocation not supported" }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        try {
          const [weatherRes, geoRes] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&temperature_unit=celsius&timezone=auto`),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          ]);
          const weatherData = await weatherRes.json();
          const geoData = await geoRes.json();

          const temp = Math.round(weatherData.current.temperature_2m);
          const code = weatherData.current.weathercode;
          const icon = code === 0 ? "☀️" : code <= 3 ? "⛅" : code <= 67 ? "🌧️" : code <= 77 ? "❄️" : "🌩️";

          const addr = geoData.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || "Your location";

          setWeather({ temp, city, icon, loading: false, error: null });
        } catch {
          setWeather(w => ({ ...w, loading: false, error: "Weather fetch failed" }));
        }
      },
      (err) => {
        const msg = err.code === 1 ? "Location permission denied" : "Location unavailable";
        setWeather(w => ({ ...w, loading: false, error: msg }));
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const ensureDay = (dateKey) => {
    if (!weekData[dateKey]) {
      setWeekData(p => ({ ...p, [dateKey]: { chores: [], schedule: [], journal: "", temp: "--°C" } }));
    }
  };

  const toggleChore = (dateKey, idx) => {
    const k = `${dateKey}-${idx}`;
    setDoneChores(prev => ({ ...prev, [k]: !prev[k] }));
  };
  const isChoresDone = (dateKey, idx) => !!doneChores[`${dateKey}-${idx}`];

  const addChore = (targetDate) => {
    if (!newChore.trim()) return;
    ensureDay(targetDate);
    setWeekData(prev => {
      const ex = prev[targetDate] || { chores: [], schedule: [], journal: "", temp: "--°C" };
      return { ...prev, [targetDate]: { ...ex, chores: [...ex.chores, newChore.trim()] } };
    });
    setNewChore(""); setAddingChore(false);
    showToast("Chore added ✓");
  };

  const addQuickTask = (label, targetDate) => {
    ensureDay(targetDate);
    setWeekData(prev => {
      const ex = prev[targetDate] || { chores: [], schedule: [], journal: "", temp: "--°C" };
      if (ex.chores.includes(label)) return prev;
      return { ...prev, [targetDate]: { ...ex, chores: [...ex.chores, label] } };
    });
    showToast(`"${label}" added`);
  };

  const addScheduleItem = (targetDate) => {
    if (!editVal.trim() || !editTime) return;
    ensureDay(targetDate);
    setWeekData(prev => {
      const ex = prev[targetDate] || { chores: [], schedule: [], journal: "", temp: "--°C" };
      const sched = [...ex.schedule, { time: editTime, label: editVal }].sort((a,b) => a.time.localeCompare(b.time));
      return { ...prev, [targetDate]: { ...ex, schedule: sched } };
    });
    setEditModal(null); setEditVal(""); setEditTime("");
    showToast("Event added ✓");
  };

  const saveJournal = (dateKey) => {
    const val = journalDraft[dateKey];
    if (val === undefined) return;
    setWeekData(prev => {
      const ex = prev[dateKey] || { chores: [], schedule: [], journal: "", temp: "--°C" };
      return { ...prev, [dateKey]: { ...ex, journal: val } };
    });
    showToast("Saved ✓");
  };

  const doneCount = dayData.chores.filter((_, i) => isChoresDone(selectedDate, i)).length;
  const progress = dayData.chores.length ? (doneCount / dayData.chores.length) * 100 : 0;

  // ── LOCK SCREEN
  if (view === "lock") {
    const td = new Date(today + "T12:00:00");
    const lockData = weekData[today] || {};
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="lock">
            <div className="lock-date">
              <div className="lock-day">{DAYS[td.getDay()]} · {MONTHS[td.getMonth()]}</div>
              <div className="lock-big">{String(td.getDate()).padStart(2,"0")}</div>
              <div className="lock-month">{td.getFullYear()}</div>
            </div>
            <div className="lock-temp">
              {weather.loading ? "…°C" : weather.error ? "--°C" : `${weather.temp}°C`} {weather.icon}
            </div>
            {weather.city && !weather.loading && (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.15em", color: T.ghost, textTransform: "uppercase" }}>
                📍 {weather.city}
              </div>
            )}
            <div className="lock-chores">
              {(lockData.chores || []).slice(0,3).map((c, i) => (
                <div key={i} className={`lock-chore${isChoresDone(today, i) ? " done" : ""}`}>
                  <div className="lock-chore-dot" />
                  <span>{c}</span>
                </div>
              ))}
              {(lockData.chores||[]).length === 0 && (
                <div style={{color: T.ghost, fontSize: 13, textAlign: "center"}}>No chores planned yet</div>
              )}
            </div>
            <button className="lock-open" onClick={() => setView("main")}>open →</button>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN APP
  const todayObj = new Date(today + "T12:00:00");

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="main">

          {/* TOPBAR */}
          <div className="topbar">
            <span className="topbar-title">
              {nav === "today" ? "today" : nav === "week" ? "this week" : "plan ahead"}
            </span>
            <div className="topbar-actions">
              {weather.error && (
                <span title={weather.error} style={{ fontSize: 13, cursor: "default" }}>📍❌</span>
              )}
              <button className="icon-btn" title="Lock screen" onClick={() => setView("lock")}>🔒</button>
              <button
                className={`icon-btn${editModal ? " active" : ""}`}
                title="Add event"
                onClick={() => { setEditModal({ type: "schedule", target: nav === "plan" ? planDate : selectedDate }); }}
              >＋</button>
            </div>
          </div>

          {/* WEEK STRIP — always visible */}
          <div className="week-strip">
            {weekDays.map((d) => {
              const k = formatDateKey(d);
              const isToday = k === today;
              const isSel = k === selectedDate;
              const hasData = !!(weekData[k]?.schedule?.length || weekData[k]?.chores?.length);
              return (
                <div
                  key={k}
                  className={`week-day${isSel && nav !== "plan" ? " selected" : ""}${isToday ? " today" : ""}`}
                  onClick={() => { setSelectedDate(k); setNav("today"); }}
                >
                  <span className="week-day-label">{DAYS[d.getDay()]}</span>
                  <span className="week-day-num">{d.getDate()}</span>
                  {hasData && !(isSel && nav !== "plan") && <div className="week-day-dot" />}
                </div>
              );
            })}
          </div>

          {/* WEATHER — today/week view only */}
          {nav !== "plan" && (
            <div style={{ padding: "14px 20px 0" }}>
              <div className="weather-row">
                <span style={{ fontSize: 22 }}>{weather.icon}</span>
                <span className="weather-temp">
                  {weather.loading ? "…°C" : weather.error ? "--°C" : `${weather.temp}°C`}
                </span>
                <span className="weather-desc">
                  {weather.loading ? "Locating…" : weather.error ? weather.error : weather.city} · {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"short" })}
                </span>
              </div>
              {dayData.chores.length > 0 && (
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          {/* TABS — only on today view */}
          {nav === "today" && (
            <div className="tab-nav">
              {[["schedule","⏱ Schedule"],["chores","✓ Chores"],["journal","✦ Journal"]].map(([id, label]) => (
                <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>
          )}

          {/* ── SCROLL CONTENT ── */}
          <div className="scroll-content">

            {/* TODAY VIEW */}
            {nav === "today" && tab === "schedule" && (
              <>
                <div className="sec-label">daily schedule</div>
                {dayData.schedule.length === 0 && (
                  <div className="week-empty">No events yet. Tap ＋ to add one.</div>
                )}
                <div className="schedule-list">
                  {dayData.schedule.map((item, i) => {
                    const status = getBlockStatus(item.time, selectedDate);
                    return (
                      <div key={i} className={`schedule-item ${status}`}>
                        <span className="schedule-time">{item.time}</span>
                        <div className="schedule-dot" />
                        <span className="schedule-label">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {nav === "today" && tab === "chores" && (
              <>
                <div className="sec-label">chores & tasks · {doneCount}/{dayData.chores.length} done</div>
                {dayData.chores.map((c, i) => (
                  <div key={i} className={`chore-item${isChoresDone(selectedDate, i) ? " done" : ""}`} onClick={() => toggleChore(selectedDate, i)}>
                    <div className="chore-check">{isChoresDone(selectedDate, i) ? "✓" : ""}</div>
                    <span className="chore-text">{c}</span>
                  </div>
                ))}
                {addingChore ? (
                  <div className="inline-input-wrap">
                    <input className="inline-input" autoFocus placeholder="New chore..." value={newChore}
                      onChange={e => setNewChore(e.target.value)} onKeyDown={e => e.key === "Enter" && addChore(selectedDate)} />
                    <button className="save-btn" onClick={() => addChore(selectedDate)}>Add</button>
                  </div>
                ) : (
                  <button className="add-btn" onClick={() => setAddingChore(true)}>+ add chore</button>
                )}
              </>
            )}

            {nav === "today" && tab === "journal" && (
              <>
                <div className="sec-label">daily intention</div>
                <div className="journal-card">
                  {dayData.journal && !(journalDraft[selectedDate] !== undefined) && (
                    <div className="journal-text">"{dayData.journal}"</div>
                  )}
                  <textarea
                    className="journal-textarea"
                    placeholder="What's your intention for today..."
                    value={journalDraft[selectedDate] ?? dayData.journal}
                    onChange={e => setJournalDraft(p => ({ ...p, [selectedDate]: e.target.value }))}
                    rows={5}
                  />
                  <button className="journal-save-btn" onClick={() => saveJournal(selectedDate)}>Save intention</button>
                </div>
              </>
            )}

            {/* WEEK OVERVIEW */}
            {nav === "week" && (
              <>
                <div className="sec-label">week at a glance</div>
                {weekDays.map((d) => {
                  const k = formatDateKey(d);
                  const data = weekData[k] || {};
                  const isToday = k === today;
                  const done = (data.chores || []).filter((_, i) => isChoresDone(k, i)).length;
                  return (
                    <div
                      key={k}
                      className={`week-card${isToday ? " active-day" : ""}`}
                      onClick={() => { setSelectedDate(k); setNav("today"); setTab("schedule"); }}
                    >
                      <div className="week-card-top">
                        <div className="week-card-date">
                          <span className="week-card-dayname">{DAYS[d.getDay()]}</span>
                          <span className="week-card-daynum">{d.getDate()} {MONTHS[d.getMonth()].slice(0,3)}</span>
                          {isToday && <span style={{ fontSize: 10, background: T.indigo, color: "white", padding: "2px 7px", borderRadius: 10 }}>Today</span>}
                        </div>
                        <span className="week-card-temp">{weather.loading ? "…" : weather.error ? "—" : `${weather.temp}°C`}</span>
                      </div>
                      {(data.schedule || []).length > 0 ? (
                        <div className="week-card-tags">
                          {(data.schedule || []).slice(0,3).map((s, i) => (
                            <span key={i} className="week-tag">{s.time} {s.label}</span>
                          ))}
                          {(data.schedule||[]).length > 3 && <span className="week-tag">+{(data.schedule||[]).length - 3} more</span>}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: T.ghost }}>Nothing planned yet</div>
                      )}
                      {(data.chores||[]).length > 0 && (
                        <div className="week-card-chore-count" style={{ marginTop: 8 }}>
                          ✓ {done}/{(data.chores||[]).length} chores
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* PLAN AHEAD VIEW */}
            {nav === "plan" && (
              <>
                {/* Tomorrow */}
                <div className="plan-section">
                  <div className="plan-day-header">
                    <div>
                      <div className="plan-day-title">
                        Tomorrow · {(() => { const d = new Date(planDate + "T12:00:00"); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`; })()}
                      </div>
                      <div className="plan-day-sub">Program your next day</div>
                    </div>
                  </div>

                  <div className="sec-label">quick add tasks</div>
                  <div className="plan-quick-btns">
                    {QUICK_TASKS.map(t => (
                      <button key={t} className="plan-quick-btn" onClick={() => addQuickTask(t, planDate)}>{t}</button>
                    ))}
                  </div>

                  <div className="sec-label">tomorrow's chores</div>
                  {planData.chores.map((c, i) => (
                    <div key={i} className="chore-item">
                      <div className="chore-check" />
                      <span className="chore-text">{c}</span>
                    </div>
                  ))}
                  {addingChore ? (
                    <div className="inline-input-wrap">
                      <input className="inline-input" autoFocus placeholder="Add a chore..." value={newChore}
                        onChange={e => setNewChore(e.target.value)} onKeyDown={e => e.key === "Enter" && addChore(planDate)} />
                      <button className="save-btn" onClick={() => addChore(planDate)}>Add</button>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => setAddingChore(true)}>+ add chore</button>
                  )}

                  <div className="sec-label" style={{ marginTop: 20 }}>tomorrow's intention</div>
                  <div className="journal-card">
                    <textarea
                      className="journal-textarea"
                      placeholder="Set the tone for tomorrow..."
                      value={journalDraft[planDate] ?? planData.journal}
                      onChange={e => setJournalDraft(p => ({ ...p, [planDate]: e.target.value }))}
                      rows={3}
                    />
                    <button className="journal-save-btn" onClick={() => saveJournal(planDate)}>Save</button>
                  </div>
                </div>

                <div className="plan-divider" />

                {/* Sunday weekly planning */}
                <div className="plan-section">
                  <div className="plan-day-header">
                    <div>
                      <div className="plan-day-title">Weekly Blueprint</div>
                      <div className="plan-day-sub">Set your focus for each day</div>
                    </div>
                  </div>
                  {weekDays.map((d) => {
                    const k = formatDateKey(d);
                    const data = weekData[k] || {};
                    const isPast = k < today;
                    return (
                      <div key={k} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isPast ? T.ghost : T.ink }}>
                            {DAYS[d.getDay()]} {d.getDate()}
                            {k === today && <span style={{ marginLeft: 6, fontSize: 10, background: T.indigo, color: "white", padding: "2px 6px", borderRadius: 8 }}>Today</span>}
                          </span>
                          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: T.ghost }}>
                            {(data.chores||[]).length} tasks · {(data.schedule||[]).length} events
                          </span>
                        </div>
                        <div
                          style={{ padding: "10px 14px", background: T.white, borderRadius: 10, fontSize: 13, color: data.journal ? T.ink : T.ghost, fontStyle: data.journal ? "normal" : "italic", cursor: "pointer", borderLeft: `3px solid ${isPast ? T.mist : T.indigo}` }}
                          onClick={() => { setSelectedDate(k); setNav("today"); setTab("journal"); }}
                        >
                          {data.journal || "Tap to set intention →"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>

          {/* BOTTOM NAV */}
          <div className="bottom-nav">
            {[["today","📅","Today"],["week","🗓","Week"],["plan","✏️","Plan"]].map(([id, icon, label]) => (
              <button key={id} className={`nav-btn${nav === id ? " active" : ""}`} onClick={() => { setNav(id); if (id === "plan") setPlanDate(addDays(today, 1)); }}>
                <span>{icon}</span>
                <span className="nav-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ADD EVENT MODAL */}
        {editModal?.type === "schedule" && (
          <div className="modal-overlay" onClick={() => setEditModal(null)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-title">Add to schedule</div>
              <div className="modal-subtitle">
                {(() => { const d = new Date((editModal.target||selectedDate) + "T12:00:00"); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; })()}
              </div>
              <input className="modal-input" type="time" value={editTime} onChange={e => setEditTime(e.target.value)} />
              <input
                className="modal-input"
                placeholder="What's happening?"
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addScheduleItem(editModal.target || selectedDate)}
                autoFocus
              />
              <div className="modal-row">
                <button className="modal-btn secondary" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="modal-btn primary" onClick={() => addScheduleItem(editModal.target || selectedDate)}>Save</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
