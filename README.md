# Personal Website Project

## Overview
This project is an open-source personal website built with modern tools and frameworks to showcase engineering and AWS/IaC expertise. It includes:
- **Vite (React)** for fast development
- **AWS CDK** for infrastructure deployment
- **Statsig** for static content management
- **Google Analytics (future enhancement)**

## Tech Stack
- **Frontend:** Vite (React)
- **Backend/Infrastructure:** AWS CDK (TypeScript)
- **Content Management:** Statsig
- **Analytics:** Google Analytics (via tagging server in future update)
- **Hosting:** AWS (likely using S3 + CloudFront + Lambda for SSR)

## Project Structure
```
website-project/
│-- infra/                 # AWS CDK infrastructure code
│-- src/
│   │-- components/        # Reusable UI components
│   │-- lib/               # Utility functions
│   │-- main.jsx           # Vite entry file
│   │-- App.jsx            # Root component
│-- public/                # Static assets
│-- package.json
│-- README.md
```

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd website-project
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up AWS CDK:**
   ```bash
   cd infra
   npm install
   cdk bootstrap
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Deployment

### Local Development
```bash
yarn dev        # Run the development server with SSR
yarn build      # Build the application for production
yarn preview    # Preview the production build locally
```

### AWS Deployment with SAM
This project is set up to deploy to AWS using SAM (Serverless Application Model):

1. **Initial deployment:**
   ```bash
   yarn deploy:guided  # Interactive guided deployment 
   ```

2. **Subsequent deployments:**
   ```bash
   yarn deploy:all     # Build, deploy Lambda function, and upload static assets
   ```

The deployment creates:
- Lambda function for server-side rendering
- API Gateway endpoint
- S3 bucket for static assets
- CloudFront distribution for caching and CDN

## Future Enhancements
- Integrate Google Analytics via a tagging server
- Expand Statsig integration for dynamic content control

