import { defineConfig, type Connect, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

import site from "./.figma/make/site.json" with { type: "json" };

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'

  return {
    base: process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      jplProxyPlugin(),
      figmaSiteConfiguration(site),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.{ts,tsx,js,jsx}' }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
      watch: { ignored: ['**/.figma/**'] },
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
    },
  }
})

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
const JPL_BODY_IDS: Record<string, string> = {
  earth: '399',
  moon: '301',
  mercury: '199',
  venus: '299',
  mars: '499',
  jupiter: '599',
  saturn: '699',
  uranus: '799',
  neptune: '899',
}

function getJplBodyId(bodyId: string): string | null {
  return JPL_BODY_IDS[bodyId] ?? null
}

const JPL_HORIZONS_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api'

/**
 * Parse the JPL Horizons JSON response. The `result` field is a **text string**
 * containing the full Horizons output with vector data between $$SOE / $$EOE markers.
 *
 * Expected $$SOE block format (VEC_TABLE=2, OUT_UNITS=AU-D):
 * ```
 * 2461297.500000000 = A.D. 2026-Sep-14 00:00:00.0000 TDB
 *  X = 9.9325...E-01 Y =-1.6013...E-01 Z = 6.0701...E-06
 *  VX= 2.4569...E-03 VY= 1.6927...E-02 VZ=-6.5247...E-07
 * ```
 */
function parseHorizonsResult(
  resultText: string,
  bodyId: string,
  fallbackDate: string,
): { position: [number, number, number]; velocity: [number, number, number]; epoch: string } | null {
  try {
    const soeIdx = resultText.indexOf('$$SOE')
    const eoeIdx = resultText.indexOf('$$EOE')
    if (soeIdx < 0 || eoeIdx < 0 || eoeIdx <= soeIdx) return null

    const block = resultText.slice(soeIdx + 5, eoeIdx)

    const posRegex = /X\s*=\s*([+\-]?\d[\d.E+\-]*)\s+Y\s*=\s*([+\-]?\d[\d.E+\-]*)\s+Z\s*=\s*([+\-]?\d[\d.E+\-]*)/
    const velRegex = /VX\s*=\s*([+\-]?\d[\d.E+\-]*)\s+VY\s*=\s*([+\-]?\d[\d.E+\-]*)\s+VZ\s*=\s*([+\-]?\d[\d.E+\-]*)/

    const posMatch = block.match(posRegex)
    const velMatch = block.match(velRegex)
    if (!posMatch) return null

    const position: [number, number, number] = [
      Number(posMatch[1]),
      Number(posMatch[2]),
      Number(posMatch[3]),
    ]
    if (position.some(Number.isNaN)) return null

    const velocity: [number, number, number] = velMatch
      ? [Number(velMatch[1]), Number(velMatch[2]), Number(velMatch[3])]
      : [0, 0, 0]

    const dateMatch = block.match(
      /A\.D\.\s+(\d{4}-\w{3}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+)\s+TDB/,
    )
    const epoch = dateMatch ? dateMatch[1] : fallbackDate

    return { position, velocity, epoch }
  } catch {
    return null
  }
}

function buildHorizonsUrl(jplBodyId: string, startDate: string, endDate: string): string {
  // CENTER : héliocentrique (Soleil) pour les planètes ; géocentrique (Terre)
  // pour la Lune, afin que le vecteur renvoyé soit Terre → Lune (offset géocentrique).
  const center = jplBodyId === '301' ? "'500@399'" : "'500@10'"
  const qs = [
    'format=json',
    `COMMAND=${encodeURIComponent(`'${jplBodyId}'`)}`,
    `MAKE_EPHEM=${encodeURIComponent("'YES'")}`,
    `EPHEM_TYPE=${encodeURIComponent("'VECTORS'")}`,
    `CENTER=${encodeURIComponent(center)}`,
    `START_TIME=${encodeURIComponent(`'${startDate}'`)}`,
    `STOP_TIME=${encodeURIComponent(`'${endDate}'`)}`,
    `STEP_SIZE=${encodeURIComponent("'1 h'")}`,
    `OUT_UNITS=${encodeURIComponent("'AU-D'")}`,
    `REF_PLANE=${encodeURIComponent("'ECLIPTIC'")}`,
    `REF_SYSTEM=${encodeURIComponent("'ICRF'")}`,
    'VEC_TABLE=2',
    'OBJ_DATA=NO',
  ]
  return `${JPL_HORIZONS_URL}?${qs.join('&')}`
}

