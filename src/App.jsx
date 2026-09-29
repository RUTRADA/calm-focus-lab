import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "calm-focus-game-v2";
const APP_HISTORY_KEY = "calm-focus-lab-route";
const APP_SCREENS = new Set([
  "home",
  "modes",
  "progress",
  "how-to",
  "rhythm-levels",
  "rhythm-stages",
  "rhythm-game",
  "pattern-start",
  "pattern-game",
  "pause",
]);

function isAppRoute(route) {
  return route?.appId === APP_HISTORY_KEY && APP_SCREENS.has(route.screen);
}

const DEFAULT_SETTINGS = {
feedbackSound: false,
showDetails: true,
fontSize: "normal",
patternSpeed: "normal",
};

const DEFAULT_PROGRESS = {
rhythm: {
beginner: 1,
medium: 1,
hard: 1,
},
pattern: 1,
};

const RHYTHM_LEVELS = {

beginner: {
title: "เริ่มต้น",
detail: "จังหวะช้า · วงแหวนใหญ่",
duration: 3200,
targetSize: 57,
tolerance: 16,
},
medium: {
title: "ฝึกต่อ",
detail: "จังหวะปานกลาง · เป้าหมายแคบลง",
duration: 2400,
targetSize: 57,
tolerance: 11,
},
hard: {
title: "ท้าทาย",
detail: "จังหวะเร็วขึ้น · ต้องสังเกตมากขึ้น",
duration: 1750,
targetSize: 57,
tolerance: 8,
},
};

function getRhythmStageConfig(levelKey, stage, beatNumber) {
  const level = RHYTHM_LEVELS[levelKey];
  const stageIndex = stage - 1;

  let baseDuration = level.duration;
  let targetSize = level.targetSize;
  let tolerance = level.tolerance;
  let totalBeats = 8;

  if (levelKey === "beginner") {
    totalBeats = Math.min(14, 6 + Math.floor(stageIndex / 2));

    baseDuration = level.duration - Math.floor(stageIndex / 4) * 110;
    tolerance = level.tolerance - Math.floor(stageIndex / 5) * 1.1;

    if (stage >= 11 && beatNumber % 4 === 0) {
      baseDuration += 220;
    }
  }

  if (levelKey === "medium") {
    totalBeats = Math.min(15, 8 + Math.floor(stageIndex / 2));

    baseDuration = level.duration - Math.floor(stageIndex / 3) * 95;
    tolerance = level.tolerance - Math.floor(stageIndex / 5) * 0.9;

    const pattern = [1, 1, 0.82, 1.15];
    baseDuration *= pattern[(beatNumber - 1) % pattern.length];
  }

  if (levelKey === "hard") {
    totalBeats = Math.min(16, 9 + Math.floor(stageIndex / 2));

    baseDuration = level.duration - Math.floor(stageIndex / 3) * 70;
    tolerance = level.tolerance - Math.floor(stageIndex / 4) * 0.65;

    const pattern = [1, 0.78, 1.14, 0.9, 1.06];
    baseDuration *= pattern[(beatNumber - 1) % pattern.length];
  }

  return {
    duration: Math.max(850, Math.round(baseDuration)),
    targetSize,
    tolerance: Math.max(5, tolerance),
    totalBeats,
  };
}

function loadSavedData() {
try {
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

return {
settings: { ...DEFAULT_SETTINGS, ...(saved?.settings || {}) },
progress: {
...DEFAULT_PROGRESS,
...(saved?.progress || {}),
rhythm: {
...DEFAULT_PROGRESS.rhythm,
...(saved?.progress?.rhythm || {}),
},
},
};
} catch {
return {
settings: DEFAULT_SETTINGS,
progress: DEFAULT_PROGRESS,
};
}
}

function saveData(settings, progress) {
localStorage.setItem(
STORAGE_KEY,
JSON.stringify({
settings,
progress,
})
);
}

function clamp(value, min, max) {
return Math.min(Math.max(value, min), max);
}

function getPatternLength(stage) {
if (stage <= 5) return 2;
if (stage <= 12) return 3;
if (stage <= 20) return 4;
if (stage <= 30) return 5;
if (stage <= 40) return 6;
if (stage <= 46) return 7;
return 8;
}

function generatePattern(stage) {
const length = getPatternLength(stage);
const result = [];
let previous = -1;

for (let index = 0; index < length; index += 1) {
let next = Math.floor(Math.random() * 9);

while (next === previous) {
next = Math.floor(Math.random() * 9);
}

result.push(next);
previous = next;
}

return result;
}

function getPatternTiming(speed) {
if (speed === "slow") {
return { light: 900, gap: 480 };
}

if (speed === "fast") {
return { light: 420, gap: 220 };
}

return { light: 650, gap: 330 };
}

function Button({ children, variant = "primary", className = "", ...props }) {
return (
<button className={`button ${variant} ${className}`} {...props}>
{children}
</button>
);
}

function TopBar({ title, onBack, onPause, onSettings }) {
return (
<header className="topbar">
<Button variant="ghost" onClick={onBack}>
← กลับ
</Button>

<h1 className="topbar-title">{title}</h1>

<div className="topbar-actions">
{onPause && (
<Button variant="ghost" onClick={onPause}>
⏸ พัก
</Button>
)}

<Button variant="ghost" onClick={onSettings} aria-label="การตั้งค่า">
⚙
</Button>
</div>
</header>
);
}

