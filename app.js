"use strict";
const FG_MAP={FF:'FA',FA:'FA',SI:'SI',FT:'SI',FC:'FC',FS:'FS',SF:'FS',FO:'FO',SL:'SL',ST:'SL',SV:'CU',CU:'CU',CS:'CU',KC:'KC',CH:'CH',SC:'CH'};
const FG_LABEL={FA:'Four-seam',SI:'Sinker',FC:'Cutter',FS:'Splitter',SL:'Slider',CU:'Curveball',CH:'Changeup',KC:'Knuckle curve',FO:'Forkball'};
const FASTBALLS=new Set(['FA','SI','FC']);
const SLOTS=[['stf','Stf+ ','stuff'],['loc','Loc+ ','loc'],['pit','Pit+ ','pit']];
const TRAITS=[
  {k:'velo',label:'Velocity',unit:'mph',dec:1,min:0.5},
  {k:'ivb',label:'Induced vert. break',unit:'in',dec:1,min:0.75},
  {k:'hb',label:'Horiz. break (arm +)',unit:'in',dec:1,min:0.75},
  {k:'spin',label:'Spin rate',unit:'rpm',dec:0,min:40},
  {k:'ext',label:'Extension',unit:'ft',dec:2,min:0.1},
  {k:'relZ',label:'Release height',unit:'ft',dec:2,min:0.08},
  {k:'relX',label:'Release side',unit:'ft',dec:2,min:0.08},
  {k:'arm',label:'Arm angle',unit:'°',dec:1,min:1}
];
const OUTS={strikeout:1,field_out:1,force_out:1,sac_fly:1,sac_bunt:1,fielders_choice_out:1,other_out:1,grounded_into_double_play:2,double_play:2,strikeout_double_play:2,sac_fly_double_play:2,sac_bunt_double_play:2,triple_play:3};
const SWING=new Set(['swinging_strike','swinging_strike_blocked','foul','foul_tip','hit_into_play','foul_bunt','missed_bunt','bunt_foul_tip']);
const WHIFF=new Set(['swinging_strike','swinging_strike_blocked','foul_tip','missed_bunt']);

const sources={savant:null,stf:null,loc:null,pit:null};
let M=null, selDate=null;

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function num(v){if(v===undefined||v===null)return null;const s=String(v).trim();if(s===''||s==='NA'||s==='null'||s==='NaN')return null;const x=+s;return Number.isFinite(x)?x:null}
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function sd(a){if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))}
function wmean(pairs){let sw=0,s=0;for(const[v,w]of pairs){if(v==null||!w)continue;sw+=w;s+=v*w}return sw?s/sw:null}
function wcorr(xs,ys,ws){
  const pts=xs.map((x,i)=>[x,ys[i],ws[i]]).filter(p=>p[0]!=null&&p[1]!=null);
  if(pts.length<4)return null;
  const W=pts.reduce((s,p)=>s+p[2],0);
  const mx=pts.reduce((s,p)=>s+p[0]*p[2],0)/W,my=pts.reduce((s,p)=>s+p[1]*p[2],0)/W;
  let sxy=0,sxx=0,syy=0;for(const[x,y,w]of pts){sxy+=w*(x-mx)*(y-my);sxx+=w*(x-mx)**2;syy+=w*(y-my)**2}
  return sxx&&syy?sxy/Math.sqrt(sxx*syy):null;
}
const fmt=(v,d=1)=>v==null?'—':v.toFixed(d);
const pct=(v)=>v==null?'—':Math.round(v*100)+'%';
const woba=v=>v==null?'—':v.toFixed(3).replace(/^0/,'');

function parseCSV(text){
  const r=Papa.parse(text.replace(/^\uFEFF/,''),{header:true,skipEmptyLines:true,transformHeader:h=>h.replace(/^\uFEFF/,'').trim()});
  return {rows:r.data,fields:r.meta.fields||[]};
}
function classify(fields){
  if(fields.includes('pitch_type')&&fields.includes('release_speed'))return 'savant';
  if(fields.some(h=>h.startsWith('Stf+ ')))return 'stf';
  if(fields.some(h=>h.startsWith('Loc+ ')))return 'loc';
  if(fields.some(h=>h.startsWith('Pit+ ')))return 'pit';
  return null;
}

/* ---------- model ---------- */
function build(){
  const sv=sources.savant.rows;
  const throws=(sv.find(r=>r.p_throws)||{}).p_throws||'L';
  const hbSign=throws==='L'?1:-1;
  const nameRaw=(sv.find(r=>r.player_name)||{}).player_name||'';
  let name=nameRaw.includes(',')?nameRaw.split(',').map(s=>s.trim()).reverse().join(' '):nameRaw;
  const year=(sv.find(r=>r.game_year)||{}).game_year||'';

  const byDate={};const nameCount={};
  for(const r of sv){
    const code=FG_MAP[r.pitch_type];if(!code||!r.game_date)continue;
    const ls=num(r.launch_speed),ew=num(r.estimated_woba_using_speedangle),wv=num(r.woba_value),wd=num(r.woba_denom);
    const zone=num(r.zone),desc=r.description||'';
    const p={code,date:r.game_date,ab:num(r.at_bat_number)||0,pn:num(r.pitch_number)||0,
      velo:num(r.release_speed),ivb:num(r.pfx_z)!=null?num(r.pfx_z)*12:null,hb:num(r.pfx_x)!=null?num(r.pfx_x)*12*hbSign:null,
      spin:num(r.release_spin_rate),ext:num(r.release_extension),relZ:num(r.release_pos_z),relX:num(r.release_pos_x)!=null?Math.abs(num(r.release_pos_x)):null,
      arm:num(r.arm_angle),mx:num(r.pfx_x)!=null?-num(r.pfx_x)*12:null,my:num(r.pfx_z)!=null?num(r.pfx_z)*12:null,desc,swing:SWING.has(desc),whiff:WHIFF.has(desc),csw:desc==='called_strike'||WHIFF.has(desc),
      inZone:zone!=null&&zone>=1&&zone<=9,hasZone:zone!=null,ev:r.events||'',
      wDen:wd,xw:wd===1?((ls!=null&&ew!=null)?ew:wv):null,rv:num(r.delta_pitcher_run_exp),
      runs:(num(r.post_bat_score)!=null&&num(r.bat_score)!=null)?num(r.post_bat_score)-num(r.bat_score):0,
      opp:r.inning_topbot==='Top'?r.away_team:(r.inning_topbot==='Bot'?'@'+r.home_team:''),team:r.inning_topbot==='Top'?r.home_team:(r.inning_topbot==='Bot'?r.away_team:'')};
    (byDate[p.date]||=[]).push(p);
    const k=code+'|'+(r.pitch_name||'');nameCount[k]=(nameCount[k]||0)+1;
  }
  for(const d in byDate)byDate[d].sort((a,b)=>a.ab-b.ab||a.pn-b.pn);

  // FanGraphs merge
  const fg={};let season=null,fgName=null;
  for(const[slot,prefix,key]of SLOTS){
    const src=sources[slot];if(!src)continue;
    const pcols=src.fields.filter(h=>h.startsWith(prefix)).map(h=>[h,h.slice(prefix.length).trim()]);
    for(const r of src.rows){
      const d=String(r.Date||'').trim();
      const isGame=/^\d{4}-\d{2}-\d{2}$/.test(d);
      if(!isGame&&!/total|season|^\d{4}$/i.test(d+String(r.Team||'')))continue;
      const t=isGame?(fg[d]||={date:d,opp:r.Opp,team:r.Team,gs:num(r.GS),overall:{},p:{}}):(season||={overall:{},p:{}});
      fgName=fgName||r.NameASCII||r.Name;
      const o=t.overall;
      o.stuff=num(r['Stuff+'])??o.stuff;o.loc=num(r['Location+'])??o.loc;o.pit=num(r['Pitching+'])??o.pit;
      for(const[h,code]of pcols){const v=num(r[h]);if(v!=null)(t.p[code]||={})[key]=v}
    }
  }
  if(!name&&fgName)name=fgName;

  const dates=[...new Set([...Object.keys(byDate),...Object.keys(fg)])].sort();
  const games=dates.map(d=>{
    const ps=byDate[d]||[];const f=fg[d]||null;
    const byCode={};for(const p of ps)(byCode[p.code]||=[]).push(p);
    const opp=f?.opp||(ps[0]?.opp)||'';
    return {date:d,opp,gs:f?f.gs:null,fg:f,pitches:ps,byCode};
  });

  const lastG=[...games].reverse().find(g=>g.pitches.length||g.fg?.team);
  const team=(lastG?.fg?.team)||(lastG?.pitches.find(p=>p.team)?.team)||'';
  const yrs=[...new Set(dates.map(d=>d.slice(0,4)))].sort();
  const yearRange=yrs.length>1?`${yrs[0]}–${yrs[yrs.length-1]}`:(yrs[0]||String(year));
  // arsenal
  const all=games.flatMap(g=>g.pitches);
  const cnt={};for(const p of all)cnt[p.code]=(cnt[p.code]||0)+1;
  const codes=new Set(Object.keys(cnt));for(const g of games)if(g.fg)Object.keys(g.fg.p).forEach(c=>codes.add(c));
  const arsenal=[...codes].filter(c=>(cnt[c]||0)>=10).sort((a,b)=>(cnt[b]||0)-(cnt[a]||0));
  const minor=[...codes].filter(c=>!arsenal.includes(c));
  const pname={};
  for(const c of codes){let best=null,bn=0;for(const k in nameCount){const[cc,n]=k.split('|');if(cc===c&&nameCount[k]>bn&&n){bn=nameCount[k];best=n}}pname[c]=best||FG_LABEL[c]||c}

  // norms
  const count=(g,c)=>c?(g.byCode[c]?.length||0):g.pitches.length;
  function norm(get,c,seasonVal){
    const vals=games.map(g=>({v:get(g),n:count(g,c),g})).filter(o=>o.v!=null);
    const avg=seasonVal??wmean(vals.map(o=>[o.v,o.n||1]));
    const qmin=c?10:40;
    let pool=vals.filter(o=>o.n>=qmin||(!c&&o.n===0&&o.g.gs===1));
    if(!pool.length)pool=vals.filter(o=>o.n>=5);if(!pool.length)pool=vals;
    let peak=null,peakDate=null;for(const o of pool)if(peak==null||o.v>peak){peak=o.v;peakDate=o.g.date}
    return {avg,peak,peakDate,fromSeason:seasonVal!=null};
  }
  const norms={overall:{},p:{}};
  for(const k of['pit','stuff','loc'])norms.overall[k]=norm(g=>g.fg?.overall[k]??null,null,season?.overall[k]??null);
  for(const c of arsenal){norms.p[c]={};for(const k of['pit','stuff','loc'])norms.p[c][k]=norm(g=>g.fg?.p[c]?.[k]??null,c,season?.p[c]?.[k]??null)}

  const seasonAgg={all:agg(all)};for(const c of arsenal)seasonAgg[c]=agg(all.filter(p=>p.code===c));
  const profiles={};for(const c of arsenal)profiles[c]=profile(c,games,all.filter(p=>p.code===c));
  const moveOpt={};for(const c of codes)moveOpt[c]=optMove(c,games);

  const m={name,year,yearRange,team,throws,games,arsenal,minor,cnt,pname,norms,seasonAgg,profiles,moveOpt,hasSeasonRow:!!season,fgLoaded:SLOTS.filter(s=>sources[s[0]]).map(s=>s[0])};
  for(const g of games)g.eval=evaluate(g,m);
  const allBy={};for(const p of all)(allBy[p.code]||=[]).push(p);
  const avgOf=nm=>({pit:nm.pit?.avg??null,stuff:nm.stuff?.avg??null,loc:nm.loc?.avg??null});
  const Ifor=raw=>({pit:raw.pit!=null?100:null,stuff:raw.stuff!=null?100:null,loc:raw.loc!=null?100:null});
  const ov=avgOf(norms.overall);
  const ae={overall:{I:Ifor(ov),s:'off',notes:[],raw:ov},pitches:{},result:{a:seasonAgg.all,s:'off',line:gameLine(all)}};
  for(const c of arsenal){const rw=avgOf(norms.p[c]);ae.pitches[c]={I:Ifor(rw),s:'off',notes:[],n:cnt[c]||0,a:seasonAgg[c],raw:rw}}
  m.allGame={date:'ALL',isAll:true,opp:'',gs:null,pitches:all,byCode:allBy,eval:ae};
  return m;
}

