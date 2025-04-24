# Guidance for Claude on Personal Website Project

## Project Context
This is a personal website built with:
- React + TypeScript
- Vike (previously Vite) for SSR
- Hosted on AWS/CloudFront
- Recent migration from Vite to Vike

## Commands
- **Install**: `yarn install`
- **Dev Server**: `yarn start` 
- **Build**: `yarn build`
- **Lint**: `yarn lint`
- **Test**: `yarn test` (Vitest)
- **Test Watch Mode**: `yarn test:watch`
- **Test UI**: `yarn test:ui` (Vitest UI)

### Environment-Specific Commands
- **Dev Server (Development)**: `yarn start:dev`
- **Dev Server (Staging)**: `yarn start:staging`
- **Dev Server (Production)**: `yarn start:prod`
- **Build (Development)**: `yarn build:dev`
- **Build (Staging)**: `yarn build:staging`
- **Build (Production)**: `yarn build:prod`

### Deployment Commands
#### Development Environment
- **Deploy**: `yarn deploy:dev`

#### Staging Environment
- **Deploy**: `yarn deploy:staging`

#### Production Environment
- **Deploy**: `yarn deploy:prod` or `yarn deploy`

### Miscellaneous Commands
- **Create Statsig Secrets**: `yarn create-statsig-secrets`

## Code Style Guidelines
- **TypeScript**: Use TypeScript for all new code with proper type definitions
- **Imports**: Group imports by external packages, then project imports
- **Component Structure**: React functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Use try/catch blocks and propagate errors with context
- **Formatting**: 2 space indentation, 80-column width
- **AWS SAM**: Used for infrastructure deployment via template.yaml
- **Comments**: JSDoc format for functions, minimal inline comments

## Project History
- Migrated from Vite CLI to Vike framework
- Files moved from src/pages/index and src/pages/renderer to src/pages root
- CloudFront distribution managed via template.yaml
- Server-side rendering implemented with Lambda Function URL

## Session Context
Add important context from each Claude session here to ensure continuity between sessions. Include:
- Key decisions made
- Problems solved
- Changes implemented
- Known issues
- Current priorities

### 2025-04-19 (Session 2)
- Migrated from API Gateway to Lambda Function URL:
  - Replaced API Gateway with Lambda Function URL as CloudFront origin
  - Updated Lambda handler to process Function URL events instead of API Gateway events
  - Modified response format to support Function URL cookies array
  - Updated CloudFront distribution to use Lambda Function URL as primary origin
  - Removed API Gateway resources and all associated configurations
  - Created CloudWatch Log Group specifically for Lambda Function URL logs
  - Updated IAM permissions to allow CloudFront to invoke Lambda Function URL
  - Maintained S3 origin for static assets with the same caching behavior
  - Simplified architecture by removing API Gateway as an intermediary layer
  - Used environment-specific naming for all resources
  - Added Lambda Function URL to CloudFormation outputs

### 2025-04-19 (Session 1)
- Added CloudFront real-time logging to CloudWatch:
  - Implemented AWS::CloudFront::RealtimeLogConfig resource
  - Set up Kinesis Firehose delivery stream for log processing
  - Created Lambda function to transform logs and send to CloudWatch Logs
  - Added S3 bucket for temporary log storage with 1-day lifecycle policy
  - Added real-time logging to all cache behaviors
  - Created necessary IAM roles and permissions for the logging pipeline
  - Configured comprehensive field list for detailed logging
  - Set 100% sampling rate for all requests
  - Used environment-specific naming for all resources
  - Created complete end-to-end logging solution from CloudFront to CloudWatch

### 2025-04-18 (Session 2)
- Added IAM permissions for CloudFront to invoke API Gateway:
  - Updated CloudFrontLoggingRole with execute-api:Invoke permission
  - Removed unused CloudFront logging configurations
  - Renamed policy from CloudWatchLogsAccess to ApiGatewayAccess
  - Maintained CloudWatch Log Group for compatibility
  - Removed unused Fields and SamplingRate from CloudFrontLoggingRole
  - Removed RealtimeLogConfigArn references from CloudFront behaviors
  - Simplified IAM role to focus on API Gateway access

### 2025-04-18 (Session 1)
- Fixed CloudFront logging configuration issue:
  - Completely removed CloudFront logging configuration from template.yaml
  - Reverted attempt to implement CloudWatch logging for CloudFront
  - Kept CloudWatch Log Group for CloudFront logs (/aws/cloudfront/personal-website-${Environment})
  - Maintained 30-day retention policy for CloudFront logs
  - Added comments in template.yaml about removed logging configuration
  - API Gateway logs are still properly directed to CloudWatch

### 2025-04-08 (Session 3)
- Changed CloudFront logging approach:
  - Created CloudWatch Log Group for CloudFront logs (/aws/cloudfront/personal-website-${Environment})
  - Removed S3 LoggingBucket resources and associated permissions
  - Set 30-day retention policy for CloudFront logs
  - Added IAM permissions for Lambda to write to CloudFront logs
  - Added comments for future implementation of real-time logs
  - Simplified infrastructure by consolidating logging approach

