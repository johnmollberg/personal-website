import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vike from 'vike/plugin'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode, isSsrBuild, command }) => {
  const isProduction = mode === 'production'
  
  const env = process.env.PUBLIC_APP_ENV
  if (!env) {
    throw new Error('PUBLIC_APP_ENV environment variable is not set')
  }
  
  // Load env variables
  const envObject = loadEnv(env, 'environment', ['PUBLIC_', 'SERVER_'])
  console.debug('envObject', envObject)
  
  return {
    // Define environment variables
    define: Object.entries(envObject).reduce<Record<string, string>>((acc, [key, value]) => {
      if (
        isSsrBuild ||
        key.startsWith('PUBLIC_') ||
        // TODO: Remove this once we have a better way to handle the environment variables
        // this line is needed to prevent the environment variables from being removed from
        // the server bundle when running `vike dev`. A side effect of this is that the
        // secret variables are available in the client bundle when running `vike dev`.
        command === 'serve'
      ) {
        acc[`import.meta.env.${key}`] = JSON.stringify(value)
      }
      return acc
    }, {}),
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

              const postsPath = path.resolve(__dirname, 'src/content/posts')
              if (fs.existsSync(postsPath)) {
                const distPostsPath = path.resolve(__dirname, 'dist/server/src/content/posts')
                if (!fs.existsSync(distPostsPath)) {
                  fs.mkdirSync(distPostsPath, { recursive: true })
                }
                for (const file of fs.readdirSync(postsPath)) {
                  const filePath = path.resolve(postsPath, file)
                  const fileContent = fs.readFileSync(filePath, 'utf8')
                  fs.writeFileSync(path.resolve(distPostsPath, file), fileContent)
                }
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
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
      },
    },
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