function agg(list){
  const n=list.length;if(!n)return{n:0};
  const f=k=>mean(list.map(p=>p[k]).filter(v=>v!=null));
  const sw=list.filter(p=>p.swing).length,wh=list.filter(p=>p.whiff).length,cs=list.filter(p=>p.csw).length;
  const zoned=list.filter(p=>p.hasZone),inZ=zoned.filter(p=>p.inZone).length,out=zoned.filter(p=>!p.inZone);
  const ch=out.filter(p=>p.swing).length;
  const pa=list.filter(p=>p.xw!=null);
  return {n,velo:f('velo'),csw:cs/n,whiff:sw?wh/sw:null,zone:zoned.length?inZ/zoned.length:null,chase:out.length?ch/out.length:null,
    xwoba:pa.length?pa.reduce((s,p)=>s+p.xw,0)/pa.length:null,pa:pa.length,rv:list.reduce((s,p)=>s+(p.rv||0),0)};
}
function gameLine(list){
  let outs=0,K=0,BB=0,H=0,HR=0,R=0,HBP=0,BF=0;
  for(const p of list){
    R+=p.runs||0;const e=p.ev;if(!e)continue;
    if(/^(caught_stealing|pickoff|stolen_base|wild_pitch|passed_ball|other_advance|balk)/.test(e))continue;
    BF++;outs+=OUTS[e]||0;
    if(e.startsWith('strikeout'))K++;if(e==='walk'||e==='intent_walk')BB++;if(e==='hit_by_pitch')HBP++;
    if(['single','double','triple','home_run'].includes(e))H++;if(e==='home_run')HR++;
  }
  return {IP:Math.floor(outs/3)+'.'+(outs%3),outs,K,BB,H,HR,R,HBP,BF,P:list.length};
}

function optMove(c,games){
  let elig=games.filter(g=>g.fg?.p[c]?.pit!=null&&(g.byCode[c]?.length||0)>=8);
  if(elig.length<4)elig=games.filter(g=>g.fg?.p[c]?.pit!=null&&(g.byCode[c]?.length||0)>=2);
  if(elig.length<2)return null;
  const best=[...elig].sort((a,b)=>b.fg.p[c].pit-a.fg.p[c].pit).slice(0,Math.max(2,Math.ceil(elig.length/3)));
  const ps=best.flatMap(g=>g.byCode[c]).filter(p=>p.mx!=null&&p.my!=null);
  if(!ps.length)return null;
  return {x:mean(ps.map(p=>p.mx)),y:mean(ps.map(p=>p.my)),dates:best.map(g=>g.date)};
}
function profile(code,games,allP){
  const elig=games.filter(g=>g.fg?.p[code]?.pit!=null&&(g.byCode[code]?.length||0)>=8);
  if(elig.length<4)return{ok:false,nElig:elig.length};
  const sorted=[...elig].sort((a,b)=>b.fg.p[code].pit-a.fg.p[code].pit);
  const best=sorted.slice(0,Math.max(2,Math.ceil(elig.length/3)));
  const traits=[];
  for(const t of TRAITS){
    const xs=[],ys=[],yp=[],ws=[];
    for(const g of elig){const v=g.byCode[code].map(p=>p[t.k]).filter(v=>v!=null);if(v.length<5)continue;xs.push(mean(v));ys.push(g.fg.p[code].stuff??null);yp.push(g.fg.p[code].pit);ws.push(v.length)}
    const bv=best.flatMap(g=>g.byCode[code].map(p=>p[t.k]).filter(v=>v!=null));
    const sv=allP.map(p=>p[t.k]).filter(v=>v!=null);
    if(bv.length<5||!sv.length)continue;
    const m=mean(bv),s=sd(bv);
    traits.push({...t,rS:wcorr(xs,ys,ws),rP:wcorr(xs,yp,ws),target:m,tol:Math.max(0.5*s,t.min),band:Math.max(s,t.min),seasonMean:mean(sv),lo:Math.min(...sv),hi:Math.max(...sv),sSd:sd(sv)});
  }
  const strength=t=>Math.abs(t.rS??t.rP??0);
  const keys=[...traits].sort((a,b)=>strength(b)-strength(a)).slice(0,3).map(t=>t.k);
  const tk=Object.fromEntries(traits.map(t=>[t.k,t]));
  const evaluable=p=>keys.every(k=>p[k]!=null);
  const inProf=p=>keys.every(k=>Math.abs(p[k]-tk[k].target)<=tk[k].band);
  const ev=allP.filter(evaluable);
  return{ok:true,traits,keys,tk,best:best.map(g=>g.date),nElig:elig.length,evaluable,inProf,seasonRate:ev.length?ev.filter(inProf).length/ev.length:null};
}

/* ---------- lights ---------- */
const idx=(v,avg)=>(v==null||avg==null||avg<=0)?null:100*v/avg;
const base=i=>i==null?'off':i>=98?'green':i>=95?'yellow':'red';
const UP={red:'yellow',yellow:'green',green:'green',off:'off'};
const WORD={green:'Green light',yellow:'Yellow light',red:'Red light',off:'No call'};

