import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import gameLogo from "./assets/LOGOTEMPOMEMO.png";

const LanguageContext = createContext("en");

const THAI_TEXT = {
  "Back": "ย้อนกลับ", "Pause": "พักเกม", "Settings": "ตั้งค่า",
  "Choose a Mode": "เลือกโหมด", "My Progress": "ความคืบหน้าของฉัน", "How to Play": "วิธีเล่น",
  "CHOOSE AN ACTIVITY": "เลือกกิจกรรม", "What would you like to play today?": "วันนี้อยากเล่นอะไรดี?",
  "Pick an activity that feels right.": "เลือกกิจกรรมที่เหมาะกับคุณ",
  "Tap when the ring meets the target": "แตะเมื่อวงแหวนถึงเป้าหมาย", "Focus · patience · timing": "สมาธิ · ความอดทน · จังหวะ",
  "Watch the sequence, then repeat it": "จำลำดับไฟแล้วกดตาม", "Memory · sequencing · attention": "ความจำ · ลำดับ · ความใส่ใจ",
  "CHOOSE YOUR PACE": "เลือกระดับความเร็ว", "Where would you like to start?": "อยากเริ่มจากระดับไหน?",
  "Choose any level.": "เลือกเล่นระดับใดก็ได้", "Clear stages to unlock the next one.": "ผ่านด่านเพื่อปลดล็อกด่านถัดไป",
  "Beginner": "เริ่มต้น", "Intermediate": "ปานกลาง", "Challenge": "ท้าทาย", "MY PROGRESS": "ความคืบหน้าของฉัน",
  "Slow pace · wide ring": "จังหวะช้า · เป้าหมายกว้าง", "Moderate pace · tighter target": "จังหวะปานกลาง · เป้าหมายแคบลง", "Faster pace · sharper focus": "จังหวะเร็ว · ต้องใช้สมาธิมากขึ้น",
  "Stage": "ด่าน", "of": "จาก", "CHOOSE A STAGE": "เลือกด่าน", "Practice at your own pace": "ฝึกในจังหวะของคุณ",
  "Clear a stage to unlock the next one.": "ผ่านด่านเพื่อปลดล็อกด่านถัดไป",
  "Ready when you are": "พร้อมเมื่อคุณพร้อม", "Wait for the ring to meet the target": "รอให้วงแหวนถึงเป้าหมาย",
  "Try the next beat": "ลองจังหวะถัดไป", "Perfect": "เยี่ยมมาก", "A little early": "เร็วไปนิด", "A little late": "ช้าไปนิด",
  "Wait a little longer": "รออีกสักนิด", "Try tapping a little earlier": "ลองแตะให้เร็วกว่านี้", "NICE WORK": "ทำได้ดีมาก",
  "KEEP PRACTICING": "ฝึกต่ออีกนิด", "Stage complete": "ผ่านด่านแล้ว", "Give it another try": "ลองอีกครั้ง",
  "The next stage is ready when you are.": "ด่านถัดไปรอคุณอยู่", "Try tapping closer to the target, or slow things down.": "ลองแตะให้ใกล้เป้าหมายขึ้น หรือปรับให้ช้าลง",
  "On-beat taps:": "แตะตรงจังหวะ:", "Next stage": "ด่านถัดไป", "Choose a stage": "เลือกด่าน",
  "Play this stage again": "เล่นด่านนี้อีกครั้ง", "Try again": "ลองอีกครั้ง", "Slow it down": "ปรับให้ช้าลง", "Back to stages": "กลับไปหน้าด่าน",
  "Watch the ring expand": "ดูวงแหวนขยาย", "then tap when it reaches the target.": "แล้วแตะเมื่อวงแหวนถึงเป้าหมาย", "beats": "จังหวะ", "Start stage": "เริ่มด่าน",
  "Take your time. Tap when you are ready.": "ไม่ต้องรีบ แตะเมื่อพร้อม", "Tap": "แตะ", "Beat": "จังหวะ", "Slow mode": "โหมดช้า",
  "PATTERN GRID": "ตารางรูปแบบ", "Watch the lights, then repeat the sequence": "ดูลำดับไฟ แล้วกดตาม", "Sequences get longer little by little.": "ลำดับจะยาวขึ้นทีละนิด",
  "Replay the sequence whenever you need.": "ดูลำดับซ้ำได้ทุกเมื่อ", "Continue": "เล่นต่อ", "Start": "เริ่ม", "Unlocked stages": "ด่านที่ปลดล็อกแล้ว",
  "Press start to watch the sequence": "กดเริ่มเพื่อดูลำดับ", "Watch the full sequence before tapping": "ดูลำดับให้จบก่อนเริ่มกด",
  "Repeat the sequence at your own pace": "กดตามลำดับในจังหวะของคุณ", "Try watching the sequence again": "ลองดูลำดับอีกครั้ง",
  "Your sequence is still here. Replay it when you are ready.": "ลำดับเดิมยังอยู่ ดูซ้ำได้เมื่อพร้อม", "There is no rush.": "ไม่ต้องรีบ",
  "Entered": "กดแล้ว", "steps": "ขั้น", "Showing sequence...": "กำลังแสดงลำดับ...", "Sequence ready to replay": "พร้อมดูลำดับซ้ำ",
  "Show sequence": "แสดงลำดับ", "Replay sequence": "ดูลำดับซ้ำ", "New sequence": "สุ่มลำดับใหม่", "Showing sequence at a slower pace": "กำลังแสดงลำดับแบบช้าลง",
  "Sequence complete": "จำลำดับได้ครบแล้ว", "You repeated all": "คุณกดครบทั้ง", "in order.": "ขั้นตามลำดับ", "Back to modes": "กลับไปเลือกโหมด",
  "Your practice history": "ประวัติการฝึกของคุณ", "Your progress stays on this device and is not compared with anyone else.": "ความคืบหน้าจะบันทึกไว้ในอุปกรณ์นี้และไม่มีการเปรียบเทียบกับผู้อื่น",
  "Choose a level to practice": "เลือกระดับเพื่อฝึก", "Continue from your latest stage": "เล่นต่อจากด่านล่าสุด", "Latest stage": "ด่านล่าสุด",
  "MODE 1": "โหมด 1", "Watch the ring expand.": "ดูวงแหวนขยาย", "Wait for it to meet the target.": "รอให้วงแหวนถึงเป้าหมาย", "Tap the button when you are ready.": "แตะปุ่มเมื่อพร้อม",
  "If you miss, try again or slow it down.": "ถ้าพลาด ลองอีกครั้งหรือปรับให้ช้าลง", "MODE 2": "โหมด 2", "Select “Show sequence.”": "เลือก “แสดงลำดับ”",
  "Watch each light until the sequence ends.": "ดูลำดับไฟจนจบ", "Tap the buttons in the same order.": "แตะปุ่มตามลำดับเดิม", "If you miss, replay the same sequence.": "ถ้าพลาด ให้ดูลำดับเดิมซ้ำ",
  "PAUSED": "พักเกม", "Your progress has been saved": "บันทึกความคืบหน้าแล้ว", "Come back and continue whenever you are ready.": "กลับมาเล่นต่อได้ทุกเมื่อที่พร้อม",
  "Resume": "เล่นต่อ", "Home": "หน้าหลัก", "SETTINGS": "ตั้งค่า", "Make the game more comfortable for you.": "ปรับเกมให้เหมาะกับคุณมากขึ้น",
  "Feedback sound": "เสียงตอบรับ", "A short sound when you tap near the beat in Tempo.": "เล่นเสียงสั้น ๆ เมื่อแตะใกล้จังหวะใน Tempo",
  "Text size": "ขนาดตัวอักษร", "Adjust the size of game text.": "ปรับขนาดตัวอักษรในเกม", "Small": "เล็ก", "Medium": "กลาง", "Large": "ใหญ่",
  "Memo speed": "ความเร็ว Memo", "How quickly the lights appear in Memo.": "ปรับความเร็วการแสดงไฟใน Memo", "Slow": "ช้า", "Normal": "ปกติ", "Fast": "เร็ว",
  "Score details": "รายละเอียดคะแนน", "Show on-beat taps when a stage ends.": "แสดงจำนวนครั้งที่แตะตรงจังหวะเมื่อจบด่าน", "Done": "เสร็จสิ้น", "On": "เปิด", "Off": "ปิด",
  "Language": "ภาษา", "Choose the language used in the game.": "เลือกภาษาที่ใช้ในเกม", "English": "English", "Thai": "ไทย",
  "STEP SEQUENCE": "ขั้นในลำดับ",
};

