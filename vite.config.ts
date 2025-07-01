import { defineConfig, loadEnv, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.log('Vite Config - Environment Variables:', {
    hasGroqKey: !!env.VITE_GROQ_API_KEY,
    keyLength: env.VITE_GROQ_API_KEY?.length,
    mode: mode,
  });

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
    },
    server: {
      historyApiFallback: true,
    },
  };
});
