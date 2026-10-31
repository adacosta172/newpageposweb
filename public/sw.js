const CACHE='newpage-static-v1';
const OFFLINE=['/offline.html','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(OFFLINE)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin) return;
  // Never cache any business data, auth, API, page responses or payment traffic.
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));
  } else if(url.pathname.startsWith('/icons/')){
    event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
  }
});