export default function App() {
const initial = useMemo(loadSavedData, []);
const initialRoute = useMemo(() => {
  const route = window.history.state;

  return {
    appId: APP_HISTORY_KEY,
    screen: "home",
    rhythmLevel: "beginner",
    rhythmStage: 1,
    patternStage: initial.progress.pattern || 1,
    pausedFrom: "home",
    previous: null,
    ...(isAppRoute(route) ? route : {}),
  };
}, [initial]);

const [screen, setScreen] = useState(initialRoute.screen);
const [settings, setSettings] = useState(initial.settings);
const [progress, setProgress] = useState(initial.progress);

const [selectedRhythmLevel, setSelectedRhythmLevel] = useState(
  initialRoute.rhythmLevel
);
const [selectedRhythmStage, setSelectedRhythmStage] = useState(
  initialRoute.rhythmStage
);
const [selectedPatternStage, setSelectedPatternStage] = useState(
  initialRoute.patternStage
);

const [showSettings, setShowSettings] = useState(false);
const [pausedFrom, setPausedFrom] = useState(initialRoute.pausedFrom);

function getCurrentRoute() {
  return {
    appId: APP_HISTORY_KEY,
    screen,
    rhythmLevel: selectedRhythmLevel,
    rhythmStage: selectedRhythmStage,
    patternStage: selectedPatternStage,
    pausedFrom,
  };
}

const applyRoute = useCallback((route) => {
  if (!isAppRoute(route)) return;

  setScreen(route.screen);
  setSelectedRhythmLevel(route.rhythmLevel || "beginner");
  setSelectedRhythmStage(route.rhythmStage || 1);
  setSelectedPatternStage(route.patternStage || initial.progress.pattern || 1);
  setPausedFrom(route.pausedFrom || "home");
}, [initial.progress.pattern]);

function navigate(nextScreen, extraState = {}, replace = false) {
  const currentRoute = getCurrentRoute();
  const nextRoute = {
    ...currentRoute,
    ...extraState,
    appId: APP_HISTORY_KEY,
    screen: nextScreen,
    previous: replace
      ? window.history.state?.previous || null
      : currentRoute,
  };

  if (replace) {
    window.history.replaceState(nextRoute, "", window.location.href);
  } else {
    window.history.pushState(nextRoute, "", window.location.href);
  }

  applyRoute(nextRoute);
}

function goBack() {
  const currentRoute = window.history.state;

  if (isAppRoute(currentRoute?.previous)) {
    window.history.back();
    return;
  }

  const parentScreen = {
    modes: "home",
    progress: "home",
    "how-to": "home",
    "rhythm-levels": "modes",
    "rhythm-stages": "rhythm-levels",
    "rhythm-game": "rhythm-stages",
    "pattern-start": "modes",
    "pattern-game": "pattern-start",
    pause: pausedFrom,
  }[screen] || "home";

  navigate(parentScreen, {}, true);
}

function resumePausedScreen() {
  const previousRoute = window.history.state?.previous;

  if (isAppRoute(previousRoute) && previousRoute.screen === pausedFrom) {
    window.history.back();
    return;
  }

  navigate(pausedFrom, {}, true);
}


useEffect(() => {
saveData(settings, progress);
}, [settings, progress]);

useEffect(() => {
  if (!isAppRoute(window.history.state)) {
    window.history.replaceState(initialRoute, "", window.location.href);
  }

  function handlePopState(event) {
    applyRoute(event.state);
  }

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [applyRoute, initialRoute]);

useEffect(() => {
document.documentElement.dataset.fontSize = settings.fontSize;
}, [settings]);


function openSettings() {
setShowSettings(true);
}

function closeSettings() {
setShowSettings(false);
}

function goHome() {
  closeSettings();
  navigate("home");
}

function openRhythmLevel(levelKey) {
  setSelectedRhythmLevel(levelKey);

  navigate("rhythm-stages", {
    rhythmLevel: levelKey,
  });
}

function openRhythmStage(levelKey, stage) {
  setSelectedRhythmLevel(levelKey);
  setSelectedRhythmStage(stage);

  navigate("rhythm-game", {
    rhythmLevel: levelKey,
    rhythmStage: stage,
  });
}

function openPatternStage(stage) {
  setSelectedPatternStage(stage);

  navigate("pattern-game", {
    patternStage: stage,
  });
}

function pause(from) {
  setPausedFrom(from);

  navigate("pause", {
    pausedFrom: from,
  });
}

function unlockRhythmNextStage(levelKey, stage) {
setProgress((current) => {
const nextUnlocked = Math.min(20, stage + 1);

return {
...current,
rhythm: {
...current.rhythm,
[levelKey]: Math.max(current.rhythm[levelKey], nextUnlocked),
},
};
});
}

function unlockPatternNextStage(stage) {
setProgress((current) => ({
...current,
pattern: Math.max(current.pattern, Math.min(50, stage + 1)),
}));
}

let page = null;

if (screen === "home") {
page = (
<HomeScreen
onChooseMode={() => navigate("modes")}
onProgress={() => navigate("progress")}
onHowTo={() => navigate("how-to")}
onSettings={openSettings}
/>
);
}

if (screen === "modes") {
page = (
<ModeSelectScreen
onBack={goBack}
onSettings={openSettings}
onRhythm={() => navigate("rhythm-levels")}
onPattern={() => navigate("pattern-start")}
/>
);
}

if (screen === "rhythm-levels") {
page = (
<RhythmLevelScreen
progress={progress}
onBack={goBack}
onSettings={openSettings}
onChooseLevel={openRhythmLevel}
/>
);
}

if (screen === "rhythm-stages") {
page = (
<RhythmStageScreen
levelKey={selectedRhythmLevel}
unlocked={progress.rhythm[selectedRhythmLevel]}
onBack={goBack}
onSettings={openSettings}
onChooseStage={(stage) =>
openRhythmStage(selectedRhythmLevel, stage)
}
/>
);
}

if (screen === "rhythm-game") {
  page = (
    <RhythmGame
      key={`${selectedRhythmLevel}-${selectedRhythmStage}`}
      levelKey={selectedRhythmLevel}
      stage={selectedRhythmStage}
      settings={settings}
      onBack={goBack}
      onPause={() => pause("rhythm-game")}
      onSettings={openSettings}
      onPass={() =>
        unlockRhythmNextStage(selectedRhythmLevel, selectedRhythmStage)
      }
      onNext={() => {
        if (selectedRhythmStage < 20) {
          openRhythmStage(
            selectedRhythmLevel,
            selectedRhythmStage + 1
          );
        } else {
          goBack();
        }
      }}
    />
  );
}

if (screen === "pattern-start") {
page = (
<PatternStartScreen
progress={progress}
onBack={goBack}
onSettings={openSettings}
onContinue={() => openPatternStage(progress.pattern)}
onChooseStage={openPatternStage}
/>
);
}

if (screen === "pattern-game") {
  page = (
    <PatternGame
      key={`pattern-${selectedPatternStage}`}
      stage={selectedPatternStage}
      settings={settings}
      onBack={goBack}
      onPause={() => pause("pattern-game")}
      onSettings={openSettings}
      onPass={() => unlockPatternNextStage(selectedPatternStage)}
      onNext={() => {
        if (selectedPatternStage < 50) {
          openPatternStage(selectedPatternStage + 1);
        } else {
          goBack();
        }
      }}
    />
  );
}

if (screen === "progress") {
  page = (
    <ProgressScreen
      progress={progress}
      onBack={goBack}
      onSettings={openSettings}
      onRhythm={(levelKey) => openRhythmLevel(levelKey)}
      onPattern={() => openPatternStage(progress.pattern)}
    />
  );
}

if (screen === "how-to") {
  page = (
    <HowToScreen
      onBack={goBack}
      onSettings={openSettings}
    />
  );
}

if (screen === "pause") {
  page = (
    <PauseScreen
      onResume={resumePausedScreen}
      onHome={goHome}
      onSettings={openSettings}
    />
  );
}

return (
<main className="app-shell">
{page}

{showSettings && (
<SettingsModal
settings={settings}
onChange={setSettings}
onClose={closeSettings}
/>
)}
</main>
);
}

function HomeScreen({ onChooseMode, onProgress, onHowTo, onSettings }) {
return (
<section className="screen home-screen">
<div className="home-brand">
<div className="brand-symbol">
<span />
<span />
<span />
</div>

<p className="eyebrow"></p>
<h1>TempoMemo</h1>
<p className="muted">
มินิเกมฝึกจังหวะและความจำ
<br />

</p>
</div>

<div className="home-menu">
<Button className="home-main-button" onClick={onChooseMode}>
<span className="button-icon">◌</span>
เลือกโหมด
<span className="button-arrow">→</span>
</Button>

<Button variant="secondary" className="home-menu-button" onClick={onProgress}>
<span className="button-icon">▤</span>
ความคืบหน้าของฉัน
<span className="button-arrow">→</span>
</Button>

<Button variant="secondary" className="home-menu-button" onClick={onHowTo}>
<span className="button-icon">?</span>
วิธีเล่น
<span className="button-arrow">→</span>
</Button>

<Button variant="secondary" className="home-menu-button" onClick={onSettings}>
<span className="button-icon">⚙</span>
การตั้งค่า
<span className="button-arrow">→</span>
</Button>
</div>
</section>
);
}

function ModeSelectScreen({ onBack, onSettings, onRhythm, onPattern }) {
return (
<section className="screen">
<TopBar title="เลือกโหมด" onBack={onBack} onSettings={onSettings} />

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">เลือกกิจกรรม</p>
<h2>วันนี้เล่นอะไรดีนะ?</h2>
<p className="muted">เลือกโหมดที่รู้สึกสบายได้เลย</p>
</div>

<button className="large-mode-card" onClick={onRhythm}>
<div className="mode-visual rhythm-visual">
<span className="visual-ring ring-one" />
<span className="visual-ring ring-two" />
<span className="visual-dot" />
</div>

<div className="mode-card-text">
<strong>Tempo</strong>
<small>แตะเมื่อวงแหวนตรงกับเส้น</small>
<small className="mode-skill">ฝึกสมาธิ · การรอ · การกะจังหวะ</small>
</div>

<span className="card-arrow">→</span>
</button>

<button className="large-mode-card" onClick={onPattern}>
<div className="mode-visual pattern-visual">
{Array.from({ length: 9 }, (_, index) => (
<span key={index} className={index === 4 ? "mini-lit" : ""} />
))}
</div>

<div className="mode-card-text">
<strong>Memo</strong>
<small>ดูแสงที่กะพริบเป็นรูปแบบ แล้วกดตามลำดับของรูปแบบที่แสดง</small>
<small className="mode-skill">ฝึกความจำ · ลำดับ · การจดจ่อ</small>
</div>

<span className="card-arrow">→</span>
</button>
</div>
</section>
);
}

function RhythmLevelScreen({
progress,
onBack,
onSettings,
onChooseLevel,
}) {
return (
<section className="screen">
<TopBar title="จังหวะนิ่ง" onBack={onBack} onSettings={onSettings} />

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">เลือกความเร็ว</p>
<h2>อยากเริ่มจากแบบไหน?</h2>
<p className="muted">
ทุกระดับเลือกได้อิสระ
<br />
ภายในระดับจะค่อย ๆ เปิดด่านถัดไป
</p>
</div>

{Object.entries(RHYTHM_LEVELS).map(([key, level]) => (
<button
className="level-card"
key={key}
onClick={() => onChooseLevel(key)}
>
<div className={`level-mark ${key}`}>
{key === "beginner" && "●"}
{key === "medium" && "●●"}
{key === "hard" && "●●●"}
</div>

<div>
<strong>{level.title}</strong>
<small>{level.detail}</small>
<small>เล่นถึงด่าน {progress.rhythm[key]} จาก 20</small>
</div>

<span className="card-arrow">→</span>
</button>
))}
</div>
</section>
);
}

function RhythmStageScreen({
levelKey,
unlocked,
onBack,
onSettings,
onChooseStage,
}) {
const level = RHYTHM_LEVELS[levelKey];

return (
<section className="screen">
<TopBar
title={`จังหวะนิ่ง · ${level.title}`}
onBack={onBack}
onSettings={onSettings}
/>

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">เลือกด่าน</p>
<h2>ฝึกตามจังหวะของคุณ</h2>
<p className="muted">ด่านใหม่จะพร้อมเมื่อฝึกด่านก่อนหน้าเสร็จ</p>
</div>

<div className="stage-grid">
{Array.from({ length: 20 }, (_, index) => {
const stage = index + 1;
const isUnlocked = stage <= unlocked;

return (
<button
key={stage}
className={`stage-button ${isUnlocked ? "unlocked" : "locked"}`}
disabled={!isUnlocked}
onClick={() => onChooseStage(stage)}
>
{isUnlocked ? stage : "○"}
</button>
);
})}
</div>
</div>
</section>
);
}

function RhythmGame({
  levelKey,
  stage,
  settings,
  onBack,
  onPause,
  onSettings,
  onPass,
  onNext,
}) {
  const level = RHYTHM_LEVELS[levelKey];

  const [hasStarted, setHasStarted] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const [beat, setBeat] = useState(1);
  const [hits, setHits] = useState([]);
  const [feedback, setFeedback] = useState(
    "กดเริ่มด่านเมื่อคุณพร้อม"
  );
  const [result, setResult] = useState(null);
  const [slowMode, setSlowMode] = useState(false);

  const startTimeRef = useRef(Date.now());

  const audioContextRef = useRef(null);

  async function unlockAudio() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const context = audioContextRef.current;

    if (context.state === "suspended") {
      await context.resume();
    }

    return context;
  } catch {
    return null;
  }
}

  /*
    ถ้ายังไม่ได้เพิ่ม function getRhythmStageConfig
    โค้ดตรงนี้ก็ยังทำงานได้ เพราะมี config สำรอง
  */
  const stageConfig =
    typeof getRhythmStageConfig === "function"
      ? getRhythmStageConfig(levelKey, stage, beat)
      : {
          duration: level.duration,
          targetSize: level.targetSize,
          tolerance: level.tolerance,
          totalBeats: 8,
        };

  const totalBeats = stageConfig.totalBeats;
  const duration = slowMode
    ? Math.round(stageConfig.duration * 1.3)
    : stageConfig.duration;

  const tolerance = slowMode
    ? stageConfig.tolerance * 1.35
    : stageConfig.tolerance;

  async function playFeedbackTone(hitType) {
  if (!settings.feedbackSound) return;

  try {
    const audio = await unlockAudio();

    if (!audio) return;

    const now = audio.currentTime;

    const masterGain = audio.createGain();
    masterGain.connect(audio.destination);

    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.1, now + 0.018);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    const notes =
      hitType === "perfect"
        ? [659.25, 783.99]
        : hitType === "good"
          ? [587.33]
          : [392];

    notes.forEach((frequency, index) => {
      const startAt = now + index * 0.07;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(
        hitType === "perfect" ? 0.085 : 0.065,
        startAt + 0.018
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + 0.3
      );

      oscillator.connect(gain);
      gain.connect(masterGain);

      oscillator.start(startAt);
      oscillator.stop(startAt + 0.32);
    });
  } catch {
    // เกมยังทำงานต่อได้แม้เสียงไม่รองรับ
  }
}


  function resetStage(keepSlowMode = false) {
    setHasStarted(false);
    setRoundKey((current) => current + 1);
    setBeat(1);
    setHits([]);
    setFeedback("กดเริ่มด่านเมื่อคุณพร้อม");
    setResult(null);

    if (!keepSlowMode) {
      setSlowMode(false);
    }
  }

  function startStage() {
    unlockAudio();
    setBeat(1);
    setHits([]);
    setFeedback("รอให้วงแหวนตรงกับเส้น");
    setResult(null);
    setRoundKey((current) => current + 1);
    startTimeRef.current = Date.now();
    setHasStarted(true);
  }

  function handleTap() {
    if (!hasStarted || result) return;

    const elapsed = Date.now() - startTimeRef.current;

    /*
      CSS วงแหวนเริ่มประมาณ 23% และขยายถึง 92%
      เป้าหมายอยู่ที่ targetSize
    */
    const START_SIZE = 23;
    const END_SIZE = 92;
    const targetSize = stageConfig.targetSize;

    const targetProgress =
      (targetSize - START_SIZE) / (END_SIZE - START_SIZE);

    const targetTime = duration * targetProgress;
    const timingDifference = elapsed - targetTime;

    /*
      แปลง tolerance จาก % ของวงแหวน เป็นเวลา ms
    */
    const timeTolerance =
      duration * (tolerance / (END_SIZE - START_SIZE));

    const absoluteDifference = Math.abs(timingDifference);

    const isPerfect = absoluteDifference <= timeTolerance * 0.35;
    const isGood = absoluteDifference <= timeTolerance;

    let message = "ลองรอจังหวะถัดไป";

    if (isPerfect) {
      message = "พอดี";
    } else if (isGood && timingDifference < 0) {
      message = "เร็วเล็กน้อย";
    } else if (isGood) {
      message = "ช้าเล็กน้อย";
    } else if (timingDifference < 0) {
      message = "ลองรออีกนิด";
    } else {
      message = "ลองแตะให้เร็วขึ้นเล็กน้อย";
    }

    if (isPerfect) {
      playFeedbackTone("perfect");
    } else if (isGood) {
      playFeedbackTone("good");
    } else {
      playFeedbackTone("soft");
    }

    const nextHits = [...hits, isGood];
    setHits(nextHits);
    setFeedback(message);

    if (beat >= totalBeats) {
      const goodHits = nextHits.filter(Boolean).length;
      const required = Math.ceil(totalBeats * 0.6);

      if (goodHits >= required) {
        onPass();
        setResult({
          type: "pass",
          goodHits,
          total: totalBeats,
        });
      } else {
        setResult({
          type: "retry",
          goodHits,
          total: totalBeats,
        });
      }

      return;
    }

    setBeat((current) => current + 1);
    setRoundKey((current) => current + 1);
    startTimeRef.current = Date.now();
  }

  if (result) {
    const passed = result.type === "pass";

    return (
      <section className="screen game-screen">
        <TopBar
          title={`${level.title} · ด่าน ${stage} จาก 20`}
          onBack={onBack}
          onPause={onPause}
          onSettings={onSettings}
        />

        <div className="result-panel">
          <div className="result-symbol">{passed ? "◌" : "△"}</div>

          <p className="eyebrow">{passed ? "ทำได้แล้ว" : "ฝึกต่อได้"}</p>
          <h2>{passed ? "จบด่านแล้ว" : "ยังฝึกด่านนี้ต่อได้"}</h2>

          <p className="muted">
            {passed
              ? "ด่านถัดไปพร้อมเมื่อคุณต้องการ"
              : "ลองแตะให้ใกล้จังหวะเพิ่มอีกนิด หรือปรับให้ช้าลงได้"}
          </p>

          {settings.showDetails && (
            <div className="result-detail">
              แตะใกล้จังหวะ {result.goodHits} จาก {result.total} ครั้ง
            </div>
          )}

          <div className="result-actions">
            {passed ? (
              <>
                <Button onClick={onNext}>
                  {stage < 20 ? "ไปด่านถัดไป" : "กลับเลือกด่าน"}
                </Button>

                <Button variant="secondary" onClick={() => resetStage()}>
                  เล่นด่านนี้อีกครั้ง
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => resetStage()}>
                  ลองอีกครั้ง
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setSlowMode(true);
                    resetStage(true);
                  }}
                >
                  ดูจังหวะช้าลง
                </Button>
              </>
            )}

            <Button variant="ghost" onClick={onBack}>
              กลับเลือกด่าน
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="screen game-screen">
      <TopBar
        title={`${level.title} · ด่าน ${stage} จาก 20`}
        onBack={onBack}
        onPause={onPause}
        onSettings={onSettings}
      />

      <div className="rhythm-game-layout">
        {!hasStarted ? (
          <div className="start-stage-card">
            <div className="start-stage-symbol">◌</div>

            <p className="eyebrow">จังหวะนิ่ง</p>
            <h2>พร้อมเริ่มเมื่อคุณต้องการ</h2>

            <p className="muted">
              ดูวงแหวนที่ค่อย ๆ ขยาย
              <br />
              แล้วแตะเมื่อวงแหวนตรงกับเส้น
            </p>

            <div className="start-stage-info">
              <span>{level.title}</span>
              <span>ด่าน {stage} จาก 20</span>
              <span>{totalBeats} จังหวะ</span>
            </div>

            <Button onClick={startStage}>เริ่มด่าน</Button>
          </div>
        ) : (
          <>
            <div className="game-intro">
              <p className="eyebrow">จังหวะนิ่ง</p>
              <h2>แตะเมื่อวงแหวนตรงกับเส้น</h2>
              <p className="muted">ค่อย ๆ ดู แล้วแตะเมื่อพร้อม</p>
            </div>

            <div
              className="rhythm-board"
              style={{
                "--cycle-duration": `${duration}ms`,
                "--target-size": `${stageConfig.targetSize}%`,
              }}
            >
              <div className="target-ring" />
              <div key={`${roundKey}-${beat}`} className="moving-ring" />
              <div className="board-center-dot" />
            </div>

            <p className="feedback" aria-live="polite">
              {feedback}
            </p>

            <Button className="tap-button" onClick={handleTap}>
              แตะ
            </Button>

            <div className="beat-progress">
              {Array.from({ length: totalBeats }, (_, index) => {
                const hit = hits[index];

                return (
                  <span
                    key={index}
                    className={`beat-dot ${
                      index < hits.length
                        ? hit
                          ? "good"
                          : "soft"
                        : index === beat - 1
                          ? "current"
                          : ""
                    }`}
                  />
                );
              })}
            </div>

            <p className="stage-note">
              จังหวะ {beat} จาก {totalBeats}
              {slowMode ? " · โหมดช้าลง" : ""}
            </p>
          </>
        )}
      </div>
    </section>
  );
}


