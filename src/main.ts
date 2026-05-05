import './style.css';

const FLDBASE = 16;
const FLDSIZE_Y = FLDBASE + 1;
const FLDSIZE_X = FLDBASE * 2 + 1;
const LAST_X = FLDSIZE_X - 1;
const LAST_Y = FLDSIZE_Y - 1;
const TRACE_WINDOW = 60;
const FRAME_MS = 60;
const CELL_COUNT = FLDSIZE_X * FLDSIZE_Y;
const VISIT_HISTORY_SIZE = TRACE_WINDOW + 2;
const RANDOM_MOVE_BATCH_SIZE = 16;
const RANDOM_MOVE_BITS = 0x100000000;

const TITLE = "[EBYCOW.NET]";
const HASH = "[nya256]";

const GLYPHS = " .o+=*BOX@%&#/^SE";
const START_MARK = GLYPHS.length - 2;
const END_MARK = GLYPHS.length - 1;
const START_COLOR_LEVEL = START_MARK - 1;
const QUEUED_FLAG = 0x80;
const LEVEL_MASK = 0x7f;

const COLOR_BY_LEVEL = [
  "",
  "#9933ff",
  "#5233ff",
  "#335aff",
  "#33a1ff",
  "#33e8ff",
  "#33ffd0",
  "#33ff89",
  "#33ff43",
  "#6aff33",
  "#b0ff33",
  "#f7ff33",
  "#ffc033",
  "#ff7a33",
  "#ff3333",
] as const;
const TRACE_LEVELS = new Uint8Array([
  14, 14, 14, 14, 14, 14, 14, 14,
  12, 12, 12, 12, 12, 12, 12,
  10, 10, 10, 10, 10, 10, 10, 10,
  8, 8, 8, 8, 8, 8, 8,
  6, 6, 6, 6, 6, 6, 6, 6,
  4, 4, 4, 4, 4, 4, 4,
  2, 2, 2, 2, 2, 2, 2, 2,
  1, 1, 1, 1, 1, 1, 1, 1,
  0,
]);
const FADE_CHANGE_AGES = new Uint8Array([1, 8, 15, 23, 30, 38, 45, 53, 61]);
const FADE_CHANGE_AGE_COUNT = FADE_CHANGE_AGES.length;
const MAX_DIRTY_CELLS = FADE_CHANGE_AGE_COUNT + 1;

const startX = (Math.random() * FLDSIZE_X) | 0;
const startY = (Math.random() * FLDSIZE_Y) | 0;
const startIndex = startY * FLDSIZE_X + startX;

const field = new Uint32Array(CELL_COUNT);
const rendered = new Uint8Array(CELL_COUNT);
const painted = new Uint8Array(CELL_COUNT);
const dirtyCells = new Uint16Array(MAX_DIRTY_CELLS);
const visitHistory = new Uint16Array(VISIT_HISTORY_SIZE);
const cellStyles = new Array<CSSStyleDeclaration>(CELL_COUNT);
const glyphNodes = new Array<Text>(CELL_COUNT);

let x = startX;
let y = startY;
let currentIndex = startIndex;
let dirtyCount = 0;
let inputBits = 0;
let remainingMoves = 0;
let tick = 0;
let historyCursor = 0;
let activeFadeAgeCount = 0;
let nextFrameTs = 0;
visitHistory[0] = startIndex;

const artElement = document.getElementById("art");
if (!(artElement instanceof HTMLPreElement)) {
  throw new Error('Missing <pre id="art"> element.');
}
const art = artElement;

function nextMoveBits(): number {
  if (remainingMoves === 0) {
    inputBits = (Math.random() * RANDOM_MOVE_BITS) >>> 0;
    remainingMoves = RANDOM_MOVE_BATCH_SIZE;
  }
  const bits = inputBits & 0x3;
  inputBits >>>= 2;
  remainingMoves -= 1;
  return bits;
}

function queueCell(cellIndex: number): void {
  if ((rendered[cellIndex] & QUEUED_FLAG) !== 0) return;
  rendered[cellIndex] |= QUEUED_FLAG;
  dirtyCells[dirtyCount] = cellIndex;
  dirtyCount += 1;
}

function queueFadingCells(): void {
  if (activeFadeAgeCount < FADE_CHANGE_AGE_COUNT && tick >= FADE_CHANGE_AGES[activeFadeAgeCount]) {
    activeFadeAgeCount += 1;
  }

  for (let i = 0; i < activeFadeAgeCount; i++) {
    const age = FADE_CHANGE_AGES[i];
    let historyIndex = historyCursor + VISIT_HISTORY_SIZE - age;
    if (historyIndex >= VISIT_HISTORY_SIZE) historyIndex -= VISIT_HISTORY_SIZE;
    queueCell(visitHistory[historyIndex]);
  }
}

function step(): void {
  const bits = nextMoveBits();
  tick += 1;

  x += ((bits & 0x1) << 1) - 1;
  y += (bits & 0x2) - 1;

  if (x < 0) x = 0;
  else if (x > LAST_X) x = LAST_X;

  if (y < 0) y = 0;
  else if (y > LAST_Y) y = LAST_Y;

  currentIndex = y * FLDSIZE_X + x;
  field[currentIndex] = tick;
  historyCursor += 1;
  if (historyCursor === VISIT_HISTORY_SIZE) historyCursor = 0;
  visitHistory[historyCursor] = currentIndex;

  queueFadingCells();
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
    const rowEnd = rowOffset + FLDSIZE_X;

    fragment.appendChild(document.createTextNode("|"));
    for (let cellIndex = rowOffset; cellIndex < rowEnd; cellIndex++) {
      const span = document.createElement("span");
      const glyph = document.createTextNode(" ");

      span.appendChild(glyph);
      cellStyles[cellIndex] = span.style;
      glyphNodes[cellIndex] = glyph;
      fragment.appendChild(span);
    }
    fragment.appendChild(document.createTextNode("|\n"));
  }
  fragment.appendChild(document.createTextNode(buildBorder(HASH)));
  art.replaceChildren(fragment);
}

function renderDirty(): void {
  for (let i = 0; i < dirtyCount; i++) {
    const cellIndex = dirtyCells[i];
    const previousLevel = rendered[cellIndex] & LEVEL_MASK;

    let level = 0;
    if (cellIndex === currentIndex) {
      level = END_MARK;
    } else if (tick <= TRACE_WINDOW && cellIndex === startIndex) {
      level = START_MARK;
    } else {
      const lastVisitedTick = field[cellIndex];
      if (lastVisitedTick > 0) {
        const age = tick - lastVisitedTick;
        if (age <= TRACE_WINDOW) level = TRACE_LEVELS[age];
      }
    }

    rendered[cellIndex] = level;
    if (previousLevel === level) continue;

    const colorLevel = level < START_MARK ? level : START_COLOR_LEVEL;
    if (colorLevel > 0 && painted[cellIndex] !== colorLevel) {
      painted[cellIndex] = colorLevel;
      cellStyles[cellIndex].color = COLOR_BY_LEVEL[colorLevel];
    }
    glyphNodes[cellIndex].data = GLYPHS[level];
  }

  dirtyCount = 0;
}

function animate(ts: number): void {
  if (ts >= nextFrameTs) {
    step();
    renderDirty();
    nextFrameTs = ts + FRAME_MS;
  }
  requestAnimationFrame(animate);
}

buildDom();
queueCell(startIndex);
renderDirty();
requestAnimationFrame(animate);
