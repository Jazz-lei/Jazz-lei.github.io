/* ===== 곡 목록 =====
   곡을 추가하려면 아래에 한 덩어리를 더 넣으세요.
   id    : 주소 이름 (song.html#id), 영문·숫자·하이픈
   title : 홈페이지 목록에 보일 제목
   name  : 연습 페이지 제목. {key} 자리에 지금 키 이름이 들어가요
   key   : 원래 키. 마이너 곡은 끝에 m (예: 'Gm')
   open  : (선택) 처음 열 때 키. 없으면 key와 같아요
   notes : (선택) 연습 페이지 위에 보일 설명
   cat   : (선택) 'basic'이면 Basic Practice, 없으면 Song Practice
   methods: (선택) 연습법 목록 'bebop' · 'chordtone' · 'arpeggio' · 'enclosure'. 없으면 비밥 스케일만
   코드 끝에 !를 붙이면(D7!) III7·VI7·VII7 자동 ♭9·♭13 규칙을 적용하지 않아요
   'F#dim7=D7alt'처럼 쓰면 악보에는 앞의 코드, 연주는 뒤의 코드 스케일로 해요
   bars  : 마디마다 코드. 한 마디에 1개, 2개(2박씩) 또는 4개(1박씩)
           코드 표기 예: F7, Bb7, Cm7, Am7b5, D7alt, Eb7#11, Cmaj7, C6, Cm6, CmMaj7, Bdim7
           (반음 아래로 해결하는 도미넌트는 #11을 안 적어도 자동으로 #11 스케일) */
