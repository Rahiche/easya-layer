import fs from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export function inject() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  
  return {
    name: 'inject-css',
    setup(build) {
      build.onResolve({ filter: /\.css$/ }, args => {
        return { path: resolve(args.resolveDir, args.path) }
      })

      build.onLoad({ filter: /\.css$/ }, async (args) => {
        const css = await fs.promises.readFile(args.path, 'utf8')
        const contents = `
          const style = document.createElement('style')
          style.dataset.source = '${args.path}'
          style.textContent = ${JSON.stringify(css)}
          document.head.appendChild(style)
        `
        return { contents, loader: 'js' }
      })
    }
  }
}