/* ===== Jazz Lei · 비밥 스케일 연습 엔진 =====
   곡 정보는 songs.js, 화면은 song.html. 규칙을 고치면 모든 곡에 함께 반영돼요. */
const LET='CDEFGAB', LSEMI=[0,2,4,5,7,9,11];
function parse(n){ const l=LET.indexOf(n[0]); let a=0; for(const c of n.slice(1)){ if(c==='b')a--; if(c==='#')a++; } return {l,a,pc:((LSEMI[l]+a)%12+12)%12}; }
const KEYS=['F','Bb','Eb','Ab','Db','Gb','B','E','A','D','G','C'];
const KSIG={F:-1,Bb:-2,Eb:-3,Ab:-4,Db:-5,Gb:-6,B:5,E:4,A:3,D:2,G:1,C:0};
let SONG=null, REF='F', KEY='F', MINOR=false, FORM=[], CHORDS=[], METHOD='bebop';
const kdisp=k=>k.replace(/b/g,'♭').replace(/#/g,'♯');
const nameOf=(l,pc)=>{ let a=((pc-LSEMI[l])%12+12)%12; if(a>6)a-=12; return LET[l]+(a<0?'b'.repeat(-a):'#'.repeat(a)); };
// 곡의 기준 키(REF)에서 지금 키(KEY)로 음 이름을 옮김
function tn(n){ const p=parse(n), r=parse(REF), k=parse(KEY), dl=(k.l-r.l+7)%7, ds=(k.pc-r.pc+12)%12;
  return nameOf((p.l+dl)%7,(p.pc+ds)%12); }
// 옮긴 근음이 C♭·F♭·E♯·B♯이나 겹임시표면 읽기 쉬운 이름으로 (C♭7 → B7, B𝄫7 → A7)
function simpRoot(n){ const p=parse(n); if(Math.abs(p.a)>=2||/^(Cb|Fb|E#|B#)$/.test(n)){ for(const d of [1,-1]){ const q=respell(p,d); if(Math.abs(q.a)<=1&&!/^(Cb|Fb|E#|B#)$/.test(nameOf(q.l,q.pc))) return nameOf(q.l,q.pc); } } return n; }
function tsym(sym){ const m=sym.match(/^([A-G][b#]*)([^/]*)(?:\/([A-G][b#]*))?$/); return simpRoot(tn(m[1]))+m[2]+(m[3]?'/'+simpRoot(tn(m[3])):''); } // 슬래시 코드의 베이스도 옮김
function respell(p,d){ const l=(p.l+d+7)%7; let a=((p.pc-LSEMI[l])%12+12)%12; if(a>6)a-=12; return {l,a,pc:p.pc}; }
function flatPref(p){ return KSIG[KEY]<0&&p.a>0?respell(p,1):p; }
function keyAcc(l){ const n=KSIG[KEY], L=LET[l];
  if(n<0) return 'BEADGCF'.slice(0,-n).includes(L)?-1:0;
  return 'FCGDAEB'.slice(0,n).includes(L)?1:0; }
// 키 이름: 마이너 곡이면 나란한조 단조 이름으로 (예: B♭ → Gm)
function tonicOf(k){ if(!MINOR) return k; const p=parse(k); return nameOf((p.l+5)%7,(p.pc+9)%12); }
const keyLabel=k=>kdisp(tonicOf(k))+(MINOR?'m':'');

/* ===== 코드 → 비밥 스케일 규칙 =====
   dom : 도미넌트 비밥 (1 2 3 4 5 6 b7 7)            ← 7, 9, 13, sus, m7(V로 가지 않아도 4도 위 V7 스케일)
   alt : 도미넌트 b9·b13 비밥 (1 b2 3 4 5 b6 b7 7)   ← 7alt, 7b9, 7(b9,b13), m7b5(4도 위 V7alt 스케일)
   maj : 메이저 6 비밥 (1 2 3 4 5 #5 6 7)            ← maj7, 6, 69, 메이저 트라이어드
   min : 마이너 6 비밥 (1 2 b3 4 5 #5 6 7)           ← 토닉 마이너(m6, mMaj7, m, 마이너 곡의 토닉 m7)
   dim : 홀-하프 디미니시드 (1 2 b3 4 b5 b6 6 7)      ← dim7
   lyd : 리디안 도미넌트 비밥 (1 2 3 #4 5 6 b7 7)   ← 7#11, 반음 아래로 해결하는 도미넌트(트라이톤 서브)
   m7  : 마이너 7 비밥 (1 2 b3 4 5 6 b7 7)          ← 지금은 쓰지 않음 (m7은 모두 Related II-7)
   한 마디(또는 반 마디) 안의 II-V는 V7 스케일 하나로 묶어서 연주 */
const SCALES={
  dom:{iv:[0,2,4,5,7,9,10,11], lt:[0,1,2,3,4,5,6,6], x:7},
  alt:{iv:[0,1,4,5,7,8,10,11], lt:[0,1,2,3,4,5,6,6], x:7},
  maj:{iv:[0,2,4,5,7,8,9,11], lt:[0,1,2,3,4,4,5,6], x:5},
  min:{iv:[0,2,3,5,7,8,9,11], lt:[0,1,2,3,4,4,5,6], x:5},
  dim:{iv:[0,2,3,5,6,8,9,11], lt:[0,1,2,3,4,5,5,6], x:null},
  lyd:{iv:[0,2,4,6,7,9,10,11], lt:[0,1,2,3,4,5,6,6], x:7},
  m7:{iv:[0,2,3,5,7,9,10,11], lt:[0,1,2,3,4,5,6,6], x:7},
};
const CT=[0,2,4,6]; // 스케일에서 코드톤 위치 (근음·3음·5음·7음/6음)
// 코드 기호의 성격과 코드톤 (근음 기준 반음, 글자 간격)
const QUAL={
  dom:{iv:[0,4,7,10],lt:[0,2,4,6]}, alt:{iv:[0,4,7,10],lt:[0,2,4,6]}, lyd:{iv:[0,4,7,10],lt:[0,2,4,6]},
  m7:{iv:[0,3,7,10],lt:[0,2,4,6]}, m7b5:{iv:[0,3,6,10],lt:[0,2,4,6]},
  maj7:{iv:[0,4,7,11],lt:[0,2,4,6]}, maj6:{iv:[0,4,7,9],lt:[0,2,4,5]},
  m6:{iv:[0,3,7,9],lt:[0,2,4,5]}, mmaj7:{iv:[0,3,7,11],lt:[0,2,4,6]},
  dim:{iv:[0,3,6,9],lt:[0,2,4,6]},
};
function chordInfo(sym){
  const m=sym.match(/^([A-G][b#]?)(.*)$/); if(!m) throw new Error('코드 이름을 읽을 수 없어요: '+sym);
  const root=m[1], q=m[2].replace(/\s/g,'').split('/')[0]; // D7/C → 성격은 D7으로
  let qual;
  if(/^(m7b5|m7\(b5\)|ø7?|-7b5|mi7b5|min7b5)$/.test(q)) qual='m7b5';
  else if(/^(dim7?|o7?|°7?)$/.test(q)) qual='dim';
  else if(/^(mMaj7|m\(maj7\)|mM7|-maj7|-Δ7?)$/.test(q)) qual='mmaj7';
  else if(/^(m6|-6|mi6|min6|m69|m6\/9|m|-|mi|min)$/.test(q)) qual='m6';
  else if(/^(m7|m9|m11|-7|-9|mi7|min7)$/.test(q)) qual='m7';
  else if(/^(maj7|M7|maj9|Δ7?|ma7|Maj7)$/.test(q)) qual='maj7';
  else if(/^(6|69|6\/9|maj|M|)$/.test(q)) qual='maj6';
  else if(/(alt|b9|#9|b13|#5|\+)/.test(q)) qual='alt';
  else if(/#11/.test(q)) qual='lyd';
  else qual='dom';
  let disp=sym;
  if(qual==='m7b5') disp=root+'m7(b5)';
  else if(qual==='lyd') disp=root+'7(#11)';
  else if(qual==='alt'){ const t=q.match(/^7\(?([b#]\d+(?:,?[b#]\d+)*)\)?$/); disp=t?root+'7('+t[1].replace(/,/g,'').replace(/(\d)(?=[b#])/g,'$1,')+')':root+'7(b9,b13)'; } // A7b9 → A7(b9), D7alt → D7(b9,b13)
  return {sym,root,qual,disp,pc:parse(root).pc};
}
// 스케일에 없는 음이 들어오면(드문 경우) 키에 맞춰 이름을 붙여서 멈추지 않게
function spOf(ch,m){ const pc=((m%12)+12)%12; if(ch.byPc[pc]) return ch.byPc[pc];
  const want=[0, KSIG[KEY]<0?-1:1, KSIG[KEY]<0?1:-1]; // 제자리음 → 키에 맞는 샵/플랫 순서
  for(const a of want) for(let l=0;l<7;l++) if(((LSEMI[l]+a)%12+12)%12===pc) return {l,a,pc};
}
// 세그먼트를 시작할 때 쓰는 코드톤: 악보에 적힌 코드(예: Related II-7인 Dm7)의 코드톤 중 스케일 안에 있는 음.
// 하나도 없으면 스케일 코드(V7)의 코드톤
function startTones(C,sg){ const ch=C[sg.k], w=C[sg.syms[0][0]].tones.filter(t=>ch.pcs.includes(t.pc)); return w.length?w:ch.tones; }
const up4=root=>{ const p=parse(root); return nameOf((p.l+3)%7,(p.pc+5)%12); };
// 코드 하나만 있을 때 쓸 스케일 [종류, 근음]
function scaleFor(c){
  switch(c.qual){
    case 'dom': return [c.subV?'lyd':'dom',c.root]; // 반음 아래로 해결하면 트라이톤 서브 → #11
    case 'alt': return ['alt',c.root];
    case 'lyd': return ['lyd',c.root];
    case 'maj7': case 'maj6': return ['maj',c.root];
    case 'm6': case 'mmaj7': return ['min',c.root];
    case 'dim': return ['dim',c.root];
    case 'm7b5': return ['alt',up4(c.root)];
    case 'm7': return (MINOR && c.pc===parse(SONG_TONIC).pc) ? ['min',c.root] : ['dom',up4(c.root)]; // m7은 모두 Related II-7 → 4도 위 V7 비밥 (마이너 곡의 토닉 m7만 마이너 6 비밥)
  }
}
let SONG_TONIC='F';
const isIIV=(a,b)=>(a.qual==='m7'||a.qual==='m7b5')&&(b.qual==='dom'||b.qual==='alt')&&b.pc===(a.pc+5)%12;
// 곡의 마디 목록 → 연주 단위(세그먼트). k = 스케일, syms = 악보에 적을 코드와 위치(8분음표)
function buildForm(bars){
  // 'F#dim7=D7alt' → 악보에는 F#dim7, 연주는 D7alt 스케일
  // 끝에 !를 붙이면(D7!) 아래 III7·VI7·VII7 규칙을 적용하지 않고 9·13 그대로
  const tok=t0=>{ const nat=t0.endsWith('!'), t=t0.replace(/!$/,''); const [shown,play]=t.split('='); const c=chordInfo(play||shown); c.sym=shown; c.nat=nat; return c; };
  const all=bars.map(bar=>bar.trim().split(/\s+/).map(tok)), flat=all.flat(); CHORDS=all;
  // 키의 III7·VI7·VII7은 마이너 코드로 해결하는 V7이라 ♭9·♭13 (예: C키 E7·A7·B7). 마이너 곡은 나란한조 메이저 기준
  const ref=parse(REF).pc;
  flat.forEach(c=>{ if(c.qual==='dom'&&!c.nat&&[4,9,11].includes((c.pc-ref+12)%12)){ c.qual='alt'; c.sym=c.sym.replace(/^([A-G][b#]?)[^/]*/,'$17alt'); } });
  // 도미넌트 다음 코드가 반음 아래면 트라이톤 서브로 표시 (마지막 코드는 첫 코드로 이어진다고 봄)
  // 같은 코드가 이어지면(Gm7 │ Gm7 │ C7) 그다음 다른 코드를 봄
  flat.forEach((c,i)=>{ let j=(i+1)%flat.length; for(let k=0;k<flat.length&&flat[j].pc===c.pc&&flat[j].qual===c.qual;k++) j=(j+1)%flat.length; const nx=flat[j]; c.subV=c.qual==='dom'&&nx.pc===(c.pc+11)%12;
    c.toV=['dom','alt','lyd'].includes(nx.qual)&&nx.pc===(c.pc+5)%12; }); // m7 다음이 4도 위 도미넌트인가
  return all.map(cs=>{
    const n=cs.length; const bar=cs.map(c=>c.sym).join(' ');
    if(![1,2,4].includes(n)) throw new Error('한 마디에 코드는 1, 2, 4개만 넣을 수 있어요: '+bar);
    const len=8/n, segs=[];
    for(let i=0;i<n;i++){
      const a=cs[i], b=cs[i+1];
      if(b && isIIV(a,b)){ const [t,r]=scaleFor(b); segs.push({k:t+':'+r,len:len*2,syms:[[a.sym,0],[b.sym,len]]}); i++; continue; }
      const [t,r]=scaleFor(a); segs.push({k:t+':'+r,len,syms:[[a.sym,0]]});
    }
    // 같은 마디 안 세그먼트의 코드 위치를 마디 기준이 아닌 세그먼트 기준으로 맞춤
    return segs;
  });
}
function chordDefs(){
  const out={};
  const scaleKeys=new Set(), symKeys=new Set();
  FORM.forEach(bar=>bar.forEach(sg=>{ scaleKeys.add(sg.k); sg.syms.forEach(([s])=>symKeys.add(s)); }));
  for(const k of scaleKeys){
    const [type,root]=k.split(':'), S=SCALES[type];
    // 옮긴 근음을 읽기 쉬운 이름으로 바꿨으면 그 근음에서 바로 스케일을 만듦
    const rT=tn(root), rS=simpRoot(rT), TN=rS===rT?tn:(n=>n), R=parse(rS===rT?root:rS);
    const names=S.iv.map((iv,i)=>nameOf((R.l+S.lt[i])%7,(R.pc+iv)%12));
    const tnames=CT.map(i=>names[i]);
    const ct=tnames.map(n=>parse(TN(n)).pc), xName=S.x===null?null:names[S.x];
    const sc=names.map(n=>{ let p=parse(TN(n));
      if(p.a<=-2) p=respell(p,-1);                                   // 겹내림표는 아래 글자로 (B𝄫 → A)
      if(p.a>=2) p=respell(p,1);                                     // 겹올림표는 위 글자로 (F𝄪 → G)
      // 비밥 경과음은 근음 글자로 적을 수 있으면 그렇게: D–D♭–C, F♯–F–E (플랫 키는 샵일 때만, 샵 키는 플랫이 생기지 않을 때만)
      if(xName && p.pc===parse(TN(xName)).pc){ const r=parse(rS), q=respell(p,(r.l-p.l+7)%7); if(Math.abs(q.a)<=1 && (KSIG[KEY]<0 ? p.a>0 : q.a>=0)) p=q; }
      else if(KSIG[KEY]<0 && p.a>0 && !ct.includes(p.pc) && (type==='dom'||type==='alt'||type==='m7')){ // 플랫 키에서 경과음은 플랫으로
        const q=respell(p,1); if(!names.some(n=>parse(TN(n)).l===q.l && parse(TN(n)).pc!==q.pc)) p=q; } // 단, 스케일에 같은 글자 음이 있으면(F♯→G♭인데 G가 있음) 그대로 // 플랫 키에서 도미넌트의 다른 경과음도 플랫으로 (메이저·마이너 비밥의 7음은 그대로)
      if(type==='dim' && p.a!==0){ const q=respell(p,p.a>0?1:-1); if(q.a===0) p=q; } // 디미니시드는 B♯·E♯·C♭·F♭ 대신 제자리음으로
      return p; });
    const byPc={}; sc.forEach(n=>byPc[n.pc]=n);
    out[k]={sym:rS, x:xName?parse(TN(xName)).pc:null, byPc, pcs:sc.map(n=>n.pc).sort((a,b)=>a-b), tones:tnames.map(n=>parse(TN(n)))};
  }
  for(const s of symKeys){
    const c=chordInfo(s), Q=QUAL[c.qual], R=parse(c.root);
    const t=Q.iv.map((iv,i)=>nameOf((R.l+Q.lt[i])%7,(R.pc+iv)%12));
    out[s]={sym:tsym(c.disp), tones:t.map(n=>parse(tn(n)))};
  }
  return out;
}
let LOW=60; const LOW_B=43, HI_B=88; /* 사이클 B 최저음: G2(연주는 한 옥타브 위 G3) */ const DEG=[0,1,2], DEGNAME=['근음','3음','5음'];
function lower(ch,m){ // next scale note strictly below m
  let best=-1e9;
  for(const pc of ch.pcs){ let c=m-((m-pc)%12+12)%12; if(c>=m)c-=12; if(c===m)c-=12; if(c>best)best=c; }
  return best;
}
function inst(pc,lo){ let m=lo+((pc-lo)%12+12)%12; return m; } // lowest midi >= lo with pc
function walk(ch,start,len,jump){
  const seq=[start]; let c=start;
  for(let i=1;i<len;i++){ let n=lower(ch,c); if(jump&&n<LOW)n+=12; seq.push(n); c=n; }
  return seq;
}
function fitWalk(ch,s,len){
  let w=walk(ch,s,len,false); if(Math.min(...w)>=LOW) return w;
  while(Math.min(...w)<LOW){ s+=12; w=walk(ch,s,len,false); }
  // 사이클 B도 필요한 만큼(보통 한 옥타브)만 올림: 손 위치가 크게 바뀌지 않게
  return w;
}
function higher(ch,m){ let best=1e9;
  for(const pc of ch.pcs){ let c=m+((pc-m)%12+12)%12; if(c<=m)c+=12; if(c<best)best=c; }
  return best; }
function walkDir(ch,start,len,up){ const seq=[start]; let c=start; for(let i=1;i<len;i++){ c=up?higher(ch,c):lower(ch,c); seq.push(c);} return seq; }
const HI=84;
/* ===== 다운비트에 코드톤 맞추기 (교재 Chapter 3 · 시작음별 / Extended Be-bop Scale) =====
   비밥 스케일은 코드톤에서 출발하면 정박(다운비트)마다 코드톤이 와요.
   코드톤이 아닌 음(2·4·6음)에서 출발하거나 연결 때문에 한 칸 밀리면, 정박에 비-코드톤이 오게 돼요.
   이때 교재 방식대로 바로잡아요.
   - 크로매틱 음을 하나 넣어서 밀린 음을 한 번 더 밀기 (예: G7 위 A A♯ B, F6 위 E E♭ D, C7 위 D D♭ C)
   - 상행에서는 비밥 경과음을 빼고 일반 스케일로 가기 (교재: "상행할 때는 비밥 스케일을 쓰지 않고")
   한 세그먼트(코드 하나) 안에서 정박의 비-코드톤이 가장 적은 경로를 찾고, 같으면 덜 바꾸는 쪽을 골라요.
   하행은 크로매틱 넣기를, 상행은 경과음 빼기를 조금 더 우선해요. */
const MISS=10;
function aligned(ch,start,len,up){
  ch._al=ch._al||new Map(); const key=start+'|'+len+'|'+up; if(ch._al.has(key)) return ch._al.get(key);
  const ct=new Set(ch.tones.map(t=>t.pc)), pc=m=>((m%12)+12)%12, inS=m=>ch.pcs.includes(pc(m));
  const step=c=>up?higher(ch,c):lower(ch,c);
  const cChrom=up?1.2:1.0, cSkip=up?1.0:1.3;
  let best=null; const arr=[start], chrom=[];
  (function rec(i,c,cost){
    if(best&&cost>=best.cost) return;
    if(i===len){ best={cost,arr:arr.slice(),chrom:chrom.slice()}; return; }
    const s1=step(c), moves=[[s1,0,false]];
    const cr=up?c+1:c-1; if(!inS(cr)) moves.push([cr,cChrom,true]);           // 크로매틱 끼워 넣기
    if(ch.x!==null && pc(s1)===ch.x) moves.push([step(s1),cSkip,false]);      // 비밥 경과음 건너뛰기
    for(const [n,mc,isC] of moves){
      const pen=(i%2===0 && !ct.has(pc(n)))?MISS:0;
      arr.push(n); if(isC) chrom.push(i);
      rec(i+1,n,cost+mc+pen);
      arr.pop(); if(isC) chrom.pop();
    }
  })(1,start,0);
  const out=best.arr; out.chrom=new Set(best.chrom); out.acost=best.cost+(ct.has(pc(start))?0:MISS);
  ch._al.set(key,out); return out;
}
// 크로매틱 음 이름: 올라가면 아래 글자의 샵(A→A♯→B), 내려가면 위 글자의 플랫(E→E♭→D)
function chromSp(m,up){ const p=((m%12)+12)%12;
  for(let l=0;l<7;l++) if(LSEMI[l]===p) return {l,a:0,pc:p};
  for(let l=0;l<7;l++) if(((LSEMI[l]+(up?1:-1))%12+12)%12===p) return {l,a:up?1:-1,pc:p};
}
// 크로매틱 음과 비밥 경과음은 진행 방향대로 적어요: 상행 C C♯ D · G G♯ A, 하행 D D♭ C · A A♭ G (교재 표기)
const mkNotes=(ch,w,up)=>w.map((m,j)=>({m,sp:(w.chrom&&w.chrom.has(j))||(ch.x!==null&&((m%12)+12)%12===ch.x)?chromSp(m,up):spOf(ch,m)}));
function genC(C){
  // 하행/상행을 마디마다 교대, 연결은 반음~온음, 코드 시작음은 코드톤, 정박에는 코드톤 (필요하면 크로매틱)
  const list=[];
  for(const d of DEG) FORM.forEach((bar,bi)=>bar.forEach((sg,si)=>list.push({sg,d,bi,first:bi===0&&si===0,up:bi%2===1})));
  // 동음 반복을 최소로 하는 경로를 동적계획법으로 찾음
  const memo=new Map();
  function best(i,prev){
    if(i===list.length) return {cost:0,path:[]};
    const key=i+'_'+prev; if(memo.has(key)) return memo.get(key);
    const it=list[i], ch=C[it.sg.k];
    const sc=C[it.sg.syms[0][0]], isII=sc!==ch;
    const st0=C[it.sg.syms[0][0]].tones[it.d].pc, f0=ch.pcs.includes(st0)?st0:ch.tones[it.d].pc;
    const pcs=it.first?[f0]:startTones(C,it.sg).map(t=>t.pc); // 코드가 바뀌면 적힌 코드(II-7이면 II-7)의 코드톤에서 시작
    let res=null;
    const cands=[]; for(const pc of pcs) for(let m=inst(pc,LOW);m<=HI;m+=12) cands.push([m,0]);
    // 앞 마디 마지막 음이 비밥 경과음이나 크로매틱이면 그 방향으로 한 걸음 해결하는 음도 후보로
    if(prev!==null && i>0 && !it.first){ const pi=list[i-1], pch=C[pi.sg.k], P=((prev%12)+12)%12; // 코러스 첫 음은 지정음(1·3·5음)만
      if(P===pch.x || !pch.pcs.includes(P)) for(const k of [1,2]){ const m=prev+(pi.up?k:-k); if(ch.pcs.includes(((m%12)+12)%12)&&!cands.some(c=>c[0]===m)) cands.push([m,2]); }
      // 상행 마디는 앞 음에서 한 걸음 위(반음·온음) 스케일 음으로도 시작할 수 있게
      if(it.up) for(const k of [1,2]){ const m=prev+k; if(ch.pcs.includes(((m%12)+12)%12)&&!cands.some(c=>c[0]===m)) cands.push([m,1]); } }
    for(const [m,extra] of cands){
      const dist=prev===null?1:Math.abs(m-prev); if(dist>MAXD) continue;
      const w=aligned(ch,m,it.sg.len,it.up);
      if(Math.min(...w)<LOW||Math.max(...w)>HI) continue;
      const mid=w.reduce((x,y)=>x+y,0)/w.length;
      const r=best(i+1,w[w.length-1]); if(!r) continue;
      const cost=r.cost+(dist===0?100:0)+Math.abs(mid-70)+w.acost*5+extra; // 정박 코드톤을 크게 우선
      if(!res||cost<res.cost) res={cost,path:[w,...r.path]};
    }
    memo.set(key,res); return res;
  }
  // 반음·온음 연결이 안 되는 진행이면 조금씩 넓혀서 다시 찾음
  let sol=null, MAXD=2; for(const md of [2,3,4,7]){ MAXD=md; memo.clear(); sol=best(0,null); if(sol) break; }
  if(!sol) return [];
  const out=sol.path;
  const choruses=DEG.map(d=>({mode:'C',deg:d,bars:FORM.map(()=>[])}));
  list.forEach((it,i)=>{
    const ch=C[it.sg.k];
    choruses[it.d].bars[it.bi].push({k:it.sg.k,sym:ch.sym,up:it.up,notes:mkNotes(ch,out[i],it.up),tones:ch.tones.map(t=>t.pc),
      syms:it.sg.syms.map(([s,at])=>({sym:C[s].sym,at,tones:C[s].tones.map(t=>t.pc)}))});
  });
  return choruses;
}
// ===== 사이클 B: 2마디 단위로 끊김 없이 이어가기 (하행 B / 상행 B↑) =====
// 2마디 묶음 안에서는 옥타브를 바꾸지 않고, 묶음이 시작될 때만 필요한 만큼 옥타브를 옮겨서 다음 2마디가 음역 안에 들어가게 함
const GROUP=2, HI_BW=81; /* 사이클 B 최고음: A5(연주는 한 옥타브 위 A6, E6 위는 8va로 표기) */ let SPACE=true;
function stepB(C,sg,d,first,st,off,up,commit){
  const ch=C[sg.k], len=sg.len, W=s=>aligned(ch,s,len,up);
  if(first){
    let pc=C[sg.syms[0][0]].tones[d].pc; if(!ch.pcs.includes(pc)) pc=ch.tones[d].pc; let s; // II-7의 음이 V7 스케일에 없으면 V7의 같은 자리 음에서 // Related II-7이면 II-7의 1·3·5음
    if(st.prev===null) s=inst(pc,up?LOW:72);
    else { const cands=[-1,0,1].map(o=>inst(pc,LOW)+12*o).filter(x=>x!==st.prev); s=cands.reduce((a,b)=>Math.abs(b-st.prev)<Math.abs(a-st.prev)?b:a); }
    return W(s+off);
  }
  if(sg.k===st.prevKey) return W((up?higher:lower)(ch,st.prev)+off);
  // 코드가 바뀌면 진행 방향으로 가장 가까운 코드톤에서 이어감
  let best=up?1e9:-1e9;
  const sts=startTones(C,sg);
  for(const t of sts){
    if(up){ let c=st.prev+((t.pc-st.prev)%12+12)%12; if(c<=st.prev)c+=12; if(c<best)best=c; }
    else  { let c=st.prev-((st.prev-t.pc)%12+12)%12; if(c>=st.prev)c-=12; if(c>best)best=c; }
  }
  // 앞 코드의 마지막 음이 비밥 경과음이나 크로매틱이면 그 음을 진행 방향으로 한 걸음(반음·온음) 해결해서 이어감.
  // 예: F6의 D♭(♭6) 다음 E♭7 → C에서 시작, 크로매틱으로 정박을 다시 맞춤 (C B B♭ …)
  const pch=st.prevKey?C[st.prevKey]:null, P=((st.prev%12)+12)%12;
  // 상행은 코드가 바뀔 때 항상 한 걸음(반음·온음 위 스케일 음)으로 이어감. 위의 코드톤으로 3도씩 뛰지 않고,
  // 그 음이 코드톤이 아니면 경과음 빼기·크로매틱으로 정박을 맞춤 (예: …A B♭ │ E♭7 C D♭ E♭ F G A B♭)
  if(up && off===0){
    const steps=[1,2].map(k=>st.prev+k).filter(m=>ch.pcs.includes(((m%12)+12)%12));
    const isT=(arr,m)=>arr.some(t=>t.pc===((m%12)+12)%12), ctm=steps.find(m=>isT(ch.tones,m))??steps.find(m=>isT(sts,m)); // 스케일 코드(V7)의 코드톤 → 적힌 코드의 코드톤 순
    if(steps.length) return W(ctm!==undefined?ctm:steps[0]);
  }
  if(off===0 && pch && (P===pch.x || !pch.pcs.includes(P)) && Math.abs(best-st.prev)>2){ // 경과음·크로매틱으로 끝났을 때만
    const steps=[1,2].map(k=>st.prev+(up?k:-k)).filter(m=>ch.pcs.includes(((m%12)+12)%12));
    const isT=(arr,m)=>arr.some(t=>t.pc===((m%12)+12)%12), ctm=steps.find(m=>isT(ch.tones,m))??steps.find(m=>isT(sts,m)); // 스케일 코드(V7)의 코드톤 → 적힌 코드의 코드톤 순
    if(steps.length) return W(ctm!==undefined?ctm:steps[0]);
  }
  // 이전 마지막 음이 새 코드의 코드톤이고 그 앞 음과 온음 관계면: 마지막 음을 반음 접근음으로 바꾸고 그 코드톤에서 시작
  const ln=st.lastSeg?st.lastSeg.notes:null, pen=ln&&ln.length>1?ln[ln.length-2].m:null;
  if(off===0 && Math.abs(best-st.prev)>2 && sts.some(t=>t.pc===st.prev%12) && pen===st.prev+(up?-2:2)){
    if(commit) ln[ln.length-1]=up?{m:st.prev-1,sp:approachSpell(st.prev,ch.byPc[st.prev%12]),approach:true}
                                  :{m:st.prev+1,sp:approachAbove(st.prev,ch.byPc[st.prev%12]),approach:true};
    return W(st.prev);
  }
  return W(best+off);
}
function runGroup(C,items,d,st0,off,up,commit,restart){
  const st={...st0}, segs=[]; let lo=1e9, hi=-1e9;
  items.forEach(({sg,bi,si},j)=>{
    const notes=stepB(C,sg,d,(bi===0&&si===0)||(restart&&j===0),st,j===0?off:0,up,commit), ch=C[sg.k];
    const seg={k:sg.k,sym:ch.sym,bi,notes:mkNotes(ch,notes,up),tones:ch.tones.map(t=>t.pc),
      low:LOW,syms:sg.syms.map(([s,at])=>({sym:C[s].sym,at,tones:C[s].tones.map(t=>t.pc)}))};
    segs.push(seg); lo=Math.min(lo,...notes); hi=Math.max(hi,...notes);
    st.prev=notes[notes.length-1]; st.prevKey=sg.k; st.lastSeg=seg;
  });
  const high=segs.reduce((x,sg)=>x+sg.notes.filter(n=>n.m+12>OTTAVA_ABOVE).length,0); // 8va가 필요한 음 수 (연주는 한 옥타브 위)
  return {segs,st,viol:Math.max(0,LOW-lo)+Math.max(0,hi-HI_BW),high};
}
function genB(C,up){
  LOW=LOW_B;
  const out=[]; let st={prev:null,prevKey:null,lastSeg:null};
  const offs=[0,12,-12,24,-24,36,-36,48,-48]; // 작은 이동부터 시도
  for(const d of DEG){
    const bars=FORM.map(()=>[]);
    for(let g=0;g<FORM.length;g+=GROUP){
      const items=[]; for(let bi=g;bi<Math.min(g+GROUP,FORM.length);bi++) FORM[bi].forEach((sg,si)=>items.push({sg,bi,si}));
      const rs=SPACE; // 프레이즈 끝 길게: 2마디마다 코러스의 지정음(1·3·5음)에서 새로 시작
      let pick=offs[0], bestV=1e9;
      // 음역 안에 들어가는 옥타브 중 8va가 가장 적게 필요한 쪽을 고름 (같으면 이동이 작은 쪽)
      for(const off of offs){ const r0=runGroup(C,items,d,st,off,up,false,rs), v=r0.viol*1000+r0.high; if(v<bestV){bestV=v;pick=off;} }
      const r=runGroup(C,items,d,st,pick,up,true,rs);
      r.segs.forEach(s=>bars[s.bi].push(s)); st=r.st;
    }
    out.push({mode:up?'Bu':'B',deg:d,bars});
  }
  LOW=60;
  return out;
}
function generate(){
  const C=chordDefs(), choruses=[];
  let prev=null;
  LOW=60;
  for(const d of DEG){
    const bars=[];
    FORM.forEach((bar,bi)=>{
      const segs=[];
      bar.forEach(sg=>{
        const k=sg.k, len=sg.len, ch=C[k]; let notes;
        const sc=C[sg.syms[0][0]]; // Related II-7: 시작음은 II-7의 1·3·5음
        let pc=sc.tones[d].pc; if(!ch.pcs.includes(pc)) pc=ch.tones[d].pc; // II-7의 음이 V7 스케일에 없으면 V7의 같은 자리 음에서 시작
        for(let o=0;o<4;o++){ const s=inst(pc,LOW)+12*o; const w=aligned(ch,s,len,false); if(Math.min(...w)>=LOW){notes=w;break;} }
        segs.push({k,sym:ch.sym,notes:mkNotes(ch,notes,false),tones:ch.tones.map(t=>t.pc),
          low:LOW,syms:sg.syms.map(([s,at])=>({sym:C[s].sym,at,tones:C[s].tones.map(t=>t.pc)}))});
      });
      bars.push(segs);
    });
    choruses.push({mode:'A',deg:d,bars});
  }
  const B=genB(C,false).concat(genB(C,true));
  // 사이클 B는 전체를 한 옥타브 높게 연주 (높은 부분은 악보에 8va로 표기)
  B.forEach(c=>c.bars.forEach(b=>b.forEach(sg=>{ sg.notes.forEach(n=>{ if(!n.rest) n.m+=12; }); sg.low=(sg.low||60)+12; })));
  return addSpace(resolveChromatic(choruses.concat(B,genC(C)),C));
}
// 프레이즈 끝 길게: A는 마디마다, B는 2마디 프레이즈마다 마지막 음을 4분음표로 길게(4박 정박 코드톤에서 착지)
function addSpace(chs){
  if(!SPACE) return chs;
  chs.forEach(c=>{
    if(c.mode==='C') return;
    c.bars.forEach((segs,bi)=>{
      const sg=segs[segs.length-1], ns=sg.notes, last=ns[ns.length-1];
      if(last.rest||ns.length<2) return;
      if(c.mode!=='A' && bi%GROUP!==GROUP-1 && !(bi===c.bars.length-1)) return;
      ns[ns.length-1]={hold:true};
    });
  });
  return chs;
}
// 마디(코드) 마지막 음이 비밥 경과음인데 다음 음으로 반음 해결이 안 되면, 다음 음의 반음 아래 접근음으로 바꿈
function approachSpell(nm,nsp){
  if(nsp.a===1) return {l:nsp.l,a:0,pc:(nm-1+1200)%12};
  const l=(nsp.l+6)%7; let base=LSEMI[l]; let target=(nm-1)%12; let a=((target-base)%12+12)%12; if(a>6)a-=12;
  return {l,a,pc:target}; // 아래에서 올라가 해결하는 접근음은 샵/제자리표로 (G♯→A, A♭→A 같은 같은 글자 해결을 피함)
}
function approachAbove(nm,nsp){
  if(nsp.a===-1) return {l:nsp.l,a:0,pc:(nm+1)%12};
  const l=(nsp.l+1)%7; let target=(nm+1)%12; let a=((target-LSEMI[l])%12+12)%12; if(a>6)a-=12;
  return flatPref({l,a,pc:target});
}
function resolveChromatic(choruses,C){
  const segs=[]; choruses.forEach(c=>c.bars.forEach(b=>b.forEach(sg=>segs.push(sg))));
  for(let i=0;i<segs.length-1;i++){
    const sg=segs[i], last=sg.notes[sg.notes.length-1], nx=segs[i+1].notes[0], ch=C[sg.k];
    if(last.rest||nx.rest) continue;
    // 마디(코드)가 바뀌면서 같은 음이 반복되면, 앞 마디 마지막 음을 다음 음의 반음 접근음으로 바꿈 (예: F7 …E♭ D | B♭7 D → …E♭ C♯ | D)
    if(last.m===nx.m){
      const pen=sg.notes.length>1?sg.notes[sg.notes.length-2].m:null;
      const cands=[{m:nx.m-1,sp:approachSpell(nx.m,nx.sp)},{m:nx.m+1,sp:approachAbove(nx.m,nx.sp)}]
        .filter(c=>pen!==null && c.m!==pen && Math.abs(c.m-pen)<=2);
      if(cands.length) sg.notes[sg.notes.length-1]={...cands[0],approach:true};
      continue;
    }
    if(ch.x===null||last.m%12!==ch.x||Math.abs(nx.m-last.m)===1) continue;
    const pen=sg.notes.length>1?sg.notes[sg.notes.length-2].m:null;
    // 앞 음과도 2도 이내가 되는 반음 접근음만 사용 (아래 → 위 순서로 시도)
    const cands=[{m:nx.m-1,sp:approachSpell(nx.m,nx.sp)},{m:nx.m+1,sp:approachAbove(nx.m,nx.sp)}]
      .filter(c=>c.m>=(sg.low||60) && pen!==null && c.m!==pen && Math.abs(c.m-pen)<=2);
    if(cands.length) sg.notes[sg.notes.length-1]={...cands[0],approach:true};
  }
  return choruses;
}
function noteOct(m,sp){ return Math.floor((m-sp.a-LSEMI[sp.l])/12)-1; }
function abcName(l,oct){
  const L=LET[l];
  if(oct<=3) return L+','.repeat(4-oct);
  if(oct===4) return L;
  return L.toLowerCase()+"'".repeat(oct-5);
}
const OTTAVA_ABOVE=88; // E6보다 높은 음이 있는 구간만 8va로 한 옥타브 낮춰 표기
function toABC(ch,barsPerLine,bpm){
  // 악보 문자열(ABC)과, 그려질 음표·쉼표 하나하나의 정보(길이·마디·연주 이벤트)를 같은 순서로 만듦
  const out=[]; let idx=0, lastNote=null; ch.ottava=[]; ch.toks=[];
  const ott=!ch.method && (ch.mode==='B'||ch.mode==='Bu');
  const all=ch.pickup?[[{notes:ch.pickup,syms:[],pick:true}],...ch.bars]:ch.bars;
  all.forEach((segs,bi0)=>{ const bi=ch.pickup?bi0-1:bi0;   // 못갖춘마디는 -1
    const state={};
    segs.forEach(seg=>{
      const snd=seg.notes.filter(n=>!n.rest&&!n.hold&&!n.tc);
      const up=ott && snd.length>0 && Math.max(...snd.map(n=>n.m))>OTTAVA_ABOVE;
      const nt=seg.notes.reduce((x,n)=>x+(n.rest||n.tc?0:n.six?2:n.trip?3:n.hold?0:1),0)+(seg.notes[0]&&seg.notes[0].hold?1:0);
      if(up){ const g=ch.ottava[ch.ottava.length-1]; if(g&&g[1]===idx-1) g[1]=idx+nt-1; else ch.ottava.push([idx,idx+nt-1]); }
      idx+=nt;
      const nm=n=>{ const oct=noteOct(n.m,n.sp)-(up?1:0), key=n.sp.l+'_'+oct;
        const cur=key in state?state[key]:keyAcc(n.sp.l); let acc='';
        if(cur!==n.sp.a){ acc=n.sp.a===-1?'_':n.sp.a===1?'^':n.sp.a===0?'=':n.sp.a===-2?'__':'^^'; state[key]=n.sp.a; }
        return acc+abcName(n.sp.l,oct); };
      const ns=seg.notes;
      for(let i=0;i<ns.length;){
        const n=ns[i];
        if(i%4===0 && i>0) out.push(' ');
        const cs=seg.syms.find(s=>s.at===i), sym=cs?'"'+cs.sym+'"':'';
        let j=i+1;
        if(n.tc){ i++; continue; }
        if(n.rest){ // 이어지는 쉼표는 하나로 (코드가 바뀌는 자리에서는 나눔)
          while(j<ns.length&&ns[j].rest&&!seg.syms.some(s=>s.at===j)) j++;
          out.push(sym+'z'+(j-i>1?j-i:'')); ch.toks.push({rest:true,d8:j-i,bar:bi,ev:n.ev}); i=j; continue;
        }
        if(n.six){ out.push(sym+nm(n.six[0])+'/'+nm(n.six[1])+'/'); n.six.forEach(x=>ch.toks.push({d8:.5,bar:bi,ev:x.ev}));
          lastNote={oi:out.length-1,n:n.six[1]}; i++; continue; }
        if(n.trip){ /* 셋잇단은 앞뒤 음과 빔을 나눔 */ if(out.length&&out[out.length-1]!==' ') out.push(' ');
          out.push('(3'+sym+n.trip.map(nm).join('')); n.trip.forEach(x=>ch.toks.push({d8:2/3,bar:bi,ev:x.ev}));
          lastNote={oi:out.length-1,n:n.trip[2]}; out.push(' '); i+=2; continue; }
        if(n.hold){ // 앞 마디에서 붙임줄로 이어지는 음
          while(j<ns.length&&ns[j].hold) j++;
          if(lastNote){ out[lastNote.oi]+='-'; out.push(sym+nm(lastNote.n)+(j-i>1?j-i:'')); ch.toks.push({d8:j-i,bar:bi,ev:null,tie:true}); lastNote={oi:out.length-1,n:lastNote.n}; }
          else { out.push(sym+'z'+(j-i>1?j-i:'')); ch.toks.push({rest:true,d8:j-i,bar:bi,ev:null}); }
          i=j; continue;
        }
        while(j<ns.length&&ns[j].hold) j++;
        out.push(sym+nm(n)+(j-i>1?j-i:'')); ch.toks.push({d8:j-i,bar:bi,ev:n.ev}); lastNote={oi:out.length-1,n};
        i=j;
      }
      out.push(' ');
    });
    out.push(bi===ch.bars.length-1?'|]':'|');
    if(bi>=0 && (bi+1)%barsPerLine===0 && bi<ch.bars.length-1) out.push('\n');
    else out.push(' ');
  });
  return `X:1\nM:4/4\nL:1/8\nK:${KEY}\n`+out.join('')+'\n';
}
/* ===== 코드톤 · 아르페지오 · 엔클로저 연습 (Swing Solo Guide Book Ch.1·2, Approach note guide) =====
   마디(코드)마다 정해진 리듬 패턴에 코드의 1·3·5·7·9·11·13음을 넣어 만들어요.
   패턴 기호:  N(음,방향)  방향 u 위로 · d 아래로 · n 가장 가까운 · = 같은 음
              H 앞 음 늘이기 · R 쉼표 · TIE 앞 마디에서 붙임줄 · S(a,b) 16분음표 둘 · T3(a,b,c) 셋잇단 (+TC 자리)
              NX(음) 다음 코드의 음을 미리(당김음) · AP(종류) 다음 코드 목표음으로 접근 · APS 이 코드 첫 음의 반음 아래
              접근 종류: cb 반음 아래 · ca 반음 위 · cb2 온음 아래 · da 위 다이아토닉 · db 아래 다이아토닉 */
const N=(d,dir)=>({t:'n',d,dir:dir||'n'}), H={t:'h'}, R={t:'r'}, TIE={t:'tie'}, TC={t:'tc'};
const S=(a,b)=>({t:'six',x:[a,b]}), T3=(a,b,c)=>({t:'trip',x:[a,b,c]}), NX=d=>({t:'nx',d}), AP=k=>({t:'ap',k}), APS={t:'aps'};
// 엔클로저: 목표음(3음) 2분음표 + 다음 코드 3음으로 가는 접근음
const ENC=ks=>({full:[N('3'),H,H,H,...(ks.length===4?[]:ks.length===3?[R]:[R,R]),...ks.map(AP)],
               half:[N('3'),...(ks.length>=3?ks.slice(-3):[H,...ks]).map(k=>typeof k==='string'?AP(k):k)], target:'3', win:[62,79]});
const METHODS={
  chordtone:{name:'코드톤', book:'Swing Solo Guide Book · Chapter 1',
    lead:'코드마다 코드톤(1·3·5·7음)만으로 리듬을 바꿔 가며 연주해요. 같은 진행을 8분음표, 당김음, 16분음표, 셋잇단으로 연결합니다.',
    rules:['6화음(C6, Cm6)은 7음 대신 6음을 써요.','한 마디에 코드가 둘이면 2박짜리 짧은 패턴으로 연주해요.',
      '당김음은 마지막 8분음표에서 다음 코드의 음을 미리 치고 붙임줄로 이어요.','16분음표 패턴은 7-1-7-5로 다음 코드의 3음을 감싸며 들어가요.'],
    groups:{A:['8분음표','코드톤을 8분음표로 이어요. 마디 끝은 다음 코드의 가이드톤(3·7음) 근처로 가요.'],
            B:['당김음 (싱코페이션)','4박 뒷박에서 다음 코드의 음을 미리 치고 붙임줄로 넘어가요.'],
            C:['16분음표 · 셋잇단','16분음표 엔클로저와 셋잇단 리듬으로 코드톤을 연주해요.']},
    v:[{g:'A',title:'3-5-1-7',full:[N('3'),H,H,H,N('3','='),N('5','u'),N('1','u'),N('7','d')],half:[N('3'),N('5','u'),N('1','u'),N('7','d')],win:[60,77]},
       {g:'A',title:'5-7-5-3-1',full:[N('5'),N('7','u'),N('5','d'),N('3','d'),N('1','d'),H,H,H],half:[N('5'),N('3','d'),N('1','d'),H],win:[64,81]},
       {g:'B',title:'3-5-7 → 다음 3음',full:[TIE,TIE,TIE,TIE,N('3','='),N('5','u'),N('7','u'),NX('3')],half:[TIE,N('5','u'),N('7','u'),NX('3')],win:[60,77]},
       {g:'B',title:'5-7-5-3-1 → 다음 5음',full:[TIE,N('7','u'),N('5','d'),N('3','d'),N('1','d'),H,H,NX('5')],first:[N('5'),N('7','u'),N('5','d'),N('3','d'),N('1','d'),H,H,NX('5')],
        half:[TIE,N('3','d'),N('1','d'),NX('5')],win:[64,81]},
       {g:'C',title:'16분음표 3-5-1-7-1-7-5',full:[N('3'),H,H,N('3','='),N('5','u'),N('1','u'),S(N('7','d'),N('1','u')),S(N('7','d'),N('5','d'))],
        half:[N('3'),N('5','u'),N('1','u'),S(N('7','d'),N('5','d'))],win:[60,77]},
       {g:'C',title:'셋잇단 1-3-5-7',full:[N('3'),H,H,H,R,N('1','d'),T3(N('3','u'),N('5','u'),N('7','u')),TC],half:[T3(N('1'),N('3','u'),N('5','u')),TC,N('7','u'),H],win:[60,77]},
       {g:'C',title:'셋잇단 1-3-1-3-5-3-5-7',full:[N('1'),H,T3(N('3','u'),N('1','d'),N('3','u')),TC,T3(N('5','u'),N('3','d'),N('5','u')),TC,N('7','u'),H],
        half:[T3(N('1'),N('3','u'),N('5','u')),TC,N('7','u'),H],win:[57,72]}]},
  arpeggio:{name:'아르페지오', book:'Swing Solo Guide Book · Chapter 2',
    lead:'코드톤 아르페지오에 9·11·13음과 크로매틱 접근음을 더해, 코드 하나를 한 번에 그리는 연습이에요.',
    rules:['접근음(*)은 다음에 칠 아르페지오 첫 음의 반음 아래예요.','6화음(C6, Cm6)은 7음 대신 6음을 써요.',
      '코드별 아르페지오: m7·m7(♭5) 5-7-9-11-9-3-5-7, Maj7·6·마이너 6 3-5-7-9-7-1-3-5, 도미넌트 3-5-7-9-13-5 (alt는 ♭9·♭13).',
      '한 마디에 코드가 둘이면 아르페지오 앞부분 4음만 연주해요.'],
    groups:{A:['크로매틱 접근 아르페지오','아르페지오를 길게 끝낸 뒤, 다음 코드 첫 음의 반음 아래에서 들어가요.'],
            B:['셋잇단 크로매틱 접근','반음 아래 접근음에서 셋잇단 아르페지오로 올라가요.'],
            C:['확장 아르페지오','코드별로 많이 쓰는 아르페지오와 두 아르페지오를 합친 형태예요.']},
    v:[{g:'A',title:'* 1-3-5-7',full:[N('1'),N('3','u'),N('5','u'),N('7','u'),H,H,H,AP('cb')],half:[N('1'),N('3','u'),N('5','u'),N('7','u')],target:'1',win:[57,70]},
       {g:'A',title:'* 3-5-7-9',full:[N('3'),N('5','u'),N('7','u'),N('9','u'),H,H,H,AP('cb')],half:[N('3'),N('5','u'),N('7','u'),N('9','u')],target:'3',win:[59,72]},
       {g:'B',title:'* 셋잇단 1-3-5-7',full:[R,APS,T3(N('1'),N('3','u'),N('5','u')),TC,N('7','u'),H,H,H],half:[T3(N('1'),N('3','u'),N('5','u')),TC,N('7','u'),H],win:[57,72]},
       {g:'B',title:'* 셋잇단 3-5-7-9',full:[R,APS,T3(N('3'),N('5','u'),N('7','u')),TC,N('9','u'),H,H,H],half:[T3(N('3'),N('5','u'),N('7','u')),TC,N('9','u'),H],win:[59,72]},
       {g:'C',title:'코드별 아르페지오',byQual:true,win:[57,70]},
       {g:'C',title:'1-3-5-7 + 3-5-7-9',full:[N('1'),N('3','u'),N('5','u'),N('7','u'),N('3','d'),N('5','u'),N('7','u'),N('9','u')],half:[N('1'),N('3','u'),N('5','u'),N('7','u')],win:[57,68]}]},
  enclosure:{name:'엔클로저', book:'Approach note guide',
    lead:'다음 코드의 3음을 위아래에서 감싸(엔클로저) 다운비트에 착지하는 연습이에요. 3음을 2분음표로 들려준 뒤 접근음으로 다음 코드에 들어가요.',
    rules:['접근음: 위 다이아토닉(그 코드 스케일의 한 음 위) · 반음 위 · 반음 아래 · 온음 아래.','한 마디에 코드가 둘이면 목표음을 짧게 하고 접근음 2~3개로 들어가요.',
      '같은 원리로 근음·5음·7음을 목표로 바꿔서도 연습해 보세요.'],
    groups:{A:['2음 엔클로저','목표음을 두 음으로 감싸요.'],B:['3음 엔클로저','목표음을 세 음으로 감싸요.'],C:['4음 엔클로저','목표음을 네 음으로 감싸요.']},
    v:[{g:'A',title:'(1-1) 위 다이아토닉 · 반음 아래',...ENC(['da','cb'])},
       {g:'A',title:'(1-2) 반음 아래 · 위 다이아토닉',...ENC(['cb','da'])},
       {g:'B',title:'(1) 온음 아래 · 반음 아래 · 위 다이아토닉',...ENC(['cb2','cb','da'])},
       {g:'B',title:'(2) 반음 아래 · 위 다이아토닉 · 반음 위',...ENC(['cb','da','ca'])},
       {g:'B',title:'(3) 위 다이아토닉 · 반음 위 · 반음 아래',...ENC(['da','ca','cb'])},
       {g:'B',title:'(4) 위 다이아토닉 · 온음 아래 · 반음 아래',...ENC(['da','cb2','cb'])},
       {g:'C',title:'(1) 반음 아래 · 위 다이아토닉 · 반음 위 · 반음 아래',...ENC(['cb','da','ca','cb'])},
       {g:'C',title:'(2) 온음 아래 · 반음 아래 · 위 다이아토닉 · 반음 위',...ENC(['cb2','cb','da','ca'])},
       {g:'C',title:'(4) 위 다이아토닉 · 온음 아래 · 반음 아래 · 위 다이아토닉',...ENC(['da','cb2','cb','da'])}]}
};
// 코드별 아르페지오 (교재 Chapter 2)
function qualPattern(q,half){
  const p= ['m7','m7b5','dim'].includes(q)?[N('5'),N('7','u'),N('9','u'),N('11','u'),N('9','d'),N('3','u'),N('5','u'),N('7','u')]
         : ['dom','alt','lyd'].includes(q)?[N('3'),N('5','u'),N('7','u'),N('9','u'),N('13','d'),N('5','d'),H,H]
         : [N('3'),N('5','u'),N('7','u'),N('9','u'),N('7','d'),N('1','u'),N('3','u'),N('5','u')];
  return half?p.slice(0,4):p;
}
const DEG_IV=(q,d)=>{ const Q=QUAL[q]; if(d==='1') return Q.iv[0]; if(d==='3') return Q.iv[1]; if(d==='5') return Q.iv[2]; if(d==='7') return Q.iv[3];
  if(d==='9') return q==='alt'?1:2; if(d==='11') return 5; if(d==='13') return q==='alt'?8:9; };
const M_LO=55, M_HI=88;
function genMethod(meth){
  const M=METHODS[meth], C=chordDefs();
  // 마디별 코드 정보 (지금 키 기준)
  const segs=[]; FORM.forEach((bar,bi)=>bar.forEach((sg,si)=>segs.push({bi,si,sg})));
  const ctxOf=({sg})=>{ const c=sg.c, ch=C[sg.k], root=parse(simpRoot(tn(c.root))).pc, S8=SCALES[sg.k.split(':')[0]];
    const sroot=parse(ch.sym).pc, diat=S8.iv.filter((iv,i)=>i!==S8.x).map(iv=>(sroot+iv)%12).sort((a,b)=>a-b);
    return {c,ch,root,diat,pc:d=>(root+DEG_IV(c.qual,d))%12, sp:m=>spOf(ch,m)}; };
  const ctxs=segs.map(ctxOf);
  const pick=(pc,prev,dir)=>{ if(dir==='='&&((prev%12)+12)%12===pc) return prev;
    const u=prev+((pc-prev)%12+12)%12;
    if(dir==='u') return u<=prev?u+12:u; if(dir==='d') return u-12;
    return (u-prev)<=(prev-(u-12))?u:u-12; };
  const into=(m,[lo,hi])=>{ while(m<lo) m+=12; while(m>hi) m-=12; return m; };
  const fit=m=>into(m,[M_LO+2,M_HI-2]); // 이어지는 음은 가장 가까운 자리, 음역(G3–E6)을 벗어날 때만 옥타브 이동
  const leads=x=>x.t==='ap'||x.t==='nx';
  const firstOf=a=>{ for(const x of a){ if(x.t==='n') return x; if(x.x){ const y=firstOf(x.x); if(y) return y; } } return null; };
  // 패턴 하나를 실제 음으로: cx 지금 코드, nx 다음 코드, prev 앞 음, forced 앞에서 정해 준 첫 음(접근·당김음)
  function run(V,pat,cx,nx,prev,forced,anchor,okNext){
    // 다음 코드로 이끄는 목표음: 가장 가까운 자리부터, 다음 마디가 음역(G3–E6) 안에 들어가는 옥타브로
    const tgt=(pc,g=0)=>{ const n0=pick(pc,cur==null?67:cur,'n'); const cs=[n0,n0-12,n0+12,n0-24,n0+24].sort((a,b)=>Math.abs(a-n0)-Math.abs(b-n0)).filter(m=>m>=M_LO+g&&m<=M_HI-g);
      return (okNext&&cs.find(okNext))??fit(n0); };
    const firstSpec=firstOf(pat);
    const notes=[]; let cur=prev, nextF=null, T=null; const ms=[];
    const put=(m,sp)=>{ ms.push(m); return {m,sp}; };
    const one=x=>{ const m=x===firstSpec&&anchor!=null?anchor:pick(cx.pc(x.d),cur==null?67:cur,x.dir); cur=m; return put(m,cx.sp(m)); };
    for(const x of pat){
      if(x.t==='h'){ notes.push({hold:true}); continue; }
      if(x.t==='r'){ notes.push({rest:true}); continue; }
      if(x.t==='tc'){ notes.push({tc:true}); continue; }
      if(x.t==='tie'){ if(forced!=null){ notes.push({hold:true}); cur=forced; } else notes.push({rest:true}); continue; }
      if(x.t==='n'){ notes.push(one(x)); continue; }
      if(x.t==='six'){ notes.push({six:x.x.map(one)}); continue; }
      if(x.t==='trip'){ notes.push({trip:x.x.map(one)}); continue; }
      if(x.t==='nx'){ const m=tgt(nx.pc(x.d)); nextF=m; cur=m; notes.push(put(m,nx.sp(m))); continue; }
      if(x.t==='aps'){ const m=anchor-1; notes.push(put(m,chromSp(m,true))); continue; }
      if(x.t==='ap'){
        if(T==null){ T=tgt(nx.pc(V.target),2); nextF=T; }
        let m, sp;
        if(x.k==='cb'){ m=T-1; sp=chromSp(m,true); } else if(x.k==='ca'){ m=T+1; sp=chromSp(m,false); }
        else if(x.k==='cb2'){ m=T-2; sp=nx.ch.byPc[((m%12)+12)%12]||chromSp(m,true); }
        else { const up=x.k==='da', pcs=nx.diat; let k=T; do{ k+=up?1:-1; }while(!pcs.includes(((k%12)+12)%12)); m=k; sp=nx.sp(m);
          // 위 다이아토닉이 반음 위와 같은 음이면(교재: E → F♯ F D♯) 온음 위를 써서 같은 음이 겹치지 않게
          if(up&&m===T+1&&pat.some(y=>y.t==='ap'&&y.k==='ca')){ m=T+2; sp={l:sp.l,a:sp.a+1,pc:((m%12)+12)%12}; } }
        cur=m; notes.push(put(m,sp)); continue; }
    }
    return {notes,nextF,last:cur,lo:ms.length?Math.min(...ms):67,hi:ms.length?Math.max(...ms):67};
  }
  // 변주 하나 만들기. ref = 시작 음높이 기준. 앞 음과 이어지는 음은 항상 가장 가까운 자리로 잇고,
  // 음역을 벗어날 때만 옥타브를 옮김. 여러 시작 높이를 시험해서 옥타브 이동·도약이 가장 적은 것을 고름
  function variant(V,ref){
    const bars=FORM.map(()=>[]); let score=0;
    let pickup=null, prev=null, forced=null;
    const hasPk=!V.byQual&&V.full.some(leads);
    const patOf=i=>{ const len=segs[i].sg.len, half=len<8; let pat=V.byQual?qualPattern(ctxs[i].c.qual,half):(i===0&&V.first&&!hasPk?V.first:(half?V.half:V.full));
      if(len===2) pat=[N('3'),H];
      if(i===segs.length-1&&hasPk) pat=pat.map(x=>leads(x)?R:x); // 마지막 마디 끝은 쉼표 (반복하면 못갖춘마디가 그 자리에)
      return pat; };
    // 목표음 m에서 시작하면 그 마디가 음역 안에 들어가는지
    const okAt=j=>m=>{ const pj=patOf(j), tj=pj[0].t==='tie'; const r=run(V,pj,ctxs[j],ctxs[(j+1)%segs.length],m,tj?m:null,tj?null:m); return r.lo>=M_LO&&r.hi<=M_HI; };
    if(hasPk){ // 못갖춘마디: 다음 코드로 이끄는 음은 1마디 앞에서
      const tail=V.full.slice(V.full.findIndex(leads));
      const r=run(V,tail,ctxs[0],ctxs[0],ref,null,null,okAt(0));
      pickup=r.notes; prev=r.last; forced=r.nextF; if(r.lo<M_LO||r.hi>M_HI) score+=5000;
    }
    segs.forEach((s,i)=>{
      const cx=ctxs[i], nx=ctxs[(i+1)%segs.length];
      const pat=patOf(i), okN=okAt((i+1)%segs.length);
      const firstSpec=firstOf(pat);
      const isForcedFirst=forced!=null && firstSpec && pat.indexOf(firstSpec)<=2 && pat[0].t!=='tie';
      const tied=pat[0].t==='tie'&&forced!=null; // 붙임줄로 시작하면 첫 음은 패턴의 방향대로
      let anchor=null; const from=prev==null?ref:prev;
      if(firstSpec&&!tied){ anchor=isForcedFirst&&cx.pc(firstSpec.d)===((forced%12)+12)%12?forced:pick(cx.pc(firstSpec.d),from,'n'); }
      const f=pat[0].t==='tie'?forced:null;
      let r=run(V,pat,cx,nx,prev,f,anchor,okN);
      const out_=x=>x.lo<M_LO||x.hi>M_HI, locked=isForcedFirst&&anchor===forced;
      if(anchor!=null && !locked && out_(r)){
        let ok=false; for(const d of [12,-12,24,-24]){ const r2=run(V,pat,cx,nx,prev,f,anchor+d,okN); if(!out_(r2)){ r=r2; anchor+=d; ok=true; break; } }
        score+=ok?1000:5000; }
      else if(out_(r)) score+=5000;
      if(anchor!=null&&prev!=null) score+=Math.abs(anchor-prev);
      score+=Math.abs((r.lo+r.hi)/2-71)*0.2;
      bars[s.bi].push({k:s.sg.k,sym:cx.ch.sym,notes:r.notes,tones:cx.ch.tones.map(t=>t.pc),
        syms:s.sg.syms.map(([sy,at])=>({sym:C[sy].sym,at,tones:C[sy].tones.map(t=>t.pc)}))});
      prev=r.last; forced=r.nextF;
    });
    return {bars,pickup,score};
  }
  const out=[];
  M.v.forEach((V,vi)=>{
    const grpIdx=M.v.slice(0,vi).filter(x=>x.g===V.g).length;
    let best=null; for(let ref=M_LO+2;ref<=M_HI-2;ref+=2){ const r=variant(V,ref); if(!best||r.score<best.score) best=r; }
    out.push({method:meth,mode:V.g,deg:grpIdx,title:V.title,bars:best.bars,pickup:best.pickup});
  });
  return out;
}
/* ===== GEN END ===== */

const $=id=>document.getElementById(id);
let DATA=[], FLAT=[], COMP=[], CH_START=[], TOTAL=0, ctx=null, master=null, playing=false, timer=null, idx=0, cidx=0, clickP=0, base=0, P0=0, lastSpb=0, q=[];

const MODES=['A','B','Bu','C'], LAB={A:'A',B:'B',Bu:'B↑',C:'C'}, CLS=m=>m==='Bu'?'B':m;
const cid=c=>LAB[c.mode]+'-'+(c.deg+1)+(c.half==null?'':'ab'[c.half]);   // 예: B-1a
const cjump=c=>LAB[c.mode]+(c.deg+1)+(c.half==null?'':'ab'[c.half]);     // 예: B1a
const cfrom=c=>c.half==null?'':(c.half?'3–4':'1–2')+'마디부터';
const ctitle=c=>c.title||(DEGNAME[c.deg]+' 시작');             // 시작 코러스 목록·재생 위치에 쓰는 이름
const cstart=c=>c.title||(DEGNAME[c.deg]+'에서 시작');
function fillFrom(){
  const old=+$('from').value||0, oc=DATA_PREV[old];
  $('from').innerHTML=DATA.map((c,i)=>`<option value="${i}">${cid(c)} · ${ctitle(c)}${c.half==null?'':' · '+cfrom(c)}</option>`).join('');
  // 쉼표 옵션을 바꿔도 비슷한 코러스를 계속 선택
  let ni=oc?DATA.findIndex(c=>c.mode===oc.mode&&c.deg===oc.deg&&(c.half==null||oc.half==null||c.half===oc.half)):0;
  $('from').value=String(ni<0?0:ni);
}
let DATA_PREV=[];

function build(){
  SPACE=$('space').checked; DATA=METHOD==='bebop'?generate():genMethod(METHOD);
  // 연주 이벤트: 음표·쉼표(FLAT), 반주(COMP). 위치는 8분음표 단위 (마디 = 8)
  FLAT=[]; COMP=[]; CH_START=[]; let P=0;
  DATA.forEach((c,ci)=>{ CH_START[ci]=P; let last=null, cur=null;
    const k=c.pickup?c.pickup.length:0;
    (c.pickup?[[{notes:c.pickup,syms:[]}],...c.bars]:c.bars).forEach((segs,bi0)=>{ const bi=c.pickup?bi0-1:bi0; let bp=bi<0?-k:0;
      segs.forEach(seg=>{
        seg.syms.forEach((s,si)=>{ const end=(seg.syms[si+1]||{at:seg.notes.length}).at; COMP.push({P:P+bp+s.at,dur:end-s.at,tones:s.tones,chorus:ci}); });
        seg.notes.forEach((n,j)=>{
          const p=P+bp+j, cs=seg.syms.find(s=>s.at===j); if(cs) cur=cs.sym;
          const ev=o=>Object.assign({chorus:ci,bar:bi,key:KEY,sym:cur,el:null},o);
          if(n.tc) return;
          if(n.hold){ if(last) last.dur+=1; return; }
          if(n.rest){ n.ev=ev({rest:true,P:p,dur:1}); FLAT.push(n.ev); last=n.ev; return; }
          if(n.six){ n.six.forEach((x,k)=>{ x.ev=ev({m:x.m,P:p+k/2,dur:.5,trip:true}); FLAT.push(x.ev); /* 16분음표도 스윙 없이 고르게 */ last=x.ev; }); return; }
          if(n.trip){ n.trip.forEach((x,k)=>{ x.ev=ev({m:x.m,P:p+k*2/3,dur:2/3,trip:true}); FLAT.push(x.ev); last=x.ev; }); return; }
          n.ev=ev({m:n.m,P:p,dur:1}); FLAT.push(n.ev); last=n.ev;
        });
        bp+=seg.notes.length;
      });
      if(bi>=0) P+=8;
    });
  });
  TOTAL=P;
  // 다음 코러스의 못갖춘마디와 겹치는 앞 코러스 마지막 쉼표는 빼고, 위치 순서로 정렬
  DATA.forEach((c,ci)=>{ if(ci>0&&c.pickup){ const from=CH_START[ci]-c.pickup.length-1e-9; FLAT=FLAT.filter(e=>!(e.chorus===ci-1&&e.P>=from)); /* 앞 코러스 끝의 '처음으로 돌아가는 음' 자리는 다음 코러스 못갖춘마디가 대신 */ } });
  FLAT.sort((a,b)=>a.P-b.P);
  document.querySelectorAll('.kn').forEach(e=>e.textContent=keyLabel(KEY));
}
function render(){
  if(playing) stop();
  DATA_PREV=DATA; build(); fillFrom(); draw();
}
let SW_D=980, SW_M=520;
function draw(){
  if(!window.ABCJS){ $('scores').innerHTML='<p class="err">악보 라이브러리를 불러오지 못했어요. 새로고침해 주세요.</p>'; return; }
  const w=$('scores').clientWidth||360, bpl=w<600?2:4;
  const CY=METHOD!=='bebop'?METHODS[METHOD].groups:{A:['코드마다 다시 시작','코드가 바뀔 때마다 지정한 음(1·3·5음)에서 새로 하행해요.'],
            B:['끊지 않고 이어가기','앞 코드의 마지막 음에서 가장 가까운 코드톤으로 이어가요. 2마디 동안은 옥타브를 바꾸지 않고 한 흐름으로 연주해요. E6보다 높아지는 구간만 8va로 표기해요.'],
            C:['하행 · 상행 교대','한 마디씩 방향을 바꾸고, 연결은 반음이나 온음으로만 해요.']};
  const SUB=METHOD==='bebop'?{B:'하행',Bu:'상행'}:{};
  $('scores').innerHTML=['A','B','C'].map(m=>`<section class="cycle ${m}"><div class="cycle-head"><span class="letter">${m}</span><div><h2>사이클 ${m} · ${CY[m][0]}</h2><p>${CY[m][1]}</p></div></div>`+
    DATA.map((c,i)=>CLS(c.mode)!==m?'':(SUB[c.mode]&&(i===0||DATA[i-1].mode!==c.mode)?`<h3 class="sub">${LAB[c.mode]} · ${SUB[c.mode]}</h3>`:'')+`<article class="chorus" id="ch${i}"><div class="chorus-h"><span class="id">${cid(c)}</span><span class="start">${cstart(c)}${c.half==null?'':' · '+cfrom(c)}</span><button class="play1" data-i="${i}">여기서 재생</button><button class="loop1" data-loop="${i}" aria-label="이 코러스 반복 재생">↻ 반복</button></div><div class="score" id="sc${i}"></div></article>`).join('')+`</section>`).join('');
  $('jump').innerHTML=DATA.map((c,i)=>(i&&c.mode!==DATA[i-1].mode?'<span class="sep"></span>':'')+`<button class="${CLS(c.mode)}" data-i="${i}">${cjump(c)}</button>`).join('');
  // 코러스마다 '반복': 이 코러스 전체를 구간 반복으로 바로 재생
  document.querySelectorAll('[data-loop]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.loop; if(playing) stop();
    SEL={chorus:i,bar:0,end:DATA[i].bars.length-1,done:true}; $('from').value=String(i); setLoop(true); start(); });
  document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ SEL=null; markBar(); $('from').value=b.dataset.i; if(b.classList.contains('play1')){ if(playing) stop(); start(); } else { stop(); $('ch'+b.dataset.i).scrollIntoView({block:'start'}); } });
  markSel();
  DATA.forEach((c,ci)=>{
    ABCJS.renderAbc('sc'+ci,toABC(c,bpl,+$('bpm').value),{add_classes:true,responsive:'resize',paddingtop:22,paddingbottom:4,paddingleft:6,paddingright:6,staffwidth:w<600?SW_M:SW_D});
    // 그려진 음표·쉼표에 길이·마디·연주 이벤트를 연결 (그린 순서 = 악보 문자열 순서)
    const all=[...document.querySelectorAll('#sc'+ci+' .abcjs-note, #sc'+ci+' .abcjs-rest')];
    if(all.length===c.toks.length) all.forEach((el,k)=>{ const t=c.toks[k]; el.dataset.d8=t.d8; el.dataset.bar=t.bar; el.dataset.ch=ci; if(t.ev) t.ev.el=el; });
    const els=all.filter(e=>e.classList.contains('abcjs-note'));
    try{ equalize(document.querySelector('#sc'+ci+' svg')); }catch(e){}
    try{ drawOttava(document.querySelector('#sc'+ci+' svg'),els,c.ottava||[]); }catch(e){}
  });
  markBar(); markBlank();
  if(playing) markCur(curCh);
}

// 한 줄 안의 마디 넓이를 똑같이 맞추고, 마디 안의 8분음표도 같은 간격으로 놓음 (빔은 첫·끝 기둥에 맞춰 늘림)
const mOf=e=>{ const m=(e.getAttribute('class')||'').match(/abcjs-m(\d+)(\s|$)/); return m?+m[1]:null; };
function bb(e){ const b=e.getBBox(); let d=0, p=e; while(p&&p.tagName!=='svg'){ d+=+(p.dataset&&p.dataset.dx||0); p=p.parentNode; } return {x:b.x+d,y:b.y,width:b.width,height:b.height}; }
function equalize(svg){
  if(!svg) return;
  const top=e=>{ const par=e.parentNode&&e.parentNode.closest&&e.parentNode.closest('[class*="abcjs-m"]'); return !(par&&svg.contains(par)); };
  const move=(e,dx,tf)=>{ if(!dx&&!tf) return; const t=e.getAttribute('transform')||''; e.setAttribute('transform',(tf||`translate(${dx},0)`)+' '+t); e.dataset.dx=dx; };
  const lines=[...new Set([...svg.querySelectorAll('.abcjs-bar')].map(lineOf))];
  // 모든 줄의 시작점을 가장 늦게 시작하는 줄(박자표가 있는 첫 줄)에 맞춰서, 줄이 바뀌어도 음표 간격이 같게
  const startOf=l=>{ let st=0; svg.querySelectorAll('.abcjs-l'+l).forEach(e=>{ if(/abcjs-(clef|key-signature|time-signature)/.test(e.getAttribute('class'))){ const b=e.getBBox(); st=Math.max(st,b.x+b.width); } }); return st; };
  const START=Math.max(...lines.map(startOf));
  lines.forEach(l=>{
    const bars=[...svg.querySelectorAll('.abcjs-bar.abcjs-l'+l)].map(e=>({e,m:mOf(e),x:e.getBBox().x})).sort((a,b)=>a.m-b.m);
    if(bars.length<2) return;
    const start=START;
    const els=[...svg.querySelectorAll('.abcjs-l'+l)].filter(e=>{ const c=e.getAttribute('class');
      return top(e) && !/abcjs-(bar|staff|clef|key-signature|time-signature|tempo)/.test(c) && mOf(e)!==null && mOf(e)<bars.length; });
    // 마디 넓이: 보통은 모두 같게, 못갖춘마디(8분음표 8개보다 짧은 마디)는 길이에 맞게 좁게
    const durOf=e=>e.dataset.d8?+e.dataset.d8:0;
    const wts=bars.map((_,m)=>{ const t=els.filter(e=>mOf(e)===m&&(e.classList.contains('abcjs-note')||e.classList.contains('abcjs-rest'))).reduce((x,e)=>x+durOf(e),0); return t>0&&t<7.99?Math.max(.28,t/8+.12):1; });
    const end=bars[bars.length-1].x, W=(end-start)/wts.reduce((a,b)=>a+b,0), nw=[start]; wts.forEach(w=>nw.push(nw[nw.length-1]+W*w)); nw[nw.length-1]=end;
    bars.forEach((b,i)=>move(b.e,nw[i+1]-b.x));
    for(let m=0;m<bars.length;m++){
      const inM=els.filter(e=>mOf(e)===m);
      // 길이(8분음표 개수)에 비례해서 배치: 4분음표는 두 칸, 쉼표는 자기 구간 가운데
      const d8=e=>{ if(e.dataset.d8) return +e.dataset.d8; const m=(e.getAttribute('class')||'').match(/abcjs-d(\d+)(?:-(\d+))?(\s|$)/); return m?Math.max(1,Math.round(parseFloat(m[1]+'.'+(m[2]||'0'))*8)):1; };
      const notes=inM.filter(e=>e.classList.contains('abcjs-note')||e.classList.contains('abcjs-rest')).map(e=>{
        const rest=e.classList.contains('abcjs-rest');
        const h=rest?e:(e.querySelector('.abcjs-notehead')||e), hb=h.getBBox(), st=rest?null:e.querySelector('.abcjs-stem'), sb=st?st.getBBox():hb;
        return {e,rest,n8:d8(e),hx:hb.x+hb.width/2,sx:sb.x+sb.width/2};
      }).sort((a,b)=>a.hx-b.hx);
      if(!notes.length) continue;
      const tot=notes.reduce((x,n)=>x+n.n8,0), L=nw[m]+10, R=nw[m+1]-4, slot=(R-L)/(tot<7.99?tot:Math.max(8,tot));
      let cum=0; notes.forEach(n=>{ const c=n.rest?cum+n.n8/2:cum+Math.min(n.n8,1)/2; n.dx=L+slot*c-n.hx; move(n.e,n.dx); // 16분음표·셋잇단은 자기 길이만큼
        if(n.rest){ // 쉼표에 붙은 코드 이름은 쉼표 가운데가 아니라 그 박의 시작 자리로
          const t=n.e.querySelector('.abcjs-chord');
          if(t){ const tb=t.getBBox(); t.setAttribute('transform',`translate(${L+slot*(cum+0.5)-6-(tb.x+n.dx)},0)`); } }
        cum+=n.n8; });
      const near=x=>notes.reduce((a,b)=>Math.abs(b.hx-x)<Math.abs(a.hx-x)?b:a);
      inM.forEach(e=>{ if(e.classList.contains('abcjs-note')||e.classList.contains('abcjs-rest')) return; const b=e.getBBox();
        if(e.classList.contains('abcjs-beam-elem')){
          const inB=notes.filter(n=>n.sx>=b.x-1.5&&n.sx<=b.x+b.width+1.5);
          if(inB.length<2){ move(e,near(b.x).dx); return; }
          const f=inB[0], g=inB[inB.length-1], na=f.sx+f.dx, nb=g.sx+g.dx, k=(nb-na)/(g.sx-f.sx);
          move(e,na-f.sx,`translate(${na},0) scale(${k},1) translate(${-f.sx},0)`); return; }
        const cx=e.classList.contains('abcjs-chord')?b.x+6:b.x+b.width/2;
        move(e,near(cx).dx);
      });
    }
  });
}
function lineOf(el){ const m=[...el.classList].join(' ').match(/abcjs-l(\d+)/); return m?+m[1]:0; }
function drawOttava(svg,els,groups){
  if(!svg) return;
  const NS='http://www.w3.org/2000/svg';
  groups.forEach(([a,b])=>{
    // 줄이 바뀌면 줄마다 따로 그림
    let runs=[], cur=null;
    for(let i=a;i<=b;i++){ const el=els[i]; if(!el) continue; const l=lineOf(el);
      if(!cur||cur.l!==l){ cur={l,els:[]}; runs.push(cur); } cur.els.push(el); }
    runs.forEach((r,ri)=>{
      const boxes=r.els.map(bb);
      const lineEls=[...svg.querySelectorAll('.abcjs-l'+r.l)].filter(e=>!e.classList.contains('abcjs-note')||r.els.includes(e));
      let top=Math.min(...boxes.map(x=>x.y));
      lineEls.forEach(e=>{ try{ const b=bb(e); if(b.width>0&&b.height>0&&b.y<top&&b.x<boxes[boxes.length-1].x+boxes[boxes.length-1].width&&b.x+b.width>boxes[0].x) top=b.y; }catch(_){} });
      const y=top-6, x1=boxes[0].x, x2=boxes[boxes.length-1].x+boxes[boxes.length-1].width;
      const g=document.createElementNS(NS,'g'); g.setAttribute('class','ottava');
      const t=document.createElementNS(NS,'text'); t.setAttribute('x',x1); t.setAttribute('y',y+3); t.textContent=ri===0?'8va':'(8va)';
      g.appendChild(t); svg.appendChild(g);
      const tw=t.getBBox().width;
      const ln=document.createElementNS(NS,'path');
      const last=ri===runs.length-1;
      ln.setAttribute('d',`M${x1+tw+3} ${y} H${x2}`+(last?` V${y+7}`:''));
      g.appendChild(ln);
    });
  });
}
function tone(t,m,dur,vol,type){
  const f=440*Math.pow(2,(m-69)/12);
  const g=ctx.createGain(), lp=ctx.createBiquadFilter();
  lp.type='lowpass'; lp.frequency.value=Math.min(6000,f*5);
  const o=ctx.createOscillator(); o.type=type||'triangle'; o.frequency.value=f;
  const o2=ctx.createOscillator(); o2.type='sine'; o2.frequency.value=f*2; const g2=ctx.createGain(); g2.gain.value=.2;
  o.connect(g); o2.connect(g2).connect(g); g.connect(lp).connect(master);
  const end=t+dur;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.006);
  g.gain.exponentialRampToValueAtTime(vol*.35,t+Math.min(.25,dur*.6));
  g.gain.exponentialRampToValueAtTime(.0001,end+.08);
  o.start(t);o2.start(t);o.stop(end+.1);o2.stop(end+.1);
}
function click(t,acc){
  const o=ctx.createOscillator(), g=ctx.createGain();
  o.type='square'; o.frequency.value=acc?1500:1100;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.08,t+.001); g.gain.exponentialRampToValueAtTime(.0001,t+.04);
  o.connect(g).connect(master); o.start(t); o.stop(t+.05);
}
function comp(t,tones,dur){
  const r=tones[0], third=tones[1], sev=tones[3];
  const bass=36+((r-36)%12+12)%12;
  const v3=48+((third-48)%12+12)%12, v7=48+((sev-48)%12+12)%12;
  tone(t,bass,dur,.13,'sine'); tone(t,v3,dur,.05,'sine'); tone(t,v7,dur,.05,'sine');
}
// 위치(8분음표 단위) → 시간. 8분음표 뒷박에만 스윙을 주고, 셋잇단은 고르게
function tmap(x,trip,sw){ const b=Math.floor(x/2+1e-9), f=x/2-b; if(trip||f<1e-9) return b+f; return b+(f<=.5?f*sw/.5:sw+(f-.5)*(1-sw)/.5); }
function schedule(){
  const spb=60/+$('bpm').value, sw=+$('swing').value/100, T=(P,tr)=>base+tmap(P-P0,tr,sw)*spb;
  if(lastSpb && spb!==lastSpb){ // 재생 중 템포를 바꾸면 다음 음 자리에서 이어 붙임
    const pn=Math.min(FLAT[idx]?FLAT[idx].P:TOTAL, clickP); const told=base+tmap(pn-P0,false,sw)*lastSpb; base=told-tmap(pn-P0,false,sw)*spb; }
  lastSpb=spb;
  const horizon=ctx.currentTime+.6;
  for(;;){
    const cyc=$('cyc').checked, looping=$('loop').checked, rep=cyc||looping;
    // 반복 구간: 구간 반복으로 고른 마디들, 아니면 코러스 전체. 1마디부터면 못갖춘마디도 포함
    const a=looping&&PREG.sel?PREG.a:0, b=looping&&PREG.sel?PREG.b:DATA[playFrom].bars.length-1;
    const kp=a===0&&DATA[playFrom].pickup?DATA[playFrom].pickup.length:0;
    const rs=CH_START[playFrom]+a*8, re=CH_START[playFrom]+(b+1)*8;
    const endP=rep?re-kp:TOTAL; // 다음 반복의 못갖춘마디가 시작하는 자리
    const ev=FLAT[idx], cp=COMP[cidx];
    const pe=ev&&ev.P<endP-1e-9?ev.P:Infinity, pc=cp&&cp.P<endP-1e-9?cp.P:Infinity, pk=clickP<endP-1e-9?clickP:Infinity;
    const p=Math.min(pe,pc,pk);
    if(p===Infinity){
      const tEnd=T(endP); if(tEnd>horizon) return;
      const n=+$('loopn').value;
      if(!rep || (cyc&&keysDone>=11) || (looping&&n>0&&reps+1>=n)){ q.push({t:rep?T(re):tEnd,end:true}); clearInterval(timer); return; }
      const tBar=T(re-8); // 구간 마지막 마디 시작 시각에 맞춰 다음 반복을 이어 붙임
      reps++;
      if(cyc){ keysDone++; KEY=KEYS[(KEYS.indexOf(KEY)+1)%12]; $('key').value=KEY; build(); setTimeout(draw,0); }
      P0=rs-8; base=tBar; const sp=rs-kp;
      idx=FLAT.findIndex(e=>e.P>=sp-1e-9); cidx=COMP.findIndex(e=>e.P>=sp-1e-9); clickP=Math.ceil((sp-1e-9)/2)*2;
      if(idx<0) idx=FLAT.length; if(cidx<0) cidx=COMP.length;
      q.push({t:base+tmap(sp-P0,false,sw)*spb,rep:reps});
      const inc=+$('loopt').value; if(inc){ setBpm(+$('bpm').value+inc); return; } // 다음 호출에서 새 템포로 이어 붙임
      continue;
    }
    const t=T(p, p===pe&&ev.trip); if(t>horizon) return;
    if(p===pk){ const bt=((p%8)+8)%8; if($('click').checked&&(bt===2||bt===6)) click(t,false); clickP+=2; continue; }
    if(p===pc){ cidx++; if($('comp').checked) comp(t,cp.tones,(T(cp.P+cp.dur)-t)*0.95); continue; }
    idx++;
    const bl=isBlank(ev.chorus,ev.bar,reps);
    if(!ev.rest&&!bl) tone(t,ev.m,(T(ev.P+ev.dur,ev.trip)-t)*0.9,.2);
    q.push({t,n:ev,bl});
  }
}
function ui(){
  if(!playing) return;
  while(q.length && q[0].t<=ctx.currentTime){
    const e=q.shift();
    if(e.end){ stop(); return; }
    if(e.count){ $('posk').textContent='예비박'; $('pos').textContent=e.count+' / 4'; continue; }
    if(e.rep!==undefined){ BREP=e.rep; markBlank(); continue; }
    const n=e.n;
    document.querySelectorAll('.abcjs-note.cur').forEach(x=>x.classList.remove('cur'));
    if(n.el&&!n.rest&&!e.bl){ n.el.classList.add('cur');
      if($('follow').checked){ const r=n.el.getBoundingClientRect(); if(r.top<90||r.bottom>innerHeight-40) n.el.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); } }
    const c=DATA[n.chorus];
    $('posk').textContent=`${keyLabel(n.key)} · ${cid(c)} · ${ctitle(c)}`;
    $('pos').innerHTML=n.bar<0?'못갖춘마디':`${n.bar+1}마디 · <span class="chord">${(n.sym||'').replace(/b/g,'♭').replace(/#/g,'♯')}</span>`;
    if(curCh!==n.chorus){ curCh=n.chorus; markCur(curCh); }
  }
  requestAnimationFrame(ui);
}
function start(){
  if(!FLAT.length) return;
  if(!ctx){ ctx=new (window.AudioContext||window.webkitAudioContext)(); }
  if(ctx.state==='suspended') ctx.resume();
  master=ctx.createGain(); master.gain.value=1; master.connect(ctx.destination);
  // 시작 위치: 선택한 마디의 처음, 없으면 시작 코러스의 처음
  let startP, barP;
  if(SEL&&SEL.bar>0){ playFrom=SEL.chorus; barP=startP=CH_START[SEL.chorus]+SEL.bar*8; $('from').value=String(playFrom); }
  else { playFrom=SEL?SEL.chorus:+$('from').value; barP=CH_START[playFrom]; startP=barP-(DATA[playFrom].pickup?DATA[playFrom].pickup.length:0); } // 1마디부터면 못갖춘마디도
  PREG={sel:!!SEL, a:SEL?SEL.bar:0, b:SEL?SEL.end:DATA[playFrom].bars.length-1};
  reps=0; BREP=0; markBlank();
  idx=FLAT.findIndex(e=>e.P>=startP-1e-9); if(idx<0) idx=FLAT.length;
  cidx=COMP.findIndex(e=>e.P>=startP-1e-9); if(cidx<0) cidx=COMP.length;
  keysDone=0;
  document.querySelectorAll('.abcjs-note.cur').forEach(e=>e.classList.remove('cur'));
  const spb=60/+$('bpm').value, sw=+$('swing').value/100, t0=ctx.currentTime+.08; q=[];
  if($('ci').checked){ // 예비박은 시작 마디 바로 앞 마디에서 (못갖춘마디는 그 마디 끝에 겹쳐서)
    P0=barP-8; base=t0; clickP=barP; for(let k=0;k<4;k++){ click(t0+k*spb,k===0); q.push({t:t0+k*spb,count:k+1}); } }
  else { P0=barP-(startP<barP?8:0); base=t0-tmap(startP-P0,false,sw)*spb; clickP=Math.ceil((startP-1e-9)/2)*2; }
  lastSpb=spb; playing=true;
  // 코드 중간부터 시작하면 지금 코드를 남은 길이만큼 반주
  const cov=COMP.find(c=>c.P<startP-1e-9&&c.P+c.dur>startP+1e-9);
  if(cov&&$('comp').checked) comp(base+tmap(startP-P0,false,sw)*spb,cov.tones,tmap(cov.P+cov.dur-startP,false,sw)*spb*0.95);
  schedule(); timer=setInterval(schedule,25); requestAnimationFrame(ui);
  $('playt').textContent='정지'; $('play').classList.add('on'); $('play').setAttribute('aria-label','정지'); curCh=-1;
  const f=FLAT[idx]; if($('follow').checked && f && f.el) f.el.scrollIntoView({block:'center'});
}
function stop(){
  playing=false; clearInterval(timer);
  if(master){ const m=master; m.gain.setTargetAtTime(0,ctx.currentTime,.02); setTimeout(()=>m.disconnect(),300); master=null; }
  $('playt').textContent='재생'; $('play').classList.remove('on'); $('play').setAttribute('aria-label','재생'); markCur(-1); markSel();
  if(BREP){ BREP=0; markBlank(); }
}
$('play').onclick=()=>playing?stop():start();
$('bpm').oninput=e=>{ $('bpmv').textContent=e.target.value; $('bpmq').value=e.target.value; };
// 고정 바: 템포 −/+ (4씩), 설정 창
function setBpm(v){ v=Math.round(+v); if(!isFinite(v)) v=+$('bpm').value; v=Math.max(60,Math.min(350,v)); $('bpm').value=v; $('bpmv').textContent=v; $('bpmq').value=v; }
// 템포 숫자 직접 입력: 엔터나 다른 곳을 누르면 적용 (60~350)
$('bpmq').addEventListener('change',e=>setBpm(e.target.value));
$('bpmq').addEventListener('keydown',e=>{ if(e.key==='Enter'){ setBpm(e.target.value); e.target.blur(); } });
$('bpmq').addEventListener('focus',e=>e.target.select());
$('tdn').onclick=()=>setBpm(+$('bpm').value-4);
$('tup').onclick=()=>setBpm(+$('bpm').value+4);
function sheet(open){ $('sheet').hidden=!open; $('gear').setAttribute('aria-expanded',String(open)); }
$('gear').onclick=()=>sheet($('sheet').hidden);
$('sheetx').onclick=()=>sheet(false);
document.addEventListener('pointerdown',e=>{ if(!$('sheet').hidden && !e.target.closest('#sheet,#gear')) sheet(false); });
// 단축키: 스페이스 재생·정지, ← → 키, − + 템포
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ sheet(false); return; }
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const t=e.target; if(t.closest&&t.closest('input,select,textarea,[contenteditable]')) return;
  if(e.key===' '){ if(t.tagName==='BUTTON') return; e.preventDefault(); playing?stop():start(); }
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); const i=KEYS.indexOf(KEY), n=KEYS[(i+(e.key==='ArrowRight'?1:11))%12]; KEY=n; $('key').value=n; render(); }
  else if(e.key==='r'||e.key==='R'){ setLoop(!$('loop').checked); }
  else if((e.key==='n'||e.key==='N')&&!$('songnav').hidden){ location.hash=$('nexts').getAttribute('href'); }
  else if((e.key==='p'||e.key==='P')&&!$('songnav').hidden){ location.hash=$('prevs').getAttribute('href'); }
  else if(e.key==='-'||e.key==='_'){ setBpm(+$('bpm').value-4); }
  else if(e.key==='+'||e.key==='='){ setBpm(+$('bpm').value+4); }
});
// 악보의 마디를 누르면 그 마디를 시작 위치로 선택 (재생 버튼을 누르면 거기서부터)
$('scores').addEventListener('click',e=>{
  let el=e.target.closest('.abcjs-note,.abcjs-rest');
  if(!el){ // 음표 사이를 눌러도 가장 가까운 음표로 (휴대폰에서 누르기 쉽게)
    const sc=e.target.closest('.score'); if(!sc) return; let bd=1e9;
    sc.querySelectorAll('.abcjs-note,.abcjs-rest').forEach(n=>{ const r=n.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      const d=Math.abs(cx-e.clientX)+Math.abs(cy-e.clientY)*0.6; if(d<bd){ bd=d; el=n; } });
    if(!el||bd>60) return; }
  if(el.dataset.bar===undefined) return;
  const nb={chorus:+el.dataset.ch,bar:Math.max(0,+el.dataset.bar)}; // 못갖춘마디를 누르면 1마디
  if($('blank').value==='pick'){ const k=nb.chorus+':'+nb.bar; PICK.has(k)?PICK.delete(k):PICK.add(k); markBlank(); return; } // 빈칸 직접 고르기
  if($('loop').checked){ // 구간 반복: 시작 마디 → 끝 마디
    if(SEL&&!SEL.done&&SEL.chorus===nb.chorus) SEL={chorus:nb.chorus,bar:Math.min(SEL.bar,nb.bar),end:Math.max(SEL.bar,nb.bar),done:true};
    else SEL={chorus:nb.chorus,bar:nb.bar,end:nb.bar,done:false};
  } else SEL=(SEL&&SEL.chorus===nb.chorus&&SEL.bar===nb.bar&&SEL.end===nb.bar)?null:{chorus:nb.chorus,bar:nb.bar,end:nb.bar,done:true}; // 같은 마디를 다시 누르면 선택 해제
  if(SEL) $('from').value=String(SEL.chorus);
  markBar(); markSel();
});
$('swing').oninput=e=>$('swingv').textContent=e.target.value+'%';
$('from').onchange=()=>{ SEL=null; markBar(); if(!playing) stop(); const el=$('ch'+$('from').value); el&&el.scrollIntoView({block:'start'}); };
let curCh=-1, playFrom=0, keysDone=0, startIdx=0, SEL=null, PREG={sel:false,a:0,b:0}, reps=0, BREP=0;
const PICK=new Set();
// 빈칸 마디인가 (못갖춘마디는 1마디를 따라감)
function isBlank(ch,bar,rp){
  const mode=$('blank').value, b=Math.max(0,bar), n=DATA[ch]?DATA[ch].bars.length:0;
  if(mode==='off') return false; if(mode==='all') return true;
  if(mode==='alt') return Math.floor(b/2)%2===1; if(mode==='alt2') return Math.floor(b/2)%2===0;
  if(mode==='pick') return PICK.has(ch+':'+b);
  if(mode==='grow'){ // 구간 반복 중이면 그 구간 안에서 늘림
    const lp=playing&&$('loop').checked&&PREG.sel, lo=lp?PREG.a:0, cnt=lp?PREG.b-PREG.a+1:n;
    const step=cnt<=4?1:2, pr=[3,1,2,0], order=[...Array(cnt).keys()].sort((x,y)=>pr.indexOf(x%4)-pr.indexOf(y%4)||x-y).map(x=>x+lo);
    return order.slice(0,(rp==null?BREP:rp)*step).includes(b); }
  return false;
}
// 마디들을 감싸는 상자 (여러 줄에 걸치면 줄마다)
function boxes(svg,bars,cls,label){ const tight=!!label; // 빈칸 상자는 오선 높이만
  const byLine=new Map();
  bars.forEach(bar=>svg.querySelectorAll('[data-bar="'+bar+'"]').forEach(e=>{ const l=lineOf(e); if(!byLine.has(l)) byLine.set(l,[]); byLine.get(l).push(e); }));
  const NS='http://www.w3.org/2000/svg', made=[];
  byLine.forEach((els,l)=>{
    const bx=els.map(e=>{ const h=tight&&e.querySelector('.abcjs-notehead'); return h?Object.assign(bb(e),{x:bb(e).x}):bb(e); }), staff=svg.querySelector('.abcjs-staff.abcjs-l'+l);
    const sb=staff?staff.getBBox():{y:Math.min(...bx.map(b=>b.y)),height:40};
    const x1=Math.min(...bx.map(b=>b.x))-10, x2=Math.max(...bx.map(b=>b.x+b.width))+10;
    const y1=tight?sb.y-10:Math.min(sb.y,...bx.map(b=>b.y))-6, y2=tight?sb.y+sb.height+10:Math.max(sb.y+sb.height,...bx.map(b=>b.y+b.height))+6;
    const r=document.createElementNS(NS,'rect'); r.setAttribute('class',cls);
    r.setAttribute('x',x1); r.setAttribute('y',y1); r.setAttribute('width',x2-x1); r.setAttribute('height',y2-y1); r.setAttribute('rx',6);
    svg.insertBefore(r,svg.firstChild); made.push(r);
    if(label){ const t=document.createElementNS(NS,'text'); t.setAttribute('class','blanklab'); t.setAttribute('x',(x1+x2)/2); t.setAttribute('y',sb.y+sb.height/2+4); t.setAttribute('text-anchor','middle'); t.textContent=label; svg.appendChild(t); made.push(t); }
  });
  return made;
}
// 빈칸 마디: 음표·쉼표·빔을 가리고 점선 상자로 표시 (코드 이름은 그대로)
function markBlank(){
  document.querySelectorAll('.score svg .bl').forEach(e=>e.classList.remove('bl'));
  document.querySelectorAll('.blankbox,.blanklab').forEach(e=>e.remove());
  if($('blank').value==='off') return;
  DATA.forEach((c,ci)=>{
    const svg=document.querySelector('#sc'+ci+' svg'); if(!svg) return;
    c.bars.forEach((_,bar)=>{
      if(!isBlank(ci,bar)) return;
      const ids=bar===0&&c.pickup?[-1,0]:[bar];
      ids.forEach(id=>{ const lm=new Set(); svg.querySelectorAll('[data-bar="'+id+'"]').forEach(e=>lm.add(lineOf(e)+'_'+mOf(e)));
        lm.forEach(k=>{ const [l,m]=k.split('_'); svg.querySelectorAll('.abcjs-l'+l+'.abcjs-m'+m).forEach(e=>{ const cl=e.getAttribute('class')||'';
          if(!/abcjs-(chord|bar|staff|clef|key-signature|time-signature)/.test(cl)) e.classList.add('bl'); }); }); });
      boxes(svg,ids,'blankbox','즉흥');
    });
  });
}
// 선택한 마디를 악보에 표시 (마디 뒤에 옅은 상자)
function markBar(){
  document.querySelectorAll('.selbar').forEach(r=>r.remove());
  if(!SEL) return;
  const svg=document.querySelector('#sc'+SEL.chorus+' svg'); if(!svg) return;
  const bars=[]; for(let b=SEL.bar;b<=SEL.end;b++) bars.push(b);
  boxes(svg,bars,'selbar');
}
// 구간 반복 켜고 끄기
function setLoop(on){ $('loop').checked=on; $('loopb').setAttribute('aria-pressed',String(on));
  if(!on&&SEL){ SEL.end=SEL.bar; SEL.done=true; } markBar(); markSel(); }
$('loopb').onclick=()=>setLoop(!$('loop').checked);
$('loop').onchange=()=>setLoop($('loop').checked);
$('blank').onchange=()=>markBlank();
$('key').onchange=()=>{ KEY=$('key').value; render(); };
$('space').onchange=()=>render();
function markCur(i){ document.querySelectorAll('#jump button').forEach(b=>b.classList.toggle('cur',+b.dataset.i===i));
  document.querySelectorAll('.chorus').forEach(a=>a.classList.toggle('playing',a.id==='ch'+i));
  const b=document.querySelector('#jump button.cur'); b&&b.scrollIntoView({block:'nearest',inline:'nearest'}); }
function markSel(){ const s=+$('from').value, c=DATA[s];
  document.querySelectorAll('#jump button').forEach(b=>b.classList.toggle('sel',+b.dataset.i===s));
  const lp=$('loop').checked;
  const where=SEL?(lp?(SEL.end>SEL.bar?`${SEL.bar+1}–${SEL.end+1}마디 반복`:`${SEL.bar+1}마디 반복`+(SEL.done?'':' · 끝 마디를 누르세요')):(SEL.bar+1)+'마디부터'):(lp?'코러스 전체 반복':cstart(c));
  if(!playing&&c){ $('posk').textContent='시작 위치'; $('pos').textContent=`${keyLabel(KEY)} · ${cid(c)} · ${where}`; } }
let lastW=0; addEventListener('resize',()=>{ const w=$('scores').clientWidth; if((w<600)!==(lastW<600)&&!playing){ lastW=w; render(); } });
lastW=$('scores').clientWidth;

/* ===== 곡 불러오기 =====
   주소 끝의 #곡id 로 songs.js 에서 곡을 찾음 (예: song.html#f-blues) */
function loadSong(){
  const [id,mh]=location.hash.slice(1).split('--');   // 예: jazz-blues--chordtone
  const s=(window.SONGS||[]).find(x=>x.id===id)||(window.SONGS||[])[0];
  METHOD=METHODS[mh]?mh:'bebop';
  if(!s){ $('scores').innerHTML='<p class="err">곡 정보를 찾을 수 없어요.</p>'; return; }
  if(playing) stop();
  SONG=s; SEL=null; PICK.clear(); MINOR=/m$/.test(s.key); SONG_TONIC=s.key.replace(/m$/,'');
  const t=parse(SONG_TONIC); REF=MINOR?nameOf((t.l+2)%7,(t.pc+3)%12):SONG_TONIC;
  if(!(REF in KSIG)) throw new Error('지원하지 않는 키예요: '+s.key);
  KEY=REF;
  if(s.open){ const o=parse(s.open.replace(/m$/,'')), ok=MINOR?nameOf((o.l+2)%7,(o.pc+3)%12):s.open; if(ok in KSIG) KEY=ok; } // 처음 열 때 키 (예: Autumn Leaves는 Cm)
  try{ FORM=buildForm(s.bars); }catch(e){ $('scores').innerHTML='<p class="err">'+e.message+'</p>'; return; }
  // 코드톤·아르페지오·엔클로저는 II-V를 묶지 않고 코드마다 따로
  if(METHOD!=='bebop') FORM=CHORDS.map(cs=>cs.map(c=>{ const [t,r]=scaleFor(c); return {k:t+':'+r,len:8/cs.length,syms:[[c.sym,0]],c}; }));
  $('key').innerHTML=KEYS.map(k=>`<option value="${k}">${keyLabel(k)}</option>`).join('');
  $('key').value=KEY;
  $('from').value='0'; DATA=[];
  document.querySelectorAll('.sg-name').forEach(e=>e.innerHTML=s.name.replace('{key}','<span class="kn"></span>'));
  document.querySelectorAll('.sg-bars').forEach(e=>e.textContent=s.bars.length);
  const M=METHODS[METHOD];
  $('mname').textContent=M?M.name:'비밥 스케일';
  document.title=s.title+' '+(M?M.name:'비밥 스케일');
  if(!HEAD0) HEAD0={lead:$('lead').innerHTML,rules:$('rules').innerHTML};
  $('lead').innerHTML=M?M.lead:HEAD0.lead;
  $('rules').innerHTML=M?M.rules.map(r=>'<li>'+r+'</li>').join('')+'<li>다음 코드로 이끄는 음(접근음·당김음)이 있는 코러스는 1마디 앞 못갖춘마디에서 시작하고, 마지막 마디 끝에는 다시 1마디로 돌아가는 음이 있어요. 반복하거나 12키 순환을 켜면 그 자리에 다음 반복의 못갖춘마디가 이어져요.</li><li>자세한 원리와 12키 드릴은 <b>'+M.book+'</b>에서 다뤄요.</li>':HEAD0.rules;
  $('space').closest('label').hidden=!!M; $('spacehint').hidden=!!M;
  // 같은 메뉴(Basic/Song · 연습법) 안에서 이전·다음 곡
  const list=(window.SONGS||[]).filter(x=>(x.cat||'song')===(s.cat||'song')&&(x.methods||['bebop']).includes(METHOD));
  const at=list.indexOf(s), hid=x=>METHOD==='bebop'?x.id:x.id+'--'+METHOD;
  const pv=list[(at-1+list.length)%list.length], nx=list[(at+1)%list.length];
  $('songnav').hidden=list.length<2;
  if(list.length>1){ $('prevs').href='#'+hid(pv); $('prevs').querySelector('b').textContent=pv.title; $('nexts').href='#'+hid(nx); $('nexts').querySelector('b').textContent=nx.title; }
  $('songnote').innerHTML=(s.notes||[]).map(n=>'<p>'+n+'</p>').join(''); $('songnote').hidden=!(s.notes&&s.notes.length);
  render();
}
let HEAD0=null;
addEventListener('hashchange',loadSong);
loadSong();