function PatternStartScreen({
progress,
onBack,
onSettings,
onContinue,
onChooseStage,
}) {
return (
<section className="screen">
<TopBar title="รหัสแสง" onBack={onBack} onSettings={onSettings} />

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">PATTERN GRID</p>
<h2>ดูแสง แล้วกดตามลำดับเดิม</h2>
<p className="muted">
รหัสจะค่อย ๆ ยาวขึ้นทีละน้อย
<br />
คุณสามารถดูรหัสซ้ำได้เสมอ
</p>
</div>

<div className="continue-box">
<div>
<span>เล่นต่อ</span>
<strong>ด่าน {progress.pattern} จาก 50</strong>
</div>

<Button onClick={onContinue}>เริ่มเล่น</Button>
</div>

<p className="section-label">ด่านที่เปิดแล้ว</p>

<div className="stage-grid pattern-stage-list">
{Array.from({ length: 50 }, (_, index) => {
const stage = index + 1;
const unlocked = stage <= progress.pattern;

return (
<button
key={stage}
className={`stage-button ${unlocked ? "unlocked" : "locked"}`}
disabled={!unlocked}
onClick={() => onChooseStage(stage)}
>
{unlocked ? stage : "○"}
</button>
);
})}
</div>
</div>
</section>
);
}

