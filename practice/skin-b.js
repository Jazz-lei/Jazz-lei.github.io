/* B안 연습 화면: 왼쪽에 사이클 목차, 아래쪽에 재생 바.
   원래 버튼·입력칸을 그대로 옮겨 쓰기만 해서 engine.js 동작은 바뀌지 않아요. */
(function(){
  const $=id=>document.getElementById(id);
  const bar=document.querySelector('.bar'); if(!bar) return;
  const MC={chordtone:['#2b2b30','CH.1'],arpeggio:['#c9bfa6','CH.2'],bebop:['#d8a43f','CH.3'],enclosure:['#2d5b86','CH.4'],combo:['#7a3a52','MIX'],lick:['#1d3557','LICK']};
  const meth=(typeof METHOD!=='undefined'&&METHOD)||'bebop', mc=MC[meth]||MC.bebop;
  const svg=d=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;

  /* --- 아래쪽 재생 바 --- */
  const info=document.createElement('div'); info.className='sk-info';
  info.innerHTML=`<span class="sk-cov" style="background:${mc[0]}">${mc[1]}</span>`;
  info.appendChild(document.querySelector('.bar .now'));
  const ctr=document.createElement('div'); ctr.className='sk-ctr';
  const tr=document.createElement('div'); tr.className='sk-tr';
  const nav=(dir,label,d)=>{ const b=document.createElement('button'); b.type='button'; b.className='sk-nav'; b.setAttribute('aria-label',label); b.innerHTML=svg(d);
    b.onclick=()=>{ const a=$(dir); if(a&&a.getAttribute('href')) a.click(); }; return b; };
  const pv=nav('prevs','이전 곡','M6 5h2v14H6zM20 5v14L9 12z'), nx=nav('nexts','다음 곡','M16 5h2v14h-2zM4 5v14l11-7z');
  tr.append($('loopb'),pv,$('play'),nx,$('gear'));
  ctr.append(tr);
  ctr.append(document.querySelector('.bar .mix'));
  const right=document.createElement('div'); right.className='sk-right';
  const r2=document.createElement('div'); r2.className='sk-row'; r2.append($('key'),document.querySelector('.bar .tempo'));
  right.append(r2);
  const ls=$('licksel'); if(ls) right.append(ls);
  bar.prepend(info); bar.insertBefore(ctr,info.nextSibling); bar.insertBefore(right,ctr.nextSibling);
  const navState=()=>{ const sn=$('songnav'); const off=!sn||sn.hidden; pv.disabled=off; nx.disabled=off; };

  /* --- 왼쪽 사이클 목차 --- */
  const out=document.createElement('aside'); out.className='sk-out'; out.setAttribute('aria-label','사이클 목차');
  document.body.appendChild(out);
  function build(){
    const name=(document.querySelector('.sg-name')||{}).textContent||'', k=(document.querySelector('.kn')||{}).textContent||'';
    let h=`<div class="sk-song"><b>${esc(name)}</b><span>${esc(k)}${k?' · ':''}${esc(($('mname')||{}).textContent||'')}</span></div>`;
    document.querySelectorAll('#scores .cycle').forEach(sec=>{
      const g=[...sec.classList].find(c=>c.length===1)||'A', t=(sec.querySelector('.cycle-head h2')||{}).textContent||'';
      h+=`<div class="sk-g" style="--cc:var(--${g.toLowerCase()})"><i></i>${esc(t)}</div>`;
      sec.querySelectorAll('.chorus').forEach(ch=>{ const i=ch.id.slice(2);
        h+=`<div class="sk-i" data-i="${i}" style="--cc:var(--${g.toLowerCase()})"><button type="button" class="sk-go"><b>${esc(ch.querySelector('.id').textContent)}</b><small>${esc(ch.querySelector('.start').textContent)}</small></button>`+
           `<button type="button" class="sk-a" data-act="play" aria-label="여기서 재생" title="여기서 재생">▶</button><button type="button" class="sk-a" data-act="loop" aria-label="이 코러스 반복" title="반복">↻</button></div>`; });
    });
    out.innerHTML=h; mirror(); navState();
  }
  function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  out.addEventListener('click',e=>{ const it=e.target.closest('.sk-i'); if(!it) return; const i=it.dataset.i, act=(e.target.closest('[data-act]')||{}).dataset;
    if(act&&act.act==='play') document.querySelector(`#ch${i} .play1`).click();
    else if(act&&act.act==='loop') document.querySelector(`#ch${i} .loop1`).click();
    else { const b=document.querySelector(`#jump button[data-i="${i}"]`); b&&b.click(); } });
  function mirror(){ document.querySelectorAll('#jump button[data-i]').forEach(b=>{ const it=out.querySelector(`.sk-i[data-i="${b.dataset.i}"]`); if(!it) return;
      it.classList.toggle('cur',b.classList.contains('cur')); it.classList.toggle('sel',b.classList.contains('sel'));
      if(b.classList.contains('cur')) it.scrollIntoView({block:'nearest'}); }); }
  const j=$('jump');
  new MutationObserver(ms=>{ if(ms.some(m=>m.type==='childList')) build(); else mirror(); }).observe(j,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  new MutationObserver(build).observe($('songnav')||document.body,{attributes:true,attributeFilter:['hidden']});
  build();
  let ly=scrollY; addEventListener('scroll',()=>{ const y=scrollY, d=y-ly; if(Math.abs(d)<6) return; document.documentElement.classList.toggle('sk-compact',d>0&&y>60); ly=y; },{passive:true});
})();