function useTranslation() {
  const language = useContext(LanguageContext);
  return (text) => language === "th" ? THAI_TEXT[text] || text : text;
}

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
language: "en",
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
title: "Beginner",
detail: "Slow pace · wide ring",
duration: 3200,
targetSize: 57,
tolerance: 16,
},
medium: {
title: "Intermediate",
detail: "Moderate pace · tighter target",
duration: 2400,
targetSize: 57,
tolerance: 11,
},
hard: {
title: "Challenge",
detail: "Faster pace · sharper focus",
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
const t = useTranslation();
return (
<header className="topbar">
<Button variant="ghost" onClick={onBack}>
← {t("Back")}
</Button>

<h1 className="topbar-title">{title}</h1>

<div className="topbar-actions">
{onPause && (
<Button variant="ghost" onClick={onPause}>
⏸ {t("Pause")}
</Button>
)}

<Button variant="ghost" onClick={onSettings} aria-label={t("Settings")}>
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

useEffect(() => {
  document.documentElement.lang = settings.language || "en";
}, [settings.language]);


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
<LanguageContext.Provider value={settings.language || "en"}>
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
</LanguageContext.Provider>
);
}

function HomeScreen({ onChooseMode, onProgress, onHowTo, onSettings }) {
const t = useTranslation();
return (
<section className="screen home-screen">
<div className="home-brand">
<img className="game-logo" src={gameLogo} alt="" />
</div>

<div className="home-menu">
<Button className="home-main-button" onClick={onChooseMode}>
<span className="button-icon">◌</span>
{t("Choose a Mode")}
<span className="button-arrow">→</span>
</Button>

<Button variant="secondary" className="home-menu-button" onClick={onProgress}>
<span className="button-icon">▤</span>
{t("My Progress")}
<span className="button-arrow">→</span>
</Button>

<Button variant="secondary" className="home-menu-button" onClick={onHowTo}>
<span className="button-icon">?</span>
{t("How to Play")}
<span className="button-arrow">→</span>
</Button>

<Button variant="secondary" className="home-menu-button" onClick={onSettings}>
<span className="button-icon">⚙</span>
{t("Settings")}
<span className="button-arrow">→</span>
</Button>
</div>
</section>
);
}