function PatternGame({
stage,
settings,
onBack,
onPause,
onSettings,
onPass,
onNext,
}) {
const [pattern, setPattern] = useState(() => generatePattern(stage));
const [phase, setPhase] = useState("ready");
const [litCell, setLitCell] = useState(null);
const [input, setInput] = useState([]);
const [pressedCell, setPressedCell] = useState(null);
const [result, setResult] = useState(null);
const [slowMode, setSlowMode] = useState(false);
const timersRef = useRef([]);
const pressFeedbackTimerRef = useRef(null);

const activeSpeed = slowMode ? "slow" : settings.patternSpeed;
const timing = getPatternTiming(activeSpeed);

function clearTimers() {
timersRef.current.forEach((timer) => clearTimeout(timer));
timersRef.current = [];
}

useEffect(() => {
  return () => {
    clearTimers();
    clearTimeout(pressFeedbackTimerRef.current);
  };
}, []);

useEffect(() => {
clearTimers();
setPattern(generatePattern(stage));
setPhase("ready");
setLitCell(null);
setInput([]);
setResult(null);
setSlowMode(false);
}, [stage]);

function showPattern() {
clearTimers();
setPhase("showing");
setLitCell(null);
setInput([]);
setPressedCell(null);

const startDelay = 500;

pattern.forEach((cell, index) => {
const lightStart = startDelay + index * (timing.light + timing.gap);
const lightEnd = lightStart + timing.light;

timersRef.current.push(
setTimeout(() => setLitCell(cell), lightStart)
);

timersRef.current.push(
setTimeout(() => setLitCell(null), lightEnd)
);
});

const finishedAt =
startDelay + pattern.length * (timing.light + timing.gap) + 200;

timersRef.current.push(
setTimeout(() => {
setPhase("input");
setLitCell(null);
}, finishedAt)
);
}

function chooseCell(cell) {
    if (phase !== "input" || result) return;
    clearTimeout(pressFeedbackTimerRef.current);
    setPressedCell(cell);

    pressFeedbackTimerRef.current = setTimeout(() => {
    setPressedCell(null);
    }, 180);


    const expected = pattern[input.length];

if (cell !== expected) {
setPhase("wrong");
setLitCell(null);
return;
}

const nextInput = [...input, cell];
setInput(nextInput);

if (nextInput.length === pattern.length) {
onPass();
setResult({
length: pattern.length,
});
setPhase("done");
}
}

function replayPattern() {
showPattern();
}

function retrySamePattern() {
setInput([]);
setResult(null);
showPattern();
}

function slowerPattern() {
setSlowMode(true);
setInput([]);
setResult(null);

setTimeout(() => {
showPattern();
}, 120);
}

function newPattern() {
clearTimers();
setPattern(generatePattern(stage));
setInput([]);
setResult(null);
setPhase("ready");
setLitCell(null);
}

if (result) {
return (
<section className="screen game-screen">
<TopBar
title={`รหัสแสง · ด่าน ${stage} จาก 50`}
onBack={onBack}
onPause={onPause}
onSettings={onSettings}
/>

<div className="result-panel">
<div className="result-symbol">▦</div>
<p className="eyebrow">ทำได้แล้ว</p>
<h2>จบรหัสแล้ว</h2>
<p className="muted">
คุณกดตามลำดับได้ครบ {result.length} จุด
</p>

<div className="result-actions">
<Button onClick={onNext}>
{stage < 50 ? "ไปด่านถัดไป" : "กลับหน้าโหมด"}
</Button>

<Button variant="secondary" onClick={newPattern}>
เล่นด่านนี้อีกครั้ง
</Button>

<Button variant="ghost" onClick={onBack}>
กลับเลือกด่าน
</Button>
</div>
</div>
</section>
);
}

let instruction = "กดเริ่มเพื่อดูรหัส";
if (phase === "showing") instruction = "ดูรหัสให้จบก่อนเริ่มกด";
if (phase === "input") instruction = "ค่อย ๆ กดตามลำดับที่เห็น";
if (phase === "wrong") instruction = "ลองดูรหัสอีกครั้ง";

return (
<section className="screen game-screen">
<TopBar
title={`Memo · ด่าน ${stage} จาก 50`}
onBack={onBack}
onPause={onPause}
onSettings={onSettings}
/>

<div className="pattern-game-layout">
<div className="game-intro">
<p className="eyebrow">รหัสยาว {pattern.length} จุด</p>
<h2>{instruction}</h2>
<p className="muted">
{phase === "wrong"
? "รหัสเดิมยังอยู่ คุณดูซ้ำได้เมื่อพร้อม"
: "ไม่มีเวลาเร่งรีบ"}
</p>
</div>

<div className="pattern-grid">
{Array.from({ length: 9 }, (_, index) => (
<button
key={index}
className={`pattern-cell ${litCell === index ? "lit" : ""} ${
  pressedCell === index ? "pressed-feedback" : ""
}`}
disabled={phase !== "input"}
onClick={() => chooseCell(index)}
>
<span>{index + 1}</span>
</button>
))}
</div>

<p className="pattern-status">
{phase === "input"
? `กดแล้ว ${input.length} จาก ${pattern.length} จุด`
: phase === "showing"
? "กำลังแสดงรหัส"
: phase === "wrong"
? "รหัสเดิมพร้อมให้ดูซ้ำ"
: "พร้อมเริ่มเมื่อคุณต้องการ"}
</p>

<div className="game-actions">
{phase === "ready" && (
<Button onClick={showPattern}>เริ่มดูรหัส</Button>
)}

{phase === "input" && (
<Button variant="secondary" onClick={replayPattern}>
ดูรหัสอีกครั้ง
</Button>
)}

{phase === "wrong" && (
<>
<Button onClick={retrySamePattern}>ดูรหัสอีกครั้ง</Button>
<Button variant="secondary" onClick={slowerPattern}>
แสดงช้าลง
</Button>
<Button variant="ghost" onClick={newPattern}>
เปลี่ยนรหัสใหม่
</Button>
</>
)}
</div>

{slowMode && <p className="stage-note">กำลังแสดงรหัสแบบช้าลง</p>}
</div>
</section>
);
}

