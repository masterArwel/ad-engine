import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 开发服务器配置
  server: {
    port: 3000,
    host: true,
    cors: true,
    // 代理配置，用于开发环境下的微应用请求
    proxy: {
      // 可以根据需要添加代理规则
    },
  },

  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 生成 sourcemap
    sourcemap: true,
    // 构建优化
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          qiankun: ['qiankun'],
        },
      },
    },
  },

  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@config': resolve(__dirname, 'src/config'),
      '@router': resolve(__dirname, 'src/router'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },

  // 预构建配置
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'qiankun'],
  },

  // 环境变量配置
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
