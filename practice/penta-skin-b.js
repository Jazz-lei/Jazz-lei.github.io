/* B안 펜타토닉 화면: 툴 탭을 왼쪽 목차로, 재생 바를 아래쪽으로 */
(function(){
  const $=id=>document.getElementById(id), tabs=[...document.querySelectorAll('.tab')];
  const out=document.createElement('aside'); out.className='sk-out'; out.setAttribute('aria-label','펜타토닉 툴');
  out.innerHTML='<div class="sk-song"><b>펜타토닉</b><span>툴 3개</span></div><div class="sk-g">툴</div>'+
    tabs.map((t,i)=>`<button type="button" class="sk-go" data-tab="${t.id}"><i>${i+1}</i><span></span></button>`).join('');
  out.querySelectorAll('.sk-go').forEach(b=>{ const t=$(b.dataset.tab); b.querySelector('span').textContent=t.textContent; b.onclick=()=>t.click(); });
  document.body.appendChild(out);
  const sync=()=>{ out.querySelectorAll('.sk-go').forEach(b=>b.setAttribute('aria-current',String($(b.dataset.tab).getAttribute('aria-selected')==='true')));
    const cur=tabs.find(t=>t.getAttribute('aria-selected')==='true'); const s=info.querySelector('small'); if(cur&&s) s.textContent=cur.textContent; };
  const w=document.querySelector('#mixbar .wrap'), info=document.createElement('div'); info.className='sk-info';
  info.innerHTML='<span class="sk-cov">PT</span><span class="sk-t"><b>펜타토닉</b><small></small></span>'; w.prepend(info);
  new MutationObserver(sync).observe(document.querySelector('.tabs'),{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  sync();
})();