function createJplProxyHandler(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const bodyId = url.searchParams.get('bodyId') ?? 'earth'
    const date = (url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10)).trim()
    const jplBodyId = getJplBodyId(bodyId)

    if (!jplBodyId) {
      res.writeHead(400, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify({ error: `Unsupported body: ${bodyId}` }))
      return
    }

    try {
      const endDate = `${date} 01:00`
      const apiUrl = buildHorizonsUrl(jplBodyId, date, endDate)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      let response: Response
      try {
        response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
      } finally {
        clearTimeout(timeout)
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        res.writeHead(502, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({ error: errorText || `JPL Horizons HTTP ${response.status}` }))
        return
      }

      const payload = await response.json()

      if (payload.error) {
        res.writeHead(502, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({ error: payload.error }))
        return
      }

      const resultText = typeof payload.result === 'string' ? payload.result : ''
      const parsed = parseHorizonsResult(resultText, bodyId, date)

      if (!parsed) {
        res.writeHead(502, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({ error: 'Failed to parse Horizons vector data' }))
        return
      }

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify({
        bodyId,
        position: parsed.position,
        velocity: parsed.velocity,
        unit: 'AU',
        referenceFrame: 'ICRF',
        epoch: parsed.epoch,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown proxy error'
      res.writeHead(502, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify({ error: message }))
    }
  }
}

function jplProxyPlugin(): Plugin {
  const handler = createJplProxyHandler()
  return {
    name: 'jpl-proxy',
    configureServer(server) {
      server.middlewares.use('/api/jpl', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/jpl', handler)
    },
  }
}

function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
  }
  function escapeHtmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function replaceHtmlCommentSlot(html: string, slotName: string, content: string): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "Figma Make App"
  const description = config.description ?? ''
  const favicon = config.icons?.icon ?? ''
  const socialImage = config.openGraph?.image ?? ''
  const language = sanitizeHtmlValue(config.language) || 'en'
  const googleAnalyticsId = sanitizeHtmlValue(config.analytics?.googleAnalyticsId)
  const headStart = config.customScripts?.headStart ?? ''
  const headEnd = config.customScripts?.headEnd ?? ''
  const bodyStart = config.customScripts?.bodyStart ?? ''
  const bodyEnd = config.customScripts?.bodyEnd ?? ''
  const robotsTxt = config.robots?.index === false ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'figma-site-configuration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, 'figma:lang', language)
        result = replaceHtmlCommentSlot(result, 'figma:title', escapeHtmlText(title))
        result = replaceHtmlCommentSlot(result, 'figma:head-start', headStart)
        result = replaceHtmlCommentSlot(result, 'figma:head-end', headEnd)
        result = replaceHtmlCommentSlot(result, 'figma:body-start', bodyStart)
        result = replaceHtmlCommentSlot(result, 'figma:body-end', bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        }
        if (config.robots?.index === false) {
          tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        }
        if (favicon) {
          tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        }
        if (title) {
          tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        }
        if (description) {
          tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })
        }
        if (socialImage) {
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: socialImage }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: socialImage }, injectTo: 'head' },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: 'script',
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: 'head',
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: 'style',
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: 'head',
            },
            {
              tag: 'a',
              attrs: { class: 'figma-bypass-link', href: '#root' },
              children: 'Skip to content',
              injectTo: 'body-prepend',
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: 'figma-error-overlay-replay',
    apply: 'serve',
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (...args: any[]) => void
      server.ws.send = ((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === 'error') {
            lastError = payload as object
          } else if (type === 'update' || type === 'full-reload') {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send

      server.ws.on('connection', (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  const hadRefreshBoundary = new Map<string, boolean>()
  let sendFullReload: (() => void) | null = null

  return {
    name: 'figma-react-refresh-boundary-fallback',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: 'full-reload', path: '*' })
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return null

      const moduleId = id.split('?')[0] ?? id
      const hasRefreshBoundary = code.includes('registerExportsForReactRefresh')
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: { storiesGlob: string | string[] }): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob) ? options.storiesGlob : [options.storiesGlob]
  const ROUTE = '/.figma/make/kit.html'
  const VIRTUAL_ID = 'virtual:figma-stories'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: 'figma-make-kit',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.split('?')[0] !== ROUTE) return next()

        try {
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}
