const C='tailor-v2';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C)
    .then(c=>Promise.all(CORE.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>c.put(u,r)))))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const isDoc=req.mode==='navigate'||req.destination==='document';
  if(isDoc){
    e.respondWith(
      fetch(new Request(req.url,{cache:'no-cache'}))
        .then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(req.url,cp));return r})
        .catch(()=>caches.match(req.url).then(h=>h||caches.match('index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{
      if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(C).then(c=>c.put(req,cp))}
      return r;
    }).catch(()=>hit);
    return hit||net;
  }));
});
