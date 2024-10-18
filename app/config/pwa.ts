import type { ModuleOptions } from '@vite-pwa/nuxt'
import process from 'node:process'
import { appDescription, appName } from '../constants/index'

const scope = '/'

/**
 * nginx 部署静态文件的话，需要配置 nginx.conf 对 sw.js 的访问权限
 * @see https://vite-pwa-org.netlify.app/deployment/nginx.html#cache-control
 * demo: 看页面最下方
 */

export const pwa: ModuleOptions = {
  registerType: 'autoUpdate',
  scope,
  base: scope,
  manifest: {
    id: scope,
    scope,
    name: appName,
    short_name: appName,
    description: appDescription,
    theme_color: '#ffffff',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'maskable-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,txt,png,ico,svg}'],
    navigateFallbackDenylist: [/^\/api\//],
    navigateFallback: '/',
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts.googleapis.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts.gstatic.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
  registerWebManifestInRouteRules: true,
  writePlugin: true,
  devOptions: {
    enabled: process.env.VITE_PLUGIN_PWA === 'true',
    navigateFallback: scope,
  },
}

// server {
//   listen       8081;
//   server_name  localhost;

//   # 项目地址
//   root   dist;
//   index  index.html index.htm;

//     location / {
//   try_files $uri $uri/ /index.html;
//   add_header 'Access-Control-Allow-Origin' '*';
//   add_header 'Access-Control-Allow-Headers' '*';
//   add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
//     }

//     # 确保处理静态文件，例如 JS、CSS、图片等
//   location ~* \.(?:ico|css|js|woff2?|ttf|svg|png|jpg|jpeg|gif)$ {
//   try_files $uri =404;
//   expires 1y;
//   access_log off;
//   add_header Cache-Control "public, max-age=31536000, immutable";
//   }

//   # 处理 Service Worker 文件
//   location /sw.js {
//   try_files $uri =404;
//   access_log off;
//   add_header Cache-Control "no-cache";
//   }

//   error_page   500 502 503 504  /50x.html;
//   location = /50x.html {
//   root   /dist;
//   }
// }