function evaluate(g,m){
  const out={overall:null,pitches:{},result:null};
  const tot=g.pitches.length;
  // overall
  {
    const o=g.fg?.overall||{},N=m.norms.overall;
    const I={pit:idx(o.pit,N.pit.avg),stuff:idx(o.stuff,N.stuff.avg),loc:idx(o.loc,N.loc.avg)};
    let s=base(I.pit);const notes=[];
    if(!g.fg||o.pit==null){s='off';notes.push('FanGraphs grades for this outing are not in the uploaded logs yet, so only Statcast results are shown.')}
    else{
      if(tot&&tot<25){notes.push(`Short outing: grades rest on ${tot} pitches.`);if(s==='red'){s='yellow';notes.push('Red capped at yellow for sample size.')}}
      const bs=base(I.stuff),bl=base(I.loc);
      if(bs==='green'&&bl==='red')notes.push('The stuff was there; location is what pulled Pitching+ down.');
      if(bl==='green'&&bs==='red')notes.push('Command held up; the raw stuff (velo/shape) was below his norm.');
    }
    out.overall={I,s,notes,raw:o};
  }
  // result
  {
    const a=agg(g.pitches),sa=m.seasonAgg.all;
    const ri=(a.xwoba!=null&&sa.xwoba)?100*sa.xwoba/Math.max(a.xwoba,0.05):null;
    let s=a.pa>=3?base(ri):'off';
    out.result={a,ri,s,line:gameLine(g.pitches)};
    const os=out.overall.s;
    if(os!=='off'&&s!=='off'){
      if((os==='red'||os==='yellow')&&s==='green')out.overall.notes.push('Results outran the process: contact quality held down even though the grades dipped.');
      if(os==='green'&&s==='red')out.overall.notes.push('Process was green but results were red: likely contact luck or sequencing, not pitch quality.');
    }
  }
  // pitches
  for(const c of m.arsenal){
    const v=g.fg?.p[c]||{},N=m.norms.p[c],list=g.byCode[c]||[],n=list.length;
    const I={pit:idx(v.pit,N.pit.avg),stuff:idx(v.stuff,N.stuff.avg),loc:idx(v.loc,N.loc.avg)};
    let s=base(I.pit);const notes=[];const a=agg(list),sa=m.seasonAgg[c];
    if(n===0&&v.pit==null){s='off';notes.push('Not thrown.')}
    else if(v.pit==null){s='off';notes.push('No FanGraphs grade for this pitch in this outing.')}
    else if(n<6){s='off';notes.push(`Only ${n} thrown, too few to call.`)}
    else{
      const b=s;
      if(b!=='green'&&a.csw!=null&&sa.csw!=null&&a.csw>=sa.csw+0.05&&(a.xwoba==null||sa.xwoba==null||a.xwoba<=sa.xwoba+0.02)){
        s=UP[s];notes.push(`Graded down, but ${pct(a.csw)} CSW beat his ${pct(sa.csw)} norm without harder contact; bumped up one light.`)}
      const drop=(sa.velo!=null&&a.velo!=null)?sa.velo-a.velo:0;
      if(s==='green'&&drop>=(FASTBALLS.has(c)?1.5:2)){s='yellow';notes.push(`Graded well, but velo sat ${drop.toFixed(1)} mph under his norm; fatigue watch.`)}
      if(n<12&&s==='red'){s='yellow';notes.push(`Only ${n} thrown; red capped at yellow.`)}
      const bs=base(I.stuff),bl=base(I.loc);
      if(bs==='green'&&bl==='red')notes.push('Shape and velo were fine; the misses were location.');
      if(bl==='green'&&bs==='red')notes.push('Located well, but the raw pitch quality was below his norm.');
      if(tot&&n/tot<0.08)notes.push(`Used ${pct(n/tot)} of the time; it does not drive the outing's call.`);
    }
    out.pitches[c]={I,s,notes,n,a,raw:v};
  }
  return out;
}

/* ---------- render ---------- */
const PCOL={FA:'#4F80D9',SI:'#E6E619',FC:'#F39514',CH:'#8E168F',CU:'#6A4BD9',SL:'#D9B400',FS:'#34B3A0',KC:'#4B2A9E',FO:'#2A8C7A'};
const opened=new Set();const hiddenPT=new Set();
const sig=(s,size='',label)=>`<div class="signal ${size}" data-s="${s}" role="img" aria-label="${esc(label||WORD[s])}"><span class="lens r"></span><span class="lens y"></span><span class="lens g"></span></div>`;
const posOf=i=>Math.max(0,Math.min(100,(i-50)));
const MNAME={pit:'Pitching+',stuff:'Stuff+',loc:'Location+'};

function hbar(label,value,i,nm,light,isAll){
  const has=i!=null;
  const pkI=isAll?nm.peak:idx(nm.peak,nm.avg);
  const over=pkI!=null&&pkI>150;
  const aria=has?`${label}: ${value.toFixed(1)}, index ${Math.round(i)}; average ${nm.avg.toFixed(1)}; peak ${nm.peak?.toFixed(1)}`:`${label}: no grade`;
  return `<div class="hbar" role="img" aria-label="${esc(aria)}">
    <div class="l">${label}</div>
    <div><div class="track"><div class="zr"></div><div class="zy"></div>
      <div class="fill ${has?(isAll?'base':light):'off'}" style="width:${has?posOf(i):0}%"></div>
      <div class="avg"></div>
      ${pkI!=null?`<div class="peak ${over?'over':''}" style="left:${posOf(pkI)}%"></div>`:''}
    </div>
    <div class="ticks"><span style="left:0%">50</span><span style="left:25%">75</span><span style="left:50%">100</span><span style="left:75%">125</span><span style="left:100%">150</span></div></div>
    <div class="v ${has?'':'na'}"><b>${has?Math.round(i):'—'}</b>${isAll?`<span class="n1">Season avg <b>${nm.avg!=null?nm.avg.toFixed(1):'—'}</b></span><span class="n2">peak <b>${nm.peak!=null?nm.peak.toFixed(1):'—'}</b>${nm.peakDate?` | ${+nm.peakDate.slice(5,7)}/${+nm.peakDate.slice(8)}`:''}</span>`:`<span class="n1">This start <b>${has?value.toFixed(1):'—'}</b></span><span class="n2">avg <b>${nm.avg!=null?nm.avg.toFixed(1):'—'}</b> | peak <b>${nm.peak!=null?nm.peak.toFixed(1):'—'}</b></span>`}</div>
  </div>`;
}

function box(key,title,sub,ev,nm,raw,isArs,isAll){
  const ks=['pit','stuff','loc'];
  const mini=ks.map(k=>`<span class="${isAll?'neutral':base(ev.I[k])}">${isAll?(raw[k]==null?'—':Math.round(raw[k])):(ev.I[k]==null?'—':Math.round(ev.I[k]))}<i>${MNAME[k].replace('+','').slice(0,3)}+</i></span>`).join('');
  return `<details class="box ${isArs?'arsenal':''}" data-key="${key}" ${opened.has(key)?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h3>${esc(title)}<small>${esc(sub)}</small></h3>
      <div class="mini" aria-hidden="true">${mini}</div>${isAll?'':sig(ev.s,'',`${title}: ${WORD[ev.s]}`)}</summary>
    <div class="bars">${ks.map(k=>hbar(MNAME[k],raw[k]??null,isAll?(raw[k]??null):ev.I[k],nm[k],base(ev.I[k]),isAll)).join('')}</div>
  </details>`;
}

