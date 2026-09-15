/* 오프라인 캐시 — 요세미티처럼 통신이 약한 곳에서도 페이지가 열립니다 */
const CACHE='trip2026-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest',
  './icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;                 // 동기화 전송은 건드리지 않습니다
  const url=new URL(req.url);
  const sameOrigin = url.origin===self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(!sameOrigin && !isFont) return;             // 동기화 서버 응답은 캐시하지 않습니다
  e.respondWith(
    caches.match(req).then(hit=>hit || fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
