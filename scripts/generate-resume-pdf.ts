import puppeteer from 'puppeteer'
import { spawn, type ChildProcess } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const DEV_SERVER_URL = 'http://localhost:3000'
const RESUME_PATH = '/resume'
const OUTPUT_PATH = path.join(projectRoot, 'public', 'resume.pdf')

async function waitForServer(url: string, maxAttempts = 30, delayMs = 1000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        console.log(`Server is ready after ${attempt} attempts`)
        return
      }
    } catch {
      // Server not ready yet
    }
    console.log(`Waiting for server... (attempt ${attempt}/${maxAttempts})`)
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  throw new Error(`Server did not become ready after ${maxAttempts} attempts`)
}

async function startDevServer(): Promise<ChildProcess> {
  console.log('Starting dev server...')

  const devServer = spawn('yarn', ['start'], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })

  devServer.stdout?.on('data', (data: Buffer) => {
    const output = data.toString()
    if (output.includes('error') || output.includes('Error')) {
      console.log('Dev server output:', output)
    }
  })

  devServer.stderr?.on('data', (data: Buffer) => {
    console.error('Dev server error:', data.toString())
  })

  return devServer
}

async function generatePDF(): Promise<void> {
  let devServer: ChildProcess | null = null
  let browser: puppeteer.Browser | null = null

  try {
    // Start the dev server
    devServer = await startDevServer()

    // Wait for the server to be ready
    await waitForServer(DEV_SERVER_URL)

    console.log('Launching browser...')
    browser = await puppeteer.launch({
      headless: true,
    })

    const page = await browser.newPage()

    // Set viewport to a reasonable desktop size
    await page.setViewport({ width: 1200, height: 800 })

    console.log(`Navigating to ${DEV_SERVER_URL}${RESUME_PATH}...`)
    await page.goto(`${DEV_SERVER_URL}${RESUME_PATH}`, {
      waitUntil: 'networkidle0',
    })

    // Inject styles to hide elements and make content fit on ONE page
    await page.addStyleTag({
      content: `
        /* Hide navigation, footer, download button */
        header.page-header, nav, .nav, .navigation, .site-header,
        footer, .footer, .site-footer, .page-footer,
        .resume-actions, .resume-download-button {
          display: none !important;
        }

        body {
          background: white !important;
          font-size: 11px !important;
          line-height: 1.25 !important;
        }

        .resume-page {
          padding: 0 !important;
          max-width: 100% !important;
        }

        .resume-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          margin-bottom: 0.5rem !important;
        }

        .resume-header-left {
          text-align: left !important;
        }

        .resume-header h1 {
          font-size: 1.6rem !important;
          margin-bottom: 0.1rem !important;
        }

        .resume-header h2 {
          font-size: 1rem !important;
        }

        .resume-header-right {
          text-align: right !important;
          font-size: 0.8rem !important;
        }

        .contact-item {
          margin-bottom: 0.15rem !important;
        }

        .resume-section {
          margin-bottom: 0.6rem !important;
        }

        .resume-section h2 {
          font-size: 1.15rem !important;
          margin-bottom: 0.4rem !important;
          padding-bottom: 0.2rem !important;
        }

        .resume-item {
          margin-bottom: 0.5rem !important;
        }

        .resume-item h3 {
          font-size: 1rem !important;
          margin-bottom: 0.1rem !important;
        }

        .resume-item-meta {
          font-size: 0.85rem !important;
          margin-bottom: 0.2rem !important;
        }

        .resume-item ul {
          padding-left: 1rem !important;
          margin: 0 !important;
        }

        .resume-item li {
          margin-bottom: 0.15rem !important;
          line-height: 1.25 !important;
        }

        /* Claude Code section - compact */
        .claude-code-highlight {
          padding: 0.5rem !important;
          margin-bottom: 1.2rem !important;
        }

        .claude-code-title {
          font-size: 1rem !important;
          margin-bottom: 0.3rem !important;
        }

        .claude-code-intro {
          font-size: 0.85rem !important;
          margin-bottom: 0.8rem !important;
          line-height: 1.25 !important;
        }

        .claude-code-capabilities {
          gap: 0.4rem !important;
          grid-template-columns: repeat(2, 1fr) !important;
        }

        .capability-card {
          padding: 0.35rem !important;
        }

        .capability-card h4 {
          font-size: 0.85rem !important;
          margin-bottom: 0.15rem !important;
        }

        .capability-card p {
          font-size: 0.8rem !important;
          line-height: 1.25 !important;
        }

        /* Skills - compact grid */
        .skills-container {
          gap: 0.5rem !important;
          grid-template-columns: repeat(4, 1fr) !important;
        }

        .skill-category h3 {
          font-size: 0.9rem !important;
          margin-bottom: 0.25rem !important;
        }

        .skill-list li {
          font-size: 0.75rem !important;
          padding: 0.15rem 0.4rem !important;
          margin-bottom: 0.2rem !important;
          margin-right: 0.2rem !important;
          background-color: rgba(128, 176, 128, 0.15) !important;
        }
      `,
    })

    // Wait a moment for styles to apply
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`Generating PDF to ${OUTPUT_PATH}...`)
    await page.pdf({
      path: OUTPUT_PATH,
      format: 'Letter',
      margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in',
      },
      printBackground: true,
      scale: 0.9,
    })

    console.log('PDF generated successfully!')
  } finally {
    if (browser) {
      console.log('Closing browser...')
      await browser.close()
    }

    if (devServer) {
      console.log('Stopping dev server...')
      devServer.kill('SIGTERM')
      // Force exit since shell processes don't always clean up
      process.exit(0)
    }
  }
}

generatePDF().catch((error) => {
  console.error('Failed to generate PDF:', error)
  process.exit(1)
})
