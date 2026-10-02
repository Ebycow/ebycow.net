import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { htmlToLlmsTxt } from './src/llms'
import { renderMusicList, renderProjectList } from './src/render'

// 一覧を HTML に埋め込み、出来上がった HTML から llms.txt を生成する。
// JS を実行しないクローラーや LLM にも内容が見え、読み込み後のレイアウトシフトも起きない。
function prerender(): Plugin {
  return {
    name: 'prerender',
    transformIndexHtml(html) {
      return html
        .replace('<!-- music-list -->', renderMusicList())
        .replace('<!-- code-list -->', renderProjectList())
    },
    configureServer(server) {
      server.middlewares.use('/llms.txt', async (_req, res, next) => {
        try {
          const source = await readFile(join(server.config.root, 'index.html'), 'utf8')
          const html = await server.transformIndexHtml('/', source)
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(htmlToLlmsTxt(html))
        } catch (error) {
          next(error)
        }
      })
    },
    async writeBundle(options, bundle) {
      const page = bundle['index.html']
      if (page?.type !== 'asset' || !options.dir) {
        throw new Error('llms.txt: ビルド済みの index.html が見つかりません')
      }
      await writeFile(join(options.dir, 'llms.txt'), htmlToLlmsTxt(String(page.source)))
    },
  }
}

export default defineConfig({
  plugins: [prerender()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
