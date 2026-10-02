// ビルド時（vite.config.ts）に呼ばれ、一覧を静的 HTML として書き出す
import { bandcampWorks, type BandcampWork } from './bandcamp-works';
import { projects, type Project } from './projects';

// 表示する Bandcamp 作品（この順に並ぶ）
const FEATURED_MUSIC_URLS = [
  'https://ebycow.bandcamp.com/album/zur-ckkehren',
  'https://ebycow.bandcamp.com/album/touchstones',
  'https://ebycow.bandcamp.com/track/yakisoba-no-aonori',
  'https://ebycow.bandcamp.com/track/--9',
  'https://ebycow.bandcamp.com/album/splitting',
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function externalAttrs(href: string): string {
  return `href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
}

function getFeaturedWorks(): BandcampWork[] {
  return FEATURED_MUSIC_URLS.map((url) => {
    const work = bandcampWorks.find((item) => item.url === url);
    if (!work) {
      throw new Error(`Bandcamp work not found: ${url}`);
    }
    return work;
  });
}

function getReleaseMeta(work: BandcampWork): string {
  return `${work.releaseDateLabel.slice(0, 4)} · ${work.format}`;
}

function renderMusicItem(work: BandcampWork): string {
  // Bandcamp の _16 は 700px 四方
  const image = work.image.replace(/_10\.jpg$/, '_16.jpg');
  return `<li>
        <a class="release" ${externalAttrs(work.url)}>
          <img src="${escapeHtml(image)}" alt="" width="700" height="700" loading="lazy" decoding="async" />
          <span class="release-caption">
            <span class="release-title">${escapeHtml(work.title)}</span>
            <span class="release-meta">${escapeHtml(getReleaseMeta(work))}</span>
          </span>
        </a>
      </li>`;
}

function renderProjectItem(project: Project): string {
  const note = project.note ? `<span class="item-note">${escapeHtml(project.note)}</span>` : '';
  return `<li class="item">
        <a class="item-title" ${externalAttrs(project.url)}>${escapeHtml(project.title)}</a>
        <span class="item-meta">${escapeHtml(`${project.date} · ${project.language}`)}</span>
        <p class="item-description">${escapeHtml(project.description)}${note}</p>
      </li>`;
}

export function renderMusicList(): string {
  return getFeaturedWorks().map(renderMusicItem).join('\n      ');
}

export function renderProjectList(): string {
  return projects.map(renderProjectItem).join('\n      ');
}
