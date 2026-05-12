import { bandcampWorks, type BandcampWork } from './bandcamp-works';
import { githubProjects, type GitHubProject } from './github-projects';
import './style.css';

type TimelineItem =
  | {
      source: 'music';
      date: string;
      dateLabel: string;
      data: BandcampWork;
    }
  | {
      source: 'project';
      date: string;
      dateLabel: string;
      data: GitHubProject;
    };

function createMetaItem(label: string, value: string): HTMLDivElement | null {
  if (!value) return null;

  const item = document.createElement('div');
  item.className = 'meta-item';

  const labelElement = document.createElement('dt');
  labelElement.textContent = label;

  const valueElement = document.createElement('dd');
  valueElement.textContent = value;

  item.append(labelElement, valueElement);
  return item;
}

function sortByDateDesc(a: TimelineItem, b: TimelineItem): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function getTimelineItems(): TimelineItem[] {
  const musicItems: TimelineItem[] = bandcampWorks.map((work) => ({
    source: 'music',
    date: work.releaseDate,
    dateLabel: work.releaseDateLabel,
    data: work,
  }));

  const projectItems: TimelineItem[] = githubProjects.map((project) => ({
    source: 'project',
    date: project.createdAt,
    dateLabel: project.createdAtLabel,
    data: project,
  }));

  return [...musicItems, ...projectItems].sort(sortByDateDesc);
}

function createProjectPlaceholder(project: GitHubProject): HTMLSpanElement {
  const placeholder = document.createElement('span');
  placeholder.className = 'artwork-placeholder project-placeholder';

  const icon = document.createElement('i');
  icon.className = 'fa-brands fa-github placeholder-icon';
  icon.setAttribute('aria-hidden', 'true');

  const source = document.createElement('span');
  source.className = 'placeholder-source';
  source.textContent = 'GitHub';

  const title = document.createElement('span');
  title.className = 'placeholder-title';
  title.textContent = project.title;

  placeholder.append(icon, source, title);
  return placeholder;
}

function createArtwork(item: TimelineItem): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = `artwork ${item.source === 'project' ? 'project-artwork' : ''}`;
  link.href = item.data.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  if (item.source === 'music') {
    link.setAttribute('aria-label', `${item.data.title} をBandcampで開く`);

    if (item.data.image) {
      const image = document.createElement('img');
      image.src = item.data.image;
      image.alt = `${item.data.title} のアートワーク`;
      image.loading = 'lazy';
      image.decoding = 'async';
      link.append(image);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'artwork-placeholder';
      placeholder.textContent = item.data.title;
      link.append(placeholder);
    }
  } else {
    link.setAttribute('aria-label', `${item.data.title} をGitHubで開く`);
    link.append(createProjectPlaceholder(item.data));
  }

  return link;
}

function getEyebrow(item: TimelineItem): string {
  if (item.source === 'music') return item.data.format;
  return 'GitHub Project';
}

function getSourceIconClass(item: TimelineItem): string {
  return item.source === 'music' ? 'fa-solid fa-music' : 'fa-brands fa-github';
}

function getCtaIconClass(item: TimelineItem): string {
  return item.source === 'music' ? 'fa-brands fa-bandcamp' : 'fa-brands fa-github';
}

function getMetaItems(item: TimelineItem): Array<HTMLDivElement | null> {
  if (item.source === 'music') {
    return [
      createMetaItem('リリース', item.dateLabel),
      createMetaItem('形式', item.data.format),
      createMetaItem('曲数', item.data.trackCount),
    ];
  }

  return [
    createMetaItem('作成', item.dateLabel),
    createMetaItem('種別', 'Repository'),
    createMetaItem('言語', item.data.language || 'N/A'),
  ];
}

function getDescription(item: TimelineItem): string {
  if (item.data.description) return item.data.description;
  return item.source === 'music' ? 'Bandcampで詳細を確認できます。' : 'GitHubで詳細を確認できます。';
}

function getCtaLabel(item: TimelineItem): string {
  return item.source === 'music' ? 'Bandcampで聴く' : 'GitHubで見る';
}

function createTimelineCard(item: TimelineItem): HTMLElement {
  const article = document.createElement('article');
  article.className = `work-card ${item.source === 'project' ? 'project-card' : 'music-card'}`;

  const body = document.createElement('div');
  body.className = 'work-body';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';

  const eyebrowIcon = document.createElement('i');
  eyebrowIcon.className = getSourceIconClass(item);
  eyebrowIcon.setAttribute('aria-hidden', 'true');

  const eyebrowText = document.createElement('span');
  eyebrowText.textContent = getEyebrow(item);

  eyebrow.append(eyebrowIcon, eyebrowText);

  const titleLink = document.createElement('a');
  titleLink.href = item.data.url;
  titleLink.target = '_blank';
  titleLink.rel = 'noopener noreferrer';
  titleLink.textContent = item.data.title;

  const title = document.createElement('h2');
  title.append(titleLink);

  const meta = document.createElement('dl');
  meta.className = 'metadata';
  meta.append(...getMetaItems(item).filter((metaItem): metaItem is HTMLDivElement => metaItem !== null));

  const description = document.createElement('p');
  description.className = 'description';
  description.textContent = getDescription(item);

  const cta = document.createElement('a');
  cta.className = 'external-link';
  cta.href = item.data.url;
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';

  const ctaIcon = document.createElement('i');
  ctaIcon.className = getCtaIconClass(item);
  ctaIcon.setAttribute('aria-hidden', 'true');

  const ctaText = document.createElement('span');
  ctaText.textContent = getCtaLabel(item);

  cta.append(ctaIcon, ctaText);

  body.append(eyebrow, title, meta, description, cta);
  article.append(createArtwork(item), body);
  return article;
}

function setupScrollTopButton(): void {
  const button = document.querySelector<HTMLButtonElement>('.scroll-top-button');
  if (!button) return;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateButtonVisibility = () => {
    const isVisible = window.scrollY > 420;
    button.classList.toggle('is-visible', isVisible);
    button.tabIndex = isVisible ? 0 : -1;
  };

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotionQuery.matches ? 'auto' : 'smooth',
    });
  });

  updateButtonVisibility();
  window.addEventListener('scroll', updateButtonVisibility, { passive: true });
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app element.');
}

setupScrollTopButton();

const fragment = document.createDocumentFragment();
for (const item of getTimelineItems()) {
  fragment.append(createTimelineCard(item));
}

app.append(fragment);