function moveChart(g,m){
  const codes=Object.keys(g.byCode).sort((a,b)=>(m.cnt[b]||0)-(m.cnt[a]||0));
  if(!codes.length)return '<div class="empty">No pitch data for this outing.</div>';
  const W=480,H=460,L=48,R=66,T=28,B=50,pw=W-L-R,ph=H-T-B;
  const X=v=>L+(Math.max(-25,Math.min(25,v))+25)/50*pw, Y=v=>T+(25-Math.max(-25,Math.min(25,v)))/50*ph;
  const tk=[-25,-12.5,0,12.5,25];
  let s=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="var(--plate-in)" stroke="var(--plate-grid)"/>`;
  for(const v of[-12.5,12.5])s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T+ph}" stroke="var(--plate-grid)" stroke-dasharray="5 4"/><line y1="${Y(v)}" y2="${Y(v)}" x1="${L}" x2="${L+pw}" stroke="var(--plate-grid)" stroke-dasharray="5 4"/>`;
  s+=`<line x1="${X(0)}" x2="${X(0)}" y1="${T}" y2="${T+ph}" stroke="var(--plate-zero)" stroke-width="2" stroke-dasharray="7 5"/><line y1="${Y(0)}" y2="${Y(0)}" x1="${L}" x2="${L+pw}" stroke="var(--plate-zero)" stroke-width="2" stroke-dasharray="7 5"/>`;
  for(const v of tk){
    s+=`<text x="${X(v)}" y="${T+ph+15}" text-anchor="middle" font-size="12" fill="var(--plate-ink)">${v}</text><text x="${X(v)}" y="${T-7}" text-anchor="middle" font-size="12" fill="var(--plate-ink)">${v}</text>`;
    s+=`<text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="12" fill="var(--plate-ink)">${v}</text><text x="${L+pw+6}" y="${Y(v)+4}" font-size="12" fill="var(--plate-ink)">${v}</text>`;
  }
  s+=`<text x="${L+pw/2}" y="${H-16}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--plate-ink)">Horizontal Break (inches)</text>`;
  s+=`<text transform="translate(${W-10},${T+ph/2}) rotate(90)" text-anchor="middle" font-size="14" font-weight="700" fill="var(--plate-ink)">Vertical Break (inches)</text>`;
  s+=`<text x="${L+pw/2}" y="${H-1}" text-anchor="middle" font-size="12" fill="var(--plate-ink)">Pitch movement from pitcher's POV</text>`;
  const vis=codes.filter(c=>!hiddenPT.has(c));
  for(const c of vis)for(const p of g.byCode[c])if(p.mx!=null&&p.my!=null)
    s+=`<circle cx="${X(p.mx).toFixed(1)}" cy="${Y(p.my).toFixed(1)}" r="4.2" fill="${PCOL[c]||'#888'}" fill-opacity=".8" stroke="#222" stroke-width=".7"/>`;
  const rows=[];
  for(const c of vis){
    const ps=g.byCode[c].filter(p=>p.mx!=null&&p.my!=null);if(!ps.length)continue;
    const ax=mean(ps.map(p=>p.mx)),ay=mean(ps.map(p=>p.my)),o=m.moveOpt[c];
    if(o){
      s+=`<line x1="${X(ax)}" y1="${Y(ay)}" x2="${X(o.x)}" y2="${Y(o.y)}" stroke="var(--plate-zero)" stroke-width="1.6" stroke-dasharray="3 3"/>`;
      const ox=X(o.x),oy=Y(o.y),d=10;
      s+=`<polygon points="${ox},${oy-d} ${ox+d},${oy} ${ox},${oy+d} ${ox-d},${oy}" fill="#fff" stroke="#111" stroke-width="4.5"/><polygon points="${ox},${oy-d} ${ox+d},${oy} ${ox},${oy+d} ${ox-d},${oy}" fill="#fff" stroke="${PCOL[c]||'#888'}" stroke-width="2.5"/>`;
    }
    s+=`<circle cx="${X(ax)}" cy="${Y(ay)}" r="11" fill="#111"/><circle cx="${X(ax)}" cy="${Y(ay)}" r="9" fill="${PCOL[c]||'#888'}" stroke="#fff" stroke-width="2.5"/>`;
  }
  const lg=codes.map(c=>`<button type="button" data-pt="${c}" aria-pressed="${!hiddenPT.has(c)}"><i style="background:${PCOL[c]||'#888'}"></i>${esc(m.pname[c])}</button>`).join('');
  const tbl=codes.map(c=>{
    const ps=g.byCode[c].filter(p=>p.mx!=null&&p.my!=null);const ax=mean(ps.map(p=>p.mx)),ay=mean(ps.map(p=>p.my)),o=m.moveOpt[c];
    const f=v=>v==null?'—':v.toFixed(1),df=(a,b)=>(a==null||b==null)?'—':((a-b)>=0?'+':'')+(a-b).toFixed(1);
    return `<tr><td><span class="sw" style="background:${PCOL[c]||'#888'}"></span>${esc(m.pname[c])}</td><td>${ps.length}</td><td>${f(ax)}</td><td>${f(ay)}</td><td>${f(o?.x)}</td><td>${f(o?.y)}</td><td>${df(ax,o?.x)}</td><td>${df(ay,o?.y)}</td></tr>`}).join('');
  return `<div class="plate">
    <div class="lgtitle">PitchType</div><div class="lg">${lg}</div>
    <div class="symkey"><span><svg width="20" height="20"><circle cx="10" cy="10" r="9" fill="#111"/><circle cx="10" cy="10" r="7" fill="#999" stroke="#fff" stroke-width="2"/></svg>${g.isAll?'Season':'Start'} average</span><span><svg width="20" height="20"><polygon points="10,1 19,10 10,19 1,10" fill="#fff" stroke="#111" stroke-width="3"/></svg>Optimal profile</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pitch movement chart">${s}</svg></div>
    <div class="tblwrap"><table class="mvt" style="margin-top:0"><thead><tr><th>Pitch</th><th>n</th><th>Avg H</th><th>Avg V</th><th>Opt H</th><th>Opt V</th><th>ΔH</th><th>ΔV</th></tr></thead><tbody>${tbl}</tbody></table></div>`;
}

function strip(t,gm,goodSide){
  const lo=Math.min(t.lo,t.target-t.band,gm??t.lo),hi=Math.max(t.hi,t.target+t.band,gm??t.hi);
  const pad=(hi-lo)*0.05||1,L=lo-pad,H=hi+pad,x=v=>((v-L)/(H-L)*100).toFixed(2);
  let cls='in';
  if(gm!=null&&!goodSide){const d=gm-t.target;if(Math.abs(d)>t.tol)cls=Math.abs(d)>t.band?'far':(d>0?'high':'low')}
  return `<div class="strip" aria-hidden="true">
    <div class="band" style="left:${x(t.target-t.tol)}%;width:${(x(t.target+t.tol)-x(t.target-t.tol)).toFixed(2)}%"></div>
    <div class="sm" style="left:${x(t.seasonMean)}%"></div>
    ${gm!=null?`<div class="gm ${cls}" style="left:${x(gm)}%"></div>`:''}</div>`;
}

function pitchCard(c,g,m){
  const ev=g.eval.pitches[c],pr=m.profiles[c],sa=m.seasonAgg[c],a=ev.a,tot=g.pitches.length;
  const list=g.byCode[c]||[];
  const st=(lab,v,s,f)=>`<div><b>${f(v)}</b><span>${lab}</span>${g.isAll?'':`<em>season ${f(s)}</em>`}</div>`;
  let rows='',prof='';
  if(g.isAll){
    const pd=m.norms.p[c]?.pit?.peakDate;const pg=pd?m.games.find(x=>x.date===pd):null;const pl=pg?.byCode[c]||[];
    const tr=TRAITS.map(t=>{
      const sv=list.map(p=>p[t.k]).filter(v=>v!=null),pv=pl.map(p=>p[t.k]).filter(v=>v!=null);
      if(!sv.length)return '';
      const key=pr.ok&&pr.keys.includes(t.k)?'<span class="keyt">key</span>':'';
      return `<tr><td>${t.label}${key}</td><td>${mean(sv).toFixed(t.dec)} <small>${t.unit}</small></td><td>${pv.length?mean(pv).toFixed(t.dec)+' <small>'+t.unit+'</small>':'—'}</td></tr>`}).join('');
    rows=`<table class="ttab"><thead><tr><th>Trait</th><th>Season avg</th><th>Peak${pd?` (${+pd.slice(5,7)}/${+pd.slice(8)})`:''}</th></tr></thead><tbody>${tr}</tbody></table>`;
    if(pr.ok)prof=st('In profile',pr.seasonRate,null,pct);
  }else if(pr.ok){
    rows=[...pr.traits].sort((x,y)=>(pr.keys.includes(y.k)-pr.keys.includes(x.k))||Math.abs(y.rS??0)-Math.abs(x.rS??0)).map(t=>{
      const vals=list.map(p=>p[t.k]).filter(v=>v!=null);const gm=vals.length?mean(vals):null;
      const r=t.rS??t.rP;const d=gm!=null?gm-t.target:null;
      const goodSide=d!=null&&r!=null&&Math.abs(r)>=0.2&&Math.sign(d)===Math.sign(r);
      const key=pr.keys.includes(t.k)?'<span class="keyt">key</span>':'';
      return `<div class="tr"><div class="n">${t.label}${key}<small>r ${r==null?'—':r.toFixed(2)}</small></div>${strip(t,gm,goodSide)}
        <div class="val">${gm==null?'—':gm.toFixed(t.dec)+' '+t.unit}<small>target ${t.target.toFixed(t.dec)} · Δ ${d==null?'—':(d>=0?'+':'')+d.toFixed(t.dec)}</small></div></div>`}).join('');
    const ev2=list.filter(pr.evaluable);const rate=ev2.length?ev2.filter(pr.inProf).length/ev2.length:null;
    prof=st('In profile',rate,pr.seasonRate,pct);
  }
  return `<article class="card pcard">
    <div class="ph"><h3>${esc(m.pname[c])}</h3>${g.isAll?'':sig(ev.s,'',`${m.pname[c]}: ${WORD[ev.s]}`)}</div>
    <div class="stats">${st('Thrown',ev.n,null,v=>v==null?'—':v)}${st('Usage',tot?ev.n/tot:null,m.cnt[c]/m.seasonAgg.all.n,pct)}${st('Velo',a.velo,sa.velo,v=>fmt(v,1))}${st('CSW',a.csw,sa.csw,pct)}${st('Whiff',a.whiff,sa.whiff,pct)}${st('Zone',a.zone,sa.zone,pct)}${st('Chase',a.chase,sa.chase,pct)}${st('xwOBA',a.xwoba,sa.xwoba,woba)}${prof}</div>
    ${rows?`<div class="traits"><h4>Trait profile</h4>${rows}</div>`:''}
  </article>`;
}

