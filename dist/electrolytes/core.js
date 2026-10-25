// Ideal dilute aqueous teaching models at 25 °C. Shared by diagrams and readouts.
export const KW=1e-14, KA=1.8e-5, KB=1.8e-5;
export function bounded(v,min,max,label='數值') {
 if(v===''||v===null||typeof v==='boolean')throw new RangeError(label+'不可空白');
 const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw new RangeError(label+'需介於 '+min+'～'+max);return n;
}
export const ionInfo={H:['H⁺',1,7],OH:['OH⁻',-1,4],Na:['Na⁺',1,1],Cl:['Cl⁻',-1,1.5],Ac:['CH₃COO⁻',-1,.8],NH4:['NH₄⁺',1,1.5],Ca:['Ca²⁺',2,1.2],CO3:['CO₃²⁻',-2,1.3],HCO3:['HCO₃⁻',-1,.9]};
export function direction(z){return z>0?'負電極':z<0?'正電極':'不定向';}
export function fromExcess(d){const r=Math.hypot(d,2*Math.sqrt(KW)),H=d>=0?(d+r)/2:2*KW/(r-d);return{H,OH:KW/H,pH:-Math.log10(H)};}
export const solutions={
 water:{name:'蒸餾水',formula:'H₂O',kind:'極少離子',strength:'非溶質',state:'aq'},
 nacl:{name:'食鹽水',formula:'NaCl(aq)',kind:'強電解質',strength:'強',state:'aq'},
 sugar:{name:'糖水',formula:'C₁₂H₂₂O₁₁(aq)',kind:'非電解質',strength:'無',state:'aq'},
 acetic:{name:'醋酸水溶液',formula:'CH₃COOH(aq)',kind:'弱酸／弱電解質',strength:'弱',state:'aq'},
 hcl:{name:'稀鹽酸',formula:'HCl(aq)',kind:'強酸／強電解質',strength:'強',state:'aq'},
 naoh:{name:'氫氧化鈉水溶液',formula:'NaOH(aq)',kind:'強鹼／強電解質',strength:'強',state:'aq'},
 ammonia:{name:'氨水',formula:'NH₃(aq)',kind:'弱鹼／弱電解質',strength:'弱',state:'aq'},
 carbonate:{name:'碳酸鈉水溶液',formula:'Na₂CO₃(aq)',kind:'鹼性的鹽類',strength:'強',state:'aq'},
 solid:{name:'固態氯化鈉',formula:'NaCl(s)',kind:'離子位置受限',strength:'強',state:'s'}
};
export function speciate(id,concentration=.01,dilution=1){
 if(!solutions[id])throw new RangeError('未知樣品');
 const C=bounded(concentration,0,1,'濃度')/bounded(dilution,1,1e8,'稀釋倍數');
 if(id==='solid')return{id,C,pH:null,H:0,OH:0,ions:[],mobile:false,alpha:0};
 const Na=['nacl','naoh'].includes(id)?C:id==='carbonate'?2*C:0,Cl=['nacl','hcl'].includes(id)?C:0;
 function at(H){const OH=KW/H,Ac=id==='acetic'?C*KA/(KA+H):0,NH4=id==='ammonia'?C*H/(KW/KB+H):0,K1=4.3e-7,K2=4.7e-11,D=H*H+K1*H+K1*K2;
 return{H,OH,Na,Cl,Ac,NH4,CO3:id==='carbonate'?C*K1*K2/D:0,HCO3:id==='carbonate'?C*K1*H/D:0};}
 let lo=-16,hi=1;
 for(let i=0;i<110;i++){const mid=(lo+hi)/2,s=at(10**mid),q=s.H+s.Na+s.NH4-s.OH-s.Cl-s.Ac-2*s.CO3-s.HCO3;if(q>0)hi=mid;else lo=mid;}
 const s=at(10**((lo+hi)/2)),ions=Object.entries(s).filter(([,c])=>c>0).map(([key,c])=>({key,label:ionInfo[key][0],charge:ionInfo[key][1],mobility:ionInfo[key][2],c}));
 return{id,C,...s,pH:-Math.log10(s.H),ions,mobile:true,alpha:C===0?0:id==='acetic'?s.Ac/C:id==='ammonia'?s.NH4/C:['water','sugar'].includes(id)?0:1};
}
export function conductivity(id,C=.01,immersed=true,powered=true){const s=speciate(id,C),weighted=s.ions.reduce((v,i)=>v+i.c*Math.abs(i.charge)*i.mobility,0),score=immersed&&powered&&s.mobile?Math.min(100,100*Math.log1p(weighted/.002)/Math.log1p(.65/.002)):0;return{...s,weighted,score,lamp:score/100};}
function mix(a,b,t){t=Math.max(0,Math.min(1,t));return '#'+[0,1,2].map(i=>Math.round(parseInt(a.slice(1+i*2,3+i*2),16)*(1-t)+parseInt(b.slice(1+i*2,3+i*2),16)*t).toString(16).padStart(2,'0')).join('');}
export function indicator(kind,pH){
 bounded(pH,-2,16,'pH');
 if(kind==='phenol')return{color:mix('#e7f4eb','#e946a0',(pH-8.2)/1.8),label:pH<8.2?'無色':pH>10?'桃紅色':'淡粉紅 → 桃紅',range:'酚酞：pH 約 8.2～10.0'};
 if(kind==='btb')return{color:pH<=6.8?mix('#eed46b','#68b879',(pH-6)/.8):mix('#68b879','#4b8fc7',(pH-6.8)/.8),label:pH<=6?'黃色':pH>=7.6?'藍色':'黃綠／綠／藍綠',range:'BTB：pH 約 6.0～7.6'};
 if(['red','blue'].includes(kind))return{color:kind==='red'?mix('#d06b79','#677fc5',(pH-7)/1.3):mix('#d06b79','#677fc5',(pH-4.5)/2.5),label:pH<=4.5?'紅色':pH>=8.3?'藍色':kind==='red'?'紅色至紫色（中性不變藍）':'紫色至藍色（中性不變紅）',range:'石蕊：約 4.5～8.3；中間區亦受原試紙顏色影響'};
 const stops=[[0,'#c55f69'],[3,'#e98b60'],[5,'#e6cd64'],[7,'#71b681'],[9,'#599fc1'],[11,'#777fc2'],[14,'#9b69a9']],k=stops.findIndex(([v])=>v>=pH),n=Math.max(1,k<0?stops.length-1:k);
 return{color:mix(stops[n-1][1],stops[n][1],(pH-stops[n-1][0])/(stops[n][0]-stops[n-1][0])),label:'對照色卡，讀取約略 pH',range:'廣用指示劑／試紙：連續色階，配方不同會略有差異'};
}
export function neutralize(acidC,acidML,baseC,baseML){
 const a=bounded(acidC,0,1)*bounded(acidML,0,500)/1000,b=bounded(baseC,0,1)*bounded(baseML,0,500)/1000,volume=(Number(acidML)+Number(baseML))/1000;
 if(volume<=0)throw new RangeError('混合體積必須大於零');
 const reacted=Math.min(a,b),delta=(a-b)/volume,Q=reacted*57300;
 return{a,b,reacted,volume,acidLeft:Math.max(0,a-b),baseLeft:Math.max(0,b-a),...fromExcess(delta),Q,temperature:25+Q/(volume*1000*4.18),Na:b,Cl:a,waterMade:reacted,saltEquivalent:reacted,progress:Math.max(a,b)===0?0:reacted/Math.max(a,b)};
}
export function precipitate(carbC,carbML,calciumC,calciumML,partner='calcium'){
 const carbonate=bounded(carbC,0,1)*bounded(carbML,0,500)/1000,second=bounded(calciumC,0,1)*bounded(calciumML,0,500)/1000,calcium=partner==='calcium'?second:0,solid=Math.min(carbonate,calcium);
 return{carbonate,calcium,solid,mass:solid*100.09,Na:2*carbonate+(partner==='nacl'?second:0),Cl:partner==='calcium'?2*second:partner==='nacl'?second:0,Ca:calcium-solid,CO3:carbonate-solid,volume:(Number(carbML)+Number(calciumML))/1000};
}
export function crystallize({water=100,salt=30,other=0,dirt=0,evaporated=0,filtered=false,settled=false,separated=false}={}){
 water=bounded(water,0,2000);salt=bounded(salt,0,2000);other=bounded(other,0,2000);dirt=bounded(dirt,0,2000);evaporated=bounded(evaporated,0,water);
 const waterLeft=water-evaporated,dissolvedSalt=Math.min(salt,.36*waterLeft),crystalSalt=salt-dissolvedSalt,dissolvedOther=Math.min(other,.35*waterLeft),crystalOther=other-dissolvedOther,removedDirt=filtered?dirt:settled?dirt*.8:0,dirtLeft=dirt-removedDirt,mother=waterLeft+dissolvedSalt+dissolvedOther;
 return{initialSolid:Math.max(0,salt-.36*water),newCrystal:Math.max(0,crystalSalt-Math.max(0,salt-.36*water)),waterLeft,evaporated,dissolvedSalt,crystalSalt,dissolvedOther,crystalOther,dirtLeft,removedDirt,mother,crystalMass:crystalSalt+crystalOther,harvest:separated?crystalSalt+crystalOther:0,total:mother+crystalSalt+crystalOther+dirtLeft+removedDirt+evaporated,initial:water+salt+other+dirt,percent:mother?dissolvedSalt/mother*100:null,ppm:mother?dissolvedSalt/mother*1e6:null,safeToEat:false};
}
export function assessFood(e={}){return e.foodGrade===true&&e.purityTest===true&&e.contaminantTest===true&&e.processVerified===true?'需由合格品質程序判定':'證據不足，不能判定可食用';}
export function neutralEndpoint(acid,base){return acid==='hcl'&&base==='naoh'?'25°C 理想等莫耳模型約 pH 7':'需考慮生成離子與水的平衡，不能一律判為 pH 7';}
export function fmt(n,d=2){return n===null?'—':Number(n.toFixed(d)).toLocaleString('zh-TW',{maximumFractionDigits:d});}
export function sci(n){return n===0?'0':n.toExponential(2).replace('e-',' × 10^−').replace('e+',' × 10^');}

