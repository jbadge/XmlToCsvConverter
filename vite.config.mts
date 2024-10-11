import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

import { EsLinter, linterPlugin } from 'vite-plugin-linter'

export default defineConfig((configEnv) => ({
  plugins: [
    reactRefresh(),
    linterPlugin({
      build: {
        disable: true,
      },
      include: ['./src/**/*.ts', './src/**/*.tsx'],
      linters: [
        new EsLinter({
          configEnv: configEnv,
          serveOptions: { cache: false, formatter: 'visualstudio' },
        }),
      ],
    }),
  ],
}))