### 2025-04-08 (Session 2)
- Migrated from Lambda@Edge to API Gateway with Lambda:
  - Replaced CloudFront origin-request Lambda@Edge function with API Gateway + Lambda backend
  - Updated CloudFormation template to create API Gateway resources
  - Modified Lambda handler to work with API Gateway events instead of CloudFront events
  - Added environment variables to Lambda function (previously not possible with Lambda@Edge)
  - Simplified IAM permissions by removing Lambda@Edge specific policies
  - Updated CloudFront distribution to use API Gateway as primary origin
  - Maintained S3 origin for static assets with the same caching behavior
  - Added API Gateway logging to CloudWatch with detailed request format
  - Updated Lambda response format to work with API Gateway
  - Removed CodeHash parameter that was needed for Lambda@Edge versioning
  - Added proper cookie handling in new Lambda handler
  - Improved error handling with appropriate API Gateway response formats
  - Added IAM role and API Gateway account configuration for CloudWatch logs
    - Created ApiGatewayCloudWatchLogsRole with proper assume role permissions
    - Added AWS::ApiGateway::Account resource to set up CloudWatch logs role
    - Made API Gateway depend on account configuration to ensure proper deployment order

### 2025-04-08 (Session 1)
- Added a Lambda warm-up solution:
  - Created a scheduled Lambda function that runs every 5 minutes
  - Function makes HTTPS requests to the website to keep the SSR Lambda warm
  - Added the necessary infrastructure in template.yaml including IAM role and event schedule
  - Added follow-redirects package for simplified HTTPS requests
  - Implemented proper error handling and logging
  - Set up environment variables to pass the site domain to the function
  - Added a shutdown log statement to the SSR Lambda to track when it's shut down
  - Deployed the warm-up function to multiple regions for better coverage:
    - US East 1 (N. Virginia)
    - US East 2 (Ohio)
    - US West 1 (N. California)
    - US West 2 (Oregon)
    - Canada Central 1
  - Each region has its own Lambda function with the same code but region-specific triggers

### 2025-04-05 (Session 2)
- Refactored code to better leverage Vike hooks
  - Moved Statsig server SDK initialization to root +guard.ts hook
  - Created proper type definitions for each page's data
  - Added GuardData interface for shared data across all pages
  - Created specific data types for each page (HomePageData, PostsPageData, PostPageData)
  - Refactored each page's +data.ts to only fetch what it needs
  - Updated StatsigProvider to support both new guardData and backward compatibility
  - Added proper type assertions in page components
  - Improved code organization with clear separation of concerns
  - Made bootstrap process more efficient by only initializing Statsig once
  - Improved type safety with more specific page context typing

### 2025-04-05 (Session 1)
- Added proper routes for blog content
  - Created `/posts` route with PostList component to display all blog posts
  - Created `/posts/[slug]` dynamic route to display individual posts
  - Implemented data fetching for both list and individual post pages
  - Added error handling for missing posts
  - Fixed command references in CLAUDE.md (updated yarn dev → yarn start)
  - Implemented CSS styles for the posts page
  - Enhanced PostContent component with proper metadata display
  - Added comprehensive test coverage for new pages and components
  - Migrated from Jest to Vitest for better Vite integration
  - Fixed the "View all posts" link on homepage
  - Added null-checking for page context to prevent errors
  - Added ts-node as a development dependency

### 2025-04-02 (Session 2)
- Added CloudFormation-managed secrets for AWS Secrets Manager
  - Created StatsigSecret resource in template.yaml
  - Environment-specific secret naming with `statsig-credentials-${Environment}`
  - Added IAM permissions to access the secret
  - Set up template for optional automatic secret rotation (commented out)
  - Added secret outputs to CloudFormation stack
  - Added application and environment tags to secrets for better management
  - Created a TypeScript script (scripts/create-statsig-secrets.ts) to manage secrets:
    - Takes API keys from environment variables (STATSIG_DEV_API_KEY, etc.)
    - Creates all environment secrets (dev, staging, prod) in a single execution
    - Handles both creation and updating of existing secrets

### 2025-04-02 (Session 1)
- Added markdown blog functionality
  - Installed react-markdown for rendering markdown content
  - Created content directory for storing markdown posts with frontmatter
  - Implemented post loading and parsing utilities in src/utils/posts.ts
  - Added PostContent component for rendering individual posts
  - Added PostList component for displaying post listings
  - Created blog post listing page at /posts route
  - Created dynamic post pages with route parameters at /posts/:slug
  - Styled posts with responsive layouts
  - Added recent posts section to homepage
  - Implemented server-side rendering of posts with Vike's data loading
  - Created example posts to demonstrate functionality
  - Used Vike's route parameters to support dynamic post URLs

