import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const COVER_LETTER_PATH = path.join(projectRoot, 'documents', 'cover-letter-stripe.md')
const OUTPUT_PATH = path.join(projectRoot, 'documents', 'cover-letter-stripe.pdf')

// Stripe brand colors
const STRIPE = {
  purple: '#635BFF',
  darkNavy: '#0A2540',
  text: '#425466',
  lightBg: '#F6F9FC',
  white: '#FFFFFF',
  border: '#E3E8EE',
}

function parseMarkdownToHTML(md: string): string {
  const lines = md.split('\n')
  const htmlParts: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip the H1 title line (we handle the header separately)
    if (line.startsWith('# ')) {
      i++
      continue
    }

    // Skip the --- divider
    if (line.trim() === '---') {
      i++
      continue
    }

    // Contact info line (bold name line or pipe-separated)
    if (line.includes('mollbergjo@gmail.com') && line.includes('|')) {
      // This is the contact line, handled in header
      i++
      continue
    }

    // Bold name line
    if (line === '**John Mollberg**') {
      i++
      continue
    }

    // Section headers like **Why this role fits:**
    if (line.match(/^\*\*[^*]+\*\*$/)) {
      const text = line.replace(/\*\*/g, '')
      htmlParts.push(`<h3>${text}</h3>`)
      i++
      continue
    }

    // "Dear..." greeting
    if (line.startsWith('Dear ')) {
      htmlParts.push(`<p class="greeting">${line}</p>`)
      i++
      continue
    }

    // Signature
    if (line.trim() === 'John Mollberg' && i >= lines.length - 2) {
      htmlParts.push(`<p class="signature">${line}</p>`)
      i++
      continue
    }

    // Regular paragraph (non-empty)
    if (line.trim() !== '') {
      // Process inline bold
      const processed = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      htmlParts.push(`<p>${processed}</p>`)
    }

    i++
  }

  return htmlParts.join('\n')
}

function buildHTML(bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: ${STRIPE.darkNavy};
      line-height: 1.6;
      background: ${STRIPE.white};
    }

    .page {
      padding: 36px 56px;
      max-width: 100%;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 18px;
      border-bottom: 2px solid ${STRIPE.purple};
    }

    .header-left h1 {
      font-size: 28px;
      font-weight: 700;
      color: ${STRIPE.darkNavy};
      letter-spacing: -0.5px;
    }

    .header-left .role {
      font-size: 13px;
      font-weight: 500;
      color: ${STRIPE.purple};
      margin-top: 2px;
      letter-spacing: 0.3px;
    }

    .header-right {
      text-align: right;
      font-size: 13px;
      color: ${STRIPE.text};
      line-height: 1.8;
    }

    /* Body content */
    .greeting {
      font-size: 15px;
      margin-bottom: 12px;
      color: ${STRIPE.darkNavy};
    }

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: ${STRIPE.purple};
      margin-top: 18px;
      margin-bottom: 6px;
      letter-spacing: 0.2px;
    }

    p {
      font-size: 13px;
      color: ${STRIPE.text};
      margin-bottom: 7px;
      line-height: 1.5;
    }

    .signature {
      margin-top: 14px;
      font-weight: 600;
      color: ${STRIPE.darkNavy};
      font-size: 14px;
    }

    /* Accent bar on the left */
    .accent-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, ${STRIPE.purple} 0%, #0A2540 100%);
    }
  </style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="page">
    <div class="header">
      <div class="header-left">
        <h1>John Mollberg</h1>
        <div class="role">Staff Engineer, Usage Based Billing</div>
      </div>
      <div class="header-right">
        mollbergjo@gmail.com<br>
        218-234-7709<br>
        Minneapolis metro area
      </div>
    </div>
    <div class="body-content">
      ${bodyContent}
    </div>
  </div>
</body>
</html>`
}

async function generateCoverLetterPDF(): Promise<void> {
  console.log('Reading cover letter markdown...')
  const markdown = fs.readFileSync(COVER_LETTER_PATH, 'utf-8')

  const bodyHTML = parseMarkdownToHTML(markdown)
  const fullHTML = buildHTML(bodyHTML)

  console.log('Launching browser...')
  const browser = await puppeteer.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.setContent(fullHTML, { waitUntil: 'networkidle0' })

    // Wait for font to load
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log(`Generating PDF to ${OUTPUT_PATH}...`)
    await page.pdf({
      path: OUTPUT_PATH,
      format: 'Letter',
      margin: {
        top: '0.4in',
        right: '0in',
        bottom: '0.4in',
        left: '0in',
      },
      printBackground: true,
    })

    console.log('Cover letter PDF generated successfully!')
  } finally {
    await browser.close()
  }
}

generateCoverLetterPDF().catch((error) => {
  console.error('Failed to generate cover letter PDF:', error)
  process.exit(1)
})