function render(){
  const m=M,app=$('#app');
  if(!m){app.innerHTML='<div class="empty">Upload the Baseball Savant pitch log and the three FanGraphs game logs to build the dashboard.</div>';return}
  $('#title').textContent=m.name||'Start Signal';
  $('#subtitle').textContent=`${m.throws==='L'?'Left-handed':'Right-handed'} pitcher · ${m.games.length} appearances (${m.yearRange})`;
  setLogo(m.team);
  const g=selDate==='ALL'?m.allGame:(m.games.find(x=>x.date===selDate)||m.games[m.games.length-1]);selDate=g.date;
  const isAll=!!g.isAll;
  const e=g.eval,r=e.result,L=r.line;
  const dt=new Date((isAll?m.games[0].date:g.date)+'T12:00:00');
  const dLabel=dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const role=g.gs===1?'Start':g.gs===0?'Relief appearance':'Appearance';

  const allChip=`<button class="chip all ${isAll?'sel':''}" data-date="ALL" aria-pressed="${isAll}" aria-label="All appearances, season baseline"><span class="d">ALL</span><span class="o">${esc(m.yearRange)}</span></button>`;
  const rail=m.games.map(x=>{
    const s=x.eval.overall.s;const lab=`${x.date}, ${x.opp}: ${WORD[s]}`;
    return `<button class="chip ${x.date===g.date?'sel':''} ${x.gs===0?'relief':''}" data-date="${x.date}" aria-pressed="${x.date===g.date}" aria-label="${esc(lab)}">
      ${sig(s,'sm','')}<span class="d">${+x.date.slice(5,7)}/${+x.date.slice(8)}</span><span class="o">${esc(x.opp)}</span></button>`}).join('');

  const deck=[box('overall','Full arsenal',`${L.P} pitches`,e.overall,m.norms.overall,e.overall.raw,true,isAll)]
    .concat(m.arsenal.map(c=>box(c,m.pname[c],`${e.pitches[c].n} thrown`,e.pitches[c],m.norms.p[c],e.pitches[c].raw,false,isAll))).join('');
  const fd=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const nStarts=m.games.filter(x=>x.gs===1).length;
  const sa=m.seasonAgg.all;
  app.innerHTML=`
  <div class="rail-wrap"><div class="rail-row" id="railRow">${allChip}<div class="rail" id="rail">${rail}</div></div></div>

  <div class="banner">
    <section class="card verdict">
      ${isAll?'':sig(e.overall.s,'lg')}
      ${isAll?`<div><h2>Season baseline</h2><p><b>${fd(m.games[0].date)} – ${fd(m.games[m.games.length-1].date)}</b> · ${m.games.length} appearances · ${nStarts} starts</p></div>`
        :`<div><h2>${WORD[e.overall.s]}</h2><p><b>${esc(dLabel)} ${esc(g.opp)}</b> · ${role}</p></div>`}
    </section>
    <section class="card">
      <div class="result-head">${isAll?'':sig(r.s,'',`Result: ${WORD[r.s]}`)}<h3>${isAll?'Season totals':'Result'}</h3></div>
      <div class="line">
        <div><b>${L.IP}</b><span>IP</span></div><div><b>${L.H}</b><span>H</span></div><div><b>${L.R}</b><span>R</span></div>
        <div><b>${L.BB}</b><span>BB</span></div><div><b>${L.K}</b><span>K</span></div><div><b>${L.HR}</b><span>HR</span></div><div><b>${L.P}</b><span>Pitches</span></div>
      </div>
      <div class="line">
        <div><b>${woba(r.a.xwoba)}</b><span>xwOBA${isAll?'':` · season ${woba(sa.xwoba)}`}</span></div>
        <div><b>${pct(r.a.csw)}</b><span>CSW${isAll?'':` · season ${pct(sa.csw)}`}</span></div>
        <div><b>${r.a.rv>=0?'+':''}${r.a.rv.toFixed(1)}</b><span>Run value</span></div>
      </div>
    </section>
  </div>

${isAll?`<div class="tcwrap"><details class="sec" data-key="__trends" ${opened.has('__trends')?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h2>Trends</h2></summary>
    <div class="sec-body">${trendsSection(m)}</div>
  </details>
  <details class="sec" data-key="__compare" ${opened.has('__compare')?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h2>Compare Outings</h2></summary>
    <div class="sec-body">${compareSection(m)}</div>
  </details></div>`:''}

  <div class="deck-head"><h2>${isAll?'Quality vs league':'Quality vs his norms'}</h2>
    <div class="deck-ctl"><button class="btn" id="expAll">Expand all</button><button class="btn" id="colAll">Collapse all</button></div></div>
  <div class="key" style="margin-bottom:8px"><span><i></i>100 = ${isAll?'league':'season'} average</span><span><i class="pk"></i>${isAll?'His peak outing':'Peak'}</span>${isAll?'<span>Bar = his season average</span>':''}<span>Scale 50–150</span></div>
  <div class="deck" id="deck">${deck}</div>
  ${m.minor.length?`<p class="also">Under 10 pitches this season: ${m.minor.map(c=>`${esc(m.pname[c])} (${m.cnt[c]||0})`).join(', ')}</p>`:''}

  <details class="sec" data-key="__move" ${opened.has('__move')?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h2>Pitch movement</h2></summary>
    <div class="sec-body mvgrid">${moveChart(g,m)}</div>
  </details>

  <details class="sec" data-key="__pbp" ${opened.has('__pbp')?'open':''}>
    <summary><span class="chev" aria-hidden="true"></span><h2>Pitch by pitch</h2></summary>
    <div class="sec-body"><div class="detail-grid">${m.arsenal.map(c=>pitchCard(c,g,m)).join('')}</div></div>
  </details>
`;

  const sel=app.querySelector('.chip.sel:not(.all)');if(sel)sel.scrollIntoView({block:'nearest',inline:'center'});
  app.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{selDate=b.dataset.date;render()}));
  app.querySelectorAll('details[data-key]').forEach(d=>d.addEventListener('toggle',()=>{d.open?opened.add(d.dataset.key):opened.delete(d.dataset.key)}));
  $('#expAll').addEventListener('click',()=>app.querySelectorAll('#deck details.box').forEach(d=>d.open=true));
  $('#colAll').addEventListener('click',()=>app.querySelectorAll('#deck details.box').forEach(d=>d.open=false));
  if(isAll)bindTC(m);
  app.querySelectorAll('.lg button').forEach(b=>b.addEventListener('click',()=>{
    const c=b.dataset.pt;hiddenPT.has(c)?hiddenPT.delete(c):hiddenPT.add(c);
    const y=window.scrollY;render();window.scrollTo(0,y);$(`.lg button[data-pt="${c}"]`)?.focus({preventScroll:true});
  }));
  $('#railRow').addEventListener('keydown',ev=>{
    if(ev.key!=='ArrowRight'&&ev.key!=='ArrowLeft')return;
    const seq=['ALL',...m.games.map(x=>x.date)];
    const i=seq.indexOf(selDate)+(ev.key==='ArrowRight'?1:-1);
    if(i>=0&&i<seq.length){selDate=seq[i];render();$('#railRow .chip.sel')?.focus()}
  });
}

