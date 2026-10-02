// ビルド済みの index.html から llms.txt（Markdown）を作る。
// ページの文面はすべて index.html 側が正なので、ここには内容を書かない。
import { parseHTML } from 'linkedom';

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function link(el: Element): string {
  return `[${collapse(el.textContent ?? '')}](${el.getAttribute('href')})`;
}

// 段落内のテキストを、リンクを Markdown にしながら 1 行にする
function inline(node: Node): string {
  let out = '';
  for (const child of node.childNodes) {
    if (child.nodeType === child.TEXT_NODE) {
      out += child.textContent;
    } else if (child.nodeType === child.ELEMENT_NODE) {
      const el = child as Element;
      if (el.tagName === 'A') {
        out += ` ${link(el)} `;
      } else if (el.classList.contains('item-note')) {
        out += `（${collapse(el.textContent ?? '')}）`;
      } else {
        out += inline(el);
      }
    }
  }
  return collapse(out);
}

function listItem(li: Element): string {
  const release = li.querySelector('.release');
  if (release) {
    const title = collapse(li.querySelector('.release-title')?.textContent ?? '');
    const meta = collapse(li.querySelector('.release-meta')?.textContent ?? '');
    return `- [${title}](${release.getAttribute('href')}): ${meta}`;
  }

  const title = li.querySelector('.item-title');
  if (!title) {
    throw new Error(`llms.txt: リスト項目にタイトルがありません: ${collapse(li.textContent ?? '')}`);
  }
  const meta = collapse(li.querySelector('.item-meta')?.textContent ?? '');
  const description = li.querySelector('.item-description');
  const body = description ? inline(description) : '';
  return `- ${link(title)}: ${body}${meta ? ` — ${meta}` : ''}`;
}

function section(el: Element): string {
  const heading = el.querySelector('h2');
  if (!heading) {
    throw new Error('llms.txt: section に h2 がありません');
  }
  const headingText = collapse(
    [...heading.childNodes]
      .filter((node) => node.nodeType === node.TEXT_NODE)
      .map((node) => node.textContent)
      .join(''),
  );

  const lines = [`## ${headingText}`, ''];
  const sectionLink = heading.querySelector('a');
  if (sectionLink) {
    lines.push(`- ${link(sectionLink)}: すべて見る`);
  }
  const items = [...el.querySelectorAll('li')];
  if (items.length === 0) {
    throw new Error(`llms.txt: ${headingText} の項目が空です`);
  }
  lines.push(...items.map(listItem));
  return lines.join('\n');
}

export function htmlToLlmsTxt(html: string): string {
  const { document } = parseHTML(html);

  const h1 = document.querySelector('h1');
  if (!h1) {
    throw new Error('llms.txt: h1 がありません');
  }
  const [summary, ...details] = [...document.querySelectorAll('.profile p')].map(inline);
  const url = document.querySelector('meta[property="og:url"]')?.getAttribute('content');

  const blocks = [
    `# ${collapse(h1.textContent ?? '')}`,
    `> ${summary}`,
    [url ? `- サイト: ${url}` : '', ...details.map((line) => `- ${line}`)].filter(Boolean).join('\n'),
    ...[...document.querySelectorAll('section.section')].map(section),
  ];
  return `${blocks.join('\n\n')}\n`;
}
