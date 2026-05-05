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

const COLOR_TABLE: string[] = new Array(MAX_NORMAL_TRACE + 1);
for (let level = 1; level <= MAX_NORMAL_TRACE; level++) {
  const hue = (1 - (level - 1) / (MAX_NORMAL_TRACE - 1)) * 270;
  COLOR_TABLE[level] = `hsl(${hue.toFixed(1)},100%,60%)`;
}

const startX = (Math.random() * FLDSIZE_X) | 0;
const startY = (Math.random() * FLDSIZE_Y) | 0;

const field: number[][] = Array.from({ length: FLDSIZE_X }, () =>
  Array(FLDSIZE_Y).fill(-Infinity)
);
const view: number[][] = Array.from({ length: FLDSIZE_X }, () =>
  Array(FLDSIZE_Y).fill(0)
);
const cells: HTMLSpanElement[][] = Array.from({ length: FLDSIZE_X }, () =>
  Array<HTMLSpanElement>(FLDSIZE_Y)
);

let x = startX;
let y = startY;
let inputBits = 0;
let remainingMoves = 0;
let tick = 0;
let lastFrameTs = 0;

const art = document.getElementById("art") as HTMLPreElement;

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

function buildDom(): void {
  art.textContent = "";
  art.appendChild(document.createTextNode(`${buildBorder(TITLE)}\n`));
  for (let yy = 0; yy < FLDSIZE_Y; yy++) {
    art.appendChild(document.createTextNode("|"));
    for (let xx = 0; xx < FLDSIZE_X; xx++) {
      const span = document.createElement("span");
      span.textContent = " ";
      cells[xx][yy] = span;
      art.appendChild(span);
    }
    art.appendChild(document.createTextNode("|\n"));
  }
  art.appendChild(document.createTextNode(buildBorder(HASH)));
}

function render(): void {
  for (let xx = 0; xx < FLDSIZE_X; xx++) {
    for (let yy = 0; yy < FLDSIZE_Y; yy++) {
      view[xx][yy] = traceLevel(field[xx][yy]);
    }
  }

  if (tick <= TRACE_WINDOW) view[startX][startY] = START_MARK;
  view[x][y] = END_MARK;

  for (let yy = 0; yy < FLDSIZE_Y; yy++) {
    for (let xx = 0; xx < FLDSIZE_X; xx++) {
      const span = cells[xx][yy];
      const lvl = view[xx][yy];
      const idx = Math.min(lvl, CHARS.length - 1);

      if (idx === 0) {
        span.style.color = "";
        span.textContent = " ";
        continue;
      }

      const effectiveLevel = idx >= START_MARK ? MAX_NORMAL_TRACE : lvl;
      span.style.color = COLOR_TABLE[effectiveLevel];
      span.textContent = CHARS[idx];
    }
  }
}

function animate(ts: number): void {
  if (!lastFrameTs || ts - lastFrameTs >= FRAME_MS) {
    step();
    render();
    lastFrameTs = ts;
  }
  requestAnimationFrame(animate);
}

buildDom();
render();
requestAnimationFrame(animate);
