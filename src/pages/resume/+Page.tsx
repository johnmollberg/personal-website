import { usePageContext } from 'vike-react/usePageContext'
import { PageShell } from '../../components/page/PageShell'
import type { PageProps } from '../../vike'
import './+Page.css'

export const Page = ({ context }: PageProps) => {
  // Always use context if provided, otherwise get from hook (SSR/SSG compatibility)
  const pageContext = usePageContext()
  const contextToUse = context || pageContext
  
  return (
    <PageShell pageContext={contextToUse}>
      <div className="resume-page">
        <header className="resume-header">
          <h1>John Mollberg</h1>
          <h2>Software Engineering Manager</h2>
        </header>
        
        <section className="resume-section">
          <h2>Experience</h2>
          <div className="resume-item">
            <h3>Software Engineering Manager</h3>
            <div className="resume-item-meta">
              <span className="resume-company">Arccos Golf</span>
              <span className="resume-date">Dec 2020 - Present</span>
            </div>
            <ul>
              <li>Lead a cross-platform team of 4+ engineers focused on growth initiatives from a 100% remote environment</li>
              <li>Regularly hired, trained, and mentored engineers to grow their skills</li>
              <li>Worked closely with the executive team to set the strategy for the team</li>
              <li>Worked closely with the vice president of engineering to influence company culture toward improving individual engineering capabilities</li>
              <li>Highly productive senior engineer in addition to managing the team</li>
              <li>Implemented or oversaw almost all web development over my tenure, as well as significant back-end and infrastructure development</li>
              <li>Many largescale projects over my tenure, including managing relationships with SaaS providers, building the organization's first CI/CD pipeline, moving much of the infrastructure to IaC, and more</li>
            </ul>
          </div>
          
          <div className="resume-item">
            <h3>Senior Software Engineering Consultant</h3>
            <div className="resume-item-meta">
              <span className="resume-company">Daugherty Business Solutions</span>
              <span className="resume-date">Jun 2016 - Dec 2020</span>
            </div>
            <ul>
              <li>Consulted with clients to improve their software engineering capabilities, spending the majority of my time with a Fortune 100 Consumer Electronics Retailer</li>
              <li>Technical lead on a team of five engineers that is part of a larger team of thousands of employees working in an agile manner</li>
              <li>Provided change to the enterprise, demonstrating the effectiveness of continuous integration, automated testing, and clean code</li>
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
          <div className="skills-container">
            <div className="skill-category">
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
            
            <div className="skill-category">
              <h3>Frontend</h3>
              <ul className="skill-list">
                <li>React</li>
                <li>Vue</li>
                <li>HTML/CSS</li>
                <li>Redux</li>
                <li>Rollup</li>
                <li>Webpack</li>
                <li>Vite</li>
                <li>SCSS</li>
                <li>Less</li>
                <li>Tailwind</li>
                <li>Material-UI</li>
                <li>Bootstrap</li>
                <li>Google Tag Manager</li>
                <li>Google Analytics</li>
                <li>Many other tools</li>
              </ul>
            </div>
            
            <div className="skill-category">
              <h3>Backend</h3>
              <ul className="skill-list">
                <li>Node.js</li>
                <li>Express</li>
                <li>MySQL</li>
                <li>PostgreSQL</li>
                <li>Snowflake</li>
                <li>Kafka</li>
                <li>Serverless</li>
                <li>AWS SAM</li>
                <li>AWS Lambda</li>
                <li>AWS RDS</li>
                <li>AWS CloudFormation</li>
                <li>AWS CloudFront</li>
                <li>AWS API Gateway</li>
                <li>Many other AWS services</li>
              </ul>
            </div>
            
            <div className="skill-category">
              <h3>Tools</h3>
              <ul className="skill-list">
                <li>ChatGPT</li>
                <li>Claude</li>
                <li>Gemini</li>
                <li>Cursor</li>
                <li>VSCode</li>
                <li>WebStorm</li>
                <li>IntelliJ</li>
                <li>DataGrip</li>
                <li>GitHub</li>
                <li>GitLab</li>
                <li>Many other tools</li>
              </ul>
            </div>
          </div>
        </section>
        
        <div className="resume-actions">
          <a href="/resume.pdf" className="resume-download-button">Download PDF</a>
        </div>
      </div>
    </PageShell>
  )
}