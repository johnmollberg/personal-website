# Personal Website Project

## Overview
This project is an open-source personal website built with modern tools and frameworks to showcase engineering and AWS/IaC expertise. It includes:
- **React + TypeScript** with modern patterns
- **Vike** (previously Vite) for SSR
- **AWS SAM** for infrastructure deployment
- **Web Vitals** for performance tracking

## Tech Stack
- **Frontend:** React + TypeScript with Vike for SSR
- **Backend/Infrastructure:** AWS SAM (TypeScript)
- **Hosting:** AWS (S3 + CloudFront + Lambda@Edge for SSR)
- **Testing:** Jest + React Testing Library

## Project Structure
```
personal-website/
│-- scripts/               # Deployment scripts
│-- server/                # Server-side code for Lambda@Edge
│-- src/
│   │-- components/        # Reusable UI components
│   │   │-- App/           # Main application component
│   │   │-- WebVitals/     # Web Vitals tracking component
│   │   │-- page/          # Page layout components
│   │-- pages/             # Vike page components
│   │-- assets/            # Static assets and images
│-- package.json
│-- template.yaml          # SAM template for AWS infrastructure
│-- README.md
```

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd personal-website
   ```
2. **Install dependencies:**
   ```bash
   yarn install
   ```
3. **Run the development server:**
   ```bash
   yarn dev
   ```

## Deployment

### Local Development
```bash
yarn dev        # Run the development server with SSR (with DEV title prefix)
yarn build      # Build the application for production
yarn preview    # Preview the production build locally
```

### Environment-Specific Builds
```bash
yarn build:dev      # Build for development environment
yarn build:staging  # Build for staging environment
yarn build:prod     # Build for production environment
```

### AWS Deployment with SAM
This project is set up to deploy to AWS using SAM (Serverless Application Model) with multi-environment support:

#### Environment-Specific Deployments
```bash
# Development Environment
yarn deploy:dev       # Deploy to dev environment with DEV title prefix

# Staging Environment
yarn deploy:staging   # Deploy to staging environment with STAGING title prefix

# Production Environment
yarn deploy:prod      # Deploy to production environment
yarn deploy           # Alias for deploy:prod
```

The deployment process automatically:
1. Builds the application with the correct environment settings
2. Deploys the Lambda function and CloudFront distribution
3. Uploads static assets to the environment-specific S3 bucket

The deployment creates:
- Lambda@Edge function for server-side rendering directly at the edge
- S3 bucket for static assets
- CloudFront distribution for caching and CDN

### AWS IAM Policy for Deployment
The following policy should be attached to the IAM user or role responsible for deploying this application:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:PutBucketPolicy",
                "cloudfront:CreateDistribution",
                "cloudfront:GetDistribution",
                "cloudfront:UpdateDistribution",
                "cloudfront:CreateInvalidation",
                "lambda:CreateFunction",
                "lambda:GetFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:AddPermission",
                "lambda:PublishVersion",
                "lambda:CreateAlias",
                "lambda:UpdateAlias",
                "iam:PassRole",
                "cloudformation:CreateStack",
                "cloudformation:UpdateStack",
                "cloudformation:DescribeStacks",
                "cloudformation:DeleteStack",
                "cloudformation:ValidateTemplate"
            ],
            "Resource": "*"
        }
    ]
}
```

This policy provides the minimum permissions needed to deploy and manage the application's AWS resources.

## Lambda@Edge Architecture

This project uses Lambda@Edge for server-side rendering, which offers several benefits:

### Benefits of Lambda@Edge for SSR
- **Lower Latency**: Content is rendered closer to users, reducing round-trip time
- **Simplified Architecture**: Eliminates API Gateway, reducing infrastructure complexity
- **Cost Efficiency**: Removes API Gateway charges and potentially reduces overall costs
- **Global Distribution**: Automatic code distribution to edge locations worldwide
- **Improved Cache Utilization**: Better caching of dynamic content at the edge

### Implementation Details
The implementation uses:
- **Origin Request** trigger for the Lambda@Edge function
- **Vike/SSR** for React server-side rendering
- **S3 Origin** for static assets (js, css, images)
- **CloudFront** for caching both static assets and dynamic content

### Important Notes
- Lambda@Edge functions must be deployed to the `us-east-1` region
- Size limits apply: Lambda@Edge functions are limited to 10MB (compressed) 
- Execution environment limitations: Lambda@Edge functions have more restrictive runtime compared to regular Lambda functions

## Future Enhancements
- Integrate Google Analytics via a tagging server
- Expand Statsig integration for dynamic content control
- Add custom domain with SSL certificate

