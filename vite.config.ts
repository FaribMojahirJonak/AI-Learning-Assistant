import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Vite Config - Environment Variables:', {
    hasGroqKey: !!env.VITE_GROQ_API_KEY,
    keyLength: env.VITE_GROQ_API_KEY?.length,
    mode: mode
  })
  
  return {
    plugins: [react()],
    define: {
      // Explicitly define environment variables
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY)
    },
    server: {
      historyApiFallback: true
    }
  }
})
