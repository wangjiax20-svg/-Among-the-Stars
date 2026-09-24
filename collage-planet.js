/* One paper-collage renderer for studio, notebook and visitor planets. */
window.CollagePlanet=(()=>{
const W=900,CX=450,CY=525,R=276,RES=560;
const sizes=[210,83,90,170,160,180,100,124];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let atlas,propAtlas,tex=[],sprites=[];
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function freshSeed(){return Math.floor(Math.random()*2147483647)}
function makeCells(seed,kind){const rand=rng(seed);return Array.from({length:32},(_,i)=>{const a=i*2.399963+rand()*.25,r=Math.sqrt((i+.5)/32)*.985;const x=Math.cos(a)*r,y=Math.sin(a)*r,z=Math.sqrt(1-r*r);let type=0;
 if(kind==='meadow'){if(x>.08&&y>.0&&x*x+(y-.25)**2<.42)type=5;else if(y>.58||x<-.76)type=4;else if(x<-.22&&y<-.05)type=2;else if(x>.46&&y<-.18)type=1;else if(Math.abs(x+y*.25)<.18)type=3}
 if(kind==='woodland'){type=1;if(x>.12)type=0;if(x>.08&&y>.35)type=5;if(y<-.45&&x<.3)type=2;if(x<-.6||y>.7)type=4;if(Math.abs(x-y*.35)<.14)type=3}
 if(kind==='lake'){type=5;if(y<-.35||x<-.65)type=0;if(x<-.3&&y<-.1)type=2;if(x>.65||y>.7)type=4;if(x>.32&&y<-.35)type=1;if(y<-.7)type=3}
 return{x,y,z,type,variant:i%2};})}
function makeState(kind='meadow',seed=freshSeed()){const configs={meadow:[[0,-.48,-.59,1],[3,.22,-.55,.88],[1,-.5,-.2,.9],[2,.57,.26,.85]],woodland:[[0,-.38,-.62,1.1],[5,.35,-.43,.95],[1,.58,-.03,.8],[6,.03,.1,.8]],lake:[[0,-.48,-.56,.92],[1,-.64,-.15,.9],[2,.53,.0,1],[6,.17,-.46,.9]]};return{format:'among-stars-planet',version:1,name:'一处有风的小世界',seed,template:kind,palette:0,cells:makeCells(seed,kind),items:configs[kind].map((v,i)=>({id:'start-'+i,type:v[0],x:v[1],y:v[2],scale:v[3],angle:0})),photo:null,originalPhoto:null,caption:'',ring:{type:'none',color:'#dec58f',angle:-18,width:18}}}
function imageFrom(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('图片未能读取'));im.src=src})}
function prepareTextures(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d',{willReadFrequently:true});for(let i=0;i<6;i++){g.clearRect(0,0,512,512);g.drawImage(atlas,i%3*atlas.width/3,Math.floor(i/3)*atlas.height/2,atlas.width/3,atlas.height/2,0,0,512,512);tex.push(g.getImageData(0,0,512,512).data)}
 for(let i=0;i<8;i++){const c=document.createElement('canvas');c.width=c.height=440;const g=c.getContext('2d');g.drawImage(propAtlas,i%4*propAtlas.width/4,Math.floor(i/4)*propAtlas.height/2,propAtlas.width/4,propAtlas.height/2,0,0,440,440);sprites.push(c)}}