function ProgressScreen({ progress, onBack, onSettings, onRhythm, onPattern }) {
return (
<section className="screen">
<TopBar
title="ความคืบหน้าของฉัน"
onBack={onBack}
onSettings={onSettings}
/>

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">MY PROGRESS</p>
<h2>ดูสิ่งที่คุณเคยฝึก</h2>
<p className="muted">ข้อมูลอยู่บนอุปกรณ์นี้ และไม่เปรียบเทียบกับใคร</p>
</div>

<div className="progress-card">
<div className="progress-card-title">
<span className="small-icon">◌</span>
<div>
<strong>จังหวะนิ่ง</strong>
<small>เลือกระดับเพื่อกลับไปฝึก</small>
</div>
</div>

{Object.entries(RHYTHM_LEVELS).map(([key, level]) => (
<button className="progress-row" key={key} onClick={() => onRhythm(key)}>
<span>{level.title}</span>
<span>ด่าน {progress.rhythm[key]} / 20 →</span>
</button>
))}
</div>

<div className="progress-card">
<div className="progress-card-title">
<span className="small-icon">▦</span>
<div>
<strong>รหัสแสง</strong>
<small>เล่นต่อจากด่านล่าสุดได้</small>
</div>
</div>

<button className="progress-row" onClick={onPattern}>
<span>ด่านล่าสุด</span>
<span>ด่าน {progress.pattern} / 50 →</span>
</button>
</div>
</div>
</section>
);
}

