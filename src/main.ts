import './style.css';

const FLDBASE = 16;
const FLDSIZE_Y = FLDBASE + 1;
const FLDSIZE_X = FLDBASE * 2 + 1;
const CHARS = " .o+=*BOX@%&#/^SE";
const TRACE_WINDOW = 60;
const FRAME_MS = 60;
const CELL_COUNT = FLDSIZE_X * FLDSIZE_Y;

const TITLE = "[EBYCOW.NET]";
const HASH = "[nya256]";

const MAX_NORMAL_TRACE = CHARS.length - 3;
const START_MARK = CHARS.length - 2;
const END_MARK = CHARS.length - 1;

const COLOR_TABLE: string[] = new Array(MAX_NORMAL_TRACE + 1).fill("");
for (let level = 1; level <= MAX_NORMAL_TRACE; level++) {
  const hue = (1 - (level - 1) / (MAX_NORMAL_TRACE - 1)) * 270;
  COLOR_TABLE[level] = `hsl(${hue.toFixed(1)},100%,60%)`;
}

const TRACE_LEVELS = new Uint8Array(TRACE_WINDOW + 1);
for (let age = 0; age <= TRACE_WINDOW; age++) {
  TRACE_LEVELS[age] = Math.max(
    1,
    MAX_NORMAL_TRACE - Math.floor((age / TRACE_WINDOW) * MAX_NORMAL_TRACE)
  );
}

const startX = (Math.random() * FLDSIZE_X) | 0;
const startY = (Math.random() * FLDSIZE_Y) | 0;
const startIndex = startY * FLDSIZE_X + startX;

const field = new Uint32Array(CELL_COUNT);
const rendered = new Uint8Array(CELL_COUNT);
const cells = new Array<HTMLSpanElement>(CELL_COUNT);

let x = startX;
let y = startY;
let inputBits = 0;
let remainingMoves = 0;
let tick = 0;
let lastFrameTs = 0;

const art = document.getElementById("art") as HTMLPreElement;

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

  if (x < 0) x = 0;
  else if (x >= FLDSIZE_X) x = FLDSIZE_X - 1;

  if (y < 0) y = 0;
  else if (y >= FLDSIZE_Y) y = FLDSIZE_Y - 1;

  field[y * FLDSIZE_X + x] = tick;
}

function buildBorder(label: string): string {
  const left = Math.floor((FLDSIZE_X - label.length) / 2);
  const right = FLDSIZE_X - left - label.length;
  return `+${"-".repeat(left)}${label}${"-".repeat(right)}+`;
}

function buildDom(): void {
  const fragment = document.createDocumentFragment();

  fragment.appendChild(document.createTextNode(`${buildBorder(TITLE)}\n`));
  for (let yy = 0; yy < FLDSIZE_Y; yy++) {
    const rowOffset = yy * FLDSIZE_X;

    fragment.appendChild(document.createTextNode("|"));
    for (let xx = 0; xx < FLDSIZE_X; xx++) {
      const span = document.createElement("span");
      span.textContent = " ";
      cells[rowOffset + xx] = span;
      fragment.appendChild(span);
    }
    fragment.appendChild(document.createTextNode("|\n"));
  }
  fragment.appendChild(document.createTextNode(buildBorder(HASH)));
  art.replaceChildren(fragment);
}

function render(): void {
  const currentIndex = y * FLDSIZE_X + x;
  for (let yy = 0; yy < FLDSIZE_Y; yy++) {
    const rowOffset = yy * FLDSIZE_X;

    for (let xx = 0; xx < FLDSIZE_X; xx++) {
      const cellIndex = rowOffset + xx;
      const lastVisitedTick = field[cellIndex];
      const age = tick - lastVisitedTick;
      let level =
        lastVisitedTick > 0 && age <= TRACE_WINDOW ? TRACE_LEVELS[age] : 0;

      if (tick <= TRACE_WINDOW && cellIndex === startIndex) level = START_MARK;
      if (cellIndex === currentIndex) level = END_MARK;
      if (rendered[cellIndex] === level) continue;

      const colorLevel = level >= START_MARK ? MAX_NORMAL_TRACE : level;
      const span = cells[cellIndex];
      rendered[cellIndex] = level;
      span.style.color = COLOR_TABLE[colorLevel];
      span.textContent = CHARS[level];
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
