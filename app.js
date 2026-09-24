(async()=>{await CollagePlanet.ready;
const thumbnailCache=new Map();
const views=[...document.querySelectorAll('.view')];
const state={name:'俊宝',species:'鸟',hint:0,x:0,y:0,dragging:false,focused:false,justFocused:0,startX:0,startY:0,records:[],activeId:null};
const constellationData={
  '鸟':{name:'飞鸟座',group:'鸟星群',clue:'展开翅膀的小鸟',points:[[50,41],[37,37],[21,24],[7,36],[25,47],[63,37],[79,24],[93,36],[75,47],[50,58],[41,75],[50,67],[59,75]],edges:[[0,1],[1,2],[2,3],[1,4],[0,5],[5,6],[6,7],[5,8],[0,9],[9,10],[9,11],[11,12]]},
  '猫':{name:'眠猫座',group:'猫星群',clue:'竖起耳朵的小猫',points:[[50,44],[31,31],[22,10],[43,25],[57,25],[78,10],[69,31],[72,56],[61,69],[50,73],[39,69],[28,56],[40,47],[60,47]],edges:[[0,3],[3,2],[2,1],[1,11],[11,10],[10,9],[9,8],[8,7],[7,6],[6,5],[5,4],[4,0],[12,13]]},
  '狗':{name:'守望犬座',group:'狗星群',clue:'抬头守望的小狗',points:[[50,42],[30,28],[13,35],[27,45],[34,64],[55,66],[67,53],[84,57],[92,46],[72,40],[61,27],[48,22]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,0],[0,11],[11,10],[10,9]]},
  '兔子':{name:'长耳座',group:'兔星群',clue:'有一双长耳朵的小兔',points:[[50,43],[38,25],[34,5],[45,29],[57,7],[60,31],[70,42],[74,59],[61,70],[43,69],[30,58],[31,43]],edges:[[0,3],[3,2],[2,1],[1,3],[3,4],[4,5],[5,0],[0,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,0]]},
  '仓鼠':{name:'谷粒座',group:'仓鼠星群',clue:'捧着谷粒的小仓鼠',points:[[50,42],[35,29],[25,18],[20,39],[27,61],[42,71],[58,71],[73,61],[80,39],[75,18],[65,29],[39,45],[61,45],[50,57]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,0],[11,13],[13,12]]},
  '鱼':{name:'游鳍座',group:'鱼星群',clue:'摆动尾鳍的小鱼',points:[[50,41],[29,27],[11,41],[29,56],[59,58],[76,48],[93,63],[88,41],[93,20],[76,34],[59,24]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,1],[10,0],[0,4]]},
  '其他':{name:'无名座',group:'自由星群',clue:'尚未被命名的轮廓',points:[[50,41],[35,23],[17,31],[25,52],[42,65],[63,61],[80,45],[72,24],[54,16],[45,50],[59,48]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,1],[0,9],[9,10],[10,0]]}
};
const svgNS='http://www.w3.org/2000/svg';
const storageKey='among-the-stars-memorials-v1';
const defaultRecord={id:'junbao-demo',name:'俊宝',species:'鸟',breed:'玄凤鹦鹉',memory:'她以前最喜欢在秋千上睡觉。',words:'稳如泰山的鸟妈妈。',createdAt:'13 SEP',skyIndex:0};
const worldAssets={'鸟':'world-bird.webp','猫':'world-cat.webp','狗':'world-dog.webp','兔子':'world-rabbit.webp','仓鼠':'world-hamster.webp','鱼':'world-fish.webp','其他':'world-other.webp'};
const stickerSheets={cats:'./assets/pet-stickers-cats-dogs.webp',birds:'./assets/pet-stickers-birds-rabbits.webp',small:'./assets/pet-stickers-small-fish.webp'};
const speciesSticker={'鸟':['birds',0],'猫':['cats',0],'狗':['cats',2],'兔子':['birds',2],'仓鼠':['small',0],'鱼':['small',2],'其他':['birds',1]};
const communityRecords=[
  {name:'橘子',species:'猫',breed:'橘猫',memory:'一到下午，就把自己晒成暖烘烘的一小团。',words:'窗台上还留着你最喜欢的那块阳光。',date:'08 SEP',sheet:'cats',sprite:0},
  {name:'墨墨',species:'猫',breed:'奶牛猫',memory:'总把瓶盖藏到沙发下面，再装作什么都不知道。',words:'家里偶尔还会找到你的宝藏。',date:'11 SEP',sheet:'cats',sprite:1},
  {name:'麦穗',species:'狗',breed:'金毛',memory:'每次听见钥匙声，她都会先跑到门口。',words:'谢谢你一次次欢迎我回家。',date:'29 AUG',sheet:'cats',sprite:2},
  {name:'豆包',species:'狗',breed:'小型犬',memory:'年纪大以后走得很慢，却仍坚持陪我们下楼。',words:'这一次，换我们慢慢等你。',date:'02 SEP',sheet:'cats',sprite:3},
  {name:'阿黄',species:'鸟',breed:'玄凤鹦鹉',memory:'关灯以后还要悄悄挪到最高的那根栖木上。',words:'晚安，小小的守夜人。',date:'13 SEP',sheet:'birds',sprite:0},
  {name:'薄荷',species:'鸟',breed:'虎皮鹦鹉',memory:'会把最喜欢的小米留到最后一粒才吃。',words:'你留下的声音还在房间里。',date:'24 AUG',sheet:'birds',sprite:1},
  {name:'月团',species:'兔子',breed:'垂耳兔',memory:'听见纸袋响，就从桌子下面露出半张脸。',words:'愿你永远有吃不完的青草。',date:'17 AUG',sheet:'birds',sprite:2},
  {name:'雪球',species:'兔子',breed:'白兔',memory:'最喜欢趴在刚换好的柔软毯子上。',words:'轻轻的你，也留下了很重的想念。',date:'06 SEP',sheet:'birds',sprite:3},
  {name:'栗子',species:'仓鼠',breed:'金丝熊',memory:'每晚认真搬运纸巾，把小窝垫得圆圆的。',words:'你建过的小小房间，我们都记得。',date:'31 AUG',sheet:'small',sprite:0},
  {name:'灰灰',species:'仓鼠',breed:'侏儒仓鼠',memory:'睡醒时总顶着一小片没有理顺的毛。',words:'希望你仍做着香甜的梦。',date:'19 AUG',sheet:'small',sprite:1},
  {name:'小满',species:'鱼',breed:'金鱼',memory:'有人靠近鱼缸时，就摇着尾巴游到最前面。',words:'原来安静的陪伴也会被听见。',date:'27 AUG',sheet:'small',sprite:2},
  {name:'蓝宝',species:'鱼',breed:'斗鱼',memory:'喜欢停在水草叶片上，像在自己的床上休息。',words:'你曾拥有一片蓝色的小宇宙。',date:'04 SEP',sheet:'small',sprite:3}
].map((record,index)=>({...record,id:`community-${index}`,createdAt:record.date,skyIndex:index+6,pointIndex:(index*3+1)%constellationData[record.species].points.length,isCommunity:true}));
let pendingAvatar='',pendingOriginal='';
const skyPositions=[
  {x:71,y:29,hint:'右上方'},{x:29,y:31,hint:'左上方'},{x:70,y:58,hint:'右下方'},{x:31,y:62,hint:'左下方'},
  {x:52,y:24,hint:'正上方'},{x:53,y:68,hint:'下方'},{x:74,y:45,hint:'右侧'},{x:25,y:48,hint:'左侧'},
  {x:63,y:34,hint:'偏右上方'},{x:39,y:69,hint:'偏左下方'},{x:64,y:65,hint:'偏右下方'},{x:37,y:26,hint:'偏左上方'},
  {x:18,y:22,hint:'左上方边缘'},{x:83,y:22,hint:'右上方边缘'},{x:17,y:72,hint:'左下方边缘'},{x:84,y:72,hint:'右下方边缘'},
  {x:45,y:43,hint:'中央偏左'},{x:59,y:48,hint:'中央偏右'},{x:46,y:79,hint:'靠近下方'},{x:57,y:16,hint:'靠近上方'}
];