window.SONGS=[
  { id:'major-251', cat:'basic', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Major II-V-I', name:'Major II-V-I', key:'C', bars:[
    'Dm7', 'G7', 'Cmaj7', 'C6' ] },
  { id:'minor-251', cat:'basic', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Minor II-V-I', name:'Minor II-V-I', key:'Cm', bars:[
    'Dm7b5', 'G7alt', 'CmMaj7', 'Cm6' ] },
  { id:'jazz-blues', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Jazz Blues', name:'Jazz Blues', key:'F', bars:[
    'F7', 'Bb7', 'F7', 'Cm7 F7',
    'Bb7', 'Bb7', 'F7', 'Am7b5 D7alt',
    'Gm7', 'C7', 'F7 D7alt', 'Gm7 C7' ] },
  { id:'days-of-wine-and-roses', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Days of Wine and Roses', name:'Days of Wine and Roses', key:'F', bars:[
    'Fmaj7', 'Eb7', 'D7alt', 'D7alt',
    'Gm7', 'Gm7', 'Bbm6', 'Eb7#11',
    'Am7', 'Dm7', 'Gm7', 'C7',
    'Em7b5 A7b9', 'Dm7 G7', 'Gm7', 'C7',
    'Fmaj7', 'Eb7', 'D7alt', 'D7alt',
    'Gm7', 'Gm7', 'Bbm6', 'Eb7#11',
    'Am7', 'Dm7', 'Bm7b5', 'Bb7',
    'Am7 D7alt', 'Gm7 C7', 'F6', 'Gm7 C7' ] },
  { id:'rhythm-changes', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Rhythm Changes', name:'Rhythm Changes', key:'Bb', bars:[
    'Bbmaj7 G7', 'Cm7 F7', 'Dm7 G7', 'Cm7 F7', 'Fm7 Bb7', 'Ebmaj7 Ebm6', 'Dm7 G7', 'Cm7 F7',
    'Bbmaj7 G7', 'Cm7 F7', 'Dm7 G7', 'Cm7 F7', 'Fm7 Bb7', 'Ebmaj7 Ebm6', 'Cm7 F7', 'Bb6',
    'D7!', 'D7!', 'G7!', 'G7!', 'C7', 'C7', 'F7', 'F7',
    'Bbmaj7 G7', 'Cm7 F7', 'Dm7 G7', 'Cm7 F7', 'Fm7 Bb7', 'Ebmaj7 Ebm6', 'Cm7 F7', 'Bb6' ] },
  { id:'all-of-me', methods:['bebop','chordtone','arpeggio','enclosure'], title:'All of Me', name:'All of Me', key:'C', bars:[
    'Cmaj7', 'Cmaj7', 'E7', 'E7', 'A7', 'A7', 'Dm7', 'Dm7',
    'E7', 'E7', 'Am7', 'Am7', 'D7', 'D7', 'Dm7', 'G7',
    'Cmaj7', 'Cmaj7', 'E7', 'E7', 'A7', 'A7', 'Dm7', 'Dm7',
    'Fmaj7', 'Fm6', 'Cmaj7 Em7', 'A7', 'Dm7', 'G7', 'C6 Ebdim7', 'Dm7 G7' ] },
  { id:'autumn-leaves', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Autumn Leaves', name:'Autumn Leaves', key:'Em', open:'Gm', bars:[
    'Am7', 'D7', 'Gmaj7', 'Cmaj7', 'F#m7b5', 'B7alt', 'Em6', 'Em6',
    'Am7', 'D7', 'Gmaj7', 'Cmaj7', 'F#m7b5', 'B7alt', 'Em6', 'Em6',
    'F#m7b5', 'B7b9', 'Em6', 'Em6', 'Am7', 'D7', 'Gmaj7', 'Gmaj7',
    'F#m7b5', 'B7b9', 'Em7 Eb7', 'Dm7 Db7', 'Cmaj7', 'B7b9', 'Em6', 'Em6' ] },
  { id:'beautiful-love', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Beautiful Love', name:'Beautiful Love', key:'Dm', bars:[
    'Em7b5', 'A7b9', 'Dm6', 'Dm6', 'Gm7', 'C7', 'Fmaj7', 'Em7b5 A7alt',
    'Dm6', 'Gm7', 'Bb7', 'Em7b5 A7alt', 'Dm6', 'G7#11', 'Em7b5', 'A7b9',
    'Em7b5', 'A7b9', 'Dm6', 'Dm6', 'Gm7', 'C7', 'Fmaj7', 'Em7b5 A7alt',
    'Dm6', 'Gm7', 'Bb7', 'Em7b5 A7alt', 'Dm6', 'Bb7 A7alt', 'Dm6', 'Dm6' ] },
  { id:'green-dolphin-street', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Green Dolphin Street', name:'Green Dolphin Street', key:'C', bars:[
    'Cmaj7', 'Cmaj7', 'Cm7', 'Cm7', 'D7/C', 'Dbmaj7/C', 'Cmaj7', 'Cmaj7',
    'Dm7', 'G7', 'Cmaj7', 'Cmaj7', 'Fm7', 'Bb7', 'Ebmaj7', 'Ebmaj7 G7',
    'Cmaj7', 'Cmaj7', 'Cm7', 'Cm7', 'D7/C', 'Dbmaj7/C', 'Cmaj7', 'Cmaj7',
    'Dm7 Dm7/C', 'Bm7b5 E7b9', 'Am7 Am7/G', 'F#m7b5 B7', 'Em7 A7', 'Dm7 G7', 'Cmaj7', 'Dm7 G7' ] },
  { id:'have-you-met-miss-jones', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Have You Met Miss Jones', name:'Have You Met Miss Jones', key:'F',
    notes:['<b>F♯°7 → D7(♭9,♭13)</b> F♯°7(F♯ A C E♭)은 D7(♭9)에서 근음 D를 뺀 소리예요. 다음 마디 Gm7으로 가는 V7(D7)과 같은 역할이라, 연주는 D7(♭9,♭13) 비밥 스케일로 해요.'],
    bars:[
    'Fmaj7', 'F#dim7=D7alt', 'Gm7', 'C7', 'Am7', 'Dm7', 'Gm7', 'C7',
    'Fmaj7', 'F#dim7=D7alt', 'Gm7', 'C7', 'Am7', 'Dm7', 'Cm7', 'F7',
    'Bbmaj7', 'Abm7 Db7', 'Gbmaj7', 'Em7 A7!', 'Dmaj7', 'Abm7 Db7', 'Gbmaj7', 'Gm7 C7',
    'Fmaj7', 'F#dim7=D7alt', 'Gm7', 'C7 Bb7', 'Am7 D7', 'Gm7 C7', 'Fmaj7', 'Gm7 C7' ] },
  { id:'how-high-the-moon', methods:['bebop','chordtone','arpeggio','enclosure'], title:'How High the Moon', name:'How High the Moon', key:'G', bars:[
    'Gmaj7', 'Gmaj7', 'Gm7', 'C7', 'Fmaj7', 'Fmaj7', 'Fm7', 'Bb7',
    'Ebmaj7', 'Am7b5 D7', 'Gmaj7', 'Am7 D7b9', 'Bm7 Bb7', 'Am7 D7', 'Gmaj7', 'Am7 D7',
    'Gmaj7', 'Gmaj7', 'Gm7', 'C7', 'Fmaj7', 'Fmaj7', 'Fm7', 'Bb7',
    'Ebmaj7', 'Am7b5 D7', 'Gmaj7', 'Am7 D7b9', 'Bm7 Bb7', 'Am7 D7', 'G6', 'Am7 D7' ] },
  { id:'out-of-nowhere', methods:['bebop','chordtone','arpeggio','enclosure'], title:'Out of Nowhere', name:'Out of Nowhere', key:'G', bars:[
    'Gmaj7', 'Gmaj7', 'Bbm7', 'Eb7', 'Gmaj7', 'Gmaj7', 'Bm7', 'E7b9',
    'Am7', 'E7b9', 'Am7', 'Am7', 'Eb7', 'Eb7', 'D7sus4', 'D7b9',
    'Gmaj7', 'Gmaj7', 'Bbm7', 'Eb7', 'Gmaj7', 'Gmaj7', 'Bm7', 'E7b9',
    'Am7', 'E7b9', 'Am7', 'Cm6', 'Bm7 Bbdim7', 'Am7 D7', 'G6', 'Am7 D7' ] },
];
