/* Jazz Lei 오프라인 지원 (홈 화면 앱용)
   - 사이트 파일: 인터넷이 되면 항상 최신으로 받아오고, 안 되면 저장해둔 걸 보여줘요.
   - 악보 라이브러리·글꼴(외부): 한 번 받으면 저장해두고 다시 써요.
   파일 구성이 크게 바뀌면 VERSION 숫자만 올려주세요. */
const VERSION = 'v1';
const CACHE = 'jazzlei-' + VERSION;
const CORE = [
  '/', '/index.html', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png',
  '/practice/song.html', '/practice/pentatonic.html', '/practice/two-five-one-bebop.html',
  '/practice/songs.js', '/practice/engine.js',
  ...['bass1','bass2','bass3','bass4','bass5','bass6','hat','kick','ride','snare'].map(n => `/practice/samples/${n}.mp3`),
];
const CDN = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('jazzlei-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    // 최신 우선, 오프라인이면 저장본
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(r => r || (req.mode === 'navigate' ? caches.match('/') : Response.error()))));
    return;
  }

  if (CDN.includes(url.hostname)) {
    // 버전이 고정된 외부 파일: 저장본 우선
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