function remap(rgb,type,palette){if(palette===0)return rgb;const orange=[[[114,52,31],[229,121,48],[255,205,132]],[[10,60,63],[22,113,113],[121,196,176]],[[162,135,94],[233,214,165],[255,248,222]],[[100,55,39],[180,92,57],[243,170,107]],[[52,89,103],[166,192,181],[250,239,209]],[[8,56,81],[21,135,150],[179,231,224]]],blue=[[[20,46,104],[71,120,185],[153,202,235]],[[9,20,53],[20,43,87],[67,104,147]],[[115,153,189],[210,228,234],[255,253,240]],[[26,59,107],[109,167,206],[223,240,242]],[[114,144,170],[226,233,230],[255,253,240]],[[8,27,71],[65,144,191],[173,222,241]]];const tones=(palette===1?orange:blue)[type];const lum=(rgb[0]*.25+rgb[1]*.6+rgb[2]*.15)/255,l=clamp((lum-.18)/.64,0,1),t=l<.5?Math.round(l*2*3)/3:Math.round((l-.5)*2*3)/3,a=l<.5?tones[0]:tones[1],b=l<.5?tones[1]:tones[2];return a.map((v,i)=>v+(b[i]-v)*t)}
const ready=Promise.all([imageFrom('./assets/studio-terrain.webp'),imageFrom('./assets/studio-objects.webp')]).then(images=>{[atlas,propAtlas]=images;prepareTextures()});
function draw(state,canvas,photoImage=null){
 const ctx=canvas.getContext('2d'),terrain=document.createElement('canvas');terrain.width=terrain.height=RES;
 const tc=terrain.getContext('2d');let geometry=null,dirty=true,showGrid=false,selected=null;
function buildGeometry(){const count=RES*RES;const ids=new Uint8Array(count),uv=new Uint32Array(count),shade=new Float32Array(count),alpha=new Uint8Array(count),seam=new Uint8Array(count);const half=RES/2;
 for(let py=0;py<RES;py++)for(let px=0;px<RES;px++){let x=(px-half)/half,y=(py-half)/half;const dist=Math.hypot(x,y),ang=Math.atan2(y,x);const edge=.986+.006*Math.sin(ang*13+.6)+.003*Math.sin(ang*31);if(dist>edge)continue;const z=Math.sqrt(Math.max(0,1-x*x-y*y));const wx=x+.011*Math.sin(y*43+x*16)+.005*Math.sin(y*97),wy=y+.012*Math.sin(x*37-y*13);let best=-10,second=-10,id=0;
 for(let i=0;i<state.cells.length;i++){const c=state.cells[i],dot=wx*c.x+wy*c.y+z*c.z;if(dot>best){second=best;best=dot;id=i}else if(dot>second)second=dot}
 const p=py*RES+px;ids[p]=id;seam[p]=(best-second)<.005?1:0;
 let u=Math.atan2(x,z)/Math.PI+.5,v=Math.asin(clamp(y,-1,1))/Math.PI+.5;const ix=clamp(Math.floor(u*510),0,511),iy=clamp(Math.floor(v*510),0,511);uv[p]=(iy*512+ix)*4;
 shade[p]=clamp(.77-.18*x-.14*y+.17*z,.4,1.07)*(.73+.27*Math.min(1,z*2.4));alpha[p]=Math.round(clamp((edge-dist)*half,0,1)*255)}
 geometry={ids,uv,shade,alpha,seam}}
function drawTerrain(){if(!geometry)buildGeometry();const out=tc.createImageData(RES,RES),d=out.data,{ids,uv,shade,alpha,seam}=geometry;
 for(let p=0;p<alpha.length;p++){if(!alpha[p])continue;const cell=state.cells[ids[p]],t=tex[cell.type],j=uv[p],k=p*4;const rgb=remap([t[j],t[j+1],t[j+2]],cell.type,state.palette);const brightness=shade[p]*(cell.variant?1:.94);for(let c=0;c<3;c++)d[k+c]=clamp(rgb[c]*brightness+(seam[p]?5:0),0,255);d[k+3]=alpha[p]}
 tc.putImageData(out,0,0);dirty=false}
function propGeometry(item){const z=Math.sqrt(Math.max(0,1-item.x**2-item.y**2)),size=sizes[item.type]*item.scale*(.76+.24*z);return{x:CX+item.x*R,y:CY+item.y*R,size,angle:item.angle*Math.PI/180+item.x*.15}}
function drawItem(g,item,selection){const p=propGeometry(item);g.save();g.translate(p.x,p.y);g.rotate(p.angle);g.fillStyle='#14241f42';g.beginPath();g.ellipse(0,-3,p.size*.24,p.size*.055,0,0,Math.PI*2);g.fill();
 if(item.type===7){if(photoImage){const ratio=Math.min(p.size/photoImage.width,p.size/photoImage.height),w=photoImage.width*ratio,h=photoImage.height*ratio;g.drawImage(photoImage,-w/2,-h,w,h)}}else g.drawImage(sprites[item.type],-p.size/2,-p.size*.96,p.size,p.size);if(selection){g.strokeStyle='#e6d7ac';g.lineWidth=1.7;g.setLineDash([5,5]);g.strokeRect(-p.size*.47,-p.size*.92,p.size*.94,p.size*.93);g.setLineDash([]);g.beginPath();g.arc(0,0,5,0,Math.PI*2);g.fillStyle='#e8d6a5';g.fill()}g.restore()}
function drawRing(g,front){const r=state.ring;if(!r||r.type==='none')return;g.save();g.translate(CX,CY);g.rotate(r.angle*Math.PI/180);const rand=rng(state.seed+82);g.strokeStyle=r.color;g.fillStyle=r.color;const start=front?0:Math.PI,end=start+Math.PI;
 if(r.type==='dust'){for(let i=0;i<520;i++){const t=start+rand()*Math.PI,rad=R*1.25+(rand()-.5)*r.width*2;g.globalAlpha=.25+rand()*.65;g.beginPath();g.arc(Math.cos(t)*rad,Math.sin(t)*rad*.32,.5+rand()*2.1,0,7);g.fill()}}
 else{const n=r.type==='line'?3:22;for(let i=0;i<n;i++){const rad=R*1.2+i/(n-1)*r.width*1.8;g.globalAlpha=r.type==='line'?.75:.25+rand()*.3;g.lineWidth=r.type==='line'?1.5:2.7;g.beginPath();for(let j=0;j<=150;j++){const t=start+(end-start)*j/150,rr=rad+Math.sin(t*31+i)*1.2+(rand()-.5)*1.5;const x=Math.cos(t)*rr,y=Math.sin(t)*rr*.32;j?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}g.restore()}
function render(g=ctx,clean=false){g.clearRect(0,0,W,W);if(!tex.length)return;if(dirty)drawTerrain();const rand=rng(9847);for(let i=0;i<44;i++){const x=70+rand()*760,y=90+rand()*720;if(Math.hypot(x-CX,y-CY)<R+25)continue;g.fillStyle=i%4?'#c3b88972':'#e0c58a';g.beginPath();g.arc(x,y,rand()*1.3+.5,0,7);g.fill()}
 drawRing(g,false);g.drawImage(terrain,CX-R,CY-R,R*2,R*2);
 if(showGrid&&!clean){const grid=g.createImageData(RES,RES);for(let p=0;p<geometry.ids.length;p++){if(!geometry.alpha[p])continue;const k=p*4;if(geometry.seam[p]){grid.data[k]=236;grid.data[k+1]=226;grid.data[k+2]=196;grid.data[k+3]=125}else if(geometry.ids[p]===hoverCell){grid.data[k]=237;grid.data[k+1]=226;grid.data[k+2]=198;grid.data[k+3]=40}}const tmp=document.createElement('canvas');tmp.width=tmp.height=RES;tmp.getContext('2d').putImageData(grid,0,0);g.drawImage(tmp,CX-R,CY-R,R*2,R*2)}
 [...state.items].sort((a,b)=>a.y-b.y).forEach(item=>drawItem(g,item,!clean&&item.id===selected));drawRing(g,true);}
 ctx.save();ctx.scale(canvas.width/W,canvas.height/W);render(ctx,true);ctx.restore();
}
function fromRecord(record){let hash=2166136261;for(const c of record.id){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619)}const seed=hash>>>0;
 if(record.planet)return record.planet;
 const state=makeState(['meadow','woodland','lake'][seed%3],seed);state.name=record.name+'的小世界';state.palette=(seed>>>4)%3;
 state.ring={type:['none','line','crayon','dust'][(seed>>>8)%4],color:['#ddba80','#ecc897','#c4dcf1'][state.palette],angle:-32+seed%55,width:12+seed%15};
 state.items.forEach((item,i)=>{item.x=clamp(item.x+((seed>>i*2)%7-3)*.03,-.8,.8);item.scale=.8+(seed+i)%5*.1});
 return state;
}
return{ready,draw,fromRecord,makeState,makeCells};
})();
