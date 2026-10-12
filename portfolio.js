 'use strict';
const $=s=>document.querySelector(s),canvas=$('#world'),ctx=canvas.getContext('2d'),panel=$('#panel');
let stored={};try{stored=JSON.parse(localStorage.getItem('sahil-starship')||'{}')}catch{}
const state={x:620,y:470,color:stored.color||'#c51111',reduced:stored.reduced??matchMedia('(prefers-reduced-motion: reduce)').matches};
const keys=new Set(),joy={x:0,y:0},cam={x:620,y:444},velocity={x:0,y:0};
let width=0,height=0,zoom=1,last=0,time=0,nearest=null,toastTimer,hasBoarded=false;
function save(){try{localStorage.setItem('sahil-starship',JSON.stringify({color:state.color,reduced:state.reduced}))}catch{}}
function toast(s){$('#toast').textContent=s;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,2800)}
function show(html){keys.clear();joy.x=joy.y=0;$('#content').innerHTML=html;if(!panel.open)panel.showModal()}
function close(){panel.close();canvas.focus()}
$('.close').onclick=close;panel.addEventListener('close',()=>{keys.clear();canvas.focus()});
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
function about(){show('<div class="eyebrow">THE PERSON IN THE VENT</div><h2>Oh, hi. I’m Sahil.</h2><p class="lead">Web developer. Curious builder. Your host aboard this little ship.</p><p>I build responsive business websites, eCommerce stores and interactive web interfaces using WordPress, WooCommerce, Shopify and React.</p><p>My work spans frontend development, custom store experiences, website maintenance and workflow automation. I enjoy turning a design into something people can actually use.</p><div class="tags"><span>WordPress</span><span>Shopify</span><span>React</span><span>Automation</span></div><div class="actions"><button id="aboutWork">See my work →</button><button id="aboutResume">Read my résumé</button></div>');$('#aboutWork').onclick=projects;$('#aboutResume').onclick=resume}
function projects(){show('<div class="eyebrow">SECURITY / PROJECT ARCHIVE</div><h2>Work from planet Earth.</h2><p>A few websites I’ve worked on. Select a project to visit its live website.</p><a class="project" target="_blank" rel="noopener noreferrer" href="https://agylestudio.com/">01 &nbsp; Agyle Studio <span>↗</span><small>Brand design & advertisement</small></a><a class="project" target="_blank" rel="noopener noreferrer" href="https://divineeventstours.com/">02 &nbsp; Divine Events & Tours <span>↗</span><small>Travel & tourism</small></a><a class="project" target="_blank" rel="noopener noreferrer" href="https://smiledentalpkl.com/">03 &nbsp; Smile Dental <span>↗</span><small>Dental clinic</small></a><div class="actions"><button id="workResume">More experience in my résumé →</button></div>');$('#workResume').onclick=resume}
function resume(){show('<div class="eyebrow">RECORDS ROOM / RÉSUMÉ</div><h2>The story so far.</h2><p class="lead">Sahil Kumar · Web Developer</p><p>WordPress · Shopify · React · WooCommerce</p><p>Explore my experience, technical skills, selected projects and education in the complete two-page résumé.</p><div class="actions"><a class="primary" href="assets/Sahil-Kumar-Resume.pdf" target="_blank" rel="noopener">Open résumé ↗</a><a href="assets/Sahil-Kumar-Resume.pdf" download="Sahil-Kumar-Resume.pdf">Download PDF ↓</a></div><div class="resume-note">PDF · 2 pages</div>')}
function contact(){show('<div class="eyebrow">COMMUNICATIONS / SAY HELLO</div><h2>Let’s build something.</h2><p>Have a website or eCommerce project in mind? Get in touch.</p><a class="project" href="mailto:sahils.0903@gmail.com">Email Sahil <span>↗</span><small>sahils.0903@gmail.com</small></a><a class="project" href="https://www.linkedin.com/in/sahilkumar-webdev" target="_blank" rel="noopener noreferrer">Connect on LinkedIn <span>↗</span><small>Sahil Kumar · Web Developer</small></a>')}
const destinations={about:{x:690,y:460,room:0,title:'About Me'},projects:{x:1375,y:435,room:2,title:'Projects'},resume:{x:430,y:1150,room:4,title:'Résumé'},contact:{x:1390,y:1150,room:6,title:'Contact'}};
const hotspots=[{id:'about',x:740,y:440,r:105,label:'Meet Sahil',action:about},{id:'projects',x:1375,y:325,r:160,label:'View projects',action:projects},{id:'resume',x:360,y:1100,r:120,label:'Read résumé',action:resume},{id:'contact',x:1390,y:1050,r:120,label:'Say hello',action:contact}];
function board(){hasBoarded=true;$('#boarding').hidden=true;document.body.classList.remove('boarding');canvas.focus()}
function goRoom(id){const d=destinations[id];if(!d)return;if(panel.open)close();if(!hasBoarded)board();state.x=d.x;state.y=d.y;cam.x=d.x;cam.y=d.y-26;keys.clear();joy.x=joy.y=0;update(0);canvas.focus()}
function currentRoom(){return rooms.find(r=>state.x>=r.x&&state.x<=r.x+r.w&&state.y>=r.y&&state.y<=r.y+r.h)||rooms[0]}
function map(){show('<div class="eyebrow">EXPLORE THE SHIP</div><h2>Where would you like to go?</h2><p>Pick a room, then click its character or console.</p><div class="roomchoices">'+Object.entries(destinations).map(([id,d])=>'<button data-room="'+id+'"><b>'+d.title+'</b><small>'+({about:'Meet the character in the vent',projects:'Browse the project screens',resume:'Open or download my résumé',contact:'Email and LinkedIn'})[id]+'</small></button>').join('')+'</div>');bindRoomButtons()}
function quick(){show('<div class="eyebrow">SAHIL KUMAR / WEB DEVELOPER</div><h2>A little space.<br>A lot to share.</h2><p>Open a section directly, or explore the rooms at your own pace.</p><div class="roomchoices"><button id="qabout">About me</button><button id="qprojects">Projects</button><button id="qresume">Résumé</button><button id="qcontact">Contact</button></div>');$('#qabout').onclick=about;$('#qprojects').onclick=projects;$('#qresume').onclick=resume;$('#qcontact').onclick=contact}
function settings(){show('<div class="eyebrow">YOUR VISIT</div><h2>Make yourself at home.</h2><p>Choose a colour for your explorer.</p><div class="swatches">'+['#c51111','#54c8bd','#c59beb','#ebc96a','#6896ef'].map((c,i)=>'<button data-color="'+c+'" aria-label="'+['Red','Teal','Lavender','Yellow','Blue'][i]+' suit" style="background:'+c+'"></button>').join('')+'</div><label><input type="checkbox" id="motion" '+(state.reduced?'checked':'')+'> Reduce motion</label><p>Use the room buttons to get around, or walk with WASD / arrow keys. Click a character or console to open its section.</p>');document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{state.color=b.dataset.color;save();settings()});$('#motion').onchange=e=>{state.reduced=e.target.checked;save()}}
function bindRoomButtons(){document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>goRoom(b.dataset.room))}bindRoomButtons();
$('#quick').onclick=quick;$('#spaceQuick').onclick=quick;$('#boardShip').onclick=board;$('#map').onclick=map;$('#settings').onclick=settings;
function interact(){if(!panel.open&&nearest)nearest.action()}$('#interact').onclick=interact;
window.addEventListener('keydown',e=>{if(panel.open||!hasBoarded)return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','e','m'].includes(k)){e.preventDefault();keys.add(k)}if(!e.repeat&&k==='e')interact();if(!e.repeat&&k==='m')map()});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();joy.x=joy.y=0});document.addEventListener('visibilitychange',()=>{keys.clear();joy.x=joy.y=0});
let joyPointer=null;const stick=$('#joystick');function joyMove(e){if(e.pointerId!==joyPointer)return;const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.max(32,Math.hypot(dx,dy));joy.x=dx/d;joy.y=dy/d;stick.firstElementChild.style.transform=`translate(${joy.x*27}px,${joy.y*27}px)`}stick.onpointerdown=e=>{joyPointer=e.pointerId;stick.setPointerCapture(e.pointerId);joyMove(e)};stick.onpointermove=joyMove;function joyEnd(){joyPointer=null;joy.x=joy.y=0;stick.firstElementChild.style.transform=''}stick.onpointerup=joyEnd;stick.onpointercancel=joyEnd;
const rooms=[{x:120,y:110,w:760,h:660,name:'ABOUT ME',color:'#a4aaa9'},{x:880,y:375,w:220,h:160,name:'TRANSIT',color:'#818b8e'},{x:1100,y:180,w:600,h:550,name:'PROJECTS',color:'#859b91'}];
rooms.push({x:470,y:770,w:120,h:200,name:'SOUTH HALL',color:'#7f8889'},{x:120,y:970,w:600,h:480,name:'RÉSUMÉ',color:'#868878'},{x:1315,y:730,w:120,h:240,name:'REACTOR ACCESS',color:'#80898e'},{x:1100,y:970,w:600,h:480,name:'CONTACT',color:'#778992'},{x:720,y:1140,w:380,h:120,name:'LOWER HALL',color:'#7f8889'});
const blocks=[{x:390,y:220,w:220,h:190,circle:true},{x:642.5,y:545,w:185,h:160,circle:true},{x:227.5,y:530,w:185,h:160,circle:true},{x:1240,y:260,w:270,h:95},{x:1480,y:520,w:145,h:100},{x:240,y:137,w:185,h:58}];
blocks.push({x:155,y:990,w:230,h:65},{x:145,y:1180,w:100,h:200},{x:400,y:1330,w:220,h:88},{x:1170,y:1010,w:155,h:300},{x:1480,y:1090,w:175,h:220});
function inCafe(px,py){return px>=120&&px<=880&&py>=110&&py<=770&&px+py>=330&&px-py<=670&&px+py<=1550&&py-px<=550}
function valid(x,y){const r=14;return [[x-r,y-r],[x+r,y-r],[x-r,y+r],[x+r,y+r]].every(([px,py])=>inCafe(px,py)||rooms.slice(1).some(b=>px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h))&&!blocks.some(b=>b.circle?Math.pow((x-(b.x+b.w/2))/(b.w/2+r+21),2)+Math.pow((y-(b.y+b.h/2))/(b.h/2+r+19),2)<1:x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)}
function rr(x,y,w,h,r,fill,stroke,lw=2){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function text(s,x,y,size,color='#b5c5d3',align='center'){ctx.font=`600 ${size}px "Space Grotesk", sans-serif`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(s,x,y)}
function line(x1,y1,x2,y2,color,w=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.stroke()}
function table(x,y,w,h,mission=false){const cx=x+w/2,cy=y+h/2,rx=w/2,ry=h/2;ctx.save();ctx.translate(cx,cy);ctx.scale(1,ry/rx);
ctx.fillStyle='#050b1755';ctx.beginPath();ctx.ellipse(0,14,rx+35,rx+31,0,0,7);ctx.fill();
for(let i=0;i<4;i++){const a=i*Math.PI/2+.11,b=(i+1)*Math.PI/2-.11;ctx.beginPath();ctx.arc(0,6,rx+31,a,b);ctx.arc(0,6,rx+15,b,a,true);ctx.closePath();ctx.fillStyle='#294b61';ctx.fill();ctx.strokeStyle='#162531';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.arc(0,0,rx+31,a,b);ctx.arc(0,0,rx+15,b,a,true);ctx.closePath();ctx.fillStyle='#477b98';ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,-2,rx+28,a+.015,b-.015);ctx.strokeStyle='#7297ad';ctx.lineWidth=2;ctx.stroke()}
ctx.beginPath();ctx.arc(0,7,rx,0,7);ctx.fillStyle='#26455a';ctx.fill();ctx.strokeStyle='#172937';ctx.lineWidth=4;ctx.stroke();
const g=ctx.createLinearGradient(-rx,-rx,rx,rx);g.addColorStop(0,'#568aa5');g.addColorStop(.55,'#427892');g.addColorStop(1,'#37647f');ctx.beginPath();ctx.arc(0,0,rx,0,7);ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,0,rx-7,0,7);ctx.strokeStyle='#73a0b657';ctx.lineWidth=2;ctx.stroke();
for(let i=0;i<20;i++){const xx=Math.sin(i*17)*rx*.8,yy=Math.cos(i*13)*rx*.7;line(xx,yy,xx+4,yy+1,'#b3c8d018',1)}ctx.restore();
if(mission){rr(cx-28,cy-24,56,44,3,'#a4adb1','#26323b',3);rr(cx-22,cy-20,44,31,2,'#463d3f','#20262b',2);rr(cx-15,cy-16,30,20,7,'#c82c28','#541914',3);line(cx-10,cy-13,cx+9,cy-13,'#f57f5c',2);text('WELCOME ABOARD',cx,cy+38,9,'#cbd6d9')}
else{paper(cx-40,cy-38,.22);paper(cx+36,cy+22,-.35);ctx.beginPath();ctx.moveTo(cx+16,cy-41);ctx.lineTo(cx+31,cy-27);ctx.lineTo(cx+10,cy-24);ctx.closePath();ctx.fillStyle='#d5b357';ctx.fill();ctx.strokeStyle='#6c633b';ctx.lineWidth=2;ctx.stroke();rr(cx-54,cy+23,11,18,3,'#b6c5ca','#374f5a',2);rr(cx-53,cy+23,9,4,2,'#e4e7d4','#374f5a',1)}}
function paper(x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);rr(-13,-9,26,18,2,'#ddd7bc','#576264',2);line(-8,-4,8,-4,'#999e8e',1);line(-8,0,5,0,'#999e8e',1);ctx.restore()}
let walkPhase=0,facing='right';
function crew(x,y,color,name,walk=false,flip=false){
 const player=name==='YOU';const dir=player?facing:(flip?'left':'right');
 const phase=walk&&!state.reduced?(player?walkPhase:time*11):0;
 const swing=Math.sin(phase),lift=Math.abs(Math.cos(phase));
 ctx.save();ctx.translate(x,y);ctx.fillStyle='#0c111b66';ctx.beginPath();ctx.ellipse(0,3,22,6,0,0,Math.PI*2);ctx.fill();
 if(dir==='left')ctx.scale(-1,1);ctx.translate(0,walk&&!state.reduced?-lift*2.2:0);ctx.rotate(walk&&!state.reduced?swing*.025:0);
 const back=dir==='up',front=dir==='down';
 if(!back)rr(-25,-39,14,30,5,color,'#07090e',3.5);
 const leg=(side,offset)=>{ctx.save();ctx.translate(side*11,-7);ctx.rotate(offset*.32);rr(-7,-4,15,17-(offset>0?offset*3:0),5,color,'#080a0f',3.5);rr(-5,6,11,5,2,'#00000027');ctx.restore()};
 leg(-1,swing);leg(1,-swing);
 ctx.beginPath();ctx.moveTo(-18,-13);ctx.bezierCurveTo(-20,-35,-18,-60,0,-60);ctx.bezierCurveTo(20,-62,23,-43,23,-17);ctx.quadraticCurveTo(4,-7,-18,-13);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=3.5;ctx.strokeStyle='#080a10';ctx.stroke();
 ctx.beginPath();ctx.moveTo(-16,-32);ctx.quadraticCurveTo(-10,-9,20,-23);ctx.lineTo(20,-15);ctx.quadraticCurveTo(0,-8,-16,-16);ctx.closePath();ctx.fillStyle='#00000036';ctx.fill();
 ctx.beginPath();ctx.moveTo(-11,-42);ctx.quadraticCurveTo(-10,-56,4,-55);ctx.strokeStyle='#ffffff28';ctx.lineWidth=5;ctx.lineCap='round';ctx.stroke();
 if(back){rr(-13,-39,32,28,7,color,'#090b10',3);rr(-10,-25,26,11,4,'#00000028');line(-8,-34,11,-34,'#ffffff25',3)}
 else{const vx=front?-13:-2;rr(vx,-48,front?34:29,22,10,'#547f99','#090c14',3.5);rr(vx+2,-46,front?30:25,13,8,'#a6dce5');rr(vx+7,-44,17,6,4,'#ecffff')}
 ctx.restore();ctx.font='600 13px Arial';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#101018';const label=player?'Sahil':name;ctx.strokeText(label,x,y-75);ctx.fillStyle=player?'#fff':'#abf8ee';ctx.fillText(label,x,y-75);
}
function consoleUnit(){rr(1233,258,284,101,12,'#182b36','#0f1d29',5);for(let i=0;i<3;i++){rr(1248+i*86,264,77,63,7,'#101f29','#739491',3);rr(1255+i*86,271,63,46,3,'#375d5c');line(1262+i*86,293,1274+i*86,281,'#c9f79f',2);line(1274+i*86,281,1286+i*86,301,'#c9f79f',2);line(1286+i*86,301,1305+i*86,286,'#c9f79f',2);for(let k=0;k<4;k++)line(1256+i*86+k*15,341,1264+i*86+k*15,341,'#75948f',3)}text('PROJECT ARCHIVE',1375,240,13,'#d6fa85')}
function marker(x,y,label){const bob=state.reduced?0:Math.sin(time*2)*3;ctx.save();ctx.shadowColor='#d6fa85';ctx.shadowBlur=14;rr(x-11,y-12+bob,22,22,7,'#d6fa85');ctx.restore();text('!',x,y+4+bob,15,'#273228');text(label,x,y+36,10,'#dbe9bd')}
function draw(){ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.fillStyle='#070d19';ctx.fillRect(0,0,width,height);for(let i=0;i<100;i++){const sx=((i*137.83-cam.x*.08)%width+width)%width,sy=((i*83.23-cam.y*.08)%height+height)%height;ctx.fillStyle=i%7===0?'#687c9b':'#26364e';ctx.fillRect(sx,sy,i%7===0?2:1,i%7===0?2:1)}ctx.save();ctx.translate(width/2,height/2);ctx.scale(zoom,zoom);ctx.translate(-cam.x,-cam.y);
// Ship hull and connected floors.
for(const b of rooms){rr(b.x-20,b.y-38,b.w+40,b.h+64,30,'#555d69','#10121b',7);rr(b.x-10,b.y-24,b.w+20,b.h+38,20,'#bac1ca','#202634',4)}for(const b of rooms){rr(b.x,b.y,b.w,b.h,10,b.color);ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();for(let x=b.x;x<b.x+b.w;x+=66)for(let y=b.y;y<b.y+b.h;y+=66){rr(x+2,y+2,62,62,2,'#ffffff04','#525c6366',1);ctx.fillStyle='#b0bdc329';ctx.fillRect(x+7,y+7,2,2)}ctx.restore();}
drawCafeteria();drawEngineeringRooms();
// Open corridor thresholds.
for(const x of [880,1100]){ctx.fillStyle='#818b8e';ctx.fillRect(x-23,376,46,158);for(let y=391;y<529;y+=25)line(x-15,y,x+15,y,'#677681',3);line(x-23,375,x+23,375,'#97c5bd',5);line(x-23,535,x+23,535,'#97c5bd',5)}
// Security wall windows.
for(let y=290;y<670;y+=118){rr(1678,y,20,74,5,'#223f50','#899ba2');rr(1683,y+5,9,62,3,'#477185')}
text('→',992,468,40,'#b6c5ca66');
table(390,220,220,190,true);table(642.5,545,185,160);table(227.5,530,185,160);consoleUnit();rr(1480,520,145,100,10,'#21333f','#172733',4);for(let i=0;i<4;i++){rr(1492,530+i*21,119,15,3,'#344c59');ctx.fillStyle='#a2d18d';ctx.fillRect(1500,535+i*21,5,5);line(1518,538+i*21,1585,538+i*21,'#729099',2)}

drawPortfolioProps();crew(state.x,state.y,state.color,'YOU',Math.hypot(velocity.x,velocity.y)>.1);ctx.restore();drawVisibility();positionHotspots()}
const sightWalls=[
 [220,110,780,110],[120,210,120,670],[220,770,470,770],[590,770,780,770],[120,210,220,110],[780,110,880,210],[880,670,780,770],[220,770,120,670],
 [880,210,880,375],[880,535,880,670],[880,375,1100,375],[880,535,1100,535],
 [1100,180,1700,180],[1700,180,1700,730],[1100,730,1315,730],[1435,730,1700,730],[1100,180,1100,375],[1100,535,1100,730],
 [470,770,470,970],[590,770,590,970],[1315,730,1315,970],[1435,730,1435,970],
 [120,970,470,970],[590,970,720,970],[120,970,120,1450],[120,1450,720,1450],[720,970,720,1140],[720,1260,720,1450],
 [1100,970,1315,970],[1435,970,1700,970],[1700,970,1700,1450],[1100,1450,1700,1450],[1100,970,1100,1140],[1100,1260,1100,1450],
 [720,1140,1100,1140],[720,1260,1100,1260]
];
const shadeCanvas=document.createElement('canvas'),shade=shadeCanvas.getContext('2d');
function rayDistance(px,py,angle,radius){const dx=Math.cos(angle),dy=Math.sin(angle);let best=radius;for(const [ax,ay,bx,by] of sightWalls){const sx=bx-ax,sy=by-ay,den=dx*sy-dy*sx;if(Math.abs(den)<1e-8)continue;const qx=ax-px,qy=ay-py,t=(qx*sy-qy*sx)/den,u=(qx*dy-qy*dx)/den;if(t>=0&&u>=0&&u<=1)best=Math.min(best,t)}return best}
function drawVisibility(){const dpr=devicePixelRatio;if(shadeCanvas.width!==canvas.width||shadeCanvas.height!==canvas.height){shadeCanvas.width=canvas.width;shadeCanvas.height=canvas.height}shade.setTransform(dpr,0,0,dpr,0,0);shade.globalCompositeOperation='source-over';shade.clearRect(0,0,width,height);shade.fillStyle='#000000d9';shade.fillRect(0,0,width,height);const radius=620,px=width/2+(state.x-cam.x)*zoom,py=height/2+(state.y-cam.y)*zoom;const angles=[];for(let i=0;i<160;i++)angles.push(i*Math.PI*2/160);for(const [ax,ay,bx,by] of sightWalls)for(const [x,y] of [[ax,ay],[bx,by]]){const a=Math.atan2(y-state.y,x-state.x);angles.push(...[a-.0001,a,a+.0001].map(v=>(v+Math.PI*2)%(Math.PI*2)))}angles.sort((a,b)=>a-b);shade.save();shade.beginPath();angles.forEach((a,i)=>{const r=rayDistance(state.x,state.y,a,radius),x=px+Math.cos(a)*r*zoom,y=py+Math.sin(a)*r*zoom;i?shade.lineTo(x,y):shade.moveTo(x,y)});shade.closePath();shade.clip();shade.globalCompositeOperation='destination-out';const g=shade.createRadialGradient(px,py,0,px,py,radius*zoom);g.addColorStop(0,'rgba(0,0,0,.96)');g.addColorStop(.55,'rgba(0,0,0,.91)');g.addColorStop(.85,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,0)');shade.fillStyle=g;shade.fillRect(0,0,width,height);shade.restore();shade.globalCompositeOperation='source-over';ctx.drawImage(shadeCanvas,0,0,canvas.width,canvas.height,0,0,width,height)}
function cafePath(){ctx.beginPath();ctx.moveTo(220,110);ctx.lineTo(780,110);ctx.lineTo(880,210);ctx.lineTo(880,670);ctx.lineTo(780,770);ctx.lineTo(220,770);ctx.lineTo(120,670);ctx.lineTo(120,210);ctx.closePath()}
function drawCafeteria(){
// Opaque surrounding hull, with eight-sided wall faces.
ctx.fillStyle='#252030';ctx.fillRect(98,70,804,720);cafePath();ctx.fillStyle='#a8ad9f';ctx.fill();ctx.lineWidth=14;ctx.strokeStyle='#121920';ctx.stroke();
ctx.save();cafePath();ctx.clip();
for(let y=80;y<800;y+=48)for(let x=90;x<910;x+=48){const col=(Math.floor((x-90)/48)+Math.floor((y-80)/48))%2;ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(24,0);ctx.lineTo(0,24);ctx.lineTo(-24,0);ctx.closePath();ctx.fillStyle=col?'#b7bbac':'#9da596';ctx.fill();ctx.restore()}
for(let i=0;i<1500;i++){let x=120+(Math.sin(i*145.23)*.5+.5)*760,y=110+(Math.cos(i*51.73)*.5+.5)*660;ctx.fillStyle=i%2?'#ffffff08':'#36423a09';ctx.fillRect(x,y,2+(i%4),1)}
// Upper wall elevation and inset trim.
ctx.fillStyle='#385160';ctx.fillRect(120,110,760,34);ctx.fillStyle='#729099';ctx.fillRect(120,110,760,10);ctx.fillStyle='#873d56';ctx.fillRect(120,144,760,15);line(120,160,880,160,'#202c34',4);
for(let x=255;x<760;x+=85){rr(x,115,70,20,2,'#496876','#243b45',2);line(x+5,120,x+65,120,'#88a2a6',1)}
// Doors, skirting and metal supports.
line(127,230,127,650,'#52656b',8);line(135,232,135,650,'#b6b8a3',4);line(866,230,866,365,'#879496',10);line(866,548,866,650,'#879496',10);line(230,758,767,758,'#4e616a',12);line(231,748,767,748,'#a1b4ae',3);
for(let x=260;x<745;x+=60){rr(x,750,35,6,2,'#343f46');}
// Galley counter and cupboards.
rr(235,153,193,51,3,'#626f6b','#29383d',3);rr(235,150,193,13,2,'#c2c5b0','#354950',2);for(let x=242;x<420;x+=44){rr(x,169,37,28,1,'#84958d','#354950',1);line(x+26,176,x+26,187,'#ced5c7',2)}
rr(262,137,40,14,5,'#566a71','#273d45',2);rr(267,138,29,8,3,'#929f9c');rr(354,127,21,23,3,'#b8bdaa','#35484e',2);rr(380,138,27,10,2,'#ddd4b5','#485b5e',2);
// Bulletin board, conduit, and inset access panels.
rr(655,157,72,45,3,'#3b4949','#1c323a',3);paper(674,176,-.08);paper(706,181,.12);
for(let i=0;i<3;i++){line(145+i*5,265,145+i*5,352,'#34454a',2);line(145+i*5,352,188,375+i*5,'#34454a',2)}
rr(144,425,23,85,3,'#60716e','#21373c',2);for(let y=435;y<500;y+=12)line(148,y,161,y,'#a3b0a5',2);
ctx.restore();
// Corner seams reinforce the angled room geometry.
for(const [x,y,xx,yy] of [[120,210,220,110],[780,110,880,210],[880,670,780,770],[220,770,120,670]]){line(x,y,xx,yy,'#121b22',9);line(x+3,y,xx,yy-3,'#71828a',3)}
}

// Original illustrated engineering props and continuous doorway floors.
function drawEngineeringRooms(){
 for(const [x,y,w,h] of [[470,748,120,245],[1315,710,120,280],[695,1140,430,120]]){rr(x,y,w,h,0,'#85908e');if(w<h){line(x,y,x,y+h,'#293b43',6);line(x+w,y,x+w,y+h,'#293b43',6);for(let yy=y+12;yy<y+h;yy+=32)line(x+10,yy,x+w-10,yy,'#a9b5aa',2)}else{line(x,y,x+w,y,'#293b43',6);line(x,y+h,x+w,y+h,'#293b43',6);for(let xx=x+12;xx<x+w;xx+=32)line(xx,y+10,xx,y+h-10,'#a9b5aa',2)}}
 // Electrical: cable runs, breaker cabinets and a grated service floor.
 for(let x=160;x<710;x+=50)for(let y=1080;y<1430;y+=50){line(x,y,x+27,y,'#4e585166',2);line(x,y+5,x+27,y+5,'#bec2a633',1)}
 for(let k=0;k<5;k++){ctx.beginPath();ctx.moveTo(165+k*12,1020);ctx.bezierCurveTo(440,1040+k*15,300,1290+k*15,540+k*12,1360);ctx.strokeStyle=['#303c48','#9e4541','#bba34d','#435e9b','#313e45'][k];ctx.lineWidth=7;ctx.stroke();ctx.lineWidth=2;ctx.strokeStyle='#ffffff25';ctx.stroke()}
 for(let i=0;i<3;i++){rr(158+i*75,994,68,65,3,'#738283','#24333b',3);rr(164+i*75,1002,56,25,2,'#273c40');for(let j=0;j<4;j++)rr(169+i*75+j*12,1008,6,12,1,j%2?'#d1b65c':'#72b397');line(168+i*75,1041,205+i*75,1041,'#35474e',3)}
 for(let y=1180;y<1380;y+=65){rr(145,y,100,59,4,'#727c70','#273a3d',4);rr(154,y+8,81,34,2,'#4c5e59','#253735',2);for(let j=0;j<5;j++)line(161,y+14+j*5,229,y+14+j*5,'#243b39',2)}
 rr(400,1330,220,88,7,'#697c70','#273c3e',4);for(let x=414;x<607;x+=30){rr(x,1340,20,58,2,'#3b524e','#253b39',2);rr(x+5,1347,9,8,1,'#93d087')}
 text('RÉSUMÉ',420,1410,21,'#d6d9b799');
 // Reactor column, cooling pipes and containment cylinders.
 rr(1170,1010,155,300,20,'#3b4f66','#1d2938',5);rr(1184,1026,127,264,16,'#709597','#24394b',4);
 const pulse=state.reduced?.65:.55+.12*Math.sin(time*2);const rg=ctx.createLinearGradient(1190,0,1310,0);rg.addColorStop(0,'#2f758d');rg.addColorStop(.5,'#9de9ec');rg.addColorStop(1,'#3d819a');rr(1197,1040,100,235,12,rg,'#274b63',3);
 for(let yy=1044;yy<1280;yy+=39){rr(1180,yy,140,13,3,'#547582','#283b50',3);line(1200,yy+3,1296,yy+3,'#9bb4bc',2)}
 ctx.save();ctx.globalAlpha=pulse;ctx.shadowColor='#87e5f7';ctx.shadowBlur=24;rr(1231,1054,31,190,8,'#c6ffff');ctx.restore();
 for(let i=0;i<2;i++){rr(1483+i*83,1090,76,220,25,'#74949a','#263d4e',4);rr(1496+i*83,1110,48,162,14,'#54717f','#365464',2);for(let y=1115;y<1300;y+=53)rr(1480+i*83,y,82,12,3,'#b5bdac','#364d58',2)}
 for(let i=0;i<3;i++){line(1290+i*12,1010,1290+i*12,988,'#53666f',7);line(1290+i*12,988,1550+i*12,988,'#53666f',7);line(1550+i*12,988,1550+i*12,1090,'#53666f',7)}
 text('CONTACT',1390,1420,22,'#c6d9dd99');
 // Security details: screen wall, signal racks and seats.
 for(let x=1130;x<1660;x+=96){rr(x,197,84,42,4,'#657e7e','#233c44',3);rr(x+7,203,70,25,2,'#203d46');line(x+11,222,x+60,210,'#5f9988',2)}
 rr(1320,365,110,20,8,'#3e6067','#20393e',3);rr(1330,388,90,38,10,'#547b7c','#20393e',3);
 for(const [x,y] of [[1120,682],[1630,210]]){rr(x,y,46,27,3,'#637470','#253a3c',2);line(x+6,y+7,x+38,y+7,'#a4b6a1',3)}
}

function update(dt){if(panel.open||!hasBoarded||document.hidden){velocity.x=velocity.y=0;return}velocity.x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joy.x;velocity.y=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+joy.y;const d=Math.max(1,Math.hypot(velocity.x,velocity.y)),speed=245*dt,ox=state.x,oy=state.y;if(valid(state.x+velocity.x/d*speed,state.y))state.x+=velocity.x/d*speed;if(valid(state.x,state.y+velocity.y/d*speed))state.y+=velocity.y/d*speed;const distance=Math.hypot(state.x-ox,state.y-oy);walkPhase+=distance*.055;if(distance>.01)facing=Math.abs(velocity.y)>Math.abs(velocity.x)?(velocity.y<0?'up':'down'):(velocity.x<0?'left':'right');nearest=hotspots.filter(o=>Math.hypot(o.x-state.x,o.y-state.y)<o.r).sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y))[0]||null;$('#interact').hidden=!nearest;$('#interact').textContent=nearest?nearest.label+' · E':'';$('#room').textContent=currentRoom().name;document.querySelectorAll('nav [data-room]').forEach(b=>b.setAttribute('aria-current',rooms[destinations[b.dataset.room].room]===currentRoom()?'location':'false'))}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;canvas.width=width*devicePixelRatio;canvas.height=height*devicePixelRatio;zoom=width<700?.74:Math.min(1.15,Math.max(.9,height/750))}new ResizeObserver(resize).observe(canvas);
function frame(t){const dt=Math.min((t-last)/1000,.035);last=t;time=state.reduced?0:t/1000;update(dt);const smooth=state.reduced?1:1-Math.exp(-18*dt);cam.x+=(state.x-cam.x)*smooth;cam.y+=(state.y-26-cam.y)*smooth;draw();requestAnimationFrame(frame)}
function visibleHotspot(h){const dx=h.x-state.x,dy=h.y-state.y;return Math.hypot(dx,dy)<550&&rayDistance(state.x,state.y,Math.atan2(dy,dx),620)+8>=Math.hypot(dx,dy)}
function positionHotspots(){for(const h of hotspots){const b=$('#hot-'+h.id),x=width/2+(h.x-cam.x)*zoom,y=height/2+(h.y-cam.y)*zoom;const visible=hasBoarded&&visibleHotspot(h)&&x>55&&x<width-55&&y>95&&y<height-120;b.hidden=!visible;b.style.left=x+'px';b.style.top=(y-25*zoom)+'px'}}
for(const h of hotspots){const b=$('#hot-'+h.id);b.onclick=h.action}
function drawPortfolioProps(){
 const v=hotspots[0],bob=state.reduced?0:Math.sin(time*1.7)*3;
 rr(v.x-42,v.y-13,84,37,6,'#15232b','#99b8ad',3);
 ctx.save();ctx.beginPath();ctx.rect(v.x-44,v.y-90,88,100);ctx.clip();crew(v.x,v.y+30+bob,'#38d6cf','',false);ctx.restore();
 rr(v.x-43,v.y+10,86,13,3,'#72878b','#263b46',3);
 ctx.save();ctx.translate(v.x-40,v.y-18);ctx.rotate(-.3);rr(-8,-44,73,40,4,'#829699','#263b46',3);for(let i=0;i<5;i++)line(0,-36+i*6,55,-36+i*6,'#30424b',3);ctx.restore();
 for(const x of [v.x-23,v.x+22])rr(x-7,v.y+3,14,12,5,'#38d6cf','#132c35',2);
 text('Psst… hello!',v.x,v.y-95,14,'#dbfff3');
 const d=hotspots[2];rr(d.x-57,d.y-30,114,64,7,'#657e80','#203a42',4);rr(d.x-37,d.y-67,74,81,3,'#e8e4ce','#344950',3);text('SAHIL KUMAR',d.x,d.y-48,8,'#344950');for(let i=0;i<5;i++)line(d.x-26,d.y-35+i*8,d.x+(i%2?13:25),d.y-35+i*8,'#819489',2);rr(d.x-23,d.y+19,46,7,2,'#354950');
 const c=hotspots[3];rr(c.x-35,c.y-39,70,72,8,'#627e86','#203744',4);rr(c.x-27,c.y-31,54,43,4,'#173947','#8fb8b5',2);line(c.x-18,c.y-20,c.x,c.y-6,'#b4e2d0',2);line(c.x+18,c.y-20,c.x,c.y-6,'#b4e2d0',2);rr(c.x-19,c.y-22,38,28,2,'#ffffff00','#b4e2d0',2);rr(c.x-10,c.y+21,20,5,2,'#b7d69d');
}
for(let i=0;i<90;i++){const star=document.createElement('i');star.style.cssText=`left:${(i*53.731)%100}%;top:${(i*37.213)%100}%;width:${i%8===0?3:1}px;height:${i%8===0?3:1}px;opacity:${.25+(i%6)*.12}`;$('#spaceStars').appendChild(star)}
resize();requestAnimationFrame(frame);