/* ---------- trends & compare ---------- */
const MET=[
  {k:'pit',label:'Pitching+',type:'grade',dec:1},{k:'stuff',label:'Stuff+',type:'grade',dec:1},{k:'loc',label:'Location+',type:'grade',dec:1},
  ...TRAITS.map(t=>({k:t.k,label:t.label,type:'trait',dec:t.dec,unit:t.unit})),
  {k:'csw',label:'CSW%',type:'rate',pct:true},{k:'whiff',label:'Whiff%',type:'rate',pct:true},{k:'zone',label:'Zone%',type:'rate',pct:true},
  {k:'chase',label:'Chase%',type:'rate',pct:true},{k:'xwoba',label:'xwOBA',type:'rate',dec:3},{k:'usage',label:'Usage%',type:'rate',pct:true}
];
const METK=Object.fromEntries(MET.map(x=>[x.k,x]));
const GRANS=[['pitch','By pitch'],['outing','By outing'],['roll5','Rolling 5 outings'],['month','By month'],['half','By half'],['year','By year']];
const TS={series:[{scope:'overall',k:'pit'}],gran:'outing',pickScope:'overall',pickK:'pit'};
const CMP={a:null,b:null};
const scopeName=(m,s)=>s==='overall'?'Full arsenal':s==='ALLP'?'All pitches':m.pname[s];
const scopeCol=s=>(s==='overall'||s==='ALLP')?'#F0F1F2':(PCOL[s]||'#999');
const fmtM=(mt,v)=>v==null?'—':mt.pct?(v*100).toFixed(1)+'%':mt.k==='xwoba'?woba(v):v.toFixed(mt.dec??1);
function validScope(mt,s){if(mt.type==='grade')return s!=='ALLP';if(mt.k==='usage')return s!=='overall'&&s!=='ALLP';return s!=='overall'}
function halfKey(d){return d.slice(0,4)+(d.slice(5)<='07-15'?' 1st half':' 2nd half')}
function bkey(d,gran){return gran==='month'?d.slice(0,7):gran==='half'?halfKey(d):gran==='year'?d.slice(0,4):d}
function blabel(k,gran){
  if(gran==='month'){const dt=new Date(k+'-15T12:00:00');return dt.toLocaleDateString('en-US',{month:'short',year:'2-digit'})}
  if(gran==='half'||gran==='year')return k;
  return `${+k.slice(5,7)}/${+k.slice(8,10)}`;
}
function scopePitches(g,s){return s==='ALLP'||s==='overall'?g.pitches:(g.byCode[s]||[])}
function pitchStat(list,k,total){
  if(!list.length)return null;
  if(k==='usage')return total?list.length/total:null;
  const T=TRAITS.find(t=>t.k===k);
  if(T){const v=list.map(p=>p[k]).filter(v=>v!=null);return v.length?mean(v):null}
  return agg(list)[k]??null;
}
function gradeOf(g,s,k){return s==='overall'?(g.fg?.overall[k]??null):(g.fg?.p[s]?.[k]??null)}
function outingValue(g,s,k){
  const mt=METK[k];
  if(mt.type==='grade')return gradeOf(g,s,k);
  const list=scopePitches(g,s);if(k!=='usage'&&list.length<(mt.type==='rate'?5:1))return null;
  return pitchStat(list,k,g.pitches.length);
}
function seriesData(m,s,k,gran){
  const mt=METK[k];let g2=gran;
  if(gran==='pitch'&&mt.type!=='trait')g2='outing';
  const games=m.games;
  if(g2==='pitch'){
    const pts=[];for(const g of games)for(const p of scopePitches(g,s))if(p[k]!=null)pts.push({key:`${g.date}|${String(p.ab).padStart(4,'0')}|${String(p.pn).padStart(3,'0')}`,label:blabel(g.date,'outing'),y:p[k],n:1});
    return {pts,gran:'pitch'};
  }
  if(mt.type==='grade'){
    const vals=games.map(g=>({g,v:gradeOf(g,s,k),w:(s==='overall'?g.pitches.length:(g.byCode[s]?.length||0))||1})).filter(o=>o.v!=null);
    if(g2==='roll5')return{gran:g2,pts:vals.map((o,i)=>{const win=vals.slice(Math.max(0,i-4),i+1);return{key:o.g.date,label:blabel(o.g.date,'outing'),y:wmean(win.map(x=>[x.v,x.w])),n:win.length}})};
    const B={};for(const o of vals)(B[bkey(o.g.date,g2)]||=[]).push(o);
    return{gran:g2,pts:Object.keys(B).sort().map(key=>({key,label:blabel(key,g2),y:wmean(B[key].map(x=>[x.v,x.w])),n:B[key].length}))};
  }
  const used=games.filter(g=>scopePitches(g,s).length>0||(k==='usage'&&g.pitches.length));
  if(g2==='roll5'){
    const withS=games.filter(g=>scopePitches(g,s).length>0);
    return{gran:g2,pts:withS.map((g,i)=>{const win=withS.slice(Math.max(0,i-4),i+1);const list=win.flatMap(x=>scopePitches(x,s));const tot=win.reduce((a,x)=>a+x.pitches.length,0);return{key:g.date,label:blabel(g.date,'outing'),y:pitchStat(list,k,tot),n:list.length}}).filter(p=>p.y!=null)};
  }
  const B={};for(const g of used){const key=bkey(g.date,g2);(B[key]||={list:[],tot:0});B[key].list.push(...scopePitches(g,s));B[key].tot+=g.pitches.length}
  return{gran:g2,pts:Object.keys(B).sort().map(key=>{const b=B[key];const min=g2==='outing'&&mt.type==='rate'&&k!=='usage'?5:1;return{key,label:blabel(key,g2),y:b.list.length>=min?pitchStat(b.list,k,b.tot):null,n:b.list.length}}).filter(p=>p.y!=null)};
}
function lineChart(mt,series,gl){
  const keys=[...new Set(series.flatMap(s=>s.pts.map(p=>p.key)))].sort();
  if(!keys.length)return '<div class="empty">No data for this selection.</div>';
  const lab={};for(const s of series)for(const p of s.pts)lab[p.key]=p.label;
  const xi=Object.fromEntries(keys.map((k,i)=>[k,i]));
  const ys=series.flatMap(s=>s.pts.map(p=>p.y));if(mt.type==='grade')ys.push(100);
  let lo=Math.min(...ys),hi=Math.max(...ys);const pad=(hi-lo)*0.1||Math.abs(hi)*0.05||1;lo-=pad;hi+=pad;
  const W=900,H=230,L=58,R=14,T=12,B=30,pw=W-L-R,ph=H-T-B;
  const X=i=>L+(keys.length===1?pw/2:i/(keys.length-1)*pw),Y=v=>T+(hi-v)/(hi-lo)*ph;
  let s='';
  for(let j=0;j<=4;j++){const v=lo+(hi-lo)*j/4;s+=`<line x1="${L}" x2="${L+pw}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--ink-dim)">${fmtM(mt,v)}</text>`}
  if(mt.type==='grade')s+=`<line x1="${L}" x2="${L+pw}" y1="${Y(100)}" y2="${Y(100)}" stroke="var(--ink)" stroke-dasharray="6 4" stroke-width="1.5"/><text x="${L+pw-2}" y="${Y(100)-4}" text-anchor="end" font-size="10" fill="var(--ink-dim)">100 lg avg</text>`;
  const step=Math.max(1,Math.ceil(keys.length/12));let prevL=null;
  keys.forEach((k,i)=>{const l=lab[k];if(i%step===0&&l!==prevL){s+=`<text x="${X(i)}" y="${H-10}" text-anchor="middle" font-size="11" fill="var(--ink-dim)">${esc(l)}</text>`;prevL=l}});
  const dense=keys.length>150;
  for(const se of series){
    const pts=se.pts.map(p=>[X(xi[p.key]),Y(p.y),p]);
    if(pts.length>1)s+=`<polyline fill="none" stroke="${se.color}" stroke-width="${dense?1:2.2}" stroke-opacity="${dense?.55:1}" points="${pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>`;
    for(const[x,y,p]of pts)s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dense?1.6:3.6}" fill="${se.color}" stroke="${dense?'none':'#000'}" stroke-width=".8"><title>${esc(se.name)} · ${esc(p.label)}: ${fmtM(mt,p.y)}${p.n>1?` (n ${p.n})`:''}</title></circle>`;
  }
  const lg=series.map(se=>`<span><i style="background:${se.color}"></i>${esc(se.name)}${se.note?` <em>${esc(se.note)}</em>`:''}</span>`).join('');
  return `<div class="tchart"><div class="thead"><b>${esc(mt.label)}${mt.unit?` <small>(${mt.unit})</small>`:''}</b><div class="tlg">${lg}</div></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(mt.label)} trend">${s}</svg></div>`;
}
function trendsSection(m){
  const scopes=[['overall','Full arsenal'],['ALLP','All pitches'],...m.arsenal.map(c=>[c,m.pname[c]])];
  const mt=METK[TS.pickK];
  const sOpts=scopes.map(([v,l])=>`<option value="${v}" ${v===TS.pickScope?'selected':''} ${validScope(mt,v)?'':'disabled'}>${esc(l)}</option>`).join('');
  const grp=(t,l)=>`<optgroup label="${l}">${MET.filter(x=>x.type===t).map(x=>`<option value="${x.k}" ${x.k===TS.pickK?'selected':''}>${esc(x.label)}</option>`).join('')}</optgroup>`;
  const tags=TS.series.map((se,i)=>`<span class="tag"><i style="background:${scopeCol(se.scope)}"></i>${esc(scopeName(m,se.scope))} · ${esc(METK[se.k].label)}<button type="button" data-rm="${i}" aria-label="Remove ${esc(scopeName(m,se.scope))} ${esc(METK[se.k].label)}">×</button></span>`).join('');
  const gb=GRANS.map(([v,l])=>`<button type="button" class="seg ${TS.gran===v?'on':''}" data-gran="${v}" aria-pressed="${TS.gran===v}">${l}</button>`).join('');
  const byMet={};for(const se of TS.series)(byMet[se.k]||=[]).push(se);
  const charts=Object.keys(byMet).map(k=>{
    const mt=METK[k];
    const ser=byMet[k].map(se=>{const d=seriesData(m,se.scope,k,TS.gran);return{name:scopeName(m,se.scope),color:scopeCol(se.scope),pts:d.pts,note:d.gran!==TS.gran?'by outing':''}});
    return lineChart(mt,ser);
  }).join('');
  return `<div class="tctl">
      <label>Scope <select id="tScope">${sOpts}</select></label>
      <label>Data point <select id="tMet">${grp('grade','Grades')}${grp('trait','Pitch traits')}${grp('rate','Outcomes')}</select></label>
      <button class="btn" id="tAdd" type="button">Add to chart</button>
    </div>
    <div class="tags">${tags||'<span class="meta">No data points selected</span>'}</div>
    <div class="segs" role="group" aria-label="Timeline granularity">${gb}</div>
    ${charts}`;
}
/* compare */
const sdCache={};
function metricSd(m,s,k){
  const id=s+'|'+k;if(id in sdCache)return sdCache[id];
  const v=m.games.map(g=>{const n=scopePitches(g,s).length;return (METK[k]?.type==='grade'||n>=5)?outingValue(g,s,k):null}).filter(x=>x!=null);
  return sdCache[id]=v.length>=4?sd(v):null;
}
function compareSection(m){
  const gs=m.games;
  if(!CMP.a||!gs.find(x=>x.date===CMP.a)){CMP.b=gs[gs.length-1].date;CMP.a=(gs[gs.length-2]||gs[0]).date}
  const A=gs.find(x=>x.date===CMP.a),B=gs.find(x=>x.date===CMP.b);
  const EMO={green:'🟢',yellow:'🟡',red:'🔴',off:'⚪'};
  const opt=sel=>gs.map(x=>`<option value="${x.date}" ${x.date===sel?'selected':''}>${EMO[x.eval.overall.s]} ${+x.date.slice(5,7)}/${+x.date.slice(8)} ${esc(x.opp)}${x.gs===0?' (R)':''}</option>`).join('');
  const labT=g=>`${+g.date.slice(5,7)}/${+g.date.slice(8)} ${g.opp}`;
  const lab=g=>`<span class="lt ${g.eval.overall.s}">${esc(labT(g))}</span>`;
  // lights grid
  const rowsL=[['overall','Full arsenal'],...m.arsenal.map(c=>[c,m.pname[c]])].map(([s,l])=>{
    const ea=s==='overall'?A.eval.overall:A.eval.pitches[s],eb=s==='overall'?B.eval.overall:B.eval.pitches[s];
    const gv=(g,s)=>{const v=gradeOf(g,s,'pit');return v==null?'—':v.toFixed(1)};
    return `<tr><td>${esc(l)}</td><td>${sig(ea.s,'sm',WORD[ea.s])} <b>${gv(A,s)}</b></td><td>${sig(eb.s,'sm',WORD[eb.s])} <b>${gv(B,s)}</b></td></tr>`}).join('');
  // discrepancies
  const diffs=[];
  const scopes=['overall','ALLP',...m.arsenal];
  for(const s of scopes)for(const mt of MET){
    if(!validScope(mt,s))continue;
    if(mt.type!=='grade'&&s!=='ALLP'&&(scopePitches(A,s).length<5||scopePitches(B,s).length<5)&&mt.k!=='usage')continue;
    const va=outingValue(A,s,mt.k),vb=outingValue(B,s,mt.k);if(va==null||vb==null)continue;
    const sdv=metricSd(m,s,mt.k);if(!sdv)continue;
    diffs.push({s,mt,va,vb,z:Math.abs(vb-va)/sdv});
  }
  diffs.sort((x,y)=>y.z-x.z);
  const top=diffs.slice(0,12);const zmax=Math.max(3,...top.map(d=>d.z));
  const rowsD=top.map((d,i)=>{const dv=d.vb-d.va;return `<tr class="${i<3?'hot':''}"><td><i class="dot" style="background:${scopeCol(d.s)}"></i>${esc(scopeName(m,d.s))}</td><td>${esc(d.mt.label)}</td><td>${fmtM(d.mt,d.va)}</td><td>${fmtM(d.mt,d.vb)}</td><td>${dv>=0?'+':'−'}${fmtM(d.mt,Math.abs(dv))}</td>
    <td class="zc"><div class="zbar"><span style="width:${(d.z/zmax*100).toFixed(1)}%"></span></div><small>${d.z.toFixed(1)} SD</small></td></tr>`}).join('');
  // line score
  const La=A.eval.result.line,Lb=B.eval.result.line;
  const ls=['IP','H','R','BB','K','HR','P'].map(k=>`<tr><td>${k==='P'?'Pitches':k}</td><td>${La[k]}</td><td>${Lb[k]}</td></tr>`).join('');
  return `<div class="tctl">
      <label>Outing A <select id="cA">${opt(CMP.a)}</select></label>
      <button class="btn" id="cSwap" type="button" aria-label="Swap outings">⇄</button>
      <label>Outing B <select id="cB">${opt(CMP.b)}</select></label>
    </div>
    <div class="cgrid">
      <div class="card"><h4>Biggest discrepancies <small>ranked by gap in his outing-to-outing standard deviations</small></h4>
        <div class="tblwrap"><table class="ctab dis"><thead><tr><th>Scope</th><th>Data point</th><th>${lab(A)}</th><th>${lab(B)}</th><th>B − A</th><th>Gap</th></tr></thead><tbody>${rowsD||'<tr><td colspan="6">No comparable data</td></tr>'}</tbody></table></div></div>
      <div class="cside">
        <div class="card"><h4>Lights · Pitching+</h4><table class="ctab"><thead><tr><th></th><th>${lab(A)}</th><th>${lab(B)}</th></tr></thead><tbody>${rowsL}</tbody></table></div>
        <div class="card"><h4>Line</h4><table class="ctab"><thead><tr><th></th><th>${lab(A)}</th><th>${lab(B)}</th></tr></thead><tbody>${ls}</tbody></table></div>
      </div>
    </div>
    <div class="card" style="margin-top:12px"><h4>Movement · average by pitch</h4>${moveCompare(A,B,m)}</div>`;
}
function moveCompare(A,B,m){
  const W=480,H=440,L=48,R=48,T=20,Bm=36,pw=W-L-R,ph=H-T-Bm;
  const X=v=>L+(Math.max(-25,Math.min(25,v))+25)/50*pw,Y=v=>T+(25-Math.max(-25,Math.min(25,v)))/50*ph;
  let s=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="var(--plate-in)" stroke="var(--plate-grid)"/>`;
  for(const v of[-12.5,12.5])s+=`<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${T+ph}" stroke="var(--plate-grid)" stroke-dasharray="5 4"/><line y1="${Y(v)}" y2="${Y(v)}" x1="${L}" x2="${L+pw}" stroke="var(--plate-grid)" stroke-dasharray="5 4"/>`;
  s+=`<line x1="${X(0)}" x2="${X(0)}" y1="${T}" y2="${T+ph}" stroke="var(--plate-zero)" stroke-width="2" stroke-dasharray="7 5"/><line y1="${Y(0)}" y2="${Y(0)}" x1="${L}" x2="${L+pw}" stroke="var(--plate-zero)" stroke-width="2" stroke-dasharray="7 5"/>`;
  for(const v of[-25,-12.5,0,12.5,25])s+=`<text x="${X(v)}" y="${T+ph+14}" text-anchor="middle" font-size="11" fill="var(--plate-ink)">${v}</text><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--plate-ink)">${v}</text>`;
  s+=`<text x="${L+pw/2}" y="${H-4}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--plate-ink)">Horizontal Break (in, pitcher's POV)</text>`;
  const codes=[...new Set([...Object.keys(A.byCode),...Object.keys(B.byCode)])];
  const av=(g,c)=>{const ps=(g.byCode[c]||[]).filter(p=>p.mx!=null);return ps.length?[mean(ps.map(p=>p.mx)),mean(ps.map(p=>p.my))]:null};
  for(const c of codes){const a=av(A,c),b=av(B,c),col=PCOL[c]||'#999';
    if(a&&b)s+=`<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="var(--plate-zero)" stroke-width="1.6" stroke-dasharray="3 3"/>`;
    if(a)s+=`<circle cx="${X(a[0])}" cy="${Y(a[1])}" r="9" fill="${col}" stroke="#111" stroke-width="2"><title>${esc(m.pname[c])} A: ${a[0].toFixed(1)}, ${a[1].toFixed(1)}</title></circle>`;
    if(b)s+=`<circle cx="${X(b[0])}" cy="${Y(b[1])}" r="8" fill="none" stroke="${col}" stroke-width="4"><title>${esc(m.pname[c])} B: ${b[0].toFixed(1)}, ${b[1].toFixed(1)}</title></circle><circle cx="${X(b[0])}" cy="${Y(b[1])}" r="10.5" fill="none" stroke="#111" stroke-width="1"/>`;
  }
  const lg=codes.map(c=>`<span><i style="background:${PCOL[c]||'#999'}"></i>${esc(m.pname[c])}</span>`).join('');
  const f=v=>v==null?'—':v.toFixed(1),dd=(a,b)=>(a==null||b==null)?'—':((b-a)>=0?'+':'')+(b-a).toFixed(1);
  const tb=codes.map(c=>{const a=av(A,c),b=av(B,c);return `<tr><td><i class="dot" style="background:${PCOL[c]||'#999'}"></i>${esc(m.pname[c])}</td><td>${f(a?.[0])}</td><td>${f(a?.[1])}</td><td>${f(b?.[0])}</td><td>${f(b?.[1])}</td><td>${dd(a?.[0],b?.[0])}</td><td>${dd(a?.[1],b?.[1])}</td></tr>`}).join('');
  return `<div class="mvc"><div class="plate"><div class="lg static">${lg}</div>
    <div class="symkey"><span><svg width="18" height="18"><circle cx="9" cy="9" r="7" fill="#999" stroke="#111" stroke-width="2"/></svg>Outing A</span><span><svg width="18" height="18"><circle cx="9" cy="9" r="6" fill="none" stroke="#999" stroke-width="3"/></svg>Outing B</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Average movement, outing A vs B">${s}</svg></div>
    <div class="tblwrap"><table class="ctab"><thead><tr><th>Pitch</th><th>A H</th><th>A V</th><th>B H</th><th>B V</th><th>ΔH</th><th>ΔV</th></tr></thead><tbody>${tb}</tbody></table></div></div>`;
}
function bindTC(m){
  const keep=fn=>()=>{const y=window.scrollY;fn();render();window.scrollTo(0,y)};
  const ts=$('#tScope'),tm=$('#tMet');if(!ts)return;
  tm.addEventListener('change',keep(()=>{TS.pickK=tm.value;if(!validScope(METK[TS.pickK],TS.pickScope))TS.pickScope=METK[TS.pickK].type==='grade'?'overall':(TS.pickK==='usage'?m.arsenal[0]:'ALLP')}));
  ts.addEventListener('change',()=>{TS.pickScope=ts.value});
  $('#tAdd').addEventListener('click',keep(()=>{TS.pickScope=ts.value;TS.pickK=tm.value;if(!validScope(METK[TS.pickK],TS.pickScope))return;if(!TS.series.some(x=>x.scope===TS.pickScope&&x.k===TS.pickK))TS.series.push({scope:TS.pickScope,k:TS.pickK})}));
  document.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',keep(()=>TS.series.splice(+b.dataset.rm,1))));
  document.querySelectorAll('[data-gran]').forEach(b=>b.addEventListener('click',keep(()=>TS.gran=b.dataset.gran)));
  $('#cA').addEventListener('change',keep(()=>CMP.a=$('#cA').value));
  $('#cB').addEventListener('change',keep(()=>CMP.b=$('#cB').value));
  $('#cSwap').addEventListener('click',keep(()=>{[CMP.a,CMP.b]=[CMP.b,CMP.a]}));
}

