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
const TRACE_BANDS = new Uint8Array([1, 2, 4, 6, 8, 10, 12, MAX_NORMAL_TRACE]);

const COLOR_TABLE: string[] = new Array(END_MARK + 1).fill("");
for (let level = 1; level <= END_MARK; level++) {
  const colorLevel = level >= START_MARK ? MAX_NORMAL_TRACE : level;
  const hue = (1 - (colorLevel - 1) / (MAX_NORMAL_TRACE - 1)) * 270;
  COLOR_TABLE[level] = `hsl(${hue.toFixed(1)},100%,60%)`;
}

const TRACE_LEVELS = new Uint8Array(TRACE_WINDOW + 2);
const LAST_TRACE_BAND = TRACE_BANDS.length - 1;
for (let age = 0; age <= TRACE_WINDOW; age++) {
  const band = LAST_TRACE_BAND - Math.floor((age / TRACE_WINDOW) * TRACE_BANDS.length);
  TRACE_LEVELS[age] = TRACE_BANDS[Math.max(0, band)];
}

const FADE_CHANGE_AGES = (() => {
  const ages: number[] = [];
  let previousLevel = END_MARK;

  for (let age = 1; age <= TRACE_WINDOW + 1; age++) {
    const level = TRACE_LEVELS[age];
    if (level !== previousLevel) ages.push(age);
    previousLevel = level;
  }

  return new Uint8Array(ages);
})();

const UPDATE_BUCKET_COUNT = TRACE_WINDOW + 2;
const updateBuckets = Array.from({ length: UPDATE_BUCKET_COUNT }, () => [] as number[]);

const startX = (Math.random() * FLDSIZE_X) | 0;
const startY = (Math.random() * FLDSIZE_Y) | 0;
const startIndex = startY * FLDSIZE_X + startX;

const field = new Uint32Array(CELL_COUNT);
const rendered = new Uint8Array(CELL_COUNT);
const queued = new Uint8Array(CELL_COUNT);
const dirtyCells = new Uint16Array(CELL_COUNT);
const cells = new Array<HTMLSpanElement>(CELL_COUNT);
const glyphNodes = new Array<Text>(CELL_COUNT);

let x = startX;
let y = startY;
let currentIndex = startIndex;
let dirtyCount = 0;
let inputBits = 0;
let remainingMoves = 0;
let tick = 0;
let lastFrameTs = 0;

const artElement = document.getElementById("art");
if (!(artElement instanceof HTMLPreElement)) {
  throw new Error('Missing <pre id="art"> element.');
}
const art = artElement;

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

function queueCell(cellIndex: number): void {
  if (queued[cellIndex] === 1) return;
  queued[cellIndex] = 1;
  dirtyCells[dirtyCount] = cellIndex;
  dirtyCount += 1;
}

function scheduleFade(cellIndex: number): void {
  for (let i = 0; i < FADE_CHANGE_AGES.length; i++) {
    const age = FADE_CHANGE_AGES[i];
    updateBuckets[(tick + age) % UPDATE_BUCKET_COUNT].push(cellIndex);
  }
}

function flushScheduledUpdates(): void {
  const bucket = updateBuckets[tick % UPDATE_BUCKET_COUNT];

  for (let i = 0; i < bucket.length; i++) {
    queueCell(bucket[i]);
  }

  bucket.length = 0;
}

function step(): void {
  const previousIndex = currentIndex;
  const bits = nextMoveBits();
  tick += 1;

  x += (bits & 0x1) ? 1 : -1;
  y += (bits & 0x2) ? 1 : -1;

  if (x < 0) x = 0;
  else if (x >= FLDSIZE_X) x = FLDSIZE_X - 1;

  if (y < 0) y = 0;
  else if (y >= FLDSIZE_Y) y = FLDSIZE_Y - 1;

  currentIndex = y * FLDSIZE_X + x;
  field[currentIndex] = tick;
  scheduleFade(currentIndex);
  queueCell(previousIndex);
  queueCell(currentIndex);
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
      const cellIndex = rowOffset + xx;
      const span = document.createElement("span");
      const glyph = document.createTextNode(" ");

      span.appendChild(glyph);
      cells[cellIndex] = span;
      glyphNodes[cellIndex] = glyph;
      fragment.appendChild(span);
    }
    fragment.appendChild(document.createTextNode("|\n"));
  }
  fragment.appendChild(document.createTextNode(buildBorder(HASH)));
  art.replaceChildren(fragment);
}

function getCellLevel(cellIndex: number): number {
  if (cellIndex === currentIndex) return END_MARK;
  if (tick <= TRACE_WINDOW && cellIndex === startIndex) return START_MARK;

  const lastVisitedTick = field[cellIndex];
  const age = tick - lastVisitedTick;

  return lastVisitedTick > 0 && age <= TRACE_WINDOW ? TRACE_LEVELS[age] : 0;
}

function renderCell(cellIndex: number): void {
  const level = getCellLevel(cellIndex);
  const previousLevel = rendered[cellIndex];
  if (previousLevel === level) return;

  rendered[cellIndex] = level;
  if (COLOR_TABLE[previousLevel] !== COLOR_TABLE[level]) {
    cells[cellIndex].style.color = COLOR_TABLE[level];
  }
  glyphNodes[cellIndex].data = CHARS[level];
}

function renderDirty(): void {
  flushScheduledUpdates();

  for (let i = 0; i < dirtyCount; i++) {
    const cellIndex = dirtyCells[i];
    queued[cellIndex] = 0;
    renderCell(cellIndex);
  }

  dirtyCount = 0;
}

function animate(ts: number): void {
  if (!lastFrameTs || ts - lastFrameTs >= FRAME_MS) {
    step();
    renderDirty();
    lastFrameTs = ts;
  }
  requestAnimationFrame(animate);
}

buildDom();
updateBuckets[(TRACE_WINDOW + 1) % UPDATE_BUCKET_COUNT].push(startIndex);
queueCell(startIndex);
renderDirty();
requestAnimationFrame(animate);
