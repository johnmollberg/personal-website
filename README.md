# Personal Website Project

## Overview
This project is an open-source personal website built with modern tools and frameworks to showcase engineering and AWS/IaC expertise. It includes:
- **Vite (React)** for fast development
- **AWS CDK** for infrastructure deployment
- **Statsig** for static content management
- **Google Analytics (future enhancement)**

## Tech Stack
- **Frontend:** Vite (React) with Vike for SSR
- **Backend/Infrastructure:** AWS SAM (TypeScript)
- **Content Management:** Statsig
- **Analytics:** Google Analytics (via tagging server in future update)
- **Hosting:** AWS (S3 + CloudFront + Lambda@Edge for SSR)

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

