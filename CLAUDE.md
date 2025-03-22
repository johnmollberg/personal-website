# Guidance for Claude on Personal Website Project

## Commands
- **Install**: `yarn install`
- **Dev Server**: `yarn dev` 
- **Build**: `yarn build`
- **Preview Build**: `yarn preview`
- **Lint**: `yarn lint`
- **Test**: `yarn test`
- **Single Test**: `yarn test <test-path>`
- **Deploy Infrastructure**: `cd infra && cdk deploy`

## Code Style Guidelines
- **TypeScript**: Use TypeScript for all new code with proper type definitions
- **Imports**: Group imports by external packages, then project imports
- **Component Structure**: React functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Use try/catch blocks and propagate errors with context
- **Formatting**: 2 space indentation, 80-column width
- **Statsig**: Use for feature flags and content management
- **AWS CDK**: TypeScript with L2 constructs for infrastructure
- **Comments**: JSDoc format for functions, minimal inline comments