/* A seeded paper-and-pigment planet. All geography is sampled on the sphere,
   so bands narrow naturally toward the rim and remain stable for each record. */
function renderMemorialPlanet(record,targetCanvas){
  const canvas=targetCanvas||document.getElementById('planet-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const seed=hashSeed(record.id+':'+record.name+':'+record.species);
  const random=seededRandom(seed);
  const palette=planetPalettes[record.species]||planetPalettes['其他'];
  const variants=[
    ['#172f40','#315f70','#789692','#c3c4a4','#ece0bf'],
    ['#262d42','#56546b','#958b91','#c3ab8b','#e6cfab'],
    ['#25373a','#596b61','#9c9b78','#c4ad78','#ead5a0'],
    ['#1b3446','#38667b','#77a0a0','#a9c2ba','#e1e3c7'],
    ['#362d43','#685e76','#9a8396','#bbaa9b','#e4d8bb']
  ];
  const speciesTint={鸟:0,猫:1,狗:2,兔子:4,仓鼠:2,鱼:3,其他:4};
  const family=(speciesTint[record.species]||0);
  const colors=variants[(family+(seed>>>8)%3)%variants.length].map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
  const cx=260+(random()-.5)*12,cy=252+(random()-.5)*9,r=126+random()*13;
  const spin=random()*6.28,mode=(seed>>>3)%4,ringed=(seed%3!==0),angle=-.28+(random()-.5)*.45;
  const fract=x=>x-Math.floor(x);
  const hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7+seed*.000137)*43758.5453);
  const noise=(x,y)=>{
    const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
    const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
    return (hash(ix,iy)*(1-sx)+hash(ix+1,iy)*sx)*(1-sy)
      +(hash(ix,iy+1)*(1-sx)+hash(ix+1,iy+1)*sx)*sy;
  };
  const fbm=(x,y)=>.57*noise(x,y)+.28*noise(x*2.03+19,y*2.03-7)+.15*noise(x*4.1-13,y*4.1+8);
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  const ring=(front)=>{
    if(!ringed)return;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.scale(1,.38);
    const start=front?0:Math.PI,end=front?Math.PI:2*Math.PI;
    for(let line=0;line<24;line++){
      const rad=r*(1.18+line*.022);
      ctx.beginPath();
      for(let j=0;j<=160;j++){
        const t=start+(end-start)*j/160;
        const rr=rad+(noise(t*14+line*.19,line*.3)-.5)*3;
        const x=Math.cos(t)*rr,y=Math.sin(t)*rr;
        j?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.lineWidth=line%5===0?2.6:1.7;
      ctx.strokeStyle=[palette[3],palette[0],palette[1]][line%3]+(front?'a8':'6c');
      ctx.setLineDash(line%6===0?[11,4,22,2]:[]);
      ctx.stroke();
    }
    ctx.restore();ctx.setLineDash([]);
  };
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const image=ctx.createImageData(canvas.width,canvas.height);
  const bytes=image.data;
  const x0=Math.floor(cx-r),x1=Math.ceil(cx+r),y0=Math.floor(cy-r),y1=Math.ceil(cy+r);
  for(let py=y0;py<y1;py++)for(let px=x0;px<x1;px++){
    const x=(px-cx)/r,y=(py-cy)/r,rr=x*x+y*y;
    if(rr>=1)continue;
    const z=Math.sqrt(1-rr);
    const longitude=Math.atan2(x,z)+spin;
    const latitude=Math.asin(y);
    // Warped, connected pigment fields; no circles or separate crater shapes.
    const warp=fbm(longitude*1.75+4,latitude*2.1+3)-.5;
    const broad=fbm(longitude*1.35+warp*1.2,latitude*2.4-warp*.5);
    const detail=fbm(longitude*5.4+warp*2,latitude*6.2);
    let field;
    if(mode===0)field=.58*broad+.42*fbm(longitude*2.9+warp,latitude*3.5);
    else if(mode===1)field=.48+.26*Math.sin(latitude*10+warp*4+Math.sin(longitude*2)*.8)+.21*(detail-.5);
    else if(mode===2)field=.5+.22*Math.sin(latitude*13+longitude*.6+warp*5)+.26*(broad-.5);
    else field=.61*broad+.39*fbm(longitude*3+warp*2,latitude*4+warp);
    const level=field<.34?0:field<.45?1:field<.55?2:field<.67?3:4;
    const cloud=fbm(longitude*2.5+warp*3+10,latitude*7+Math.sin(longitude*2)*.7)> .64;
    let pigment=colors[level];
    if(cloud)pigment=mix(pigment,colors[4],.53);
    const light=Math.max(0,.68-x*.47-y*.32+z*.22);
    const edge=.53+.47*Math.min(1,z*2.2);
    const grain=(hash(px,py)-.5)*11;
    const index=(py*canvas.width+px)*4;
    for(let c=0;c<3;c++)bytes[index+c]=Math.max(0,Math.min(255,pigment[c]*light*edge+grain));
    bytes[index+3]=Math.min(255,Math.round(255*Math.min(1,(1-rr)*r*.8)));
  }
  ctx.putImageData(image,0,0);
  ctx.globalCompositeOperation='destination-over';ring(false);ctx.globalCompositeOperation='source-over';
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.lineWidth=2;ctx.strokeStyle=palette[3]+'61';ctx.stroke();
  // Dry pencil grain follows the sphere without introducing sticker-like motifs.
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r-1,0,Math.PI*2);ctx.clip();
  for(let i=0;i<650;i++){
    const x=(random()*2-1)*r,y=(random()*2-1)*r;
    if(x*x+y*y>r*r)continue;
    ctx.beginPath();ctx.moveTo(cx+x,cy+y);ctx.lineTo(cx+x+random()*3,cy+y+random()*2);
    ctx.strokeStyle=i%4?'rgba(236,225,196,.13)':'rgba(21,31,43,.18)';
    ctx.lineWidth=.5+random()*1.2;ctx.stroke();
  }
  ctx.restore();
  ring(true);
}
