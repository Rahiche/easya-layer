import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@easya/layer-ui-react': path.resolve(__dirname, '../packages/easya-react')
    }
  },
});