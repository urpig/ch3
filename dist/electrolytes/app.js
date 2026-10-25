import { cards, stage, final, audit, chemicals, salts } from './data.js';
import { speciate, solutions, fmt, sci } from './core.js';
import { landscape, ionsView, svg, label } from './art.js';
import { mountLab, cleanLab, defaults } from './labs.js';
import { escapeHTML } from '../chemistry/components.js';
const KEY='k12-electrolytes-salt-v1',allQuestions=[...cards.map(c=>c.quiz),...Object.values(stage).flat(),...audit,...final];
export function cleanState(raw){
 const fresh={version:1,predictions:{},answers:{},attempts:{},observed:[],labs:{},notes:{},steps:{},reduced:false};
 if(!raw||raw.version!==1)return fresh;
 for(const c of cards){const p=raw.predictions?.[c.id];if(Number.isInteger(p)&&p>=0&&p<c.choices.length)fresh.predictions[c.id]=p;const n=raw.notes?.[c.id];if(typeof n==='string')fresh.notes[c.id]=n.slice(0,1000);const st=raw.steps?.[c.id];if(Number.isInteger(st)&&st>=0&&st<=10)fresh.steps[c.id]=st;}
 for(const q of allQuestions){const a=raw.answers?.[q.id];if(Number.isInteger(a)&&a>=0&&a<q.options.length)fresh.answers[q.id]=a;fresh.attempts[q.id]=Array.isArray(raw.attempts?.[q.id])?raw.attempts[q.id].filter(x=>Number.isInteger(x)&&x>=0&&x<q.options.length).slice(-20):[];}
 fresh.observed=Array.isArray(raw.observed)?raw.observed.filter(x=>cards.some(c=>c.id===x)):[];fresh.reduced=raw.reduced===true;
 for(const type of Object.keys(defaults))fresh.labs[type]=cleanLab(type,raw.labs?.[type]);
 return fresh;
}
let state=cleanState(null),storageOK=true;
try{state=cleanState(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{storageOK=false;}
const controllers=new Map();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}document.querySelector('#storage-status').textContent=storageOK?'預測、答案與實驗紀錄儲存在這台電腦。':'瀏覽器無法保存；本次仍可操作，請匯出學習紀錄。';}
function isCorrect(q){return state.answers[q.id]===q.answer;}
function mastered(c){return state.predictions[c.id]!==undefined&&state.observed.includes(c.id)&&isCorrect(c.quiz)&&(!stage[c.id]||stage[c.id].every(isCorrect))&&(c.id!==11||audit.every(isCorrect))&&(c.id!==12||final.every(isCorrect));}
function refresh(){
 const count=cards.filter(mastered).length;document.querySelector('#progress-count').textContent=count+' / 12';document.querySelector('#top-progress').textContent=count+' / 12';document.querySelector('#chapter-progress').value=count;
 for(const c of cards){const a=document.querySelector('[data-nav="'+c.id+'"]');a.classList.toggle('mastered',mastered(c));a.querySelector('.nav-state').textContent=mastered(c)?'✓':'○';const status=document.querySelector('#salt-'+c.id+' .card-status');if(status)status.textContent=mastered(c)?'✓ 本站已掌握':(state.predictions[c.id]===undefined?'○ 先留下預測':'✓ 已預測')+' · '+(state.observed.includes(c.id)?'✓ 已完成觀察':'○ 完成操作／圖解')+' · '+(isCorrect(c.quiz)?'✓ 小試身手答對':'○ 小試身手')+(stage[c.id]?' · 階段挑戰 '+stage[c.id].filter(isCorrect).length+'/'+stage[c.id].length:'');}
 const certificate=document.querySelector('#certificate');if(certificate){const passed=final.every(isCorrect);certificate.hidden=!passed;document.querySelector('#final-score').textContent='最終挑戰：'+final.filter(isCorrect).length+' / 8 題已掌握';}
 document.querySelector('#completion-banner').hidden=count!==12;
}
function mark(id){if(!state.observed.includes(id))state.observed.push(id);save();refresh();}
function dialogue(c){return '<div class="story-dialogue">'+c.dialogue.map(([who,expression,text])=>'<div class="story-speech story-speech--'+who+'"><div class="story-portrait story-portrait--'+who+'" data-expression="'+expression+'" role="img" aria-label="'+(who==='kui'?'小葵':'阿公')+'的'+({excited:'興奮',thinking:'思考',curious:'好奇',surprised:'驚訝',determined:'堅定',wonder:'驚喜',gentle:'溫和',mentor:'引導',idea:'靈光一現',thoughtful:'思索',encourage:'鼓勵'}[expression])+'表情"></div><p><b>'+(who==='kui'?'小葵':'阿公')+'</b>'+text+'</p></div>').join('')+'</div>';}
function quizMarkup(q){return '<form class="salt-quiz" data-quiz="'+q.id+'"><fieldset><legend>'+q.prompt+'</legend>'+q.options.map((o,i)=>'<label><input type="radio" name="'+q.id+'" value="'+i+'"> <span><b>'+String.fromCharCode(65+i)+'</b> '+o+'</span></label>').join('')+'</fieldset><div class="salt-actions"><button class="primary" type="submit">送出判斷，查看解析</button><details><summary>給我一個提示</summary><p>'+q.hint+'</p></details></div><div class="quiz-feedback" role="status"></div></form>';}
function paintFeedback(form,q){const a=state.answers[q.id];if(a===undefined)return;form.querySelector('[value="'+a+'"]').checked=true;const right=a===q.answer;form.querySelector('.quiz-feedback').innerHTML='<p class="'+(right?'correct':'retry')+'"><b>'+(right?'✓ 有證據的判斷':'再想一想')+'</b> '+q.explanations[a]+'</p>'+(!right?'<p>正確判斷：'+q.options[q.answer]+'。'+q.explanations[q.answer]+' 可以重新選擇並送出。</p>':'');}
function mountQuizzes(root){root.querySelectorAll('[data-quiz]').forEach(form=>{const q=allQuestions.find(x=>x.id===form.dataset.quiz);paintFeedback(form,q);form.onsubmit=e=>{e.preventDefault();const chosen=form.querySelector('input:checked');if(!chosen){form.querySelector('.quiz-feedback').textContent='先選一個答案，再送出。';return;}const a=Number(chosen.value);state.answers[q.id]=a;state.attempts[q.id]??=[];state.attempts[q.id].push(a);state.attempts[q.id]=state.attempts[q.id].slice(-20);paintFeedback(form,q);save();refresh();};});}
function table(head,rows){return '<div class="table-scroll"><table><thead><tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((x,i)=>'<'+(i?'td':'th')+'>'+x+'</'+(i?'td':'th')+'>').join('')+'</tr>').join('')+'</tbody></table></div>';}
const reactionSteps=[
 ['石灰岩 + 稀鹽酸','CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑','碳酸鈣表面溶蝕，二氧化碳形成氣泡。不是所有冒泡都是氫氣。','CO₂'],
 ['鋅 + 稀鹽酸','Zn + 2HCl → ZnCl₂ + H₂↑','鋅是活潑金屬，這個已知的稀鹽酸反應釋出氫氣。虛擬演示不點燃未知氣體。','H₂'],
 ['生石灰 + 水','CaO + H₂O → Ca(OH)₂','生成氫氧化鈣，溶解部分提供 OH⁻，形成鹼性環境並放熱。','OH⁻'],
 ['二氧化碳 + 水','CO₂ + H₂O ⇌ H₂CO₃','只有部分 CO₂ 與水形成碳酸；其部分游離使水偏酸。','H⁺']
];
function mountStory(root,c){
 let step=state.steps[c.id]||0,playing=false,timer=null;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;playing=false;};
 if(c.type==='story'){
  root.innerHTML='<div class="bottle-line">'+['甲','乙','丙'].map((x,i)=>'<button data-bottle="'+i+'"><span class="bottle"><i></i></span><b>樣品'+x+'</b><span>透明、無色</span><small>點擊查看紀錄</small></button>').join('')+'</div><div class="observation-result" role="status">不品嚐、不碰未知液體。先看三份採樣紀錄。</div><div class="chapter-scene">'+landscape('palace')+'</div>';
  const seen=new Set();root.querySelectorAll('[data-bottle]').forEach(b=>b.onclick=()=>{seen.add(b.dataset.bottle);b.classList.add('seen');root.querySelector('.observation-result').textContent=['樣品甲：來自鹽井，蒸乾留白色晶體。成分仍待確認。','樣品乙：來自工匠材料庫，蒸乾也留白色晶體。不可當成食鹽。','樣品丙：採樣來源不明。即使透明，也不能判定安全。'][Number(b.dataset.bottle)]+' 已查看 '+seen.size+'/3。';if(seen.size===3)mark(c.id);});return{destroy:stop};
 }
 if(c.type==='ions'){
  let sample='nacl',on=false;
  root.innerHTML='<div class="model-tabs" role="group" aria-label="微觀樣品">'+['solid','nacl','sugar','hcl','naoh','acetic'].map(id=>'<button class="secondary" data-sample="'+id+'">'+solutions[id].name+'</button>').join('')+'</div><div class="micro-stage"></div><div class="salt-actions"><button class="primary" data-electric>開啟電場</button><button class="secondary" data-motion>暫停粒子動畫</button></div><p class="ion-explanation"></p><p class="model-note">粒子數目、位置與移動速度經視覺簡化，不代表實際粒子個數。電場下同時存在隨機熱運動；外電路由電子搬運電荷。</p>';
  const seen=new Set();
  const draw=()=>{const r=speciate(sample,.01);root.querySelector('.micro-stage').innerHTML=ionsView(r.ions,{solid:sample==='solid',on,id:'story-ions',neutral:sample==='sugar'?'大量中性糖分子留在水中；微量 H⁺、OH⁻ 來自水':sample==='acetic'?'大部分醋酸分子仍未游離':''});root.querySelector('.ion-explanation').textContent={solid:'NaCl 晶格已有正負離子，但位置固定。',nacl:'NaCl 解離：Na⁺ + Cl⁻，正負電荷總量相等。',sugar:'糖保留中性分子，沒有像 NaCl 一樣解離；水仍有微量離子。',hcl:'HCl 分子在水中游離，主要形成 H⁺、Cl⁻，不是 Na⁺。',naoh:'NaOH 解離：Na⁺ + OH⁻，不是所有陰離子都叫 Cl⁻。',acetic:'CH₃COOH ⇌ H⁺ + CH₃COO⁻；仍有大量未游離分子。'}[sample];root.querySelectorAll('[data-sample]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sample===sample)));};
  root.querySelectorAll('[data-sample]').forEach(b=>b.onclick=()=>{sample=b.dataset.sample;seen.add(sample);draw();if(seen.size>=3&&on)mark(c.id);});
  root.querySelector('[data-electric]').onclick=e=>{on=!on;e.target.textContent=on?'關閉電場':'開啟電場';draw();if(on&&seen.size>=3)mark(c.id);};
  root.querySelector('[data-motion]').onclick=e=>{root.classList.toggle('paused');e.target.textContent=root.classList.contains('paused')?'繼續粒子動畫':'暫停粒子動畫';};draw();return{destroy:stop};
 }
 if(['reactions','strength','salts'].includes(c.type)){
  const length=c.type==='reactions'?4:c.type==='strength'?4:5;step=Math.min(step,length-1);
  root.innerHTML='<div class="guided-content"></div><div class="salt-actions"><button class="secondary" data-back>← 上一格</button><span class="step-counter"></span><button class="primary" data-next>下一格 →</button><button class="secondary" data-play>播放／暫停</button><button class="text-button" data-restart>重播</button></div>';
  function draw(){
   let html='';
   if(c.type==='reactions'){const [title,eq,note,particle]=reactionSteps[step];html='<div class="reaction-plate"><span class="eyebrow">已知試劑的虛擬對照</span><h3>'+title+'</h3>'+svg('<path d="M265 100V289Q265 316 294 316H461Q490 316 490 289V100" fill="#b7d5c4" fill-opacity=".45" stroke="#86a094" stroke-width="3"/><path d="M294 289l38-42 47 6 18 38Z" fill="'+(step===1?'#8c9b96':'#e9e6d7')+'" stroke="#a4aa99"/>'+[0,1,2,3,4].map(i=>'<g class="reaction-particle" style="animation-delay:-'+i*.4+'s"><circle cx="'+(340+(i*31)%105)+'" cy="'+(231-i*22)+'" r="17" fill="#f6fbeb" stroke="#b0c5b5"/>'+label(340+(i*31)%105,236-i*22,particle,10)+'</g>').join('')+label(380,365,step<2?'氣泡顯示氣體生成':'顯示溶液中增加的代表離子',14),'反應證據示意','rx'+step,390)+'<p class="equation">'+eq+'</p><p>'+note+'</p></div>';}
   if(c.type==='strength'){
    const examples=[['同濃度，比游離比例','hcl',.01,'acetic',.01],['濃度不同，強酸不一定 pH 較低','hcl',.00001,'acetic',.1],['強鹼、弱鹼，同樣也分濃淡','naoh',.01,'ammonia',.01]];
    if(step<3){const [title,a,ca,b,cb]=examples[step],x=speciate(a,ca),y=speciate(b,cb);html='<h3>'+title+'</h3><div class="compare-solutions">'+[[a,ca,x],[b,cb,y]].map(([id,C,r])=>'<section><span>'+solutions[id].kind+'</span><h4>'+solutions[id].formula+'</h4><p>'+C+' mol/L</p><strong>pH '+fmt(r.pH)+'</strong><div class="fraction-bar"><i style="width:'+r.alpha*100+'%"></i></div><p>形成離子比例約 '+fmt(r.alpha*100)+'%</p><small>[H⁺] = '+sci(r.H)+' mol/L</small></section>').join('')+'</div>';}else html='<div class="calculation-steps"><h3>兩條分步計算</h3><ol><li>100 mL = 0.100 L。</li><li>0.010 mol ÷ 0.100 L = <b>0.10 mol/L</b>。</li><li>pH 2 → [H⁺] = 10⁻²；pH 4 → 10⁻⁴。</li><li>10⁻² ÷ 10⁻⁴ = <b>100 倍</b>。</li></ol><p>同一種酸稀釋後仍是原來的強／弱酸；每公升的溶質變少。</p></div>';
   }
   if(c.type==='salts'){const [name,formula,ions,sol,use]=salts[step];html='<div class="salt-specimen"><div class="specimen-crystal" aria-hidden="true">◇<span>◇</span></div><div><span class="eyebrow">材料庫 / '+String(step+1).padStart(2,'0')+'</span><h3>'+name+'</h3><strong>'+formula+'</strong><p>'+ions+'</p><p>'+sol+'</p><p>'+use+'</p></div></div><p class="model-note">外觀只作示意，不能憑白色鑑定物質。</p>';}
   root.querySelector('.guided-content').innerHTML=html;root.querySelector('.step-counter').textContent=(step+1)+' / '+length;root.querySelector('[data-back]').disabled=step===0;root.querySelector('[data-next]').disabled=step===length-1;state.steps[c.id]=step;save();if(step===length-1)mark(c.id);
  }
  root.querySelector('[data-back]').onclick=()=>{stop();step=Math.max(0,step-1);draw();};root.querySelector('[data-next]').onclick=()=>{stop();step=Math.min(length-1,step+1);draw();};root.querySelector('[data-restart]').onclick=()=>{stop();step=0;draw();};
  root.querySelector('[data-play]').onclick=()=>{if(playing){stop();return;}if(step===length-1)step=0;playing=true;draw();timer=setInterval(()=>{step=Math.min(length-1,step+1);draw();if(step===length-1)stop();},4000);};draw();
  if(c.type==='reactions')root.insertAdjacentHTML('beforeend','<details class="reference-table"><summary>打開常見酸、鹼的用途與危險性（7 種）</summary>'+table(['物質','化學式','性質與用途','安全'],chemicals)+'</details>');return{destroy:stop};
 }
 if(c.type==='audit'){
  root.innerHTML='<div class="audit-records">'+table(['紀錄','導電／pH','離子與處理','結晶／品質'],[
   ['甲','有導電；pH 7','確認有 Na⁺、Cl⁻；其他成分未測','白色晶體；無純度、污染物檢驗'],
   ['乙','報告宣稱 pH 7','0.1 M HCl 10 mL + 0.1 M NaOH 20 mL；另對含 Ca²⁺ 留樣加 CO₃²⁻ 出現白色沉澱','認為中和就全部安全；尚未過濾'],
   ['丙','有導電；pH 未測','100 g 水 + 30 g NaCl；蒸掉 50 g 水，沒有其他加料','宣稱取回 40 g 純 NaCl；無檢驗']
  ])+'</div><div class="challenge-heading"><span class="eyebrow">皇帝的驗收 / 六項判斷</span><h3>替每一個結論找證據</h3></div>'+audit.map(quizMarkup).join('');mountQuizzes(root);root.addEventListener('submit',()=>mark(c.id));return{destroy:stop};
 }
 if(c.type==='final'){
  root.innerHTML='<div class="chapter-scene">'+landscape('home')+'</div><div class="challenge-heading"><span class="eyebrow">最終任務 / 八題綜合挑戰</span><h3>完成最後一份科學顧問報告</h3><p id="final-score"></p></div>'+final.map(quizMarkup).join('')+'<section id="certificate" hidden><span class="certificate-seal">鹽</span><span class="eyebrow">SCIENCE LAB · ROYAL SALT COUNCIL</span><h3>皇家製鹽科學顧問證書</h3><p>你已掌握八項核心判斷，<br>能用離子、酸鹼與守恆證據，檢查製鹽流程。</p><strong>完成八題最終挑戰 · 可反覆練習</strong><p>學習成就證書；不是食品安全或職業資格認證。</p><button class="secondary" id="print-certificate">列印／另存證書</button></section>';
  mountQuizzes(root);root.addEventListener('submit',()=>mark(c.id));root.querySelector('#print-certificate').onclick=()=>window.print();return{destroy:stop};
 }
 return{destroy:stop};
}
function renderCard(c){
 const section=document.createElement('section');section.className='learning-card salt-card';section.id='salt-'+c.id;section.setAttribute('aria-labelledby','title-'+c.id);
 section.innerHTML='<header class="card-header"><div class="card-kicker"><span>'+['','第一幕 · 皇帝最後的委託','第二幕 · 酸與鹼的祕密','第三幕 · 中和與鹽的誕生','第四幕 · 皇帝的製鹽挑戰'][c.act]+'</span><span>'+String(c.id).padStart(2,'0')+' / 12 · '+(defaults[c.type]?'動手探索':'故事與證據')+'</span></div><h2 id="title-'+c.id+'">'+c.title+'</h2><p class="core-question">'+c.question+'</p></header><div class="card-body"><p class="story-opening">'+c.opening+'</p>'+dialogue(c)+'<fieldset class="prediction"><legend>先猜一猜 · '+c.prediction+'</legend>'+c.choices.map((t,i)=>'<label><input type="radio" name="prediction-'+c.id+'" value="'+i+'"> '+t+'</label>').join('')+'<p class="prediction-status" role="status">先留下想法，之後用證據回頭檢查。</p></fieldset><div class="task"><span>這次的任務</span><p>'+c.task+'</p></div><div class="card-activity" id="activity-'+c.id+'"></div><div class="evidence-notebook"><label for="note-'+c.id+'">我的證據與推論 <small>我看到了什麼？這支持什麼？</small></label><textarea id="note-'+c.id+'" rows="2" maxlength="1000" placeholder="例如：同濃度下，鹽水讀數比糖水高；我認為……"></textarea><small>輸入後自動儲存。文字供回顧或老師檢視，不自動判分。</small></div><div class="concept-panels"><h3>把剛剛的證據說清楚</h3>'+c.panels.map(([t,h])=>'<details><summary>'+t+'</summary><div>'+h+'</div></details>').join('')+'</div><div class="challenge-heading"><span class="eyebrow">小試身手 / 檢查我的理解</span></div>'+quizMarkup(c.quiz)+(stage[c.id]?'<section class="stage-challenge"><div class="challenge-heading"><span class="eyebrow">階段挑戰 '+({3:'一',7:'二',10:'三'}[c.id])+'</span><h3>'+({3:'先用離子解釋差異',7:'用量對了，結論才可靠',10:'為每一克鹽找到去向'}[c.id])+'</h3></div>'+stage[c.id].map(quizMarkup).join('')+'</section>':'')+'<div class="next-clue"><span class="eyebrow">帶著線索往下走</span><p>'+c.next+'</p></div></div><footer class="card-footer"><span class="card-status"></span><div>'+(c.id>1?'<a href="#salt-'+(c.id-1)+'">← 上一站</a>':'')+'<button class="text-button reset-card">重設本卡</button>'+(c.id<12?'<a class="secondary" href="#salt-'+(c.id+1)+'">下一站 →</a>':'<a class="secondary" href="#chapter-top">回到起點 ↑</a>')+'</div></footer>';
 document.querySelector('#lesson').append(section);
 const pred=state.predictions[c.id];if(pred!==undefined){section.querySelector('.prediction input[value="'+pred+'"]').checked=true;section.querySelector('.prediction-status').textContent='已記下預測。完成探索後，可回來修正想法。';}
 section.querySelectorAll('.prediction input').forEach(el=>el.onchange=()=>{state.predictions[c.id]=Number(el.value);section.querySelector('.prediction-status').textContent='已記下預測。完成探索後，可回來修正想法。';save();refresh();});
 const note=section.querySelector('textarea');note.value=state.notes[c.id]||'';note.oninput=()=>{state.notes[c.id]=note.value;save();};
 const activity=section.querySelector('.card-activity');
 const ctrl=defaults[c.type]?mountLab(activity,c.type,{data:state.labs[c.type],save:v=>{state.labs[c.type]=v;save();},mark:()=>mark(c.id)}):mountStory(activity,c);controllers.set(c.id,ctrl);
 mountQuizzes(section);
 section.querySelector('.reset-card').onclick=()=>{controllers.get(c.id)?.destroy();delete state.predictions[c.id];delete state.notes[c.id];delete state.steps[c.id];state.observed=state.observed.filter(id=>id!==c.id);for(const q of [c.quiz,...(stage[c.id]||[]),...(c.id===11?audit:[]),...(c.id===12?final:[])]){delete state.answers[q.id];delete state.attempts[q.id];}if(defaults[c.type])state.labs[c.type]=structuredClone(defaults[c.type]);save();const next=section.nextSibling;section.remove();renderCard(c);const replacement=document.querySelector('#salt-'+c.id);if(next)document.querySelector('#lesson').insertBefore(replacement,next);refresh();replacement.scrollIntoView({block:'start'});};
}
function init(){
 document.querySelector('#chapter-route').innerHTML=cards.map(c=>'<a href="#salt-'+c.id+'" data-nav="'+c.id+'"><span>'+String(c.id).padStart(2,'0')+'</span><span>'+c.title+'</span><span class="nav-state">○</span></a>').join('');
 document.querySelector('#hero-artwork').innerHTML=landscape('saltfield');
 cards.forEach(renderCard);
 const motion=document.querySelector('#reduce-motion');motion.checked=state.reduced;document.body.classList.toggle('reduced-motion',state.reduced);motion.onchange=()=>{state.reduced=motion.checked;document.body.classList.toggle('reduced-motion',state.reduced);save();};
 document.querySelector('#clear-chapter-progress').onclick=()=>{for(const ctrl of controllers.values())ctrl.destroy();state=cleanState(null);document.querySelector('#reduce-motion').checked=false;document.body.classList.remove('reduced-motion');save();document.querySelector('#lesson').innerHTML='';cards.forEach(renderCard);refresh();};
 document.querySelector('#export-progress').onclick=()=>{const payload={chapter:'皇帝最後的製鹽委託',exportedAt:new Date().toISOString(),mastered:cards.filter(mastered).map(c=>c.id),...state};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='salt-adventure-learning-record.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function route(){document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.hash===location.hash));}
 addEventListener('hashchange',route);route();save();refresh();
 if(/^#salt-\d+$/.test(location.hash))requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView({block:'start'}));
 addEventListener('pagehide',()=>{for(const ctrl of controllers.values())ctrl.destroy();});
}
if(typeof document!=='undefined')init();

