import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const BANDCAMP_ORIGIN = 'https://ebycow.bandcamp.com';
const BANDCAMP_MUSIC_URL = `${BANDCAMP_ORIGIN}/`;
const OUTPUT_FILE = path.resolve('src/bandcamp-works.ts');
const REQUEST_DELAY_MS = 150;
const MAX_RELEASES = Number.parseInt(process.env.BANDCAMP_LIMIT ?? '', 10) || 0;

const ENTITY_MAP = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, entity) => {
    if (entity[0] === '#') {
      const radix = entity[1]?.toLowerCase() === 'x' ? 16 : 10;
      const digits = radix === 16 ? entity.slice(2) : entity.slice(1);
      return String.fromCodePoint(Number.parseInt(digits, radix));
    }

    return ENTITY_MAP[entity] ?? `&${entity};`;
  });
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function getAttribute(html, name) {
  const match = html.match(new RegExp(`${name}=(["'])(.*?)\\1`, 's'));
  return match ? decodeEntities(match[2]) : '';
}

function absolutizeUrl(url) {
  return new URL(decodeEntities(url), BANDCAMP_ORIGIN).toString();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; ebycow.net build script)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function extractGridItems(html) {
  const grid = html.match(/<ol id="music-grid"[\s\S]*?<\/ol>/)?.[0];
  if (!grid) {
    throw new Error('Could not find Bandcamp music grid.');
  }

  const items = [];
  const itemBlocks = grid.matchAll(/<li\b(?=[^>]*data-item-id=)[\s\S]*?<\/li>/g);

  for (const [block] of itemBlocks) {
    const itemId = getAttribute(block, 'data-item-id');
    const href = block.match(/<a\b[^>]*href=(["'])(.*?)\1/i)?.[2];
    const title = block.match(/<p class="title">([\s\S]*?)<\/p>/i)?.[1];
    const image =
      block.match(/data-original=(["'])(.*?)\1/i)?.[2] ??
      block.match(/<img\b[^>]*src=(["'])(.*?)\1/i)?.[2];

    if (!itemId || !href || !title) continue;

    items.push({
      id: itemId,
      kind: itemId.startsWith('album-') ? 'album' : 'track',
      title: stripTags(title),
      url: absolutizeUrl(href),
      image: image && !image.endsWith('/img/0.gif') ? absolutizeUrl(image) : '',
    });
  }

  return MAX_RELEASES > 0 ? items.slice(0, MAX_RELEASES) : items;
}

function extractJsonLd(html, url) {
  const scripts = html.matchAll(
    /<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const [, , contents] of scripts) {
    const json = contents.trim();
    if (!json) continue;

    try {
      return JSON.parse(json);
    } catch (error) {
      throw new Error(`Could not parse JSON-LD from ${url}: ${error.message}`);
    }
  }

  throw new Error(`Could not find JSON-LD in ${url}.`);
}

function extractType(value) {
  const types = Array.isArray(value) ? value : [value];
  if (types.includes('MusicAlbum')) return 'Album';
  if (types.includes('MusicRecording')) return 'Track';
  return 'Release';
}

function extractFormat(item, data) {
  if (item.kind === 'track' && data.inAlbum?.albumReleaseType === 'SingleRelease') {
    return 'Single';
  }

  return extractType(data['@type']);
}

function extractImage(item, data) {
  if (typeof data.image === 'string') return data.image;
  if (Array.isArray(data.image) && typeof data.image[0] === 'string') return data.image[0];

  const releaseImage = data.inAlbum?.albumRelease?.[0]?.image?.[0] ?? data.albumRelease?.[0]?.image?.[0];
  if (typeof releaseImage === 'string') return releaseImage;

  return item.image;
}

function extractTrackCount(data) {
  const count = data.numTracks ?? data.inAlbum?.numTracks;
  if (typeof count === 'number' && count > 0) return `${count}`;
  return '';
}

function formatReleaseDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

function normalizeDescription(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

async function fetchRelease(item) {
  await sleep(REQUEST_DELAY_MS);

  const html = await fetchText(item.url);
  const data = extractJsonLd(html, item.url);
  const releaseDate = data.datePublished ?? '';

  return {
    id: item.id,
    title: data.name ?? item.title,
    releaseDate,
    releaseDateLabel: releaseDate ? formatReleaseDate(releaseDate) : '',
    format: extractFormat(item, data),
    trackCount: extractTrackCount(data),
    image: extractImage(item, data),
    url: data.mainEntityOfPage ?? data['@id'] ?? item.url,
    description: normalizeDescription(data.description),
  };
}

function serializeWorks(works) {
  return `// Generated by scripts/fetch-bandcamp.mjs. Do not edit by hand.
export type BandcampWork = {
  id: string;
  title: string;
  releaseDate: string;
  releaseDateLabel: string;
  format: string;
  trackCount: string;
  image: string;
  url: string;
  description: string;
};

export const bandcampWorks: BandcampWork[] = ${JSON.stringify(works, null, 2)};
`;
}

async function main() {
  const indexHtml = await fetchText(BANDCAMP_MUSIC_URL);
  const gridItems = extractGridItems(indexHtml);

  if (gridItems.length === 0) {
    throw new Error('No Bandcamp releases found.');
  }

  const works = [];
  for (const item of gridItems) {
    works.push(await fetchRelease(item));
  }

  await writeFile(OUTPUT_FILE, serializeWorks(works), 'utf8');
  console.log(`Fetched ${works.length} Bandcamp releases into ${path.relative(process.cwd(), OUTPUT_FILE)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
