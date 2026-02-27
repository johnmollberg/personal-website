import { usePageContext } from 'vike-react/usePageContext'
import { PageShell } from '../../components/page/PageShell'
import type { PageProps } from '../../vike'
import './+Page.scss'

export const Page = ({ context }: PageProps) => {
  // Always use context if provided, otherwise get from hook (SSR/SSG compatibility)
  const pageContext = usePageContext()
  const contextToUse = context || pageContext
  
  return (
    <PageShell pageContext={contextToUse}>
      <div className="resume-page">
        <header className="resume-header">
          <div className="resume-header-left">
            <h1>John Mollberg</h1>
            <h2>Software Engineer</h2>
          </div>
          <div className="resume-header-right">
            <div className="contact-item">mollbergjo@gmail.com</div>
            <div className="contact-item">218-234-7709</div>
            <div className="contact-item">Roseville, MN</div>
          </div>
        </header>

        <section className="resume-section resume-summary">
          <h2>Summary</h2>
          <p>
            Software engineer with 10 years of experience across full-stack development,
            payments infrastructure, and engineering leadership. Built and led teams while
            staying hands-on — architecting billing systems, CI/CD pipelines, and event-driven
            backends. Thrives in roles that combine architecture ownership with engineering
            mentorship.
          </p>
        </section>

        <section className="resume-section">
          <h2>Experience</h2>
          <div className="resume-item">
            <h3>Software Engineering Manager</h3>
            <div className="resume-item-meta">
              <span className="resume-company">Arccos Golf</span>
              <span className="resume-date">Dec 2020 - Present</span>
            </div>
            <ul>
              <li>Architected Stripe billing integration handling multiple subscriptions per user and deferred invoices. Built event-driven backend with EventBridge, SNS/SQS, and Lambda to process webhooks reliably, with CloudWatch alarms for payment failure monitoring</li>
              <li>Led key initiatives including CI/CD pipelines, infrastructure as code, A/B testing framework, internationalization, OAuth for third-party partnerships, and click-to-cancel compliance</li>
              <li>Delivered billing system for Link Pro Trial launch, generating hundreds of thousands in revenue from thousands of trial units</li>
              <li>Owned payments and subscriptions — the most technically complex domain — maintaining delivery velocity and domain ownership through significant organizational change</li>
              <li>Built and maintained the company's core web platforms: customer acquisition funnels, user dashboard (rounds, stats, account/billing management), and Shopify e-commerce store</li>
              <li>Led a cross-platform team of 4+ engineers; hired 2 engineers, mentored the team, and promoted 1 to senior</li>
              <li>Partnered with executives to drive product and marketing direction — selecting SaaS vendors, designing activation funnels, onboarding UX, billing models, and public API strategy</li>
              <li>Company's core product processes tens of thousands of events per second at peak; contributed enhancements and gained deep familiarity with the high-throughput, event-driven architecture</li>
              <li>Served as a primary technical advisor to cross-functional leadership — scoping initiative feasibility for product, finance, and operations teams</li>
              <li>Drove engineering standards adopted across the organization: CI/CD pipelines via GitHub Actions, infrastructure as code, monitoring/alerting systems, and release processes</li>
              <li>Established engineering quality practices: incident management processes, feature request intake workflows, and team accountability mechanisms</li>
            </ul>
          </div>
          
          <div className="resume-item">
            <h3>Senior Software Engineering Consultant</h3>
            <div className="resume-item-meta">
              <span className="resume-company">Daugherty Business Solutions</span>
              <span className="resume-date">Jun 2016 - Dec 2020</span>
            </div>
            <ul>
              <li>Consulted with Fortune 100 consumer electronics clients to improve software engineering practices and deliver e-commerce solutions</li>
              <li>Technical lead on a team of five engineers building customer-facing e-commerce features within a large-scale agile organization</li>
              <li>Built Kafka-based data pipeline consuming CDC events from cross-organization databases, transforming them through stream processors, and materializing into application-specific data stores</li>
              <li>Introduced continuous integration, automated testing, and code quality standards to teams that previously lacked them</li>
            </ul>
          </div>
        </section>
        
        <section className="resume-section">
          <h2>Education</h2>
          <div className="resume-item">
            <h3>Bachelor of Science in Computer Science</h3>
            <div className="resume-item-meta">
              <span className="resume-institution">University of Minnesota</span>
              <span className="resume-date">2013 - 2016</span>
            </div>
          </div>
        </section>
        
        <section className="resume-section">
          <h2>Skills</h2>

          {/* Claude Code subsection */}
          <div className="claude-code-highlight">
            <h3 className="claude-code-title">Claude Code</h3>
            <p className="claude-code-intro">
              Early adopter of AI-augmented development. I use AI coding agents not just
              for autocomplete or learning, but as force multipliers for delivering
              production-quality work.
            </p>
            <div className="claude-code-capabilities">
              <div className="capability-card">
                <h4>Production Debugging</h4>
                <p>
                  I use AI agents to analyze production logs and trace root causes,
                  dramatically accelerating incident resolution
                </p>
              </div>
              <div className="capability-card">
                <h4>Feature Delivery</h4>
                <p>
                  I ship full implementations — code, tests, and docs — using AI agents
                  to accelerate development while maintaining my quality standards
                </p>
              </div>
              <div className="capability-card">
                <h4>Integration Testing</h4>
                <p>
                  I build and maintain comprehensive test suites across services using
                  AI agents, achieving broader coverage than manual testing alone
                </p>
              </div>
              <div className="capability-card">
                <h4>Product Planning</h4>
                <p>
                  I use AI to draft technical roadmaps and architectural designs,
                  which I refine and present to stakeholders
                </p>
              </div>
            </div>
          </div>

          {/* Existing skills container follows */}
          <div className="skills-container">
            <div className="skill-category skill-category-languages">
              <h3>Languages</h3>
              <ul className="skill-list">
                <li>TypeScript</li>
                <li>JavaScript</li>
                <li>Rust</li>
                <li>Python</li>
                <li>Kotlin</li>
                <li>Java</li>
                <li>Bash</li>
                <li>SQL</li>
              </ul>
            </div>
            
            <div className="skill-category skill-category-frontend">
              <h3>Frontend</h3>
              <ul className="skill-list">
                <li>React</li>
                <li>Vue</li>
                <li>HTML/CSS</li>
                <li>Redux</li>
                <li>Vite</li>
                <li>Tailwind</li>
              </ul>
            </div>
            
            <div className="skill-category skill-category-backend">
              <h3>Backend</h3>
              <ul className="skill-list">
                <li>Node.js</li>
                <li>Express</li>
                <li>Java</li>
                <li>Rust</li>
                <li>Stripe</li>
                <li>MySQL</li>
                <li>PostgreSQL</li>
                <li>Kafka</li>
                <li>AWS (Lambda, CloudFormation, CloudFront, EventBridge, SNS/SQS, and more)</li>
              </ul>
            </div>
            
            <div className="skill-category skill-category-tools">
              <h3>Tools</h3>
              <ul className="skill-list">
                <li>Claude Code</li>
                <li>Cursor</li>
                <li>GitHub</li>
                <li>GitLab</li>
              </ul>
            </div>
          </div>
        </section>
        
        <div className="resume-actions">
          <a href="/assets/resume.pdf" download="John_Mollberg_Resume.pdf" className="resume-download-button">Download PDF</a>
        </div>
      </div>
    </PageShell>
  )
}