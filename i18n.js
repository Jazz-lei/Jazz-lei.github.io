/* ===== Jazz Lei 다국어 (한국어 · English · 中文 · 日本語) =====
   - 사이트는 지금처럼 한국어로만 쓰면 돼요. 다른 언어는 i18n/en.js · zh.js · ja.js 사전에서
     "한국어 문장": "번역" 짝을 찾아 화면에서 바꿔 끼워요.
   - 문구를 새로 넣거나 고치면 사전에도 같은 한국어 문장으로 한 줄 추가하세요.
     (사전에 없는 문장은 한국어 그대로 보여요. 주소 끝에 ?i18n=miss 를 붙이면 빠진 문장 목록이 콘솔에 나와요.)
   - 언어 선택: 주소 ?lang=en / zh / ja (없으면 한국어). 한 번 고르면 기억해요. */
(function(){
  const LANGS={ko:'한국어',en:'English',zh:'中文',ja:'日本語'};
  const HTML_LANG={ko:'ko',en:'en',zh:'zh-Hans',ja:'ja'};
  const qs=new URLSearchParams(location.search);
  let lang=qs.get('lang');
  if(!LANGS[lang]){ try{ lang=localStorage.getItem('jl-lang'); }catch(e){} }
  if(!LANGS[lang]) lang='ko';
  try{ localStorage.setItem('jl-lang',lang); }catch(e){}
  const MISS=new Set(), FRAG=new Set(), showMiss=qs.get('i18n')==='miss';

  const JL={lang, LANGS, dict:{}, pats:[], miss:MISS, frag:FRAG,
    add(l,d,p){ if(l!==lang) return; Object.assign(this.dict,d); if(p) this.pats.push(...p); },
    /* 스크립트 안에서 직접 번역할 때: JL.t('한국어') */
    t(s){ return tr(s)??s; },
    /* 언어 바꾸기: 지금 화면(#주소) 그대로 다시 열어요 */
    set(l){ if(!LANGS[l]) return; try{ localStorage.setItem('jl-lang',l); }catch(e){}
      const u=new URL(top.location.href); if(l==='ko') u.searchParams.delete('lang'); else u.searchParams.set('lang',l); top.location.href=u.toString(); },
    url(path){ return lang==='ko'?path:path.replace(/^([^#?]*)(\?[^#]*)?/,(m,p,q)=>p+(q?q+'&':'?')+'lang='+lang); },
  };
  window.JL=JL;
  document.documentElement.lang=HTML_LANG[lang];
  if(lang==='ko') return;
  document.documentElement.classList.add('lang-'+lang);

  const root=(document.currentScript&&document.currentScript.src.replace(/i18n\.js.*$/,''))||'/';
  document.write('<script src="'+root+'i18n/'+lang+'.js"><\/script>');

  const KO=/[가-힣]/; let inUnit=false;
  const norm=s=>s.replace(/\s+/g,' ').trim();
  const CACHE=new Map();
  function tr(s){
    if(!s||!KO.test(s)) return null;
    const k=norm(s); if(CACHE.has(k)) return CACHE.get(k);
    const r=tr0(k); CACHE.set(k,r); return r;
  }
  function tr0(k){
    const d=JL.dict;
    if(k in d) return d[k];
    for(const [re,rep] of JL.pats){ re.lastIndex=0; if(re.test(k)){ re.lastIndex=0; const r=k.replace(re,(...a)=>typeof rep==='function'?rep(...a):rep.replace(/\$(\d)/g,(_,i)=>{ const v=a[+i]; return v==null?'':(tr(v)??v); })); if(!KO.test(r)) return r; } }
    /* "A-1 · 근음 시작"처럼 · / → 로 이어진 문구는 조각마다 번역 */
    for(const sep of [' · ',' → ',' / ',': ']){ if(!k.includes(sep)) continue;
      const ps=k.split(sep), seg=i=>{ if(i===ps.length) return [];
        for(let j=ps.length;j>i;j--){ if(i===0&&j===ps.length) continue; const h=ps.slice(i,j).join(sep), r=KO.test(h)?tr(h):h;
          if(r!=null){ const rest=seg(j); if(rest) return [r,...rest]; } } return null; };
      const r=seg(0); if(r) return r.join(sep); }
    (inUnit?FRAG:MISS).add(k); return null;
  }
  const INLINE=new Set(['B','I','EM','STRONG','KBD','SMALL','BR','SUB','SUP','CODE','U','SPAN']);
  /* 문장 안에 굵은 글씨 같은 꾸밈만 있으면 문장 전체(innerHTML)를 한 번에 번역 */
  function unit(el){
    if(!el.children.length) return false;
    for(const c of el.children){ if(!INLINE.has(c.tagName)||c.id||(c.tagName==='SPAN'&&c.className)||c.children.length) return false; }
    return true;
  }
  const ATTR=['aria-label','title','placeholder','alt','content','data-tip'];
  const leadWS=s=>s.match(/^\s*/)[0], tailWS=s=>s.match(/\s*$/)[0];
  function doText(n){ const v=n.nodeValue; const r=tr(v); if(r!=null){ const t=leadWS(v)+r+tailWS(v); if(t!==v) n.nodeValue=t; } }
  function doEl(el){
    if(el.nodeType!==1) return;
    if(el.tagName==='SCRIPT'||el.tagName==='STYLE') return;
    for(const a of ATTR){ const v=el.getAttribute(a); if(v&&KO.test(v)){ if(a==='content'&&el.tagName==='META'&&!/^(description|og:|twitter:)/.test(el.getAttribute('name')||el.getAttribute('property')||'')) continue; const r=tr(v); if(r!=null) el.setAttribute(a,r); } }
    const u=KO.test(el.textContent)&&unit(el);
    if(u){ const r=tr(el.innerHTML); if(r!=null){ el.innerHTML=r; return; } }
    const was=inUnit; if(u) inUnit=true;
    for(let c=el.firstChild;c;c=c.nextSibling){ if(c.nodeType===3) doText(c); else if(c.nodeType===1) doEl(c); }
    inUnit=was;
  }
  let busy=false;
  const mo=new MutationObserver(ms=>{ if(busy) return; busy=true; try{
    for(const m of ms){
      if(m.type==='attributes'){ doEl(m.target); continue; }
      const ns=m.type==='characterData'?[m.target]:m.addedNodes;
      ns.forEach(n=>{ if(!n.isConnected) return; const p=n.parentElement; if(p&&(p.tagName==='SCRIPT'||p.tagName==='STYLE')) return; // 꾸밈 글자가 낀 문장이면 문장 전체를 번역
        if(p&&unit(p)&&KO.test(p.textContent)) doEl(p); else if(n.nodeType===3) doText(n); else doEl(n); });
    } } finally{ busy=false; } });
  mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});
  const all=()=>{ busy=true; try{ doEl(document.documentElement); } finally{ busy=false; } };
  document.addEventListener('DOMContentLoaded',all);
  addEventListener('load',()=>{ all(); if(showMiss) console.log('[i18n] 사전에 없는 문장 '+MISS.size+'개:\n'+[...MISS].join('\n')); });
  /* 알림창 문구도 번역 */
  const al=window.alert; window.alert=m=>al.call(window,typeof m==='string'?(tr(m)??m):m);
  const cf=window.confirm; window.confirm=m=>cf.call(window,typeof m==='string'?(tr(m)??m):m);
})();