/* ---------- load ---------- */
/* Team logo: 1) a file named <TEAM>.png|.svg|.webp|.jpg next to index.html (or in assets/logos/) (shared with everyone who opens the site)
               2) otherwise, an image uploaded in the browser (remembered in this browser only) */
function showLogo(team,src){
  const h=$('#hlogo');h.style.backgroundImage=src?`url("${String(src).replace(/"/g,'%22')}")`:'none';
  const st=$('#logoSlotTxt'),sl=$('#logoSlot');
  if(st){st.textContent=src?`${team||'Team'} logo loaded · choose a file to replace`:`Choose an image for ${team||'the team'} (PNG or SVG)`;sl.classList.toggle('ok',!!src)}
}
function probe(url){return new Promise(res=>{const i=new Image();i.onload=()=>res(url);i.onerror=()=>res(null);i.src=url})}
let logoToken=0;
async function setLogo(team){
  const tok=++logoToken;
  let src=null;try{src=localStorage.getItem('logo:'+team)}catch(e){}
  if(src){showLogo(team,src);return}
  showLogo(team,null);
  const safe=String(team||'').replace(/[^A-Za-z0-9_-]/g,'');if(!safe)return;
  for(const path of['','assets/logos/'])for(const ext of['png','svg','webp','jpg']){
    const hit=await probe(`${path}${safe}.${ext}`);
    if(tok!==logoToken)return;
    if(hit){showLogo(team,hit);return}
  }
}
$('#logoSlot').addEventListener('click',()=>$('#logoFile').click());
$('#logoFile').addEventListener('change',e=>{
  const f=e.target.files[0];e.target.value='';if(!f||!M)return;const team=M.team;
  const rd=new FileReader();rd.onload=()=>{try{localStorage.setItem('logo:'+team,rd.result)}catch(err){console.warn('Logo too large to remember in this browser',err)}showLogo(team,rd.result)};rd.readAsDataURL(f);
});

