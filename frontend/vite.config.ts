import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://eventful-api.onrender.com',
        changeOrigin: true
      }
    }
  }
});

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src'),
//     },
//   },
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//       },
//     },
//   },
// });
