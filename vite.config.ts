import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The cloud preview hostname is supplied per-VM at runtime as an exact host.
// Never hard-code a blanket allowlist or allowedHosts: true.
const previewHost = process.env.MEWZAK_PREVIEW_HOST;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: previewHost ? [previewHost] : [],
  },
});