function normalizeRecords(records){return records.map((record,index)=>{const constellation=constellationData[record.species]||constellationData['其他'];return {...record,skyIndex:Number.isInteger(record.skyIndex)?record.skyIndex:index%6,pointIndex:Number.isInteger(record.pointIndex)?record.pointIndex:(index*4)%constellation.points.length}})}
function loadRecords(){try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(Array.isArray(saved))return normalizeRecords(saved)}catch{}return[]}
function saveRecords(){try{localStorage.setItem(storageKey,JSON.stringify(state.records))}catch{alert('这台设备的保存空间不足，请先备份已有作品，再减少照片大小重试。')}}
state.records=loadRecords();
state.activeId=state.records.at(-1)?.id||communityRecords[0].id;
saveRecords();
const catDoodleSample={id:'cat-doodle-sample',name:'猫咪样例',species:'猫',breed:'',memory:'抬起后腿，闭着眼睛，把头轻轻仰起来。',words:'照片里的这个小小瞬间。',createdAt:'贴纸预览',skyIndex:17,pointIndex:8,doodle:'./assets/cat-doodle-sticker.webp',isSample:true};
function allSearchRecords(){return [...state.records,...communityRecords]}
function currentRecord(){return allSearchRecords().find(record=>record.id===state.activeId)||state.records[0]||defaultRecord}
function currentPosition(){const record=currentRecord();return skyPositions[(record.skyIndex||0)%skyPositions.length]}
function hashSeed(value){let hash=2166136261;for(const char of value){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return hash>>>0}
function seededRandom(seed){let value=seed||1;return()=>{value+=0x6D2B79F5;let result=value;result=Math.imul(result^result>>>15,result|1);result^=result+Math.imul(result^result>>>7,result|61);return((result^result>>>14)>>>0)/4294967296}}
const planetPalettes={
  '鸟':['#bfa85d','#6e795e','#273b43','#e6d9a6'],'猫':['#9d8765','#5f6f72','#252d38','#d8c9a8'],'狗':['#ad7d55','#74735e','#293941','#e5c692'],
  '兔子':['#9f8990','#6f7f83','#303645','#ddcaca'],'仓鼠':['#b18b5b','#85715c','#30363b','#e2cda7'],'鱼':['#5c8992','#446678','#202e43','#b5d6cd'],'其他':['#887597','#65767b','#292d3f','#d0bfdd']
};
const planetTypes={
  '鸟':['微风环星','暖枝丘陵星','薄云浮岛星'],'猫':['长昼窗光星','静眠绒原星','月影环星'],'狗':['草坡守望星','归途暖原星','长风旷野星'],
  '兔子':['软云苔原星','长耳月谷星','青草微光星'],'仓鼠':['谷粒丘星','纸絮暖巢星','小径储藏星'],'鱼':['缓流水镜星','蓝藻潮汐星','静海游光星'],'其他':['无名回声星','远灯漂流星','自由轨道星']
};
const speciesCharms={'猫':[0,1,2,3],'狗':[4,5,6,7],'鸟':[8,9,10,11],'兔子':[8,12,13,10],'仓鼠':[11,14,12,13],'鱼':[15,8,13,11],'其他':[3,8,10,13]};
function drawPlanet(record){const im=document.getElementById('saved-planet');im.hidden=false;document.getElementById('planet-canvas').hidden=true;im.src=planetThumbnail(record);}
function initStickerForge(){
  const sticker=document.getElementById('journal-sticker'),stage=document.getElementById('sticker-forge-stage');if(!sticker||!stage)return;
  customElements.whenDefined('sticker-forge').then(async()=>{try{sticker.setOptions({outline:{color:'#f3ede0',width:18},edge:{width:2,strength:.24},shadow:{color:'#493c2d',opacity:.25,blur:16,distance:8},lighting:{intensity:.45,ambient:.72,softness:.85},sound:{enabled:false},peel:{radius:.14,stiffness:.5,grabWidth:38,release:'reset'},material:{type:'original'},tilt:-3,wind:.06,quality:'medium'});await sticker.setSource({type:'image',src:'./assets/cat-doodle-sticker.webp',name:'猫咪手绘贴纸'});stage.classList.add('is-ready')}catch{stage.classList.add('is-fallback')}}).catch(()=>stage.classList.add('is-fallback'));
}
initStickerForge();
function renderPlanetCharms(record){
  const host=document.getElementById('planet-charms');if(!host)return;host.replaceChildren();const rng=seededRandom(hashSeed(`${record.id}:charms`));const choices=[...(speciesCharms[record.species]||speciesCharms['其他'])];
  for(let i=0;i<2;i++){const pick=choices.splice(Math.floor(rng()*choices.length),1)[0];const wrap=document.createElement('span');wrap.className='planet-charm-orbit';wrap.style.setProperty('--angle',`${Math.floor(rng()*360)}deg`);wrap.style.setProperty('--radius',`${117+Math.floor(rng()*31)}px`);wrap.style.setProperty('--duration',`${24+Math.floor(rng()*14)}s`);wrap.style.setProperty('--delay',`${-Math.floor(rng()*12)}s`);const charm=document.createElement('i');charm.className='planet-charm';charm.style.setProperty('--charm-x',`${(pick%4)*33.333}%`);charm.style.setProperty('--charm-y',`${Math.floor(pick/4)*33.333}%`);charm.style.setProperty('--size',`${20+Math.floor(rng()*7)}px`);wrap.append(charm);host.append(wrap)}
}
function drawMemoryPhoto(record){
 const canvas=document.getElementById('world-photo-canvas'),fallback=document.getElementById('world-photo');canvas.hidden=true;fallback.hidden=false;
 fallback.className='world-photo photo-sticker';fallback.style.backgroundSize='contain';fallback.style.backgroundRepeat='no-repeat';fallback.style.backgroundImage=record.avatar?`url("${record.avatar}")`:'';
 fallback.textContent=record.avatar?'':'这里还没有留下照片';document.getElementById('world-photo-caption').textContent=record.avatar?'一个熟悉的小小瞬间':'愿每个瞬间都被记得';
}

function currentConstellation(){return constellationData[state.species]||constellationData['其他']}
function renderConstellation(svg){
  const data=currentConstellation();
  const targetIndex=currentRecord().pointIndex||0;
  svg.replaceChildren();
  for(const [a,b] of data.edges){const line=document.createElementNS(svgNS,'line');line.setAttribute('x1',data.points[a][0]);line.setAttribute('y1',data.points[a][1]);line.setAttribute('x2',data.points[b][0]);line.setAttribute('y2',data.points[b][1]);line.setAttribute('class','constellation-line');svg.append(line)}
  data.points.forEach(([x,y],index)=>{const dot=document.createElementNS(svgNS,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',index===targetIndex?'1.9':'1.15');dot.setAttribute('class',`constellation-dot${index===targetIndex?' is-heart':''}`);svg.append(dot)});
  svg.setAttribute('aria-label',`${data.name}星图`);
}
function updateIdentity(){
  const record=currentRecord();
  state.name=record.name;state.species=record.species;
  const data=currentConstellation();
  const position=currentPosition();
  document.querySelectorAll('.pet-name').forEach(el=>el.textContent=state.name);
  document.querySelectorAll('.star-location').forEach(el=>el.textContent=`${data.group} · ${data.name}附近`);
  document.querySelectorAll('.constellation-name').forEach(el=>el.textContent=data.name);
  document.getElementById('journal-clue-one').textContent=`先找到像${data.clue}一样的星群。`;
  document.getElementById('journal-clue-two').textContent=`顺着${data.name}向${position.hint}寻找。在几颗弧形小星附近，有一颗暖黄色、轻轻闪烁的星。`;
  document.getElementById('found-title').textContent=`你找到${state.name}了。`;
  document.getElementById('search-title').textContent=`寻找${state.name}`;
  document.getElementById('found-quote').textContent=`“${record.words||'想念的时候，我会再来找你。'}”`;
  document.getElementById('world-name').textContent=`${state.name}的小世界`;
  document.getElementById('search-more').textContent=allSearchRecords().length>1?'返回望远镜 · 寻找下一颗星':'返回望远镜';
  document.getElementById('target-star').setAttribute('aria-label',`${state.name}的星星，暖黄色、轻轻闪烁`);
  const targetPoint=data.points[(record.pointIndex||0)%data.points.length];const searchSky=document.getElementById('search-sky');searchSky.style.setProperty('--target-x',`${position.x}%`);searchSky.style.setProperty('--target-y',`${position.y}%`);searchSky.style.setProperty('--constellation-left-offset',`${targetPoint[0]*2.36}px`);searchSky.style.setProperty('--constellation-top-offset',`${targetPoint[1]/82*196}px`);
  const worldImage=document.querySelector('.world-image');
  const asset=worldAssets[state.species]||worldAssets['其他'];
  worldImage.style.backgroundImage=`linear-gradient(rgba(2,8,17,.04),rgba(2,8,17,.14)),url('./assets/${asset}')`;
  document.querySelector('.memory-point--swing').dataset.memory=record.memory||`这里保存着关于${state.name}的一段小事。`;
  document.querySelector('.memory-point--one').dataset.memory=record.words||`想念的时候，我会再来找你。`;
  document.querySelector('.memory-point--two').dataset.memory=record.breed?`${state.name}是一只${record.breed}。`:`${state.name}在这里安静地生活着。`;
  const types=planetTypes[state.species]||planetTypes['其他'];const type=types[hashSeed(record.id+record.name)%types.length];document.getElementById('planet-name').textContent=`${state.name}星`;document.getElementById('planet-type').textContent=`${type} · ${data.group}`;
  document.getElementById('planet-description').textContent=`它的地貌来自${state.name}生活过的痕迹，每一次靠近，都会重新看见那些细小日常。`;
  document.getElementById('world-memory').textContent=record.memory||`这里保存着关于${state.name}的一段小事。`;document.getElementById('world-words').textContent=record.words||'想念的时候，我会再来找你。';
  drawMemoryPhoto(record.doodle?{...record,avatar:record.doodle}:record);drawPlanet(record);renderPlanetCharms(record);
  const petSticker=document.getElementById('planet-pet-sticker');petSticker.hidden=true;
  const silhouette=document.getElementById('planet-soul');const [sheet,sprite]=speciesSticker[record.species]||speciesSticker['其他'];
  silhouette.style.webkitMaskImage=`url('${stickerSheets[sheet]}')`;
  silhouette.style.maskImage=`url('${stickerSheets[sheet]}')`;
  silhouette.style.webkitMaskPosition=silhouette.style.maskPosition=`${sprite%2?'100%':'0%'} ${sprite>=2?'100%':'0%'}`;
  silhouette.hidden=true;document.getElementById('planet-charms').hidden=true;document.querySelector('.planet-orbit-dot').hidden=true;const edit=document.getElementById('edit-planet');edit.hidden=!state.records.some(r=>r.id===record.id);edit.href='./studio.html?pet='+encodeURIComponent(record.id)+'&return=world';document.getElementById('pet-management').hidden=edit.hidden;document.getElementById('edit-sticker').href=edit.href+'&step=sticker';document.getElementById('visit-direct').hidden=!record.found;renderLetters();
  renderConstellation(document.getElementById('journal-constellation'));
  renderConstellation(document.getElementById('animal-constellation'));
  renderSkyNeighbors();
}

function activateRecord(id){state.activeId=id;updateIdentity();renderJournal()}
function activateNextRecord(){const records=allSearchRecords();const currentIndex=Math.max(0,records.findIndex(record=>record.id===state.activeId));const next=records[(currentIndex+1)%records.length];activateRecord(next.id)}
function searchNextRecord(){resumeSearch=true;show('search')}
function applySticker(el,record){
  if(record.doodle){el.className='star-avatar doodle-avatar';el.style.backgroundImage=`url('${record.doodle}')`;return}
  if(record.avatar){el.style.backgroundImage=`url("${record.avatar}")`;el.className='star-avatar';return}
  const fallback=speciesSticker[record.species]||speciesSticker['其他'];const sheet=record.sheet||fallback[0];const sprite=Number.isInteger(record.sprite)?record.sprite:fallback[1];
  el.className=`star-avatar sprite sprite-${sprite}`;el.style.backgroundImage=`url('${stickerSheets[sheet]}')`;
}
function makeStamp(record,{community=false}={}){
  const data=constellationData[record.species]||constellationData['其他'];
  const button=document.createElement('button');button.type='button';button.className=`star-entry${!community&&record.id===state.activeId?' is-current':''}`;
  button.dataset.recordId=record.id;const mark=document.createElement('span');mark.className='stamp-mark';mark.textContent=community?'示例星球':'我的星星';
  const sticker=document.createElement('img');sticker.className='journal-planet';sticker.alt=record.name+'的星球';sticker.src=planetThumbnail(record);
  const name=document.createElement('h3');name.textContent=record.name;
  const location=document.createElement('span');location.textContent=`${data.name} · ${record.createdAt||record.date||''}`;
  button.append(mark,sticker,name,location);
  if(community){button.setAttribute('aria-label',`查看今夜遇见的${record.name}`);button.addEventListener('click',()=>renderEncounter(record))}
  else{button.setAttribute('aria-label',`查看${record.name}的观星笔记`);button.addEventListener('click',()=>{activateRecord(record.id);updateCarouselPage('star-list')})}
  return button;
}
function renderJournal(){document.getElementById('visit-direct').hidden=!currentRecord().found||!state.records.includes(currentRecord());document.getElementById('empty-notebook').hidden=state.records.length>0;document.getElementById('journal-search').hidden=!state.records.length;document.getElementById('personal-field-note').hidden=!state.records.length||document.getElementById('tab-mine').getAttribute('aria-selected')!=='true';
  const list=document.getElementById('star-list');
  const scroll=list.scrollLeft;list.replaceChildren();
  state.records.forEach(record=>list.append(makeStamp(record)));
  list.scrollLeft=scroll;updateCarouselPage('star-list');
}
document.getElementById('preview-cat-doodle')?.addEventListener('click',()=>{activateRecord(catDoodleSample.id);show('world')});
function renderEncounters(){const grid=document.getElementById('encounter-grid');grid.replaceChildren();communityRecords.forEach(record=>grid.append(makeStamp(record,{community:true})));updateCarouselPage('encounter-grid');renderEncounter(communityRecords[0])}
function renderEncounter(record){const data=constellationData[record.species]||constellationData['其他'];const note=document.getElementById('encounter-note');note.querySelector('span').textContent=`TONIGHT · ${data.group} · ${record.date}`;note.querySelector('h3').textContent=`${record.name} · ${record.breed}`;note.querySelector('p').textContent=`${record.memory} “${record.words}”`;const searchButton=document.getElementById('encounter-search');searchButton.hidden=false;searchButton.dataset.recordId=record.id;document.querySelectorAll('#encounter-grid .star-entry').forEach(b=>b.classList.toggle('is-current',b.dataset.recordId===record.id))}
document.getElementById('encounter-search').addEventListener('click',e=>{activateRecord(e.currentTarget.dataset.recordId);show('search')});
function selectJournalTab(name){
  const mine=name==='mine';document.getElementById('tab-mine').classList.toggle('is-active',mine);document.getElementById('tab-encounters').classList.toggle('is-active',!mine);
  document.getElementById('tab-mine').setAttribute('aria-selected',mine);document.getElementById('tab-encounters').setAttribute('aria-selected',!mine);
  const minePanel=document.getElementById('journal-mine');const encounterPanel=document.getElementById('journal-encounters');minePanel.hidden=!mine;encounterPanel.hidden=mine;minePanel.classList.toggle('is-active',mine);encounterPanel.classList.toggle('is-active',!mine);document.getElementById('personal-field-note').hidden=!mine||!state.records.length;document.getElementById('journal-search').hidden=!mine||!state.records.length;document.getElementById('visit-direct').hidden=!mine||!state.records.includes(currentRecord())||!currentRecord().found;
}
document.getElementById('tab-mine').addEventListener('click',()=>selectJournalTab('mine'));
document.getElementById('tab-encounters').addEventListener('click',()=>selectJournalTab('encounters'));

let journalReturn='home',resumeSearch=false,journalRecord=null;
function show(id){
  if(id==='journal'){const from=document.querySelector('.view.is-active:not(.is-leaving)');if(from&&from.id!=='journal'){journalReturn=from.id;journalRecord=state.activeId;}document.getElementById('journal').classList.toggle('journal-drawer',journalReturn==='search');document.getElementById('scope-journal').setAttribute('aria-expanded','true')}
  if(id==='world'){const record=currentRecord();if(state.records.includes(record)&&!record.found){record.found=true;saveRecords()}selectWorldTab('about');document.getElementById('farewell').classList.remove('show')}
  if(id!=='journal')document.getElementById('scope-journal').setAttribute('aria-expanded','false');
  const active=document.querySelector('.journal-drawer.is-active:not(.is-leaving)')||[...document.querySelectorAll('.view.is-active:not(.is-leaving)')].at(-1);
  if(active&&active.id===id)return;
  if(!(id==='journal'&&active?.id==='search')){active?.classList.add('is-leaving');setTimeout(()=>active?.classList.remove('is-active','is-leaving'),360)}
  const next=document.getElementById(id);
  next.classList.add('is-active');
  next.querySelector('.paper-scroll')?.scrollTo({top:0});
  if(id==='journal')renderJournal();
  if(id==='search'){if(!resumeSearch&&!(active?.id==='journal'&&journalReturn==='search'&&journalRecord===state.activeId))resetSearch();resumeSearch=false;}if(id!=='search'&&id!=='journal')document.getElementById('search').classList.remove('is-active');
}

document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-go]');
  if(trigger){if(trigger.dataset.go==='create')prepareNewForm();show(trigger.dataset.go)}
});

let editingProfile=null;
function readCreation(){try{return JSON.parse(localStorage.getItem('among-stars-creation-v2')||'null')}catch{return null}}
function fillProfile(record){const form=document.getElementById('star-form');form.reset();for(const key of ['name','species','breed','memory','words'])form.elements[key].value=record?.[key]|| (key==='species'?'鸟':'');}
function prepareNewForm(){editingProfile=null;fillProfile(readCreation());document.getElementById('create-title').textContent='认识TA';document.querySelector('#create .folio').textContent='1 / 3 · 认识TA';document.getElementById('create-next').textContent='下一步 · 布置星球';}
function profileValues(){const data=new FormData(document.getElementById('star-form'));return Object.fromEntries(['name','species','breed','memory','words'].map(k=>[k,String(data.get(k)||'').trim().slice(0,k==='name'?40:k==='breed'?80:6000)]));}
function stashCreation(){if(editingProfile)return;const old=readCreation();localStorage.setItem('among-stars-creation-v2',JSON.stringify({...old,...profileValues(),id:old?.id||'star-'+Date.now(),createdAt:old?.createdAt||new Date().toISOString(),skyIndex:old?.skyIndex??state.records.length%skyPositions.length,pointIndex:old?.pointIndex??0}));}
document.getElementById('star-form').addEventListener('input',()=>{try{stashCreation()}catch{}});
document.getElementById('star-form').addEventListener('submit',e=>{e.preventDefault();const values=profileValues();if(!values.name){document.querySelector('[name=name]').focus();return}try{if(editingProfile){const index=state.records.findIndex(r=>r.id===editingProfile);const next=state.records.map((r,i)=>i===index?{...r,...values}:r);localStorage.setItem(storageKey,JSON.stringify(next));state.records=next;editingProfile=null;updateIdentity();show('world')}else{stashCreation();location.href='./studio.html?create=1'}}catch{alert('暂时无法保存，请保留此页并重试。')}});
document.getElementById('edit-profile').onclick=()=>{if(!state.records.includes(currentRecord()))return;editingProfile=state.activeId;fillProfile(currentRecord());document.getElementById('create-title').textContent='修改TA的资料';document.querySelector('#create .folio').textContent='关于TA';document.getElementById('create-next').textContent='保存，回到星球';show('create')};
document.querySelector('#create [data-go=home]').removeAttribute('data-go');document.querySelector('#create .icon-btn').onclick=()=>show(editingProfile?'world':'home');

function notes(){const data=currentConstellation();const position=currentPosition();return[`先找到像${data.clue}一样的星群。`,`顺着${data.name}寻找，目标在星空的${position.hint}。`,`寻找那颗暖黄色、轻轻闪烁的星，把它移进圆形视野。`]}
const hintButton=document.getElementById('hint-button');
hintButton.addEventListener('click',()=>{
  state.hint=(state.hint+1)%3;
  document.getElementById('search-note').textContent=notes()[state.hint];
  hintButton.textContent=`线索 ${state.hint+1} / 3`;
});

const sky=document.getElementById('search-sky');
const searchView=document.getElementById('search');
const lens=document.querySelector('.lens-ring');
const target=document.getElementById('target-star');
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function renderSkyNeighbors(){
  const layer=document.getElementById('search-neighbors');if(!layer)return;layer.replaceChildren();
  allSearchRecords().filter(record=>record.id!==state.activeId).forEach((record,index)=>{
    const position=skyPositions[(record.skyIndex||0)%skyPositions.length];const button=document.createElement('button');
    button.type='button';button.className='neighbor-star';button.style.left=`${position.x}%`;button.style.top=`${position.y}%`;button.style.animationDelay=`${index%5*.42}s`;button.dataset.name=record.name;button.textContent=index%4===0?'✦':'·';button.setAttribute('aria-label',`转向${record.name}的星星`);
    button.addEventListener('pointerdown',event=>event.stopPropagation());button.addEventListener('click',event=>{event.stopPropagation();state.activeId=record.id;resetSearch();document.getElementById('search-note').textContent=`望远镜已转向${record.name}所在的${currentConstellation().name}。`});
    layer.append(button);
  });
}
function positionSky(){sky.style.setProperty('--x',`${state.x}px`);sky.style.setProperty('--y',`${state.y}px`)}
function resetSearch(){state.x=0;state.y=0;state.hint=0;state.focused=false;searchView.classList.remove('is-focused','is-dragging');sky.style.setProperty('--zoom','1');positionSky();updateIdentity();document.getElementById('search-note').textContent=notes()[0];hintButton.textContent='线索 1 / 3'}
function targetInLens(){const starRect=target.getBoundingClientRect();const lensRect=lens.getBoundingClientRect();const dx=starRect.left+starRect.width/2-(lensRect.left+lensRect.width/2);const dy=starRect.top+starRect.height/2-(lensRect.top+lensRect.height/2);return Math.hypot(dx,dy)<lensRect.width/2-18}
function focusTarget(){
  if(state.focused)return;
  const starRect=target.getBoundingClientRect();const lensRect=lens.getBoundingClientRect();
  state.x=clamp(state.x+(lensRect.left+lensRect.width/2-starRect.left-starRect.width/2),-150,150);
  state.y=clamp(state.y+(lensRect.top+lensRect.height/2-starRect.top-starRect.height/2),-300,300);
  state.focused=true;state.justFocused=performance.now();positionSky();
  document.getElementById('focus-label').querySelector('small').textContent=`轻触中央的星星，查看${state.name}的详细信息`;
  requestAnimationFrame(()=>{sky.style.setProperty('--zoom','1.68');searchView.classList.add('is-focused')});
}
function pointerStart(e){if(state.focused)return;state.dragging=true;searchView.classList.add('is-dragging');state.startX=e.clientX-state.x;state.startY=e.clientY-state.y;sky.setPointerCapture?.(e.pointerId)}
function pointerMove(e){if(!state.dragging||state.focused)return;state.x=clamp(e.clientX-state.startX,-150,150);state.y=clamp(e.clientY-state.startY,-300,300);positionSky()}
function pointerEnd(){if(!state.dragging)return;state.dragging=false;searchView.classList.remove('is-dragging');if(targetInLens())focusTarget()}
sky.addEventListener('pointerdown',pointerStart);sky.addEventListener('pointermove',pointerMove);sky.addEventListener('pointerup',pointerEnd);sky.addEventListener('pointercancel',pointerEnd);
target.addEventListener('click',e=>{e.stopPropagation();if(!state.focused){if(targetInLens())focusTarget();else document.getElementById('search-note').textContent='先把这颗星星移进圆形视野。';return}if(performance.now()-state.justFocused>650)show('world')});
document.getElementById('search-more').addEventListener('click',searchNextRecord);

// Guest-first storage. No simulated account or authentication claims.
let pendingImport=null;
const storageDialog=document.getElementById('storage-dialog');
document.querySelectorAll('[data-open-storage]').forEach(b=>b.onclick=()=>{document.getElementById('storage-status').textContent='';storageDialog.showModal()});
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.closeDialog).close());
function downloadFile(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
document.getElementById('export-notebook').onclick=()=>{try{const records=loadRecords();const backup=NotebookData.exportRecords(records);downloadFile(new Blob([JSON.stringify(backup)],{type:'application/json'}),'群星之间-完整手册-'+new Date().toISOString().slice(0,10)+'.json');document.getElementById('storage-status').textContent='已生成备份，请确认文件已保存到下载目录。'}catch(err){document.getElementById('storage-status').textContent=err.message}};
document.getElementById('import-notebook').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>25*1024*1024)throw Error('备份超过25 MB，请检查是否选对文件。');pendingImport=NotebookData.parseBackup(await file.text());document.getElementById('import-summary').textContent=`找到 ${pendingImport.length} 颗星球，包含照片、布置与已保存的信件。同一颗星球若有不同版本，将保留为副本。`;document.getElementById('import-review').hidden=false;document.getElementById('storage-status').textContent='请确认后恢复。'}catch(err){pendingImport=null;document.getElementById('import-review').hidden=true;document.getElementById('storage-status').textContent=err.message}finally{e.target.value=''}};
document.getElementById('cancel-import').onclick=()=>{pendingImport=null;document.getElementById('import-review').hidden=true};
document.getElementById('confirm-import').onclick=()=>{if(!pendingImport)return;try{const merged=NotebookData.mergeRecords(loadRecords(),pendingImport);localStorage.setItem(storageKey,JSON.stringify(merged));state.records=normalizeRecords(merged);state.activeId=state.records.at(-1)?.id||communityRecords[0].id;thumbnailCache.clear();pendingImport=null;document.getElementById('import-review').hidden=true;updateIdentity();renderJournal();document.getElementById('storage-status').textContent='恢复完成，现有星球也已保留。'}catch(err){document.getElementById('storage-status').textContent=err.name==='QuotaExceededError'?'此浏览器空间不足，原有记录未更改。可在空间更充足的浏览器恢复。':err.message}};
document.getElementById('copy-tool-link').onclick=async()=>{const url=new URL('./',location.href).href;try{await navigator.clipboard.writeText(url);document.getElementById('storage-status').textContent='工具链接已复制；不会包含你的个人记录。'}catch{const input=document.getElementById('tool-link-fallback');input.hidden=false;input.value=url;input.focus();input.select();document.getElementById('storage-status').textContent='请长按或复制下方链接。'}};
function wrapShareText(ctx,text,x,y,width,lineHeight,maxLines){let line='',lines=[];for(const char of text){if(char==='\n'||ctx.measureText(line+char).width>width){lines.push(line);line=char==='\n'?'':char}else line+=char}if(line)lines.push(line);const truncated=lines.length>maxLines;lines=lines.slice(0,maxLines);if(truncated)lines[lines.length-1]=lines.at(-1).slice(0,-1)+'…';lines.forEach((t,i)=>ctx.fillText(t,x,y+i*lineHeight));}
let shareRecord=null;
async function renderShare(){const r=shareRecord;if(!r)return;const c=document.getElementById('share-canvas'),g=c.getContext('2d');g.fillStyle='#111f2b';g.fillRect(0,0,c.width,c.height);const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=planetThumbnail(r)});g.drawImage(image,0,-20,1080,1080);g.fillStyle='#efe4c8';g.textAlign='center';g.font='46px serif';wrapShareText(g,r.name+'的小世界',540,1030,920,60,2);g.font='27px serif';g.fillStyle='#c3cdbf';const copy=document.getElementById('share-include-words').checked?r.words:'想念的时候，请在星空中寻找我。';wrapShareText(g,copy||'想念的时候，请在星空中寻找我。',540,1190,840,44,3);g.font='23px serif';g.fillStyle='#b7a980';g.fillText('群星之间 · Among the Stars',540,1380);}
document.getElementById('share-planet').onclick=async()=>{shareRecord={...currentRecord()};document.getElementById('share-include-words').checked=false;document.getElementById('share-dialog').showModal();try{await renderShare()}catch{document.getElementById('share-status').textContent='图片暂时未能生成，请稍后重试。'}};
document.getElementById('share-include-words').onchange=()=>renderShare().catch(()=>document.getElementById('share-status').textContent='图片未能更新，请重试。');
function shareBlob(){return new Promise((resolve,reject)=>document.getElementById('share-canvas').toBlob(b=>b?resolve(b):reject(Error('未能生成图片，请重试。')),'image/png'))}
document.getElementById('download-share').onclick=async()=>{try{downloadFile(await shareBlob(),'群星之间-星球分享.png');document.getElementById('share-status').textContent='已生成3:4图片，请确认下载，也可截图保存。'}catch(err){document.getElementById('share-status').textContent=err.message}};
document.getElementById('native-share').onclick=async()=>{try{const blob=await shareBlob(),file=new File([blob],'Among-the-Stars.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'群星之间'})}else{downloadFile(blob,'群星之间-星球分享.png');document.getElementById('share-status').textContent='此浏览器不支持直接分享，已改为下载图片。'}}catch(err){if(err.name!=='AbortError')document.getElementById('share-status').textContent='分享未完成，请使用「保存图片」或截图。'}};

const memoryCard=document.getElementById('memory-card');
document.querySelectorAll('[data-memory]:not(.memory-panel)').forEach(point=>point.addEventListener('click',()=>{
  memoryCard.querySelector('p').textContent=point.dataset.memory;
  memoryCard.classList.add('is-open');
}));
memoryCard.querySelector('button').addEventListener('click',()=>memoryCard.classList.remove('is-open'));

document.getElementById('leave-world').addEventListener('click',()=>{
 const own=state.records.some(r=>r.id===state.activeId);
 document.getElementById('farewell-title').textContent=own?'我仍然在这里。\nTA在那颗星星上。':'谢谢你在星空中发现了我。';
 document.getElementById('farewell-note').textContent=own?'但我知道怎样再次找到TA。':'记得常来看看我。';
 document.getElementById('farewell').classList.add('show');
});
function returnToSky(){document.getElementById('farewell').classList.remove('show');resumeSearch=true;show('search')}
document.getElementById('farewell-search').onclick=returnToSky;
document.getElementById('farewell-journal').onclick=()=>{document.getElementById('farewell').classList.remove('show');show('journal')};
document.getElementById('scope-journal').onclick=()=>show('journal');
document.getElementById('close-journal').onclick=()=>{resumeSearch=journalReturn==='search'&&journalRecord===state.activeId;show(journalReturn)};

window.addEventListener('keydown',e=>{if(e.key==='Escape'){const active=document.querySelector('.journal-drawer.is-active:not(.is-leaving)')||[...document.querySelectorAll('.view.is-active:not(.is-leaving)')].at(-1);if(active?.id==='journal'){document.getElementById('close-journal').click();return}if(active?.id!=='home')show(active?.id==='world'?'search':'home')}});

// Expose the same gentle journey to compatible assistants without changing the visible flow.
const modelContext=document.modelContext;
if(modelContext?.registerTool){
  const stages=['home','create','birth','journal','search','discovered','world'];
  Promise.resolve(modelContext.registerTool({
    name:'navigate_memorial_stage',
    title:'打开纪念空间的一页',
    description:'在群星之间原型中打开首页、创建、观星手册、寻星、发现或宠物小世界。',
    inputSchema:{type:'object',properties:{stage:{type:'string',enum:stages}},required:['stage'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){if(!stages.includes(input?.stage))throw new Error('未知页面');show(input.stage);return{stage:input.stage}}
  })).catch(()=>{});
  Promise.resolve(modelContext.registerTool({
    name:'create_memorial_star',
    title:'为宠物创建星星',
    description:'填写宠物名字与物种并完成星星诞生仪式。',
    inputSchema:{type:'object',properties:{name:{type:'string',minLength:1,maxLength:30},species:{type:'string',minLength:1,maxLength:20}},required:['name','species'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){if(!input?.name?.trim()||!input?.species?.trim())throw new Error('名字和物种不能为空');const species=input.species.trim();const constellation=constellationData[species]||constellationData['其他'];const record={id:`star-${Date.now()}`,name:input.name.trim(),species,breed:'',memory:'',words:'',createdAt:new Intl.DateTimeFormat('en',{day:'2-digit',month:'short'}).format(new Date()).toUpperCase(),skyIndex:state.records.length%6,pointIndex:(state.records.length*4)%constellation.points.length};localStorage.setItem('among-stars-creation-v2',JSON.stringify(record));location.href='./studio.html?create=1';return{name:record.name,species:record.species,stage:'studio'}}
  })).catch(()=>{});
}

function planetThumbnail(record){if(record.planetPreview)return record.planetPreview;if(thumbnailCache.has(record.id))return thumbnailCache.get(record.id);const c=document.createElement('canvas');c.width=c.height=520;CollagePlanet.draw(CollagePlanet.fromRecord(record),c);const url=c.toDataURL('image/png');thumbnailCache.set(record.id,url);return url}
function selectWorldTab(tab){document.querySelectorAll('[data-world-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.worldTab===tab)));document.querySelectorAll('[data-world-panel]').forEach(p=>p.hidden=p.dataset.worldPanel!==tab);document.getElementById('memory-card').classList.remove('is-open')}
document.querySelectorAll('[data-world-tab]').forEach(b=>b.onclick=()=>selectWorldTab(b.dataset.worldTab));
function updateCarouselPage(id){const list=document.getElementById(id);if(!list)return;const step=list.firstElementChild?.getBoundingClientRect().width+14||1;const page=Math.min(list.children.length,Math.round(list.scrollLeft/step)+1);document.getElementById(id==='star-list'?'mine-page':'encounter-page').textContent=`${page} / ${list.children.length}`}
document.querySelectorAll('[data-slide]').forEach(b=>b.onclick=()=>{const list=document.getElementById(b.dataset.list);list.scrollBy({left:((list.firstElementChild?.getBoundingClientRect().width||0)+14)*Number(b.dataset.slide),behavior:'smooth'})});
['star-list','encounter-grid'].forEach(id=>{const list=document.getElementById(id);list.addEventListener('scroll',()=>updateCarouselPage(id));list.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();list.scrollBy({left:(e.key==='ArrowLeft'?-1:1)*((list.firstElementChild?.getBoundingClientRect().width||0)+14),behavior:'smooth'})}})});
window.addEventListener('storage',e=>{if(e.key===storageKey){state.records=loadRecords();updateIdentity();renderJournal()}});

window.addEventListener('pageshow',()=>{state.records=loadRecords();updateIdentity();renderJournal()});

const returnParams=new URLSearchParams(location.search);

let letterIndex=0,editingLetter=null,letterPhoto='';
function lettersFor(record){return record.letters|| (record.words?[{id:'first',text:record.words,date:record.createdAt||'',photo:''}]:[])}
function renderLetters(){const r=currentRecord(),letters=lettersFor(r);letterIndex=Math.max(0,Math.min(letterIndex,letters.length-1));const letter=letters[letterIndex];document.getElementById('world-words').textContent=letter?.text||'想说的时候，留下一句话吧。';document.getElementById('letter-date').textContent=letter?`${letter.date.slice(0,10)} · ${letterIndex+1} / ${letters.length}`:'还没有信件';const im=document.getElementById('letter-image');im.hidden=!letter?.photo;im.src=letter?.photo||'';document.getElementById('letter-owner').hidden=!state.records.includes(r);document.getElementById('edit-letter').hidden=!letter;document.getElementById('delete-letter').hidden=!letter;document.getElementById('letter-prev').disabled=letterIndex===0;document.getElementById('letter-next').disabled=letterIndex>=letters.length-1;}
function persistLetters(letters){const next=state.records.map(r=>r.id===state.activeId?{...r,letters}:r);localStorage.setItem(storageKey,JSON.stringify(next));state.records=next;renderLetters()}
function openLetter(edit=false){if(!state.records.includes(currentRecord()))return;const letter=edit?lettersFor(currentRecord())[letterIndex]:null;editingLetter=letter?.id||null;letterPhoto=letter?.photo||'';document.getElementById('letter-text').value=letter?.text||'';document.getElementById('letter-status').textContent='';document.getElementById('clear-letter-photo').hidden=!letterPhoto;document.querySelector('#letter-form [type=submit]').textContent=edit?'保存修改':'留下这句话';document.getElementById('letter-dialog').showModal();}
document.getElementById('write-letter').onclick=()=>openLetter();document.getElementById('edit-letter').onclick=()=>openLetter(true);document.getElementById('close-letter').onclick=()=>document.getElementById('letter-dialog').close();
document.getElementById('letter-prev').onclick=()=>{letterIndex--;renderLetters()};document.getElementById('letter-next').onclick=()=>{letterIndex++;renderLetters()};
document.getElementById('letter-photo').onchange=async e=>{if(!e.target.files[0])return;try{letterPhoto=await PetStickers.read(e.target.files[0]);document.getElementById('clear-letter-photo').hidden=false;document.getElementById('letter-status').textContent='照片已附上'}catch(err){document.getElementById('letter-status').textContent=err.message}e.target.value=''};
document.getElementById('clear-letter-photo').onclick=()=>{letterPhoto='';document.getElementById('clear-letter-photo').hidden=true;document.getElementById('letter-status').textContent=''};
document.getElementById('letter-form').onsubmit=e=>{e.preventDefault();if(!state.records.includes(currentRecord()))return;const text=document.getElementById('letter-text').value.trim();if(!text&&!letterPhoto)return;const letters=[...lettersFor(currentRecord())];if(editingLetter){const i=letters.findIndex(l=>l.id===editingLetter);letters[i]={...letters[i],text,photo:letterPhoto}}else{letters.unshift({id:'letter-'+Date.now(),text,photo:letterPhoto,date:new Date().toISOString()});letterIndex=0}try{persistLetters(letters);document.getElementById('letter-dialog').close()}catch{document.getElementById('letter-status').textContent='设备空间不足，请减少照片后重试。'}};
document.getElementById('delete-letter').onclick=()=>document.getElementById('delete-letter-dialog').showModal();document.getElementById('cancel-delete-letter').onclick=()=>document.getElementById('delete-letter-dialog').close();document.getElementById('confirm-delete-letter').onclick=()=>{if(!state.records.includes(currentRecord()))return;try{persistLetters(lettersFor(currentRecord()).filter((l,i)=>i!==letterIndex));document.getElementById('delete-letter-dialog').close()}catch{alert('未能保存，请重试。')}};
document.getElementById('visit-direct').onclick=()=>{if(currentRecord().found)show('world')};
updateIdentity();renderJournal();renderEncounters();
const returnId=returnParams.get('pet');if(state.records.some(r=>r.id===returnId))activateRecord(returnId);
if(returnParams.get('view')==='create'){prepareNewForm();show('create')}else if(['journal','world'].includes(returnParams.get('view'))){show(returnParams.get('view'));if(returnParams.get('view')==='journal'){const list=document.getElementById('star-list');requestAnimationFrame(()=>{const selected=list.querySelector('.is-current');if(selected)list.scrollLeft=selected.offsetLeft-list.firstElementChild.offsetLeft;updateCarouselPage('star-list')})}}
})().catch(err=>{console.error(err);const status=document.createElement('p');status.textContent='星球素材暂时未能加载，请刷新重试。';document.getElementById('home').append(status)});