function HowToScreen({ onBack, onSettings }) {
return (
<section className="screen">
<TopBar title="วิธีเล่น" onBack={onBack} onSettings={onSettings} />

<div className="content narrow how-to">
<article>
<div className="how-visual rhythm-visual">
<span className="visual-ring ring-one" />
<span className="visual-ring ring-two" />
<span className="visual-dot" />
</div>

<div>
<p className="eyebrow">โหมด 1</p>
<h2>จังหวะนิ่ง</h2>
<ol>
<li>ดูวงแหวนที่ค่อย ๆ ขยาย</li>
<li>รอให้วงแหวนตรงกับเส้นเป้าหมาย</li>
<li>แตะปุ่ม “แตะ” เมื่อพร้อม</li>
<li>หากยังไม่ถึงเกณฑ์ เลือกลองอีกครั้งหรือดูช้าลงได้</li>
</ol>
</div>
</article>

<article>
<div className="how-visual pattern-visual">
{Array.from({ length: 9 }, (_, index) => (
<span key={index} className={index === 4 ? "mini-lit" : ""} />
))}
</div>

<div>
<p className="eyebrow">โหมด 2</p>
<h2>รหัสแสง</h2>
<ol>
<li>กด “เริ่มดูรหัส”</li>
<li>ดูปุ่มที่สว่างทีละปุ่มจนจบ</li>
<li>กดปุ่มตามลำดับเดิม</li>
<li>หากกดไม่ตรง ให้ดูรหัสเดิมซ้ำได้ทันที</li>
</ol>
</div>
</article>
</div>
</section>
);
}

