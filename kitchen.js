/* Live visual feedback reads the same pot state as the cooking controls. */
window.startKitchenAnimation = function (canvas, status, getPot) {
  const ctx = canvas.getContext('2d');
  let frame, previousWater, previousNoodle, pourUntil = 0, noodleUntil = 0;
  function ellipse(x, y, rx, ry, fill) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
  }
  function render(now) {
    if (!canvas.isConnected) return;
    const pot = getPot();
    if (!pot) return;
    const t = now / 1000;
    if (previousWater !== undefined && pot.water > previousWater + 20) pourUntil = now + 900;
    if (previousNoodle === false && pot.noodle) noodleUntil = now + 850;
    previousWater = pot.water;
    previousNoodle = pot.noodle;
    const dry = pot.water <= 0;
    const boil = !dry && pot.temp >= 96;
    const warmth = Math.max(0, Math.min(1, (pot.temp - 55) / 41));
    const surface = 144 - Math.min(1, pot.water / 1000) * 48;
    ctx.clearRect(0, 0, 520, 240);
    ctx.fillStyle = '#25483e'; ctx.fillRect(0, 0, 520, 240);
    ctx.strokeStyle = '#36594e'; ctx.lineWidth = 1;
    for (let x = 0; x < 520; x += 52) {ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,190);ctx.stroke();}
    ctx.fillStyle = '#a28b6b'; ctx.fillRect(0, 197, 520, 43);
    ctx.fillStyle = '#293b35'; ctx.fillRect(118, 190, 284, 24);
    ellipse(260, 190, 95, 13, '#162c29');
    if (pot.heat) {
      for (let i = 0; i < 9; i++) {
        const x = 184 + i * 19;
        const h = 8 + pot.heat * 7 + Math.sin(t * 13 + i * 2) * 4;
        ctx.fillStyle = '#f09d43';
        ctx.beginPath();ctx.moveTo(x-6,190);ctx.quadraticCurveTo(x-8,181,x,190-h);ctx.quadraticCurveTo(x+9,181,x+6,190);ctx.fill();
        ellipse(x,188,3,5,'#ffeaa4');
      }
    }
    ctx.fillStyle = '#23332d';ctx.fillRect(132,115,33,16);ctx.fillRect(355,115,33,16);
    ctx.fillStyle = '#bb6847';
    ctx.beginPath();ctx.moveTo(159,100);ctx.lineTo(175,167);ctx.quadraticCurveTo(260,205,345,167);ctx.lineTo(361,100);ctx.fill();
    ellipse(260,100,101,35,'#e5b57c');
    ellipse(260,100,93,29,'#644738');
    // A cutaway shows actual water height as well as the visible water surface.
    ctx.save();
    ctx.beginPath();ctx.moveTo(169,100);ctx.lineTo(182,164);ctx.quadraticCurveTo(260,195,338,164);ctx.lineTo(351,100);ctx.closePath();ctx.clip();
    if (!dry) {
      ctx.fillStyle = '#589f9b';ctx.fillRect(160,surface,200,70);
      ellipse(260,surface,91,23,'#8bc9ba');
      if (pot.noodle) {
        ctx.strokeStyle = '#f6db84';ctx.lineWidth = 3;
        for (let i=0;i<12;i++) {
          const x=195+i*11;
          ctx.beginPath();
          for(let j=0;j<=24;j++){
            const y=surface-10+j*1.9;
            const wave=Math.sin(j*.4+i+t*(boil?3:.5))*4;
            if(j===0)ctx.moveTo(x+wave,y);else ctx.lineTo(x+wave,y);
          }
          ctx.stroke();
        }
      }
      const count=boil?24:Math.floor(warmth*8);
      ctx.strokeStyle='#e6fff0';ctx.lineWidth=1.5;
      for(let i=0;i<count;i++){
        const cycle=(t*(boil?1.3:.45)+i*.137)%1;
        const x=184+(i*37)%150;
        ctx.beginPath();ctx.arc(x,surface+19-cycle*39,1+cycle*(boil?5:2),0,Math.PI*2);ctx.stroke();
      }
      ctx.strokeStyle='#c6e8ce';ctx.lineWidth=2;
      ctx.beginPath();
      for(let x=174;x<348;x++){const y=surface+Math.sin(x*.12+t*5)*(boil?3:.5);if(x===174)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      ctx.stroke();
    } else {
      ellipse(260,158,70,14,'#422f24');
      if(pot.noodle){ctx.strokeStyle='#a4773b';ctx.lineWidth=3;for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(207+i*12,145);ctx.quadraticCurveTo(215+i*12,158,202+i*12,167);ctx.stroke();}}
    }
    ctx.restore();
    // Steam follows retained temperature, including after the heat is turned off.
    if(warmth>0 && !dry){
      for(let i=0;i<5;i++){
        const cycle=(t*.45+i*.21)%1;
        ctx.globalAlpha=(1-cycle)*warmth*.65;
        ctx.strokeStyle='#ecf3df';ctx.lineWidth=4;
        const x=207+i*27;
        ctx.beginPath();ctx.moveTo(x,surface-15-cycle*30);
        ctx.bezierCurveTo(x+15,surface-30-cycle*30,x-12,surface-40-cycle*30,x+5,surface-54-cycle*30);ctx.stroke();
      }ctx.globalAlpha=1;
    }
    if(now<pourUntil){
      ctx.strokeStyle='#b6e7e3';ctx.lineWidth=6;
      ctx.beginPath();ctx.moveTo(361,32);ctx.quadraticCurveTo(326,40,286,surface);ctx.stroke();
      ellipse(286,surface,18+Math.sin(t*18)*5,6,'#d1f3de');
    }
    if(now<noodleUntil){
      const drop=1-(noodleUntil-now)/850;
      ctx.strokeStyle='#f7d780';ctx.lineWidth=3;
      for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(239+i*5,drop*80);ctx.lineTo(236+i*5,35+drop*80);ctx.stroke();}
    }
    const description=dry?'鍋底乾了':boil?'水面持續翻滾':pot.temp>=80?'小氣泡逐漸變多':pot.temp>=55?'水面開始冒出蒸氣':'水面平靜';
    status.textContent=description+(pot.noodle?' · 麵已在鍋中':' · 尚未下麵');
    canvas.setAttribute('aria-label',status.textContent);
    frame=requestAnimationFrame(render);
  }
  frame=requestAnimationFrame(render);
  return () => cancelAnimationFrame(frame);
};
