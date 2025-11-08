import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';

export default defineConfig({
    root: path.resolve(__dirname, './src'),
    build: {
        outDir: path.resolve(__dirname, './dist')
    },
    plugins: [
        angular({
            tsconfig: path.resolve(__dirname, 'tsconfig.app.json'),
        }),
        viteTsConfigPaths(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 4200,
    }
});