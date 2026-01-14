import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // 1. Increases the limit from 500kb to 1000kb to reduce warning frequency
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // 2. This function splits large libraries into their own files
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Grouping major libraries to improve caching and reduce main bundle size
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('socket.io-client')) return 'vendor-socket';

            return 'vendor'; // Everything else goes into a general vendor file
          }
        },
      },
    },
  },
})