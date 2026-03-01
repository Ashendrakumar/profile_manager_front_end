import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/modules': path.resolve(__dirname, './src/modules'),
            '@/common': path.resolve(__dirname, './src/common'),
            '@/layouts': path.resolve(__dirname, './src/layouts'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/services': path.resolve(__dirname, './src/services'),
            '@/utils': path.resolve(__dirname, './src/utils'),
            '@/constants': path.resolve(__dirname, './src/constants'),
            '@/theme': path.resolve(__dirname, './src/theme'),
            '@/routes': path.resolve(__dirname, './src/routes'),
            '@/contexts': path.resolve(__dirname, './src/contexts'),
        },
    },
});