function PauseScreen({ onResume, onHome, onSettings }) {
return (
<section className="screen centered-screen">
<div className="result-panel">
<div className="result-symbol">Ⅱ</div>
<p className="eyebrow">พักอยู่</p>
<h2>ความคืบหน้าถูกบันทึกแล้ว</h2>
<p className="muted">กลับมาเล่นต่อเมื่อพร้อมได้เสมอ</p>

<div className="result-actions">
<Button onClick={onResume}>เล่นต่อ</Button>
<Button variant="secondary" onClick={onHome}>
กลับหน้าโฮม
</Button>
<Button variant="ghost" onClick={onSettings}>
การตั้งค่า
</Button>
</div>
</div>
</section>
);
}

function SettingsModal({ settings, onChange, onClose }) {
function update(key, value) {
onChange((current) => ({
...current,
[key]: value,
}));
}

return (
<div className="modal-backdrop" role="dialog" aria-modal="true">
<section className="settings-modal">
<div className="settings-header">
<div>
<p className="eyebrow">SETTINGS</p>
<h2>การตั้งค่า</h2>
</div>

<Button variant="ghost" onClick={onClose}>
✕
</Button>
</div>

<p className="muted settings-intro">
ปรับเกมให้รู้สึกสบายกับคุณมากขึ้น
</p>

<SettingRow
label="เสียงตอบรับ"
description="เสียงสั้น ๆ เมื่อแตะใกล้จังหวะในโหมดจังหวะนิ่ง"
>
<Toggle
checked={settings.feedbackSound}
onChange={(value) => update("feedbackSound", value)}
/>
</SettingRow>


<SettingRow
label="ขนาดตัวอักษร"
description="ปรับขนาดข้อความในเกม"
>
<select
value={settings.fontSize}
onChange={(event) => update("fontSize", event.target.value)}
>
<option value="small">เล็ก</option>
<option value="normal">ปกติ</option>
<option value="large">ใหญ่</option>
</select>
</SettingRow>

<SettingRow
label="ความเร็วรหัสแสง"
description="ความเร็วที่ปุ่มสว่างในโหมดรหัสแสง"
>
<select
value={settings.patternSpeed}
onChange={(event) => update("patternSpeed", event.target.value)}
>
<option value="slow">ช้า</option>
<option value="normal">ปกติ</option>
<option value="fast">เร็ว</option>
</select>
</SettingRow>

<SettingRow
label="รายละเอียดผลลัพธ์"
description="แสดงจำนวนครั้งที่แตะใกล้จังหวะเมื่อจบด่าน"
>
<Toggle
checked={settings.showDetails}
onChange={(value) => update("showDetails", value)}
/>
</SettingRow>

<Button className="settings-done" onClick={onClose}>
เสร็จแล้ว
</Button>
</section>
</div>
);
}

function SettingRow({ label, description, children }) {
return (
<div className="setting-row">
<div>
<strong>{label}</strong>
<small>{description}</small>
</div>

{children}
</div>
);
}

function Toggle({ checked, onChange }) {
return (
<button
className={`toggle ${checked ? "on" : ""}`}
onClick={() => onChange(!checked)}
aria-pressed={checked}
>
<span className="toggle-dot" />
<strong>{checked ? "เปิด" : "ปิด"}</strong>
</button>
);
}
