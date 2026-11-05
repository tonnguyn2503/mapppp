'use strict';
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg', KEY='tuyendiem-project-v1';
let drafts={}, current=0, mode='drawing', selected=null, history=[], view={x:0,y:0,w:1000,h:1250}, drag=null;
const sources=new Map();let toastTimer;
function notify(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',5000)}
function validDraft(d){return d&&Array.isArray(d.nodes)&&Array.isArray(d.edges)&&d.nodes.length<=2000&&d.edges.length<=5000&&new Set(d.nodes.map(n=>n.id)).size===d.nodes.length&&d.nodes.every(n=>typeof n.id==='string'&&typeof n.label==='string'&&n.label.length<=300&&Number.isFinite(n.x)&&Number.isFinite(n.y)&&n.x>=0&&n.x<=1000&&n.y>=0&&n.y<=1250)&&d.edges.every(e=>Array.isArray(e)&&e.length===2&&e.every(id=>d.nodes.some(n=>n.id===id)))}
function validateProject(p){if(!p||p.version!==1||!p.drafts||typeof p.drafts!=='object'||Array.isArray(p.drafts))return false;return Object.entries(p.drafts).every(([k,v])=>CATALOG.some(x=>x.file===k)&&validDraft(v))}
try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(validateProject(p))drafts=p.drafts}catch(e){}
function project(){return {version:1,drafts}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(project()))}catch(e){notify('Không thể tự lưu trên thiết bị. Hãy dùng Lưu dự án JSON.')}}
function data(){return drafts[CATALOG[current].file]||(drafts[CATALOG[current].file]={nodes:[],edges:[]})}
function checkpoint(){history.push(JSON.stringify(data()));if(history.length>40)history.shift()}
function normalize(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase()}
function renderList(){const q=normalize($('search').value),f=$('filter').value;let count=0;$('list').replaceChildren();CATALOG.forEach((item,index)=>{const draft=drafts[item.file]?.nodes.length>0;
if(!normalize(item.file).includes(q)||f==='named'&&item.file.startsWith('IMG_')||f==='photo'&&!item.file.startsWith('IMG_')||f==='draft'&&!draft)return;
count++;const b=document.createElement('button');b.className=index===current?'selected':'';b.setAttribute('aria-current',index===current?'true':'false');
const number=document.createElement('span');number.className='number';number.textContent=String(index+1).padStart(3,'0');const text=document.createElement('span');text.textContent=item.title;const small=document.createElement('small');small.textContent=draft?'Bản nháp · Chưa kiểm chứng':'Chưa vẽ lại';text.append(small);b.append(number,text);b.onclick=()=>select(index);$('list').append(b)});
$('listCount').textContent=count+' TÀI LIỆU';if(!count){const p=document.createElement('p');p.textContent='Không có tài liệu phù hợp.';$('list').append(p)}
$('progress').textContent=Object.values(drafts).filter(d=>d.nodes.length).length+' bản nháp / '+CATALOG.length+' tài liệu · 0 bản đã kiểm chứng'}
function svgEl(tag,attrs,text){const el=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;return el}
function render(){const d=data();$('nodes').replaceChildren();$('edges').replaceChildren();
d.edges.forEach(([a,b],i)=>{const n=d.nodes.find(x=>x.id===a),m=d.nodes.find(x=>x.id===b);const line=svgEl('line',{x1:n.x,y1:n.y,x2:m.x,y2:m.y,stroke:'#3f7666','stroke-width':4,'data-edge':i});$('edges').append(line);const hit=svgEl('line',{x1:n.x,y1:n.y,x2:m.x,y2:m.y,stroke:'transparent','stroke-width':18,'data-edge':i});$('edges').append(hit)});
d.nodes.forEach(n=>{const g=svgEl('g',{'data-node':n.id,tabindex:0,role:'button','aria-label':n.label});g.append(svgEl('circle',{cx:n.x,cy:n.y,r:selected===n.id?11:8,fill:selected===n.id?'#9cac45':'#224e41',stroke:'white','stroke-width':3}));g.append(svgEl('text',{x:n.x+17,y:n.y+5,fill:'#214e41','font-family':'Arial,sans-serif','font-size':16,'paint-order':'stroke',stroke:'white','stroke-width':4,'stroke-linejoin':'round'},n.label));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nodeAction(n.id)}});$('nodes').append(g)});
$('empty').hidden=d.nodes.length>0||$('tool').value!=='pan';$('nodeCount').textContent=d.nodes.length+' ĐIỂM · '+d.edges.length+' ĐƯỜNG';$('status').textContent=d.nodes.length?'Bản nháp · Chưa kiểm chứng':'Chưa vẽ lại';$('undo').disabled=!history.length;$('exportSvg').disabled=!d.nodes.length;$('selectionInfo').textContent=selected?'Đã chọn: '+(d.nodes.find(n=>n.id===selected)?.label||''):'Chưa có điểm được chọn';updateView()}
function updateView(){$('diagram').setAttribute('viewBox',[view.x,view.y,view.w,view.h].join(' '));$('zoomLabel').textContent=Math.round(100000/view.w)+'%'}
function fit(){view={x:0,y:0,w:1000,h:1250};updateView()}
function zoom(factor){const w=Math.max(200,Math.min(4000,view.w*factor)),h=w*1.25;view={x:view.x+(view.w-w)/2,y:view.y+(view.h-h)/2,w,h};updateView()}
function sourceView(){const file=CATALOG[current].file,url=sources.get(file);$('original').hidden=!url;$('sourceEmpty').hidden=!!url;if(url)$('original').src=url;else $('original').removeAttribute('src')}
function setMode(next){mode=next;$('drawingPane').hidden=mode==='source';$('sourcePane').hidden=mode==='drawing';['viewDrawing','viewSource','viewBoth'].forEach((id,i)=>$(id).classList.toggle('active',['drawing','source','both'][i]===mode));$('editor-tools')?.toggleAttribute('hidden',mode==='source');sourceView()}
function select(i){current=i;selected=null;history=[];const item=CATALOG[i];$('title').textContent=item.title;$('sourceName').textContent=item.file;$('documentNo').textContent='TÀI LIỆU '+String(i+1).padStart(3,'0')+' / '+CATALOG.length;location.hash='doc-'+(i+1);fit();render();renderList();sourceView()}
function changed(){persist();render();renderList()}
function nodeAction(id){const tool=$('tool').value,d=data();
if(tool==='connect'){if(selected&&selected!==id){if(!d.edges.some(e=>e.includes(selected)&&e.includes(id))){checkpoint();d.edges.push([selected,id]);persist()}selected=null}else selected=id}
else if(tool==='rename'){const n=d.nodes.find(n=>n.id===id),name=prompt('Tên địa danh',n.label);if(name?.trim()){checkpoint();n.label=name.trim().slice(0,300);persist()}}
else if(tool==='remove'){checkpoint();d.nodes=d.nodes.filter(n=>n.id!==id);d.edges=d.edges.filter(e=>!e.includes(id));selected=null;persist()}
else selected=id;render();renderList()}
function coordinate(event){const p=$('diagram').createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform($('diagram').getScreenCTM().inverse())}
const clamp=(v,max)=>Math.max(20,Math.min(max-20,v));
$('diagram').addEventListener('pointerdown',e=>{if(e.button!==0)return;const tool=$('tool').value,node=e.target.closest('[data-node]')?.dataset.node,edge=e.target.dataset.edge,p=coordinate(e);
if(tool==='move'&&node){checkpoint();drag={type:'node',id:node};selected=node;$('diagram').setPointerCapture(e.pointerId);return}
if(node&&tool!=='pan'){nodeAction(node);return}
if(tool==='remove'&&edge!==undefined){checkpoint();data().edges.splice(Number(edge),1);changed();return}
if(tool==='point'){const label=$('pointLabel').value.trim();if(!label){notify('Nhập tên địa danh trước khi thêm điểm.');$('pointLabel').focus();return}if(p.x<0||p.x>1000||p.y<0||p.y>1250){notify('Hãy thêm điểm trong trang trắng.');return}checkpoint();data().nodes.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random(),label:label.slice(0,300),x:clamp(p.x,1000),y:clamp(p.y,1250)});$('pointLabel').value='';changed();return}
if(tool==='pan'){drag={type:'pan',x:p.x,y:p.y,v:{...view}};$('diagram').setPointerCapture(e.pointerId)}});
$('diagram').addEventListener('pointermove',e=>{if(!drag)return;const p=coordinate(e);if(drag.type==='node'){const n=data().nodes.find(n=>n.id===drag.id);n.x=clamp(p.x,1000);n.y=clamp(p.y,1250);render()}else{view.x+=drag.x-p.x;view.y+=drag.y-p.y;updateView()}});
function endDrag(){if(drag?.type==='node')changed();drag=null}
$('diagram').addEventListener('pointerup',endDrag);$('diagram').addEventListener('pointercancel',endDrag);
$('diagram').addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.12:.89)},{passive:false});
$('tool').onchange=()=>{selected=null;$('toolHint').textContent={pan:'Kéo để di chuyển; cuộn để phóng to.',point:'Nhập tên rồi chạm vào trang trắng.',move:'Kéo điểm đến vị trí mới.',connect:'Chọn điểm đầu, sau đó chọn điểm cuối.',rename:'Chọn điểm để sửa tên.',remove:'Chọn điểm hoặc đường để xóa.'}[$('tool').value];render()};
$('startDrawing').onclick=()=>{$('tool').value='point';$('tool').onchange();$('pointLabel').focus()};
$('search').oninput=renderList;$('filter').onchange=renderList;$('plus').onclick=()=>zoom(.8);$('minus').onclick=()=>zoom(1.25);$('fit').onclick=fit;
$('viewDrawing').onclick=()=>setMode('drawing');$('viewSource').onclick=()=>setMode('source');$('viewBoth').onclick=()=>setMode('both');
$('undo').onclick=()=>{if(!history.length)return;drafts[CATALOG[current].file]=JSON.parse(history.pop());selected=null;changed()};
function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
$('saveProject').onclick=()=>{download(JSON.stringify(project(),null,2),'application/json','tuyen-diem-project.json');notify('Đã xuất bản nháp JSON. Ảnh gốc không nằm trong tệp này.')};
$('exportSvg').onclick=()=>{if(!data().nodes.length)return;const svg=$('diagram').cloneNode(true);svg.setAttribute('viewBox','0 0 1000 1250');svg.setAttribute('width','1000');svg.setAttribute('height','1250');svg.removeAttribute('id');svg.querySelectorAll('[stroke="transparent"]').forEach(n=>n.remove());svg.querySelectorAll('[tabindex]').forEach(n=>n.removeAttribute('tabindex'));svg.prepend(svgEl('title',{},CATALOG[current].title+' — bản nháp chưa kiểm chứng'));download(new XMLSerializer().serializeToString(svg),'image/svg+xml',CATALOG[current].title+'.svg')};
$('sourceButton').onclick=()=>$('sourceFiles').click();
$('sourceFiles').onchange=e=>{let count=0;for(const file of e.target.files){if(!['image/jpeg','image/png','image/webp'].includes(file.type))continue;const entry=CATALOG.find(x=>x.file.normalize('NFC')===file.name.normalize('NFC'));if(!entry)continue;if(sources.has(entry.file))URL.revokeObjectURL(sources.get(entry.file));sources.set(entry.file,URL.createObjectURL(file));count++}sourceView();if(count)setMode('both');notify(count?'Đã ghép '+count+' ảnh theo tên file.':'Không tìm thấy tên ảnh trùng với danh mục 109 tài liệu.');e.target.value=''};
$('importProject').onclick=()=>$('projectFile').click();
$('projectFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10000000)throw Error();const p=JSON.parse(await file.text());if(!validateProject(p))throw Error();if(Object.values(drafts).some(d=>d.nodes.length)&&!confirm('Thay các bản nháp hiện tại bằng bản lưu này? Hãy xuất JSON trước nếu cần giữ lại.'))return;drafts=p.drafts;history=[];selected=null;changed();notify('Đã mở bản lưu dự án.')}catch(err){notify('Tệp dự án không hợp lệ. Chọn JSON được xuất từ ứng dụng này.')}finally{e.target.value=''}};
window.addEventListener('hashchange',()=>{const i=Number(location.hash.slice(5))-1;if(location.hash.startsWith('#doc-')&&Number.isInteger(i)&&i>=0&&i<CATALOG.length&&i!==current)select(i)});
const initial=Number(location.hash.slice(5))-1;select(Number.isInteger(initial)&&initial>=0&&initial<CATALOG.length?initial:0);$('tool').onchange();