function tryBuild(){
  const msg=$('#msg');
  if(!sources.savant){msg.className='msg';msg.textContent='Add the Baseball Savant pitch log to continue.';return}
  if(!sources.stf&&!sources.loc&&!sources.pit){msg.className='msg';msg.textContent='Add at least one FanGraphs game log to continue.';return}
  try{
    M=build();
    selDate=M.games[M.games.length-1].date;
    const missing=SLOTS.filter(s=>!sources[s[0]]).map(s=>({stf:'Stuff+',loc:'Location+',pit:'Pitching+'})[s[0]]);
    msg.className='msg';msg.textContent=`Loaded ${M.games.length} appearances.`+(missing.length?` Missing: ${missing.join(', ')} log.`:'');
    render();
  }catch(err){console.error(err);msg.className='msg err';msg.textContent='Could not build the dashboard: '+err.message}
}
function ingest(text,fname,forced){
  const p=parseCSV(text);const kind=classify(p.fields);
  const msg=$('#msg');
  if(!kind){msg.className='msg err';msg.textContent=`${fname} doesn't match any expected layout. Savant files need pitch_type and release_speed; FanGraphs logs need Stf+, Loc+ or Pit+ pitch columns.`;return false}
  if(forced&&forced!==kind){msg.className='msg';msg.textContent=`${fname} looks like a ${slotName(kind)} file, so it was placed there.`}
  sources[kind]={...p,name:fname};
  const el=document.querySelector(`.slot[data-slot="${kind}"]`);el.classList.add('ok');el.querySelector('span').textContent=`${fname} · ${p.rows.length} rows`;
  return true;
}
const slotName=k=>({savant:'Baseball Savant',stf:'Stuff+',loc:'Location+',pit:'Pitching+'})[k];
async function handleFiles(files,forced){
  const list=[...files];
  for(const f of list){const t=await f.text();ingest(t,f.name,forced)}
  tryBuild();
}
let forcedSlot=null;
document.querySelectorAll('.slot').forEach(s=>{
  s.addEventListener('click',()=>{forcedSlot=s.dataset.slot;$('#fileAny').click()});
  s.addEventListener('dragover',e=>{e.preventDefault();s.classList.add('drag')});
  s.addEventListener('dragleave',()=>s.classList.remove('drag'));
  s.addEventListener('drop',e=>{e.preventDefault();s.classList.remove('drag');handleFiles(e.dataTransfer.files,s.dataset.slot)});
});
$('#fileAny').addEventListener('change',e=>{handleFiles(e.target.files,forcedSlot);forcedSlot=null;e.target.value=''});
const drop=$('#drop');
drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag')});
drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');handleFiles(e.dataTransfer.files)});
$('#toggleUpload').addEventListener('click',()=>{const u=$('#upload');u.hidden=!u.hidden;$('#toggleUpload').setAttribute('aria-expanded',String(!u.hidden))});
/* Optional auto-load: if data/manifest.json exists (and the page is served over http/https),
   the four CSVs it lists are loaded on open. Otherwise the upload panel opens. */
async function autoLoad(){
  try{
    // manifest.json may sit next to index.html or inside a data/ folder; CSV paths are relative to it
    let base='',r=await fetch('manifest.json',{cache:'no-store'});
    if(!r.ok){base='data/';r=await fetch('data/manifest.json',{cache:'no-store'})}
    if(!r.ok)throw new Error('no manifest');
    const man=await r.json();
    const files=[man.savant,man.stuff,man.location,man.pitching].filter(Boolean);
    if(!files.length)throw new Error('empty manifest');
    for(const f of files){const res=await fetch(base+f,{cache:'no-store'});if(!res.ok)throw new Error('missing '+f);ingest(await res.text(),f)}
    tryBuild();
  }catch(err){
    const u=$('#upload');u.hidden=false;$('#toggleUpload').setAttribute('aria-expanded','true');render();
  }
}
autoLoad();
