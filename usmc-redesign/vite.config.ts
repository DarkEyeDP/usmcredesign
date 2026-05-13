import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }


function assetResolver() {
  return {
    name: 'asset-resolver',
    resolveId(id) {
      if (id.startsWith('asset/')) {
        const filename = id.replace('asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/usmcredesign/',
  plugins: [
    assetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      '@/pages': path.resolve(__dirname, './src/app/pages'),
      '@/features': path.resolve(__dirname, './src/app/features'),
      '@/components': path.resolve(__dirname, './src/app/components'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/assets': path.resolve(__dirname, './src/app/assets'),
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(version),
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))
