const FLDBASE = 16;
const FLDSIZE_Y = FLDBASE + 1;
const FLDSIZE_X = FLDBASE * 2 + 1;
const CHARS = " .o+=*BOX@%&#/^SE";
const TRACE_WINDOW = 60;
const FRAME_MS = 60;

const TITLE = "[EBYCOW.NET]";
const HASH = "[nya256]";
const GITHUB_LINK = `<a href="https://github.com/Ebycow" style="color:red;text-decoration:underline;cursor:pointer">E</a>`;

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

function cellHtml(idx: number): string {
  if (idx === END_MARK) return GITHUB_LINK;
  return CHARS[idx] === "&" ? "&amp;" : CHARS[idx];
}

function render(): void {
  const view = field.map((col) => col.map(traceLevel));

  if (tick <= TRACE_WINDOW) view[startX][startY] = START_MARK;
  view[x][y] = END_MARK;

  const rows = [`${buildBorder(TITLE)}\n`];
  for (let yy = 0; yy < FLDSIZE_Y; yy++) {
    let row = "|";
    for (let xx = 0; xx < FLDSIZE_X; xx++) {
      row += cellHtml(Math.min(view[xx][yy], CHARS.length - 1));
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
    lastFrameTs = ts;
  }
  requestAnimationFrame(animate);
}

render();
requestAnimationFrame(animate);
