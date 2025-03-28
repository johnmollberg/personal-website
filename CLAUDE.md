# Guidance for Claude on Personal Website Project

## Project Context
This is a personal website built with:
- React + TypeScript
- Vike (previously Vite) for SSR
- Hosted on AWS/CloudFront
- Recent migration from Vite to Vike

## Commands
- **Install**: `yarn install`
- **Dev Server**: `yarn dev` 
- **Build**: `yarn build`
- **Preview Build**: `yarn preview`
- **Lint**: `yarn lint`
- **Test**: `yarn test`
- **Test Watch Mode**: `yarn test:watch`
- **Single Test**: `yarn test <test-path>`
- **Deploy Infrastructure**: `yarn deploy`
- **Deploy Static Assets**: `yarn deploy:static`
- **Deploy Everything**: `yarn deploy:all`

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
- Server-side rendering implemented with Lambda@Edge

## Session Context
Add important context from each Claude session here to ensure continuity between sessions. Include:
- Key decisions made
- Problems solved
- Changes implemented
- Known issues
- Current priorities

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
  - Added CloudFront logging to S3 bucket
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