### 2025-03-29 (Session 3)
- Added environment-specific document titles
  - Modified build process to use environment variables (APP_ENV)
  - Set different title formats based on environment:
    - Production: "John Mollberg"
    - Staging: "STAGING - John Mollberg"
    - Development: "DEV - John Mollberg"
  - Updated Vite configuration to inject environment variables
  - Added environment-specific build scripts to package.json
  - Updated the deploy script to pass APP_ENV during build
  - Modified both client-side (+onRenderHtml.tsx) and server-side (server/index.ts) rendering

### 2025-03-29 (Session 2)
- Added multi-environment support (dev, staging, prod)
  - Modified CloudFormation template to include Environment parameter
  - Added environment-specific resource naming in template.yaml
  - Added Environment tag to CloudFront distribution for better identification
  - Updated deploy-static.js to accept environment parameter
  - Created DRY deployment scripts using helper scripts and environment variables
  - Implemented consistent naming with personal-website-{env} for all stacks
  - Created separate CloudFront distributions and S3 buckets for each environment
  - Maintained backwards compatibility with existing scripts
  - Added environment-specific cache invalidation commands using CloudFront tags
  - Updated documentation with new deployment commands
  - Reduced code duplication by centralizing environment-specific code

### 2025-03-29 (Session 1)
- Updated ESLint configuration to follow TypeScript-ESLint recommended patterns
  - Added TypeScript-ESLint stylistic rules
  - Fixed server/index.ts syntax error with missing closing parenthesis
  - Removed unused 'path' import from deploy-static.js
  - Configured ESLint to enforce consistent type imports with 'import type'
  - Added proper globals configuration for browser and node environments
  - Improved ignores configuration to skip __mocks__ directory
  - Enhanced code quality with additional TypeScript-specific rules
  - Fixed all lint warnings:
    - Removed unused imports (lazy, Suspense, Context)
    - Removed unused function parameters (command, _context)
    - Replaced 'any' type with 'unknown' for type safety
- Added favicon.ico to the website
  - Created a simple favicon and placed it in the public directory
  - Added favicon link to the HTML head in +onRenderHtml.tsx
  - Updated deploy-static.js to copy favicon.ico to S3 bucket root
  - Added favicon.ico to CloudFront invalidation paths
- Modified CloudFront error handling for 404 responses
  - Removed 404 error response handling from CloudFront configuration
  - Updated Lambda handler to return proper 404 responses that won't trigger fallback
  - Removed ErrorDocument from S3 bucket configuration
- Updated deploy-static.js to wait for CloudFront invalidation to complete
  - Added code to wait for invalidation using AWS CLI's wait command
  - Provides better feedback and ensures deployment is fully complete

### 2025-03-27
- Fixed test warnings and cleaned up project
  - Fixed React act() warnings in tests by properly wrapping component renders
  - Removed obsolete cf-config.json and cf-config.json-e files
  - Removed unused upload-assets script from package.json
  - Removed aws-cdk-lib and constructs dependencies (using SAM instead of CDK)
  - Fixed duplicate compilerOptions in tsconfig.server.json
  - Updated README.md to reflect current project structure and commands
  - Updated CLAUDE.md with correct deployment commands and technology stack
- Added Jest testing configuration
  - Added test and test:watch scripts to package.json
  - Created Jest configuration files (jest.config.ts, jest.setup.ts)
  - Added file and style mocks for testing
  - Added sample test for App component
  - Installed Jest and React Testing Library dependencies
- Enhanced WebVitals component with loading animation
  - Added grayscale filter to charts during loading state
  - Implemented animated cursor that moves back and forth
  - Created test file for WebVitals component
  - Used CSS keyframes animation for smooth animation
  - Moved styles from inline to dedicated WebVitals.css file
  - Improved maintainability with proper CSS class-based styling
  - Made metrics clickable with links to web.dev documentation
  - Added hover effects and arrow indicator for better UX
  - Added tests for clickable functionality

### 2025-03-24
- Fixed server bundling issue with Vike modules
  - Added 'vike' and 'vike-react' to noExternal list in vite.config.ts
  - Added makeAbsoluteExternalsRelative: false to rollup options
  - Problem: dist/server/index.js had unbundled import from 'vike/server'
  - Added custom Vite plugin to inject 'import './entry.js'' only in the production server build
    - Added directly at the beginning of the bundled file to avoid tree-shaking
    - Implemented in the closeBundle hook that runs after bundling is complete
- Fixed Lambda@Edge issues with CloudFront
  - Updated Lambda handler to check for valid event structure
  - Added comprehensive logging for debugging
  - Added CloudFront logging configuration
  - Ensured proper IAM permissions for Lambda@Edge
  - Set cache headers to no-cache for dynamic content
- Updated deployment process
  - Added DeploymentTimestamp parameter to CloudFormation template
  - Modified deploy scripts to include unique timestamp for each deployment
  - This ensures a new Lambda@Edge version is published with each deployment

## Persistence Instructions
IMPORTANT: When completing significant changes, always update this file with:
1. New context gained about the project
2. Any important decisions made
3. New components or patterns introduced
4. Changes to project structure or configuration
5. Current work in progress