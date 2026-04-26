import './style.css';

const FLDBASE = 16;
const FLDSIZE_Y = FLDBASE + 1;
const FLDSIZE_X = FLDBASE * 2 + 1;
const CHARS = " .o+=*BOX@%&#/^SE";
const TRACE_WINDOW = 60;
const FRAME_MS = 60;

const TITLE = "[EBYCOW.NET]";
const HASH = "[nya256]";

const MAX_NORMAL_TRACE = CHARS.length - 3;
const START_MARK = CHARS.length - 2;
const END_MARK = CHARS.length - 1;

const startX = (Math.random() * FLDSIZE_X) | 0;
const startY = (Math.random() * FLDSIZE_Y) | 0;

const field: number[][] = Array.from({ length: FLDSIZE_X }, () =>
  Array(FLDSIZE_Y).fill(-Infinity)
);

let x = startX;
let y = startY;
let inputBits = 0;
let remainingMoves = 0;
let tick = 0;
let lastFrameTs = 0;

const art = document.getElementById("art") as HTMLPreElement;

const blobs = [
  { x: 50, y: 50, speed: 0.10 },
  { x: 50, y: 50, speed: 0.06 },
  { x: 50, y: 50, speed: 0.035 },
  { x: 50, y: 50, speed: 0.018 },
  { x: 50, y: 50, speed: 0.010 },
];

function bishopToViewportPct(): { tx: number; ty: number } {
  const rect = art.getBoundingClientRect();
  const charW = rect.width / (FLDSIZE_X + 2);
  const charH = rect.height / (FLDSIZE_Y + 2);
  const px = rect.left + (x + 1.5) * charW;
  const py = rect.top + (y + 1.5) * charH;
  return {
    tx: (px / window.innerWidth) * 100,
    ty: (py / window.innerHeight) * 100,
  };
}

function updateGradient(): void {
  const { tx, ty } = bishopToViewportPct();
  for (let i = 0; i < blobs.length; i++) {
    const b = blobs[i];
    b.x += (tx - b.x) * b.speed;
    b.y += (ty - b.y) * b.speed;
    document.body.style.setProperty(`--g${i + 1}x`, `${b.x.toFixed(2)}%`);
    document.body.style.setProperty(`--g${i + 1}y`, `${b.y.toFixed(2)}%`);
  }
}

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

function nextMoveBits(): number {
  if (remainingMoves === 0) {
    inputBits = (Math.random() * 256) | 0;
    remainingMoves = 4;
  }
  const bits = inputBits & 0x3;
  inputBits >>= 2;
  remainingMoves -= 1;
  return bits;
}

function step(): void {
  const bits = nextMoveBits();
  tick += 1;

  x += (bits & 0x1) ? 1 : -1;
  y += (bits & 0x2) ? 1 : -1;

  x = clamp(x, 0, FLDSIZE_X - 1);
  y = clamp(y, 0, FLDSIZE_Y - 1);

  field[x][y] = tick;
}

function traceLevel(lastVisitedTick: number): number {
  const age = tick - lastVisitedTick;
  if (age < 0 || age > TRACE_WINDOW) return 0;
  const level = MAX_NORMAL_TRACE - Math.floor((age / TRACE_WINDOW) * MAX_NORMAL_TRACE);
  return clamp(level, 1, MAX_NORMAL_TRACE);
}

function buildBorder(label: string): string {
  const left = Math.floor((FLDSIZE_X - label.length) / 2);
  const right = FLDSIZE_X - left - label.length;
  return `+${"-".repeat(left)}${label}${"-".repeat(right)}+`;
}

function cellHtml(idx: number, level: number): string {
  if (idx === 0) return " ";
  // E/S treated as freshest; normal cells: fresh=red(0) → old=violet(270)
  const effectiveLevel = (idx === END_MARK || idx === START_MARK) ? MAX_NORMAL_TRACE : level;
  const hue = (1 - (effectiveLevel - 1) / (MAX_NORMAL_TRACE - 1)) * 270;
  const colorStyle = `color:hsl(${hue.toFixed(1)},100%,60%)`;
  if (idx === END_MARK) {
    return `<a href="https://github.com/Ebycow" style="${colorStyle};text-decoration:underline;cursor:pointer">E</a>`;
  }
  const raw = CHARS[idx];
  const char = raw === "&" ? "&amp;" : raw;
  return `<span style="${colorStyle}">${char}</span>`;
}

function render(): void {
  const view = field.map((col) => col.map(traceLevel));

  if (tick <= TRACE_WINDOW) view[startX][startY] = START_MARK;
  view[x][y] = END_MARK;

  const rows = [`${buildBorder(TITLE)}\n`];
  for (let yy = 0; yy < FLDSIZE_Y; yy++) {
    let row = "|";
    for (let xx = 0; xx < FLDSIZE_X; xx++) {
      const lvl = view[xx][yy];
      row += cellHtml(Math.min(lvl, CHARS.length - 1), lvl);
    }
    rows.push(row + "|\n");
  }
  rows.push(buildBorder(HASH));

  art.innerHTML = rows.join("");
}

function animate(ts: number): void {
  if (!lastFrameTs || ts - lastFrameTs >= FRAME_MS) {
    step();
    render();
    updateGradient();
    lastFrameTs = ts;
  }
  requestAnimationFrame(animate);
}

render();
requestAnimationFrame(animate);