function ModeSelectScreen({ onBack, onSettings, onRhythm, onPattern }) {
const t = useTranslation();
return (
<section className="screen">
<TopBar title={t("Choose a Mode")} onBack={onBack} onSettings={onSettings} />

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">{t("CHOOSE AN ACTIVITY")}</p>
<h2>{t("What would you like to play today?")}</h2>
<p className="muted">{t("Pick an activity that feels right.")}</p>
</div>

<button className="large-mode-card" onClick={onRhythm}>
<div className="mode-visual rhythm-visual">
<span className="visual-ring ring-one" />
<span className="visual-ring ring-two" />
<span className="visual-dot" />
</div>

<div className="mode-card-text">
<strong>Tempo</strong>
<small>{t("Tap when the ring meets the target")}</small>
<small className="mode-skill">{t("Focus · patience · timing")}</small>
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
<small>{t("Watch the sequence, then repeat it")}</small>
<small className="mode-skill">{t("Memory · sequencing · attention")}</small>
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
const t = useTranslation();
return (
<section className="screen">
<TopBar title="Tempo" onBack={onBack} onSettings={onSettings} />

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">{t("CHOOSE YOUR PACE")}</p>
<h2>{t("Where would you like to start?")}</h2>
<p className="muted">
{t("Choose any level.")}
<br />
{t("Clear stages to unlock the next one.")}
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
<strong>{t(level.title)}</strong>
<small>{t(level.detail)}</small>
<small>{t("Stage")} {progress.rhythm[key]} {t("of")} 20</small>
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
const t = useTranslation();
const level = RHYTHM_LEVELS[levelKey];

return (
<section className="screen">
<TopBar
title={`Tempo · ${t(level.title)}`}
onBack={onBack}
onSettings={onSettings}
/>

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">{t("CHOOSE A STAGE")}</p>
<h2>{t("Practice at your own pace")}</h2>
<p className="muted">{t("Clear a stage to unlock the next one.")}</p>
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
  const t = useTranslation();
  const level = RHYTHM_LEVELS[levelKey];

  const [hasStarted, setHasStarted] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const [beat, setBeat] = useState(1);
  const [hits, setHits] = useState([]);
  const [feedback, setFeedback] = useState(
    "Ready when you are"
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
    setFeedback("Ready when you are");
    setResult(null);

    if (!keepSlowMode) {
      setSlowMode(false);
    }
  }

  function startStage() {
    unlockAudio();
    setBeat(1);
    setHits([]);
    setFeedback("Wait for the ring to meet the target");
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

    let message = "Try the next beat";

    if (isPerfect) {
      message = "Perfect";
    } else if (isGood && timingDifference < 0) {
      message = "A little early";
    } else if (isGood) {
      message = "A little late";
    } else if (timingDifference < 0) {
      message = "Wait a little longer";
    } else {
      message = "Try tapping a little earlier";
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
          title={`${t(level.title)} · ${t("Stage")} ${stage} ${t("of")} 20`}
          onBack={onBack}
          onPause={onPause}
          onSettings={onSettings}
        />

        <div className="result-panel">
          <div className="result-symbol">{passed ? "◌" : "△"}</div>

          <p className="eyebrow">{t(passed ? "NICE WORK" : "KEEP PRACTICING")}</p>
          <h2>{t(passed ? "Stage complete" : "Give it another try")}</h2>

          <p className="muted">
            {passed
              ? t("The next stage is ready when you are.")
              : t("Try tapping closer to the target, or slow things down.")}
          </p>

          {settings.showDetails && (
            <div className="result-detail">
              {t("On-beat taps:")} {result.goodHits} {t("of")} {result.total}
            </div>
          )}

          <div className="result-actions">
            {passed ? (
              <>
                <Button onClick={onNext}>
                  {t(stage < 20 ? "Next stage" : "Choose a stage")}
                </Button>

                <Button variant="secondary" onClick={() => resetStage()}>
                  {t("Play this stage again")}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => resetStage()}>
                  {t("Try again")}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setSlowMode(true);
                    resetStage(true);
                  }}
                >
                  {t("Slow it down")}
                </Button>
              </>
            )}

            <Button variant="ghost" onClick={onBack}>
              {t("Back to stages")}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="screen game-screen">
      <TopBar
        title={`${t(level.title)} · ${t("Stage")} ${stage} ${t("of")} 20`}
        onBack={onBack}
        onPause={onPause}
        onSettings={onSettings}
      />

      <div className="rhythm-game-layout">
        {!hasStarted ? (
          <div className="start-stage-card">
            <div className="start-stage-symbol">◌</div>

            <p className="eyebrow">Tempo</p>
            <h2>{t("Ready when you are")}</h2>

            <p className="muted">
              {t("Watch the ring expand")}
              <br />
              {t("then tap when it reaches the target.")}
            </p>

            <div className="start-stage-info">
              <span>{t(level.title)}</span>
              <span>{t("Stage")} {stage} {t("of")} 20</span>
              <span>{totalBeats} {t("beats")}</span>
            </div>

            <Button onClick={startStage}>{t("Start stage")}</Button>
          </div>
        ) : (
          <>
            <div className="game-intro">
              <p className="eyebrow">Tempo</p>
              <h2>{t("Tap when the ring meets the target")}</h2>
              <p className="muted">{t("Take your time. Tap when you are ready.")}</p>
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
              {t(feedback)}
            </p>

            <Button className="tap-button" onClick={handleTap}>
              {t("Tap")}
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
              {t("Beat")} {beat} {t("of")} {totalBeats}
              {slowMode ? ` · ${t("Slow mode")}` : ""}
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
const t = useTranslation();
return (
<section className="screen">
<TopBar title="Memo" onBack={onBack} onSettings={onSettings} />

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">{t("PATTERN GRID")}</p>
<h2>{t("Watch the lights, then repeat the sequence")}</h2>
<p className="muted">
{t("Sequences get longer little by little.")}
<br />
{t("Replay the sequence whenever you need.")}
</p>
</div>

<div className="continue-box">
<div>
<span>{t("Continue")}</span>
<strong>{t("Stage")} {progress.pattern} {t("of")} 50</strong>
</div>

<Button onClick={onContinue}>{t("Start")}</Button>
</div>

<p className="section-label">{t("Unlocked stages")}</p>

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
const t = useTranslation();
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
          title={`Memo · ${t("Stage")} ${stage} ${t("of")} 50`}
onBack={onBack}
onPause={onPause}
onSettings={onSettings}
/>

<div className="result-panel">
<div className="result-symbol">▦</div>
<p className="eyebrow">{t("NICE WORK")}</p>
<h2>{t("Sequence complete")}</h2>
<p className="muted">
{t("You repeated all")} {result.length} {t("steps")} {t("in order.")}
</p>

<div className="result-actions">
<Button onClick={onNext}>
{t(stage < 50 ? "Next stage" : "Back to modes")}
</Button>

<Button variant="secondary" onClick={newPattern}>
{t("Play this stage again")}
</Button>

<Button variant="ghost" onClick={onBack}>
{t("Back to stages")}
</Button>
</div>
</div>
</section>
);
}

let instruction = t("Press start to watch the sequence");
if (phase === "showing") instruction = t("Watch the full sequence before tapping");
if (phase === "input") instruction = t("Repeat the sequence at your own pace");
if (phase === "wrong") instruction = t("Try watching the sequence again");

return (
<section className="screen game-screen">
<TopBar
  title={`Memo · ${t("Stage")} ${stage} ${t("of")} 50`}
onBack={onBack}
onPause={onPause}
onSettings={onSettings}
/>

<div className="pattern-game-layout">
<div className="game-intro">
<p className="eyebrow">{pattern.length} {t("STEP SEQUENCE")}</p>
<h2>{instruction}</h2>
<p className="muted">
{phase === "wrong"
? t("Your sequence is still here. Replay it when you are ready.")
: t("There is no rush.")}
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
? `${t("Entered")} ${input.length} ${t("of")} ${pattern.length} ${t("steps")}`
: phase === "showing"
? t("Showing sequence...")
: phase === "wrong"
? t("Sequence ready to replay")
: t("Ready when you are")}
</p>

<div className="game-actions">
{phase === "ready" && (
<Button onClick={showPattern}>{t("Show sequence")}</Button>
)}

{phase === "input" && (
<Button variant="secondary" onClick={replayPattern}>
{t("Replay sequence")}
</Button>
)}

{phase === "wrong" && (
<>
<Button onClick={retrySamePattern}>{t("Replay sequence")}</Button>
<Button variant="secondary" onClick={slowerPattern}>
{t("Slow it down")}
</Button>
<Button variant="ghost" onClick={newPattern}>
{t("New sequence")}
</Button>
</>
)}
</div>

{slowMode && <p className="stage-note">{t("Showing sequence at a slower pace")}</p>}
</div>
</section>
);
}

function ProgressScreen({ progress, onBack, onSettings, onRhythm, onPattern }) {
const t = useTranslation();
return (
<section className="screen">
<TopBar
title={t("My Progress")}
onBack={onBack}
onSettings={onSettings}
/>

<div className="content narrow">
<div className="title-block">
<p className="eyebrow">{t("MY PROGRESS")}</p>
<h2>{t("Your practice history")}</h2>
<p className="muted">{t("Your progress stays on this device and is not compared with anyone else.")}</p>
</div>

<div className="progress-card">
<div className="progress-card-title">
<span className="small-icon">◌</span>
<div>
<strong>Tempo</strong>
<small>{t("Choose a level to practice")}</small>
</div>
</div>

{Object.entries(RHYTHM_LEVELS).map(([key, level]) => (
<button className="progress-row" key={key} onClick={() => onRhythm(key)}>
<span>{t(level.title)}</span>
<span>{t("Stage")} {progress.rhythm[key]} / 20 →</span>
</button>
))}
</div>

<div className="progress-card">
<div className="progress-card-title">
<span className="small-icon">▦</span>
<div>
<strong>Memo</strong>
<small>{t("Continue from your latest stage")}</small>
</div>
</div>

<button className="progress-row" onClick={onPattern}>
<span>{t("Latest stage")}</span>
<span>{t("Stage")} {progress.pattern} / 50 →</span>
</button>
</div>
</div>
</section>
);
}

function HowToScreen({ onBack, onSettings }) {
const t = useTranslation();
return (
<section className="screen">
<TopBar title={t("How to Play")} onBack={onBack} onSettings={onSettings} />

<div className="content narrow how-to">
<article>
<div className="how-visual rhythm-visual">
<span className="visual-ring ring-one" />
<span className="visual-ring ring-two" />
<span className="visual-dot" />
</div>

<div>
<p className="eyebrow">{t("MODE 1")}</p>
<h2>Tempo</h2>
<ol>
<li>{t("Watch the ring expand.")}</li>
<li>{t("Wait for it to meet the target.")}</li>
<li>{t("Tap the button when you are ready.")}</li>
<li>{t("If you miss, try again or slow it down.")}</li>
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
<p className="eyebrow">{t("MODE 2")}</p>
<h2>Memo</h2>
<ol>
<li>{t("Select “Show sequence.”")}</li>
<li>{t("Watch each light until the sequence ends.")}</li>
<li>{t("Tap the buttons in the same order.")}</li>
<li>{t("If you miss, replay the same sequence.")}</li>
</ol>
</div>
</article>
</div>
</section>
);
}

function PauseScreen({ onResume, onHome, onSettings }) {
const t = useTranslation();
return (
<section className="screen centered-screen">
<div className="result-panel">
<div className="result-symbol">Ⅱ</div>
<p className="eyebrow">{t("PAUSED")}</p>
<h2>{t("Your progress has been saved")}</h2>
<p className="muted">{t("Come back and continue whenever you are ready.")}</p>

<div className="result-actions">
<Button onClick={onResume}>{t("Resume")}</Button>
<Button variant="secondary" onClick={onHome}>
{t("Home")}
</Button>
<Button variant="ghost" onClick={onSettings}>
{t("Settings")}
</Button>
</div>
</div>
</section>
);
}

function SettingsModal({ settings, onChange, onClose }) {
const t = useTranslation();
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
<p className="eyebrow">{t("SETTINGS")}</p>
<h2>{t("Settings")}</h2>
</div>

<Button variant="ghost" onClick={onClose}>
✕
</Button>
</div>

<p className="muted settings-intro">
{t("Make the game more comfortable for you.")}
</p>

<SettingRow
label={t("Language")}
description={t("Choose the language used in the game.")}
>
<select
value={settings.language || "en"}
onChange={(event) => update("language", event.target.value)}
>
<option value="en">English</option>
<option value="th">ไทย</option>
</select>
</SettingRow>

<SettingRow
label={t("Feedback sound")}
description={t("A short sound when you tap near the beat in Tempo.")}
>
<Toggle
checked={settings.feedbackSound}
onChange={(value) => update("feedbackSound", value)}
/>
</SettingRow>


<SettingRow
label={t("Text size")}
description={t("Adjust the size of game text.")}
>
<select
value={settings.fontSize}
onChange={(event) => update("fontSize", event.target.value)}
>
<option value="small">{t("Small")}</option>
<option value="normal">{t("Medium")}</option>
<option value="large">{t("Large")}</option>
</select>
</SettingRow>

<SettingRow
label={t("Memo speed")}
description={t("How quickly the lights appear in Memo.")}
>
<select
value={settings.patternSpeed}
onChange={(event) => update("patternSpeed", event.target.value)}
>
<option value="slow">{t("Slow")}</option>
<option value="normal">{t("Normal")}</option>
<option value="fast">{t("Fast")}</option>
</select>
</SettingRow>

<SettingRow
label={t("Score details")}
description={t("Show on-beat taps when a stage ends.")}
>
<Toggle
checked={settings.showDetails}
onChange={(value) => update("showDetails", value)}
/>
</SettingRow>

<Button className="settings-done" onClick={onClose}>
{t("Done")}
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
const t = useTranslation();
return (
<button
className={`toggle ${checked ? "on" : ""}`}
onClick={() => onChange(!checked)}
aria-pressed={checked}
>
<span className="toggle-dot" />
<strong>{t(checked ? "On" : "Off")}</strong>
</button>
);
}
