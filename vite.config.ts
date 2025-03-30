import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vike from 'vike/plugin'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => {
  const isProduction = mode === 'production'
  
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')
  const appEnv = env.APP_ENV || (isProduction ? 'prod' : 'dev')
  
  return {
    // Define environment variables
    define: {
      'import.meta.env.VITE_APP_ENV': JSON.stringify(appEnv)
    },
    plugins: [
      react(), 
      vike(),
      {
        name: 'add-entry-import',
        closeBundle: {
          sequential: true,
          order: 'post',
          handler() {
            if (isProduction && isSsrBuild) {
              // Path to the server entry file
              const serverEntryPath = path.resolve(__dirname, 'dist/server/index.js')
              
              if (fs.existsSync(serverEntryPath)) {
                let content = fs.readFileSync(serverEntryPath, 'utf8')
                
                // Add the import at the very beginning of the file
                // This ensures it won't be removed by tree-shaking or other optimizations
                content = `import './entry.js';\n${content}`
                
                fs.writeFileSync(serverEntryPath, content)
                console.log('Added entry.js import to server bundle')
              }
            }
          }
        }
      },
    ],
    // Define aliases to ensure imports work correctly
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@pages': resolve(__dirname, './pages')
      }
    },
    // Configure Vite to properly serve the pages directory
    server: {
      fs: {
        allow: ['./src', './pages', '.']
      }
    },
    ssr: isProduction ? {
      // Bundle all dependencies for Lambda environment
      external: ['vite'],
      noExternal: true,
    } : undefined,
    // Server build configuration
    build: isSsrBuild ? {
      ssr: true,
      outDir: 'dist/server',
      rollupOptions: {
        input: {
          index: 'server/index.ts'
        },
        output: {
          format: 'esm',
          entryFileNames: '[name].js'
        },
        preserveEntrySignatures: 'exports-only',
        external: [],
        // Make sure vike modules are bundled
        makeAbsoluteExternalsRelative: false,
      }
    } : undefined,
  }
})
