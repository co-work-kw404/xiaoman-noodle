// The dining room is drawn on a low-resolution grid. Labels are drawn separately for legibility.
window.initScene = function initScene(canvas, onStation) {
  const ctx = canvas.getContext('2d');
  const W = 360, H = 200;
  const room = document.createElement('canvas');
  room.width = W; room.height = H;
  const c = room.getContext('2d');
  const p = (x,y,w,h,color) => {c.fillStyle = color; c.fillRect(x,y,w,h);};
  const outline = (x,y,w,h,fill) => {p(x,y,w,h,'#332b30');p(x+1,y+1,w-2,h-2,fill);};
  let seed = 269;
  const rand = () => ((seed = (seed*1664525+1013904223)>>>0)/4294967296);
  function cabinet(x,w) {
    outline(x,68,w,26,'#ac684b');
    p(x+1,70,w-2,4,'#854b3c');p(x+2,90,w-4,3,'#663d36');
    for(let k=x+3;k<x+w-15;k+=18){
      outline(k,75,16,14,'#bf7b53');p(k+2,77,12,1,'#e5a26b');
      p(k+10,79,3,2,'#6c4a3b');
    }
    outline(x-1,66,w+2,6,'#e1b78a');p(x,67,w,1,'#ffdcaa');
  }
  function bottle(x,y,col){
    p(x+1,y,2,2,'#594a41');p(x+1,y+2,2,2,col);outline(x,y+4,5,8,col);
    p(x+1,y+7,3,3,'#e2c595');
  }
  function plant(x,y) {
    p(x-5,y+1,11,2,'#6c5847');outline(x-4,y-5,9,7,'#bc7250');
    p(x-5,y-6,11,3,'#e3a76d');p(x,y-17,1,11,'#496451');
    [[-7,-16,5,3],[-3,-12,3,4],[1,-15,6,3],[-1,-21,3,5],[3,-19,3,3],[-6,-20,4,3]].forEach(([a,b,w,h],i)=>p(x+a,y+b,w,h,i%2?'#56795a':'#82a66d'));
  }
  function bowl(x,y){
    p(x,y,12,2,'#fff1c9');p(x+1,y+2,10,2,'#95b8a9');p(x+3,y+4,6,1,'#486d66');
  }
  // Plastered wall, tiled backsplash and deep timber crossbeams.
  p(0,0,W,H,'#e3bf8a');p(0,7,W,28,'#e7c997');
  p(0,34,W,45,'#9cb7a4');
  for(let y=35;y<79;y+=7) for(let x=(y%2?0:-6);x<W;x+=12) {
    p(x,y,11,6,['#a4b6a4','#9ab0a0','#a2b9a8','#b0bda7'][Math.floor(rand()*4)]);
    p(x+1,y,9,1,'#bac7ad');
  }
  p(0,0,W,6,'#593e3a');p(0,6,W,2,'#85583e');
  [0,131,250,355].forEach(x=>{p(x,7,5,73,'#79523e');p(x+1,7,1,72,'#ab7954');});
  p(0,78,W,6,'#6b4c40');
  // Alternating floorboards and broken wood grain.
  p(0,84,W,116,'#986449');
  for(let y=85;y<H;y+=8){
    let x=-Math.floor(rand()*55);
    while(x<W){
      const len=34+Math.floor(rand()*34);
      const col=['#cc9568','#cd986c','#c48c61','#cf9a6b','#c38a61'][Math.floor(rand()*5)];
      p(x,y,len-1,7,col);p(x,y+1,len-2,1,'#dbab79');
      for(let i=0;i<2;i++)p(x+Math.floor(rand()*len),y+3+Math.floor(rand()*3),2+Math.floor(rand()*7),1,'#b57c56');
      x+=len;
    }
  }
  // Sunset window and its noren curtains.
  outline(141,12,99,41,'#86583d');outline(145,15,91,34,'#edaf81');
  p(146,16,89,9,'#d3a19a');p(146,25,89,6,'#e5af97');p(146,31,89,8,'#f4c291');
  p(209,24,7,6,'#ffe6ac');
  for(let x=146;x<235;x+=7){const h=3+Math.floor(rand()*7);p(x,48-h,7,h,'#988c83');p(x+2,49-h,1,1,'#f0cd96');}
  p(174,16,2,33,'#7b5947');p(205,16,2,33,'#7b5947');
  p(141,48,99,5,'#ad7851');p(139,52,103,2,'#775440');
  for(let i=0;i<5;i++){const x=144+i*18;p(x,12,17,10+(i%2),'#526965');p(x+1,13,2,7,'#68867b');p(x+7,18,4,2,'#ddbf89');}
  // Cookbook cabinet.
  outline(8,22,61,69,'#754e3d');p(11,25,55,62,'#533f38');
  [28,46,64].forEach((y,index)=>{
    let x=13;
    for(let i=0;i<(index===1?6:8);i++){
      const w=3+Math.floor(rand()*4), h=8+Math.floor(rand()*6);
      const col=['#be7955','#648780','#b2a277','#955d54','#d7ad78'][Math.floor(rand()*5)];
      p(x,y+14-h,w,h,col);p(x+1,y+15-h,1,h-2,'#ddbd90');p(x,y+11,w,1,'#705847');x+=w+1;
    }
    p(10,y+14,57,3,'#c18b61');p(10,y+17,57,1,'#87583f');
  });p(8,19,61,4,'#d29b68');p(7,90,62,3,'#67473b');
  // Computer workbench with an illuminated monitor, keyboard and a pencil jar.
  cabinet(77,55);outline(82,38,36,23,'#52675e');outline(85,40,30,17,'#7db3a4');
  p(87,42,26,12,'#6d9d91');p(88,43,7,1,'#d4dca1');p(88,45,4,1,'#c7d7a0');
  [2,4,3,6,8].forEach((n,i)=>p(91+i*4,53-n,2,n,'#d0dba0'));
  p(96,61,7,3,'#625f50');p(91,64,17,2,'#65635a');p(85,65,26,2,'#a1997c');
  outline(121,59,6,7,'#9b7b55');p(122,53,1,8,'#8c5446');p(125,54,1,6,'#687b67');
  // Cookline. Round pans hang below the window, a polished steel pot sits on the flame.
  cabinet(143,100);outline(149,63,18,4,'#b59a6d');p(150,62,14,1,'#f0bf7b');
  bottle(147,52,'#7f936b');bottle(154,51,'#b87450');
  outline(170,62,48,9,'#5a6863');p(173,64,15,4,'#464947');p(197,64,16,4,'#464947');
  p(179,64,9,2,'#e7a25d');outline(173,54,19,10,'#a1ada0');p(171,55,3,2,'#605953');p(192,55,3,2,'#605953');
  p(174,54,17,2,'#d7e0ca');p(176,56,2,5,'#c7ceba');
  outline(198,59,13,5,'#686254');p(210,58,7,2,'#7c5843');bowl(224,62);
  // Serving counter with paperwork, stacked bowls and a warm paper lantern.
  cabinet(253,97);p(254,73,95,16,'#58766e');
  for(let x=256;x<348;x+=12){p(x,74,1,13,'#729284');p(x+6,75,1,12,'#476b65');}
  for(let i=0;i<3;i++)bowl(264,61-i*2);
  outline(303,52,17,13,'#59493f');p(305,54,13,8,'#c7b079');p(306,55,10,2,'#ece0a9');
  p(300,65,24,2,'#846e54');plant(338,64);
  outline(261,15,45,28,'#986446');outline(264,18,39,22,'#45615a');
  [0,1,2].forEach(i=>{p(269,22+i*5,15-i*2,1,'#e6d4ab');p(292,22+i*5,5,1,'#d3b987');});
  p(330,7,1,8,'#5a493e');p(326,15,10,2,'#6c4c3b');p(324,17,14,14,'#d89161');
  p(322,20,18,8,'#e6a16c');p(325,19,2,10,'#f9bf80');p(333,19,2,10,'#c47653');
  p(326,31,10,2,'#624a3d');p(330,33,1,3,'#936441');
  // Dining tables occupy the foreground. Runners and place settings locate the scene as a noodle shop.
  function table(x,y){
    p(x+2,y+4,63,28,'#93684c');
    [x+6,x+45].forEach(a=>{outline(a,y-7,13,10,'#8f5843');p(a+1,y-6,11,2,'#ce9161');});
    outline(x,y,65,25,'#bd8056');p(x+2,y+1,61,2,'#e6ad70');p(x+1,y+22,63,2,'#976247');
    p(x+24,y+1,17,21,'#718d77');p(x+26,y+1,1,21,'#a9ae81');p(x+38,y+1,1,21,'#a9ae81');
    [x+8,x+47].forEach(a=>{bowl(a,y+9);p(a+1,y+15,11,1,'#735343');p(a+2,y+17,10,1,'#735343');});
    bottle(x+29,y+4,'#9b664c');
    [x+6,x+45].forEach(a=>{outline(a,y+25,13,8,'#a36646');p(a+1,y+26,11,1,'#d49463');});
  }
  table(9,167);table(285,167);
  p(147,178,63,19,'#ac7959');outline(146,176,63,18,'#6c8b7e');p(149,178,57,1,'#b2b99a');p(149,190,57,1,'#b2b99a');
  for(let x=149;x<208;x+=4){p(x,174,1,2,'#ded0a3');p(x,194,1,2,'#ded0a3');}
  plant(7,127);plant(351,136);

  const stations = [
    {key:'book', text:'廚藝書', x:38}, {key:'computer',text:'學習電腦',x:104},
    {key:'stove',text:'料理爐台',x:193}, {key:'counter',text:'接單櫃檯',x:303}
  ];
  const pos={x:179,y:143};
  let target=null, pending=null, hover=null, frame=0, last=0, phase=0;
  const held=new Set();
  canvas.width=720;canvas.height=400;canvas.tabIndex=0;
  canvas.setAttribute('aria-label','餐廳探索地圖。點選站點移動，或以方向鍵移動，Enter 互動。');
  function activate(key){ target=null;pending=null;held.clear();onStation(key); }
  function walkTo(st){pending=st;target={x:st.x,y:112};}
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function getPoint(e){const b=canvas.getBoundingClientRect();return {x:(e.clientX-b.left)*W/b.width,y:(e.clientY-b.top)*H/b.height};}
  function at(q){return stations.find(s=>Math.abs(s.x-q.x)<(s.key==='stove'?42:30)&&q.y>=20&&q.y<=110);}
  function click(e){canvas.focus({preventScroll:true});const q=getPoint(e),st=at(q);if(st)walkTo(st);else{pending=null;target={x:clamp(q.x,12,348),y:clamp(q.y,111,158)};}}
  function move(e){hover=at(getPoint(e));canvas.style.cursor=hover?'pointer':'crosshair';}
  function leave(){hover=null;}
  function nearest(){return stations.find(s=>Math.hypot(pos.x-s.x,pos.y-110)<25);}
  const arrows={arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0],arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1]};
  function keydown(e){const k=e.key.toLowerCase();if(arrows[k]){e.preventDefault();held.add(k);pending=null;target=null;}
    if((k==='enter'||k===' ')&&!e.repeat){e.preventDefault();const s=nearest();if(s)activate(s.key);}}
  function keyup(e){held.delete(e.key.toLowerCase());}
  function blur(){held.clear();}
  function draw(t){
    const dt=Math.min((t-last)/1000,0.08);last=t;
    let dx=0,dy=0;
    for(const k of held){dx+=arrows[k][0];dy+=arrows[k][1];}
    if(target){dx=target.x-pos.x;dy=target.y-pos.y;}
    const len=Math.hypot(dx,dy);
    if(len){const travel=target?Math.min(len,dt*115):dt*85;pos.x=clamp(pos.x+dx/len*travel,12,348);pos.y=clamp(pos.y+dy/len*travel,111,158);phase+=dt*12;}
    if(target&&Math.hypot(target.x-pos.x,target.y-pos.y)<0.6){target=null;if(pending){const k=pending.key;activate(k);}}
    ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(room,0,0);
    function square(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x,y,w,h);}
    for(let i=0;i<3;i++){const v=((t/260+i*3)%9);const x=177+i*4+Math.round(Math.sin(v*0.6));square(x,Math.floor(54-v),2,3,'rgba(255,242,206,.78)');}
    const x=Math.round(pos.x),y=Math.round(pos.y),bob=len?Math.round(Math.sin(phase)):0;
    square(x-6,y-1,12,2,'#966f51');
    square(x-4,y-3,3,3,'#4c4941');square(x+1,y-3+bob,3,3,'#4c4941');
    const ty=y+bob;
    square(x-5,ty-11,10,8,'#465c57');square(x-6,ty-10,2,5,'#e7b88b');square(x+4,ty-10,2,5,'#e7b88b');
    square(x-3,ty-10,6,5,'#e6d3a7');square(x-4,ty-5,8,2,'#f1d9a7');
    square(x-4,ty-17,8,7,'#6c493a');square(x-3,ty-15,6,5,'#e3af7e');square(x+1,ty-14,1,1,'#4a3e36');
    square(x-5,ty-20,9,4,'#e6ddbe');square(x-3,ty-22,6,3,'#fff2ce');square(x+2,ty-21,3,4,'#f3e6ca');square(x-4,ty-17,8,2,'#c4bda1');
    ctx.setTransform(1,0,0,1,0,0);ctx.font='bold 16px "PingFang TC","Microsoft JhengHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const near=nearest();
    stations.forEach(s=>{const cx=s.x*2,cy=201,w=s.text.length*17+16;
      ctx.fillStyle='rgba(61,48,42,.22)';ctx.fillRect(cx-w/2+2,cy-10,w,25);
      ctx.fillStyle=s===hover||s===near?'#3a6059':'#53463d';ctx.fillRect(cx-w/2,cy-12,w,24);
      ctx.fillStyle='#fff1cc';ctx.fillText(s.text,cx,cy);});
    frame=requestAnimationFrame(draw);
  }
  const events={pointerdown:click,pointermove:move,pointerleave:leave,keydown,keyup,blur};
  for(const [name,fn] of Object.entries(events))canvas.addEventListener(name,fn);
  frame=requestAnimationFrame(draw);
  return {focusStation(key){const s=stations.find(item=>item.key===key);if(s)walkTo(s);},destroy(){cancelAnimationFrame(frame);for(const [name,fn] of Object.entries(events))canvas.removeEventListener(name,fn);}};
};
