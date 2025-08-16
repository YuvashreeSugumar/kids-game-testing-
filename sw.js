const CACHE_NAME='pps-v1';
const ASSETS=[
  './','./index.html','./style.css','./script.js','./manifest.webmanifest',
  './icons/icon-192.png','./icons/icon-512.png',
  // memory assets
  './assets/cards/crown.svg','./assets/cards/heart.svg','./assets/cards/star.svg','./assets/cards/butterfly.svg','./assets/cards/unicorn.svg','./assets/cards/lipstick.svg','./assets/cards/purse.svg','./assets/cards/mirror.svg','./assets/cards/shoe.svg','./assets/cards/rainbow.svg','./assets/cards/flower.svg','./assets/cards/dress.svg',
  // coloring
  './assets/coloring/butterfly.svg','./assets/coloring/flower.svg','./assets/coloring/castle.svg',
  // dressup
  './assets/dressup/dress1.png','./assets/dressup/dress2.png','./assets/dressup/top1.png','./assets/dressup/skirt1.png','./assets/dressup/hair1.png','./assets/dressup/shoes1.png'
];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME && caches.delete(k))))); });
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(res=> res || fetch(e.request)));
  }
});
