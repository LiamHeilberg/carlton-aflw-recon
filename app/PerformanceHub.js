"use client";
import storage from "./storage";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine, Cell } from "recharts";
import * as Papa from "papaparse";

const C={navy:"#0C1B33",navyMid:"#162847",carltonNavy:"#0E1E2F",carltonSilver:"#A8B5C2",teal:"#2A9D8F",tealDark:"#21867A",tealLight:"#3DBDAD",coral:"#E76F51",coralLight:"#F4A261",gold:"#F4A261",green:"#22C55E",greenDark:"#16A34A",greenBg:"#DCFCE7",red:"#EF4444",redDark:"#DC2626",redBg:"#FEE2E2",amber:"#F59E0B",amberDark:"#D97706",amberBg:"#FEF3C7",blue:"#3B82F6",blueBg:"#DBEAFE",purple:"#8B5CF6",bg:"#F1F5F9",card:"#FFFFFF",text:"#0F172A",textMid:"#475569",textLight:"#94A3B8",border:"#E2E8F0",borderLight:"#F1F5F9",shadow:"0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)"};

// ═══════════════════════════════════════════════════════════════════
// METRIC REGISTRY — every ForceDecks metric that can exist
// Each metric has: id, category, display name, unit, bilateral flag
// These are auto-toggled on when data is imported
// ═══════════════════════════════════════════════════════════════════
const METRIC_REGISTRY = [
  // CMJ
  {id:"cmj_jh",cat:"CMJ",name:"Jump Height",unit:"cm",bi:false},
  {id:"cmj_rsi_mod",cat:"CMJ",name:"RSI-modified",unit:"m/s",bi:false},
  {id:"cmj_ct",cat:"CMJ",name:"Contraction Time",unit:"ms",bi:false},
  {id:"cmj_cmd",cat:"CMJ",name:"Countermovement Depth",unit:"cm",bi:false},
  {id:"cmj_con_pf_bm",cat:"CMJ",name:"Concentric Peak Force/BM",unit:"N/kg",bi:false},
  {id:"cmj_fzv_bm",cat:"CMJ",name:"Force at Zero Velocity/BM",unit:"N/kg",bi:false},
  {id:"cmj_con_imp100",cat:"CMJ",name:"Concentric Impulse 100ms",unit:"N s",bi:false},
  {id:"cmj_con_pv",cat:"CMJ",name:"Concentric Peak Velocity",unit:"m/s",bi:false},
  {id:"cmj_ecc_pf_bm",cat:"CMJ",name:"Eccentric Peak Force/BM",unit:"N/kg",bi:false},
  {id:"cmj_ecc_dur",cat:"CMJ",name:"Eccentric Duration",unit:"ms",bi:false},
  {id:"cmj_ecc_rfd_bm",cat:"CMJ",name:"Eccentric Decel RFD/BM",unit:"N/s/kg",bi:false},
  {id:"cmj_ecc_pv",cat:"CMJ",name:"Eccentric Peak Velocity",unit:"m/s",bi:false},
  {id:"cmj_ft_ct",cat:"CMJ",name:"Flight Time:Contraction Time",unit:"ratio",bi:false},
  {id:"cmj_pp_bm",cat:"CMJ",name:"Peak Power/BM",unit:"W/kg",bi:false},
  {id:"cmj_ecc_imp_bm",cat:"CMJ",name:"Eccentric Decel Impulse/BM",unit:"N s/kg",bi:false},
  {id:"cmj_ecc_brk_asym",cat:"CMJ",name:"Ecc Braking Impulse Asym",unit:"%",bi:false},
  {id:"cmj_con_imp_asym",cat:"CMJ",name:"Concentric Impulse Asym",unit:"%",bi:false},
  {id:"cmj_ecc_pf_asym",cat:"CMJ",name:"Ecc Peak Force Asym",unit:"%",bi:false},
  {id:"cmj_ecc_rfd_asym",cat:"CMJ",name:"Ecc Decel RFD Asym",unit:"%",bi:false},
  // SL CMJ
  {id:"slcmj_jh",cat:"SL CMJ",name:"Jump Height",unit:"cm",bi:true},
  {id:"slcmj_rsi",cat:"SL CMJ",name:"mRSI",unit:"m/s",bi:true},
  {id:"slcmj_ct",cat:"SL CMJ",name:"Contraction Time",unit:"ms",bi:true},
  {id:"slcmj_pf",cat:"SL CMJ",name:"Peak Force",unit:"N",bi:true},
  {id:"slcmj_pf_bm",cat:"SL CMJ",name:"Peak Force/BM",unit:"N/kg",bi:true},
  {id:"slcmj_pp_bm",cat:"SL CMJ",name:"Peak Power/BM",unit:"W/kg",bi:true},
  {id:"slcmj_cmd",cat:"SL CMJ",name:"Countermovement Depth",unit:"cm",bi:true},
  {id:"slcmj_brk_rfd",cat:"SL CMJ",name:"Braking RFD",unit:"N/s",bi:true},
  {id:"slcmj_ecc_dur",cat:"SL CMJ",name:"Eccentric Duration",unit:"ms",bi:true},
  // Hop Tests
  {id:"dlhop_jh",cat:"DL Hop",name:"Jump Height",unit:"cm",bi:false},
  {id:"dlhop_rsi",cat:"DL Hop",name:"RSI",unit:"m/s",bi:false},
  {id:"dlhop_ct",cat:"DL Hop",name:"Contact Time",unit:"ms",bi:false},
  {id:"dlhop_pf",cat:"DL Hop",name:"Peak Force",unit:"N",bi:false},
  {id:"dlhop_ft_ct",cat:"DL Hop",name:"FT:CT Ratio",unit:"ratio",bi:false},
  {id:"slhop_jh",cat:"SL Hop",name:"Jump Height",unit:"cm",bi:true},
  {id:"slhop_rsi",cat:"SL Hop",name:"RSI",unit:"m/s",bi:true},
  {id:"slhop_ct",cat:"SL Hop",name:"Contact Time",unit:"ms",bi:true},
  {id:"slhop_pf",cat:"SL Hop",name:"Peak Force",unit:"N",bi:true},
  // Drop Jump
  {id:"dldj_jh",cat:"DL Drop Jump",name:"Jump Height",unit:"cm",bi:false},
  {id:"dldj_rsi",cat:"DL Drop Jump",name:"RSI",unit:"m/s",bi:false},
  {id:"dldj_ct",cat:"DL Drop Jump",name:"Contact Time",unit:"ms",bi:false},
  {id:"dldj_pf",cat:"DL Drop Jump",name:"Peak Landing Force",unit:"N",bi:false},
  {id:"dldj_stiff",cat:"DL Drop Jump",name:"Stiffness",unit:"N/m",bi:false},
  {id:"sldj_jh",cat:"SL Drop Jump",name:"Jump Height",unit:"cm",bi:true},
  {id:"sldj_rsi",cat:"SL Drop Jump",name:"RSI",unit:"m/s",bi:true},
  {id:"sldj_ct",cat:"SL Drop Jump",name:"Contact Time",unit:"ms",bi:true},
  {id:"sldj_pf",cat:"SL Drop Jump",name:"Peak Landing Force",unit:"N",bi:true},
  // Knee ISO
  {id:"knee_iso_pf",cat:"ISO - Knee",name:"Peak Force",unit:"N",bi:true},
  {id:"knee_iso_rpf",cat:"ISO - Knee",name:"Peak Force/BW",unit:"xBW",bi:true},
  {id:"knee_iso_f50",cat:"ISO - Knee",name:"Force at 50ms",unit:"N",bi:true},
  {id:"knee_iso_f100",cat:"ISO - Knee",name:"Force at 100ms",unit:"N",bi:true},
  {id:"knee_iso_f200",cat:"ISO - Knee",name:"Force at 200ms",unit:"N",bi:true},
  {id:"knee_iso_imp100",cat:"ISO - Knee",name:"Impulse 100ms",unit:"N s",bi:true},
  {id:"knee_iso_netpf",cat:"ISO - Knee",name:"Net Peak Force",unit:"N",bi:true},
  {id:"knee_iso_ttpf",cat:"ISO - Knee",name:"Time to Peak Force",unit:"s",bi:true},
  // Ankle ISO
  {id:"ankle_iso_pf",cat:"ISO - Ankle",name:"Peak Force",unit:"N",bi:true},
  {id:"ankle_iso_rpf",cat:"ISO - Ankle",name:"Peak Force/BW",unit:"xBW",bi:true},
  {id:"ankle_iso_f50",cat:"ISO - Ankle",name:"Force at 50ms",unit:"N",bi:true},
  {id:"ankle_iso_f100",cat:"ISO - Ankle",name:"Force at 100ms",unit:"N",bi:true},
  {id:"ankle_iso_f200",cat:"ISO - Ankle",name:"Force at 200ms",unit:"N",bi:true},
  {id:"ankle_iso_imp100",cat:"ISO - Ankle",name:"Impulse 100ms",unit:"N s",bi:true},
  {id:"ankle_iso_netpf",cat:"ISO - Ankle",name:"Net Peak Force",unit:"N",bi:true},
  {id:"ankle_iso_ttpf",cat:"ISO - Ankle",name:"Time to Peak Force",unit:"s",bi:true},
  // Hip ISO
  {id:"hip_iso_pf",cat:"ISO - Hip",name:"Peak Force",unit:"N",bi:true},
  {id:"hip_iso_rpf",cat:"ISO - Hip",name:"Peak Force/BW",unit:"xBW",bi:true},
  {id:"hip_iso_f50",cat:"ISO - Hip",name:"Force at 50ms",unit:"N",bi:true},
  {id:"hip_iso_f100",cat:"ISO - Hip",name:"Force at 100ms",unit:"N",bi:true},
  {id:"hip_iso_f200",cat:"ISO - Hip",name:"Force at 200ms",unit:"N",bi:true},
  {id:"hip_iso_imp100",cat:"ISO - Hip",name:"Impulse 100ms",unit:"N s",bi:true},
  {id:"hip_iso_netpf",cat:"ISO - Hip",name:"Net Peak Force",unit:"N",bi:true},
  {id:"hip_iso_ttpf",cat:"ISO - Hip",name:"Time to Peak Force",unit:"s",bi:true},
  // Calf ISO
  {id:"calf_iso_pf",cat:"ISO - Calf",name:"Peak Force",unit:"N",bi:true},
  {id:"calf_iso_rpf",cat:"ISO - Calf",name:"Peak Force/BW",unit:"xBW",bi:true},
  {id:"calf_iso_f50",cat:"ISO - Calf",name:"Force at 50ms",unit:"N",bi:true},
  {id:"calf_iso_f100",cat:"ISO - Calf",name:"Force at 100ms",unit:"N",bi:true},
  {id:"calf_iso_f200",cat:"ISO - Calf",name:"Force at 200ms",unit:"N",bi:true},
  {id:"calf_iso_imp100",cat:"ISO - Calf",name:"Impulse 100ms",unit:"N s",bi:true},
  {id:"calf_iso_netpf",cat:"ISO - Calf",name:"Net Peak Force",unit:"N",bi:true},
  {id:"calf_iso_ttpf",cat:"ISO - Calf",name:"Time to Peak Force",unit:"s",bi:true},
  // Rehab / Manual
  {id:"single_hop",cat:"Rehab & ROM",name:"Single Hop Test",unit:"cm",bi:true},
  {id:"triple_hop",cat:"Rehab & ROM",name:"Triple Hop Test",unit:"cm",bi:true},
  {id:"hip_ir_rom",cat:"Rehab & ROM",name:"Hip IR - ROM",unit:"deg",bi:true},
  {id:"ktw",cat:"Rehab & ROM",name:"Knee To Wall",unit:"cm",bi:true},
  {id:"eyes_closed_bal",cat:"Rehab & ROM",name:"Eyes Closed Balance",unit:"s",bi:true},
  {id:"calf_raise_cap",cat:"Rehab & ROM",name:"Calf Raise Capacity",unit:"reps",bi:true},
  {id:"tibial_er_rom",cat:"Rehab & ROM",name:"Tibial ER - ROM",unit:"deg",bi:true},
  {id:"vm_step_down",cat:"Rehab & ROM",name:"VM Step Down",unit:"/3",bi:true},
];

const METRIC_MAP = {};
METRIC_REGISTRY.forEach(m => { METRIC_MAP[m.id] = m; });

const CAT_COLORS={"CMJ":C.teal,"SL CMJ":"#0EA5E9","DL Hop":C.blue,"SL Hop":"#6366F1","DL Drop Jump":"#A855F7","SL Drop Jump":"#7C3AED","ISO - Knee":C.coral,"ISO - Ankle":"#F97316","ISO - Hip":"#EC4899","ISO - Calf":C.gold,"Rehab & ROM":C.green};

// ═══════════════════════════════════════════════════════════════════
// FORCEDECKS CSV PARSER
// ═══════════════════════════════════════════════════════════════════
function makeISOMap(pfx){return{"Peak Vertical Force [N] (L)":`${pfx}_pf_L`,"Peak Vertical Force [N] (R)":`${pfx}_pf_R`,"Peak Vertical Force / BW  (L)":`${pfx}_rpf_L`,"Peak Vertical Force / BW  (R)":`${pfx}_rpf_R`,"Peak Vertical Force / BW (L)":`${pfx}_rpf_L`,"Peak Vertical Force / BW (R)":`${pfx}_rpf_R`,"Peak Vertical Force / BM [N/kg] (L)":`${pfx}_rpf_L`,"Peak Vertical Force / BM [N/kg] (R)":`${pfx}_rpf_R`,"Force at 50ms [N] (L)":`${pfx}_f50_L`,"Force at 50ms [N] (R)":`${pfx}_f50_R`,"Force at 100ms [N] (L)":`${pfx}_f100_L`,"Force at 100ms [N] (R)":`${pfx}_f100_R`,"Force at 200ms [N] (L)":`${pfx}_f200_L`,"Force at 200ms [N] (R)":`${pfx}_f200_R`,"Absolute Impulse - 100ms [N s] (L)":`${pfx}_imp100_L`,"Absolute Impulse - 100ms [N s] (R)":`${pfx}_imp100_R`,"Peak Vertical Force (Net of BW) [N] (L)":`${pfx}_netpf_L`,"Peak Vertical Force (Net of BW) [N] (R)":`${pfx}_netpf_R`,"Start Time to Peak Force [s] (L)":`${pfx}_ttpf_L`,"Start Time to Peak Force [s] (R)":`${pfx}_ttpf_R`};}

const FD_MAPS={
  CMJ:{"Jump Height (Imp-Mom) [cm]":"cmj_jh","RSI-modified (Imp-Mom) [m/s]":"cmj_rsi_mod","Contraction Time [ms]":"cmj_ct","Countermovement Depth [cm]":"cmj_cmd","Concentric Peak Force / BM [N/kg]":"cmj_con_pf_bm","Force at Zero Velocity / BM [N/kg]":"cmj_fzv_bm","Concentric Impulse-100ms [N s]":"cmj_con_imp100","Concentric Peak Velocity [m/s]":"cmj_con_pv","Eccentric Peak Force / BM [N/kg]":"cmj_ecc_pf_bm","Eccentric Duration [ms]":"cmj_ecc_dur","Eccentric Deceleration RFD / BM [N/s/kg]":"cmj_ecc_rfd_bm","Eccentric Peak Velocity [m/s]":"cmj_ecc_pv","Flight Time:Contraction Time":"cmj_ft_ct","Peak Power / BM [W/kg]":"cmj_pp_bm","Eccentric Deceleration Impulse / BM [N s/kg]":"cmj_ecc_imp_bm","Eccentric Braking Impulse % (Asym) (%)":"cmj_ecc_brk_asym","Concentric Impulse % (Asym) (%)":"cmj_con_imp_asym","Eccentric Peak Force % (Asym) (%)":"cmj_ecc_pf_asym","Eccentric Deceleration RFD % (Asym) (%)":"cmj_ecc_rfd_asym"},
  SLCMJ:{"Jump Height (Imp-Mom) [cm] (L)":"slcmj_jh_L","Jump Height (Imp-Mom) [cm] (R)":"slcmj_jh_R","RSI-modified (Imp-Mom) [m/s] (L)":"slcmj_rsi_L","RSI-modified (Imp-Mom) [m/s] (R)":"slcmj_rsi_R","Contraction Time [ms] (L)":"slcmj_ct_L","Contraction Time [ms] (R)":"slcmj_ct_R","Peak Vertical Force [N] (L)":"slcmj_pf_L","Peak Vertical Force [N] (R)":"slcmj_pf_R","Peak Vertical Force / BM [N/kg] (L)":"slcmj_pf_bm_L","Peak Vertical Force / BM [N/kg] (R)":"slcmj_pf_bm_R","Peak Power / BM [W/kg] (L)":"slcmj_pp_bm_L","Peak Power / BM [W/kg] (R)":"slcmj_pp_bm_R","Countermovement Depth [cm] (L)":"slcmj_cmd_L","Countermovement Depth [cm] (R)":"slcmj_cmd_R","Eccentric Deceleration RFD [N/s] (L)":"slcmj_brk_rfd_L","Eccentric Deceleration RFD [N/s] (R)":"slcmj_brk_rfd_R","Braking RFD [N/s] (L)":"slcmj_brk_rfd_L","Braking RFD [N/s] (R)":"slcmj_brk_rfd_R","Eccentric Duration [ms] (L)":"slcmj_ecc_dur_L","Eccentric Duration [ms] (R)":"slcmj_ecc_dur_R"},
  DLHOP:{"Jump Height (Flight Time) [cm]":"dlhop_jh","Jump Height (Imp-Mom) [cm]":"dlhop_jh","RSI (Flight Time) [m/s]":"dlhop_rsi","RSI-modified (Imp-Mom) [m/s]":"dlhop_rsi","Contact Time [ms]":"dlhop_ct","Ground Contact Time [ms]":"dlhop_ct","Peak Vertical Force [N]":"dlhop_pf","Flight Time:Contraction Time":"dlhop_ft_ct","Flight Time:Contact Time":"dlhop_ft_ct"},
  SLHOP:{"Jump Height (Flight Time) [cm] (L)":"slhop_jh_L","Jump Height (Flight Time) [cm] (R)":"slhop_jh_R","Jump Height (Imp-Mom) [cm] (L)":"slhop_jh_L","Jump Height (Imp-Mom) [cm] (R)":"slhop_jh_R","RSI (Flight Time) [m/s] (L)":"slhop_rsi_L","RSI (Flight Time) [m/s] (R)":"slhop_rsi_R","Contact Time [ms] (L)":"slhop_ct_L","Contact Time [ms] (R)":"slhop_ct_R","Ground Contact Time [ms] (L)":"slhop_ct_L","Ground Contact Time [ms] (R)":"slhop_ct_R","Peak Vertical Force [N] (L)":"slhop_pf_L","Peak Vertical Force [N] (R)":"slhop_pf_R"},
  DLDJ:{"Jump Height (Flight Time) [cm]":"dldj_jh","Jump Height (Imp-Mom) [cm]":"dldj_jh","RSI (Flight Time) [m/s]":"dldj_rsi","Contact Time [ms]":"dldj_ct","Ground Contact Time [ms]":"dldj_ct","Peak Landing Force [N]":"dldj_pf","Peak Vertical Force [N]":"dldj_pf","Stiffness [N/m]":"dldj_stiff","Vertical Stiffness [N/m]":"dldj_stiff"},
  SLDJ:{"Jump Height (Flight Time) [cm] (L)":"sldj_jh_L","Jump Height (Flight Time) [cm] (R)":"sldj_jh_R","RSI (Flight Time) [m/s] (L)":"sldj_rsi_L","RSI (Flight Time) [m/s] (R)":"sldj_rsi_R","Contact Time [ms] (L)":"sldj_ct_L","Contact Time [ms] (R)":"sldj_ct_R","Peak Landing Force [N] (L)":"sldj_pf_L","Peak Landing Force [N] (R)":"sldj_pf_R","Peak Vertical Force [N] (L)":"sldj_pf_L","Peak Vertical Force [N] (R)":"sldj_pf_R"},
  RSKIP:makeISOMap("knee_iso"),RSAKP:makeISOMap("ankle_iso"),RSHIP:makeISOMap("hip_iso"),SLSEICR:makeISOMap("calf_iso"),
};

const FD_LABELS={CMJ:"CMJ",SLCMJ:"SL CMJ",DLHOP:"DL Hop",SLHOP:"SL Hop",DLDJ:"DL Drop Jump",SLDJ:"SL Drop Jump",RSKIP:"Knee ISO Push",RSAKP:"Ankle ISO Push",RSHIP:"Hip ISO Push",SLSEICR:"Seated Calf ISO"};

function parseFDDate(r){if(!r)return"";const p=r.trim().split("/");return p.length===3?`${p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`:r;}
function parseAsymVal(r){if(!r||typeof r!=="string")return null;const m=r.trim().match(/^([\d.]+)\s*(L|R)$/);return m?parseFloat(m[1]):parseFloat(r)||null;}

function parseSingleCSV(csvText){
  const result=Papa.parse(csvText,{header:true,skipEmptyLines:true});
  if(!result.data?.length)return{error:"Empty CSV"};
  const testType=(result.data[0]["Test Type"]||"").trim();
  if(!FD_MAPS[testType])return{error:`Unknown test type: "${testType}". Supported: ${Object.keys(FD_MAPS).join(", ")}`};
  const map=FD_MAPS[testType];
  const grouped={};
  for(const row of result.data){
    const name=(row["Name"]||"").trim(),date=parseFDDate((row["Date"]||"").trim());
    if(!name||!date)continue;
    const key=`${name}|||${date}`;
    if(!grouped[key])grouped[key]={name,date,row};
  }
  const entries=[];
  for(const{name,date,row}of Object.values(grouped)){
    const data={};
    for(const[csvCol,appField]of Object.entries(map)){
      let val=null;for(const f of result.meta.fields){if(f.trim()===csvCol){val=row[f];break;}}
      if(val==null||val==="")continue;
      val=String(val).trim();
      if(csvCol.includes("(Asym)")){const n=parseAsymVal(val);if(n!==null)data[appField]=n;}
      else{const n=parseFloat(val);if(!isNaN(n))data[appField]=csvCol.toLowerCase().includes("depth")?Math.abs(n):n;}
    }
    entries.push({name,date,data});
  }
  return{testType,label:FD_LABELS[testType]||testType,entries};
}

function parseMultipleCSVs(fileTexts){
  const allEntries=[];const testTypes=[];const errors=[];
  for(const{text,fileName}of fileTexts){
    const r=parseSingleCSV(text);
    if(r.error){errors.push(`${fileName}: ${r.error}`);continue;}
    testTypes.push(r.label);
    allEntries.push(...r.entries);
  }
  // Merge by athlete+date
  const merged={};
  for(const{name,date,data}of allEntries){
    if(!merged[name])merged[name]={};
    if(!merged[name][date])merged[name][date]={date};
    Object.assign(merged[name][date],data);
  }
  const byAthlete={};
  for(const[name,dates]of Object.entries(merged)){
    byAthlete[name]=Object.values(dates).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  }
  // Discover all metric IDs present
  const metricIds=new Set();
  for(const sessions of Object.values(byAthlete)){
    for(const s of sessions){
      for(const k of Object.keys(s)){
        if(k==="date"||k==="notes")continue;
        // Strip _L/_R suffix to get base metric id
        const base=k.replace(/_[LR]$/,"");
        metricIds.add(base);
      }
    }
  }
  return{byAthlete,athletes:Object.keys(byAthlete),testTypes:[...new Set(testTypes)],errors,metricIds:[...metricIds],totalSessions:allEntries.length};
}

// ─── Utilities ────────────────────────────────────────────────────
const calcLSI=(l,r)=>{if(!l||!r)return null;return Math.round((Math.min(l,r)/Math.max(l,r))*100);};
const calcAsym=(l,r)=>{if(!l||!r)return null;const h=Math.max(l,r);return h===0?0:Math.round(Math.abs(l-r)/h*1000)/10;};
const getStatus=p=>p===null?"none":p<=10?"normal":p<=15?"monitor":"flag";
const sSt={flag:{bg:C.redBg,c:C.redDark},monitor:{bg:C.amberBg,c:C.amberDark},normal:{bg:C.greenBg,c:C.greenDark}};

// ─── Micro Components ─────────────────────────────────────────────
const Card=({children,style,...p})=><div style={{background:C.card,borderRadius:14,padding:20,border:`1px solid ${C.border}`,boxShadow:C.shadow,...style}} {...p}>{children}</div>;
const Pill=({status,value})=>{if(!status||status==="none")return null;const s=sSt[status];return<span style={{background:s.bg,color:s.c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{status==="flag"?"Flag":status==="monitor"?"Monitor":"Normal"}{value!=null?` ${value}%`:""}</span>;};
const LSIPill=({lsi,side})=>{if(lsi===null)return null;const ok=lsi>=90,mid=lsi>=85;return<span style={{background:ok?C.greenBg:mid?C.amberBg:C.redBg,color:ok?C.greenDark:mid?C.amberDark:C.redDark,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>LSI: {lsi}%{side?` (${side} lower)`:""}</span>;};
const Toggle=({on,onToggle,size=20})=>(<div onClick={e=>{e.stopPropagation();onToggle();}} style={{width:size*2,height:size,borderRadius:size,background:on?C.teal:C.border,cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}><div style={{width:size-4,height:size-4,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:on?size+2:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></div>);
const Btn=({children,primary,danger,small,accent,style,...p})=>(<button style={{padding:small?"6px 14px":"10px 20px",borderRadius:10,border:primary||danger||accent?"none":`1px solid ${C.border}`,background:primary?C.carltonNavy:danger?C.redBg:accent?C.teal:"#fff",color:primary||accent?"#fff":danger?C.redDark:C.text,fontWeight:600,fontSize:small?12:13,cursor:"pointer",...style}} {...p}>{children}</button>);
const SectionHead=({title,color,count})=>(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,marginTop:28}}><div style={{width:10,height:10,borderRadius:"50%",background:color||C.teal}}/><h3 style={{margin:0,fontSize:17,fontWeight:700,color:C.carltonNavy}}>{title}</h3>{count!=null&&<span style={{fontSize:11,color:C.textLight,background:C.bg,padding:"2px 8px",borderRadius:10}}>{count}</span>}</div>);
function Modal({title,onClose,children,wide}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",justifyContent:"center",alignItems:"flex-start",zIndex:200,backdropFilter:"blur(2px)",overflowY:"auto",padding:"40px 16px"}} onClick={onClose}><Card style={{width:wide?620:360,padding:28,maxWidth:"100%"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontWeight:700,fontSize:18,color:C.carltonNavy}}>{title}</span><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.textLight,padding:4}}>✕</button></div>{children}</Card></div>);}

// ─── Multi-CSV Importer ──────────────────────────────────────────
function CSVImporter({onImport,onClose,existingAthletes}){
  const[dragOver,setDragOver]=useState(false);const[parsed,setParsed]=useState(null);const[errors,setErrors]=useState([]);const[fileList,setFileList]=useState([]);const[selAthletes,setSelAthletes]=useState({});const fileRef=useRef();
  const handleFiles=files=>{
    if(!files?.length)return;setErrors([]);
    const readers=[];
    for(const f of files){
      readers.push(new Promise(res=>{const r=new FileReader();r.onload=e=>res({text:e.target.result,fileName:f.name});r.readAsText(f);}));
    }
    Promise.all(readers).then(results=>{
      setFileList(results.map(r=>r.fileName));
      const res=parseMultipleCSVs(results);
      if(res.errors.length&&!res.athletes.length){setErrors(res.errors);return;}
      if(res.errors.length)setErrors(res.errors);
      setParsed(res);
      const s={};res.athletes.forEach(a=>{s[a]=true;});setSelAthletes(s);
    });
  };
  const doImport=()=>{if(!parsed)return;const ath={};for(const[name,sess]of Object.entries(parsed.byAthlete)){if(!selAthletes[name])continue;ath[name]=sess;}onImport(ath,parsed.testTypes,parsed.metricIds);};
  const totalSel=Object.values(selAthletes).filter(Boolean).length;
  return(<Modal title="Import ForceDecks CSV" onClose={onClose} wide>{!parsed?(<>
    <div onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer?.files);}} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${dragOver?C.teal:C.border}`,borderRadius:12,padding:40,textAlign:"center",cursor:"pointer",background:dragOver?"#F0FDFA":C.bg}}>
      <div style={{fontSize:36,marginBottom:8}}>📄</div>
      <div style={{fontWeight:600,color:C.text,marginBottom:4}}>Drop one or more ForceDecks CSVs here</div>
      <div style={{fontSize:11,color:C.textLight,lineHeight:1.6}}>Select multiple files at once — CMJ, SL CMJ, Knee ISO, etc.<br/>Same-day sessions are merged into one entry per athlete.</div>
      <input ref={fileRef} type="file" accept=".csv" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
    </div>
    {errors.length>0&&<div style={{marginTop:12,padding:12,borderRadius:8,background:C.redBg,color:C.redDark,fontSize:12}}>{errors.map((e,i)=><div key={i}>{e}</div>)}</div>}
  </>):(<>
    <Card style={{background:"#F0FDFA",borderColor:C.teal,marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>✅</span><div><div style={{fontWeight:700,color:C.carltonNavy}}>{fileList.length} file{fileList.length>1?"s":""} parsed</div><div style={{fontSize:12,color:C.textMid}}>Types: <b>{parsed.testTypes.join(", ")}</b> • {parsed.totalSessions} total sessions • {parsed.metricIds.length} metrics found</div></div></div></Card>
    {errors.length>0&&<div style={{marginBottom:12,padding:10,borderRadius:8,background:C.amberBg,color:C.amberDark,fontSize:11}}>{errors.map((e,i)=><div key={i}>⚠ {e}</div>)}</div>}
    <div style={{fontWeight:700,fontSize:14,color:C.carltonNavy,marginBottom:8}}>Athletes</div>
    {parsed.athletes.map(name=>{const sess=parsed.byAthlete[name];const exists=existingAthletes.includes(name);const dates=sess.map(s=>s.date).sort();const metricsInSess=sess.reduce((c,s)=>c+Object.keys(s).filter(k=>k!=="date"&&k!=="notes").length,0);
      return(<div key={name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.borderLight}`}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontWeight:600}}>{name}</span>{exists&&<span style={{fontSize:10,background:C.amberBg,color:C.amberDark,padding:"1px 6px",borderRadius:4}}>Will merge</span>}</div><div style={{fontSize:11,color:C.textLight,marginTop:2}}>{sess.length} session{sess.length>1?"s":""} • {metricsInSess} data points • {dates[0]} → {dates[dates.length-1]}</div></div><Toggle on={!!selAthletes[name]} onToggle={()=>setSelAthletes(p=>({...p,[name]:!p[name]}))}/></div>);})}
    <div style={{display:"flex",gap:8,marginTop:20}}><Btn style={{flex:1}} onClick={()=>{setParsed(null);setErrors([]);setFileList([]);}}>← Back</Btn><Btn accent style={{flex:2}} onClick={doImport}>Import {totalSel} athlete{totalSel!==1?"s":""}</Btn></div>
  </>)}</Modal>);
}

// ─── Display Cards ───────────────────────────────────────────────
function BilateralCard({m,data,pb,prev}){const l=data?.[`${m.id}_L`],r=data?.[`${m.id}_R`];if(l==null&&r==null)return null;const lsi=calcLSI(l,r),lo=l<r?"L":l>r?"R":null;
  const S=({label,val,isLo,pbV,pv})=>{const d=val!=null&&pv!=null?val-pv:null;return(<div style={{flex:1,background:isLo?"#FEF2F2":"#F0FDF4",borderRadius:10,padding:14,border:`1px solid ${isLo?"#FECACA":"#BBF7D0"}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:11,color:C.textLight,fontWeight:700,letterSpacing:.5}}>{label}</span>{isLo&&<span style={{fontSize:10,background:C.coral,color:"#fff",padding:"1px 8px",borderRadius:6,fontWeight:600}}>Lower</span>}</div><div style={{fontSize:26,fontWeight:800,color:C.text}}>{val??'—'} <span style={{fontSize:12,fontWeight:400,color:C.textLight}}>{m.unit}</span></div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:4}}>{pbV!=null&&<span style={{fontSize:10,color:C.textLight}}>PB: {pbV}</span>}{d!=null&&d!==0&&<span style={{fontSize:10,fontWeight:600,color:d>0?C.greenDark:C.redDark}}>{d>0?"▲":"▼"} {Math.abs(Math.round(d*10)/10)}</span>}</div></div>);};
  return(<Card style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontWeight:600,fontSize:14,color:C.text}}>{m.cat} — {m.name}</span><LSIPill lsi={lsi} side={lo}/></div><div style={{display:"flex",gap:10}}><S label="LEFT" val={l} isLo={lo==="L"} pbV={pb?.[`${m.id}_L`]} pv={prev?.[`${m.id}_L`]}/><S label="RIGHT" val={r} isLo={lo==="R"} pbV={pb?.[`${m.id}_R`]} pv={prev?.[`${m.id}_R`]}/></div></Card>);}

function UnilateralCard({m,data,pb,prev}){const v=data?.[m.id];if(v==null)return null;const d=v!=null&&prev?.[m.id]!=null?v-prev[m.id]:null;
  return(<Card style={{marginBottom:10}}><span style={{fontWeight:600,fontSize:14,color:C.text}}>{m.cat} — {m.name}</span><div style={{fontSize:30,fontWeight:800,color:C.text,marginTop:6}}>{v} <span style={{fontSize:12,fontWeight:400,color:C.textLight}}>{m.unit}</span></div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:4}}>{pb?.[m.id]!=null&&<span style={{fontSize:10,color:C.textLight}}>PB: {pb[m.id]}</span>}{d!=null&&d!==0&&<span style={{fontSize:10,fontWeight:600,color:d>0?C.greenDark:C.redDark}}>{d>0?"▲":"▼"} {Math.abs(Math.round(d*10)/10)}</span>}</div></Card>);}

function QuadrantChart({title,subtitle,xLabel,yLabel,xKey,yKey,sessions,quadrants}){const data=sessions.map((s,i)=>({x:s[xKey],y:s[yKey],date:s.date,i})).filter(d=>d.x!=null&&d.y!=null);if(data.length===0)return null;const latest=data[data.length-1],xs=data.map(d=>d.x),ys=data.map(d=>d.y);const xMid=(Math.min(...xs)+Math.max(...xs))/2,yMid=(Math.min(...ys)+Math.max(...ys))/2;const qi=latest.x>=xMid&&latest.y>=yMid?1:latest.x<xMid&&latest.y>=yMid?0:latest.x>=xMid?3:2;const qC=[C.redBg,C.greenBg,C.redBg,C.blueBg],qT=[C.coral,C.greenDark,C.redDark,C.blue];
  return(<Card style={{flex:1,minWidth:300,marginBottom:12}}><div style={{fontWeight:700,fontSize:15,color:C.carltonNavy}}>{title}</div><div style={{fontSize:11,color:C.textLight,marginBottom:10}}>{subtitle||`${xLabel} vs ${yLabel}`}</div><ResponsiveContainer width="100%" height={200}><ScatterChart margin={{top:16,right:8,bottom:8,left:8}}><CartesianGrid strokeDasharray="3 3" stroke={C.borderLight}/><XAxis type="number" dataKey="x" domain={['auto','auto']} tick={{fontSize:9}} stroke={C.border}/><YAxis type="number" dataKey="y" domain={['auto','auto']} tick={{fontSize:9}} stroke={C.border}/><ReferenceLine x={xMid} stroke={C.textLight} strokeDasharray="5 5" strokeOpacity={.5}/><ReferenceLine y={yMid} stroke={C.textLight} strokeDasharray="5 5" strokeOpacity={.5}/><Tooltip content={({payload})=>{if(!payload?.[0])return null;const d=payload[0].payload;return<div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:8,fontSize:11}}><div style={{fontWeight:700}}>{d.date}</div><div>{xLabel}: {d.x}</div><div>{yLabel}: {d.y}</div></div>;}}/><Scatter data={data}>{data.map((e,i)=><Cell key={i} fill={i===data.length-1?C.carltonNavy:C.carltonSilver} r={i===data.length-1?6:3.5} opacity={i===data.length-1?1:.45}/>)}</Scatter></ScatterChart></ResponsiveContainer>{latest&&quadrants&&<div style={{marginTop:6,padding:"6px 10px",borderRadius:8,background:qC[qi],fontSize:12,fontWeight:700,color:qT[qi]}}>{quadrants[qi]} ✓</div>}</Card>);}

function AsymRow({name,l,r}){const a=calcAsym(l,r);if(a===null)return null;const s=getStatus(a),total=l+r,lp=total>0?(l/total)*100:50;return(<div style={{display:"flex",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.borderLight}`,gap:6}}><div style={{flex:2.5,fontSize:11,color:C.text,fontWeight:500,minWidth:160}}>{name}</div><div style={{flex:2,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9,color:C.textLight,width:48,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>L: {l}</span><div style={{flex:1,height:7,borderRadius:4,background:C.borderLight,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",left:0,top:0,bottom:0,width:`${lp}%`,background:s==="flag"?C.red:s==="monitor"?C.amber:C.green,borderRadius:4}}/></div><span style={{fontSize:9,color:C.textLight,width:48,fontVariantNumeric:"tabular-nums"}}>R: {r}</span></div><Pill status={s} value={a}/></div>);}

// ─── Metric Config (toggle which metrics show on dashboard) ──────
function MetricConfig({visibleMetrics,onUpdate,allDataMetrics}){
  const[search,setSearch]=useState("");
  // Group all known metrics by category, mark which have data
  const grouped={};
  for(const m of METRIC_REGISTRY){
    if(search&&!m.name.toLowerCase().includes(search.toLowerCase())&&!m.cat.toLowerCase().includes(search.toLowerCase()))continue;
    if(!grouped[m.cat])grouped[m.cat]=[];
    grouped[m.cat].push({...m,hasData:allDataMetrics.has(m.id)});
  }
  const toggleMetric=id=>{const s=new Set(visibleMetrics);s.has(id)?s.delete(id):s.add(id);onUpdate([...s]);};
  const toggleCat=cat=>{const ms=METRIC_REGISTRY.filter(m=>m.cat===cat);const allOn=ms.every(m=>visibleMetrics.includes(m.id));const s=new Set(visibleMetrics);ms.forEach(m=>allOn?s.delete(m.id):s.add(m.id));onUpdate([...s]);};
  return(<div><div style={{position:"sticky",top:92,zIndex:80,background:C.bg,paddingBottom:12}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search metrics..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box",background:"#fff"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,flexWrap:"wrap",gap:8}}><span style={{fontSize:12,color:C.textLight}}>{visibleMetrics.length} shown on dashboard • {allDataMetrics.size} have data</span><div style={{display:"flex",gap:6}}><Btn small onClick={()=>onUpdate([...allDataMetrics])}>Show All with Data</Btn><Btn small onClick={()=>onUpdate([])}>Hide All</Btn></div></div></div>
    {Object.entries(grouped).map(([cat,ms])=>{const allOn=ms.every(m=>visibleMetrics.includes(m.id));return(<Card key={cat} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,cursor:"pointer"}} onClick={()=>toggleCat(cat)}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:CAT_COLORS[cat]||C.purple}}/><span style={{fontWeight:700,fontSize:14,color:C.carltonNavy}}>{cat}</span><span style={{fontSize:11,color:C.textLight}}>{ms.filter(m=>visibleMetrics.includes(m.id)).length}/{ms.length}</span></div><Toggle on={allOn} onToggle={()=>toggleCat(cat)}/></div>{ms.map(m=>(<div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0 6px 18px",borderTop:`1px solid ${C.borderLight}`,gap:8}}><div style={{flex:1,minWidth:0}}><span style={{fontSize:12,color:m.hasData?C.text:C.textLight}}>{m.name}</span><span style={{fontSize:10,color:C.textLight,marginLeft:6}}>{m.unit}{m.bi?" • L/R":""}</span>{!m.hasData&&<span style={{fontSize:9,color:C.textLight,marginLeft:6}}>(no data)</span>}</div><Toggle on={visibleMetrics.includes(m.id)} onToggle={()=>toggleMetric(m.id)} size={18}/></div>))}</Card>);})}</div>);
}

// ─── Manual Input Form ───────────────────────────────────────────
function InputForm({visibleMetrics,onSave,existingData}){
  const metrics=METRIC_REGISTRY.filter(m=>visibleMetrics.includes(m.id));
  const grouped={};metrics.forEach(m=>{if(!grouped[m.cat])grouped[m.cat]=[];grouped[m.cat].push(m);});
  const[form,setForm]=useState(existingData||{date:new Date().toISOString().split("T")[0]});
  const[notes,setNotes]=useState(existingData?.notes||"");
  const set=(k,v)=>setForm(p=>({...p,[k]:v===""?undefined:isNaN(parseFloat(v))?v:parseFloat(v)}));
  return(<div><Card style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:14,color:C.carltonNavy,marginBottom:8}}>Session Date</div><input type="date" value={form.date||""} onChange={e=>set("date",e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,width:"100%",boxSizing:"border-box"}}/></Card>
    {Object.entries(grouped).map(([cat,ms])=>(<Card key={cat} style={{marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><div style={{width:8,height:8,borderRadius:"50%",background:CAT_COLORS[cat]||C.purple}}/><span style={{fontWeight:700,fontSize:14,color:C.carltonNavy}}>{cat}</span></div>{ms.map(m=>(<div key={m.id} style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:4}}>{m.name} <span style={{color:C.textLight,fontWeight:400}}>({m.unit})</span></div>{m.bi?(<div style={{display:"flex",gap:8}}><input type="number" step="any" placeholder="Left" value={form[`${m.id}_L`]??""} onChange={e=>set(`${m.id}_L`,e.target.value)} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13}}/><input type="number" step="any" placeholder="Right" value={form[`${m.id}_R`]??""} onChange={e=>set(`${m.id}_R`,e.target.value)} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13}}/></div>):(<input type="number" step="any" placeholder="Value" value={form[m.id]??""} onChange={e=>set(m.id,e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box"}}/>)}</div>))}</Card>))}
    <Card style={{marginBottom:14}}><div style={{fontWeight:700,fontSize:14,color:C.carltonNavy,marginBottom:8}}>Notes</div><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Key takeaways..." style={{width:"100%",minHeight:80,padding:10,borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/></Card>
    <Btn primary style={{width:"100%",padding:"14px 0",fontSize:15}} onClick={()=>onSave({...form,notes})}>Save Session</Btn></div>);
}

// ═══════════════════ MAIN APP ═══════════════════
export default function App(){
  const[view,setView]=useState("dashboard");
  const[athletes,setAthletes]=useState({});
  const[cur,setCur]=useState("");
  const[visibleMetrics,setVisibleMetrics]=useState(["cmj_jh","cmj_rsi_mod","cmj_ct","cmj_cmd","cmj_con_pf_bm","cmj_ecc_pf_bm","cmj_ecc_rfd_bm","cmj_ft_ct","cmj_pp_bm","slcmj_jh","slcmj_rsi","slcmj_pf","slcmj_brk_rfd","knee_iso_pf","knee_iso_f100","knee_iso_f200","ankle_iso_pf","ankle_iso_f100","ankle_iso_f200","hip_iso_pf","hip_iso_f100","hip_iso_f200","calf_iso_pf","calf_iso_f100","calf_iso_f200"]);
  const[showAdd,setShowAdd]=useState(false);const[showImport,setShowImport]=useState(false);const[newName,setNewName]=useState("");const[loading,setLoading]=useState(true);const[editIdx,setEditIdx]=useState(null);const[toast,setToast]=useState(null);

  useEffect(()=>{(async()=>{try{const r=await storage.get("carlton-recon-v5");if(r?.value){const d=JSON.parse(r.value);setAthletes(d.a||{});setCur(d.c||"");if(d.v?.length)setVisibleMetrics(d.v);}}catch(e){}setLoading(false);})();},[]);
  const persist=useCallback(async(a,c,v)=>{try{await storage.set("carlton-recon-v5",JSON.stringify({a,c,v}));}catch(e){}},[]);
  const updateVisible=v=>{setVisibleMetrics(v);persist(athletes,cur,v);};
  const addAthlete=()=>{if(!newName.trim())return;const n=newName.trim(),u={...athletes,[n]:athletes[n]||[]};setAthletes(u);setCur(n);setNewName("");setShowAdd(false);persist(u,n,visibleMetrics);};
  const removeAthlete=()=>{const u={...athletes};delete u[cur];const next=Object.keys(u)[0]||"";setAthletes(u);setCur(next);persist(u,next,visibleMetrics);};
  const saveSession=data=>{const ss=[...(athletes[cur]||[])];if(editIdx!==null)ss[editIdx]=data;else ss.push(data);ss.sort((a,b)=>(a.date||"").localeCompare(b.date||""));const u={...athletes,[cur]:ss};setAthletes(u);persist(u,cur,visibleMetrics);setView("dashboard");setEditIdx(null);};
  const delSession=i=>{const ss=[...(athletes[cur]||[])];ss.splice(i,1);const u={...athletes,[cur]:ss};setAthletes(u);persist(u,cur,visibleMetrics);};

  const handleCSVImport=(imported,testTypes,metricIds)=>{
    const updated={...athletes};let totalNew=0;
    for(const[name,newSess]of Object.entries(imported)){
      const existing=updated[name]||[];
      // Merge by date — combine metrics from multiple test types
      const byDate={};existing.forEach(s=>{byDate[s.date]={...s};});
      for(const s of newSess){
        if(byDate[s.date])Object.assign(byDate[s.date],s);
        else{byDate[s.date]=s;totalNew++;}
      }
      updated[name]=Object.values(byDate).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
    }
    const first=Object.keys(imported)[0]||cur;
    setAthletes(updated);if(!cur&&first)setCur(first);
    // Auto-enable imported metrics on dashboard
    const newVisible=new Set(visibleMetrics);metricIds.forEach(id=>newVisible.add(id));
    setVisibleMetrics([...newVisible]);
    persist(updated,cur||first,[...newVisible]);
    setShowImport(false);
    setToast(`✅ Imported ${testTypes.join(" + ")} for ${Object.keys(imported).length} athlete${Object.keys(imported).length>1?"s":""}`);
    setTimeout(()=>setToast(null),5000);
  };

  const sessions=athletes[cur]||[],latest=sessions[sessions.length-1]||{},prev=sessions.length>=2?sessions[sessions.length-2]:null;
  const pbs=useMemo(()=>{const pb={};for(const s of sessions)for(const[k,v]of Object.entries(s)){if(k==="date"||k==="notes")continue;const n=parseFloat(v);if(!isNaN(n)&&(pb[k]===undefined||n>pb[k]))pb[k]=n;}return pb;},[sessions]);

  // All metric IDs that have data for this athlete
  const allDataMetrics=useMemo(()=>{const s=new Set();for(const sess of sessions)for(const k of Object.keys(sess)){if(k==="date"||k==="notes")continue;s.add(k.replace(/_[LR]$/,""));}return s;},[sessions]);

  // Visible metrics grouped by category (only show those with data)
  const displayMetrics=useMemo(()=>{
    const grouped={};
    for(const id of visibleMetrics){
      const m=METRIC_MAP[id];if(!m)continue;
      const hasData=m.bi?(latest[`${id}_L`]!=null||latest[`${id}_R`]!=null):latest[id]!=null;
      if(!hasData)continue;
      if(!grouped[m.cat])grouped[m.cat]=[];
      grouped[m.cat].push(m);
    }
    return grouped;
  },[visibleMetrics,latest]);

  const asymmetries=useMemo(()=>{const list=[];for(const id of visibleMetrics){const m=METRIC_MAP[id];if(!m||!m.bi)continue;const l=latest[`${id}_L`],r=latest[`${id}_R`];if(l!=null&&r!=null)list.push({name:`${m.cat} — ${m.name}`,l,r,asym:calcAsym(l,r),status:getStatus(calcAsym(l,r))});}list.sort((a,b)=>b.asym-a.asym);return list;},[latest,visibleMetrics]);

  if(loading)return<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",fontFamily:"system-ui"}}><div style={{fontSize:16,color:C.carltonNavy,fontWeight:600}}>Loading...</div></div>;

  return(<div style={{fontFamily:"system-ui,-apple-system,sans-serif",background:C.bg,minHeight:"100vh",color:C.text}}>
    <div style={{background:`linear-gradient(135deg,${C.carltonNavy} 0%,#142338 100%)`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 10px rgba(0,0,0,0.2)"}}><div><div style={{color:"#fff",fontSize:15,fontWeight:800,letterSpacing:1.2}}>CARLTON AFLW</div><div style={{color:C.carltonSilver,fontSize:10,letterSpacing:2.5,marginTop:1}}>PERFORMANCE RECONDITIONING</div></div><div style={{display:"flex",gap:8,alignItems:"center"}}>{Object.keys(athletes).length>0&&<select value={cur} onChange={e=>{setCur(e.target.value);persist(athletes,e.target.value,visibleMetrics);}} style={{padding:"6px 10px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:12,cursor:"pointer"}}>{Object.keys(athletes).map(a=><option key={a} value={a} style={{color:"#000"}}>{a}</option>)}</select>}<Btn small style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff"}} onClick={()=>setShowAdd(true)}>+ Athlete</Btn><Btn small style={{background:C.teal,border:"none",color:"#fff"}} onClick={()=>setShowImport(true)}>📄 Import</Btn></div></div>
    {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:C.greenBg,color:C.greenDark,padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:13,zIndex:300,boxShadow:"0 4px 12px rgba(0,0,0,0.15)",border:`1px solid ${C.green}`,whiteSpace:"nowrap"}}>{toast}</div>}
    {showAdd&&<Modal title="Add Athlete" onClose={()=>{setShowAdd(false);setNewName("");}}><input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAthlete()} placeholder="Athlete name" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,boxSizing:"border-box",marginBottom:14}}/><div style={{display:"flex",gap:8}}><Btn style={{flex:1}} onClick={()=>{setShowAdd(false);setNewName("");}}>Cancel</Btn><Btn primary style={{flex:1}} onClick={addAthlete}>Add</Btn></div></Modal>}
    {showImport&&<CSVImporter onImport={handleCSVImport} onClose={()=>setShowImport(false)} existingAthletes={Object.keys(athletes)}/>}

    {!cur?(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"70vh",gap:16}}><div style={{width:80,height:80,borderRadius:20,background:C.carltonNavy,display:"flex",alignItems:"center",justifyContent:"center",color:C.carltonSilver,fontWeight:800,fontSize:14,textAlign:"center",lineHeight:1.2,padding:8}}>CARLTON<br/>AFLW</div><div style={{fontSize:18,fontWeight:700,color:C.carltonNavy}}>Performance Reconditioning Hub</div><div style={{fontSize:13,color:C.textLight,textAlign:"center",maxWidth:300}}>Import ForceDecks CSVs or add athletes manually.</div><div style={{display:"flex",gap:8}}><Btn primary onClick={()=>setShowAdd(true)}>+ Athlete</Btn><Btn accent onClick={()=>setShowImport(true)}>📄 Import CSVs</Btn></div></div>):(
    <><div style={{display:"flex",gap:0,background:"#fff",borderBottom:`1px solid ${C.border}`,position:"sticky",top:56,zIndex:90,overflowX:"auto"}}>{[{key:"dashboard",label:"📊 Dashboard"},{key:"input",label:"➕ Manual Entry"},{key:"metrics",label:"⚙️ Metrics"},{key:"history",label:"📋 History"}].map(t=>(<button key={t.key} onClick={()=>{setView(t.key);setEditIdx(null);}} style={{padding:"12px 18px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:view===t.key?C.carltonNavy:C.textLight,borderBottom:view===t.key?`3px solid ${C.teal}`:"3px solid transparent",whiteSpace:"nowrap"}}>{t.label}</button>))}</div>
    <div style={{maxWidth:820,margin:"0 auto",padding:"20px 16px",paddingBottom:60}}>
      {view==="dashboard"&&(<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}><div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${C.carltonNavy},#1a3050)`,display:"flex",alignItems:"center",justifyContent:"center",color:C.carltonSilver,fontWeight:800,fontSize:17}}>{cur.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div><div><div style={{fontSize:22,fontWeight:800,color:C.carltonNavy}}>{cur}</div><div style={{fontSize:12,color:C.textLight}}>{latest.date?`Latest: ${latest.date} • ${sessions.length} session${sessions.length!==1?"s":""} • ${allDataMetrics.size} metrics`:"No sessions yet"}</div></div></div><Btn small danger onClick={()=>{if(confirm(`Delete ${cur}?`))removeAthlete();}}>Delete</Btn></div>
        {sessions.length===0?(<Card style={{textAlign:"center",padding:48}}><div style={{fontSize:44,marginBottom:12,opacity:.4}}>📊</div><div style={{fontSize:15,fontWeight:600,color:C.carltonNavy,marginBottom:20}}>No testing data yet</div><div style={{display:"flex",gap:8,justifyContent:"center"}}><Btn accent onClick={()=>setShowImport(true)}>📄 Import CSVs</Btn><Btn primary onClick={()=>setView("input")}>+ Manual Entry</Btn></div></Card>):(<>
          {latest.notes&&<Card style={{marginBottom:20,borderLeft:`4px solid ${C.teal}`,background:"#F0FDFA"}}><div style={{fontWeight:700,fontSize:15,color:C.carltonNavy,marginBottom:6}}>Key Takeaways</div><div style={{fontSize:13,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{latest.notes}</div></Card>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy}}>Performance Results</div><Btn small onClick={()=>setView("metrics")}>⚙️ Configure Metrics</Btn></div>
          {Object.entries(displayMetrics).map(([cat,ms])=>(<div key={cat}><SectionHead title={cat} color={CAT_COLORS[cat]||C.purple} count={ms.length}/>{ms.map(m=>m.bi?<BilateralCard key={m.id} m={m} data={latest} pb={pbs} prev={prev}/>:<UnilateralCard key={m.id} m={m} data={latest} pb={pbs} prev={prev}/>)}</div>))}

          <div style={{fontWeight:700,fontSize:18,color:C.carltonNavy,marginTop:28,marginBottom:12}}>Jump Profiling</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><QuadrantChart title="Neuromuscular" xLabel="Peak Power/BM" yLabel="Jump Height" xKey="cmj_pp_bm" yKey="cmj_jh" sessions={sessions} quadrants={["Reactive","Explosive","Underpowered","Powerful"]}/><QuadrantChart title="CMJ Strategy" xLabel="RSI-mod" yLabel="Jump Height" xKey="cmj_rsi_mod" yKey="cmj_jh" sessions={sessions} quadrants={["High but Slow","Fast & High","Slow & Low","Fast but Low"]}/></div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><QuadrantChart title="Eccentric Profile" xLabel="Ecc RFD/BM" yLabel="Ecc PF/BM" xKey="cmj_ecc_rfd_bm" yKey="cmj_ecc_pf_bm" sessions={sessions} quadrants={["Fast but Weak","Strong & Fast","Low Capacity","Strong but Slow"]}/><QuadrantChart title="Reactive Strength" xLabel="Jump Height" yLabel="FT:CT" xKey="cmj_jh" yKey="cmj_ft_ct" sessions={sessions} quadrants={["Slow SSC","Complete","Develop","Fast SSC"]}/></div>

          <div style={{fontWeight:700,fontSize:18,color:C.carltonNavy,marginTop:28,marginBottom:12}}>ISO Joint Profiling</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><QuadrantChart title="Knee ISO" xLabel="Peak Force" yLabel="Force@200ms" xKey="_kpf" yKey="_kf2" sessions={sessions.map(s=>({...s,_kpf:s.knee_iso_pf_L&&s.knee_iso_pf_R?(s.knee_iso_pf_L+s.knee_iso_pf_R)/2:null,_kf2:s.knee_iso_f200_L&&s.knee_iso_f200_R?(s.knee_iso_f200_L+s.knee_iso_f200_R)/2:null}))} quadrants={["Fast but Weak","Strong & Fast","Low Capacity","Strong but Slow"]}/><QuadrantChart title="Ankle ISO" xLabel="Peak Force" yLabel="Force@200ms" xKey="_apf" yKey="_af2" sessions={sessions.map(s=>({...s,_apf:s.ankle_iso_pf_L&&s.ankle_iso_pf_R?(s.ankle_iso_pf_L+s.ankle_iso_pf_R)/2:null,_af2:s.ankle_iso_f200_L&&s.ankle_iso_f200_R?(s.ankle_iso_f200_L+s.ankle_iso_f200_R)/2:null}))} quadrants={["Fast but Weak","Strong & Fast","Low Capacity","Strong but Slow"]}/></div>

          {asymmetries.length>0&&(<><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginTop:32,marginBottom:12}}>Asymmetry Dashboard</div><Card><div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap"}}>{[["Normal (≤10%)",C.green],["Monitor (10-15%)",C.amber],["Flag (>15%)",C.red]].map(([l,c])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:c}}/><span style={{fontSize:10,color:C.textLight}}>{l}</span></div>))}</div><div style={{display:"flex",gap:12,marginBottom:12}}><span style={{fontSize:12,fontWeight:700,color:C.redDark}}>{asymmetries.filter(a=>a.status==="flag").length} Flag</span><span style={{fontSize:12,fontWeight:700,color:C.amberDark}}>{asymmetries.filter(a=>a.status==="monitor").length} Monitor</span><span style={{fontSize:12,fontWeight:700,color:C.greenDark}}>{asymmetries.filter(a=>a.status==="normal").length} Normal</span></div>{asymmetries.map((a,i)=><AsymRow key={i} name={a.name} l={a.l} r={a.r}/>)}</Card></>)}
        </>)}
      </>)}

      {view==="input"&&(<><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginBottom:4}}>{editIdx!==null?"Edit Session":"Manual Entry"}</div><div style={{fontSize:12,color:C.textLight,marginBottom:16}}>Only visible metrics shown • <span style={{color:C.teal,cursor:"pointer",fontWeight:600}} onClick={()=>setView("metrics")}>Configure</span> • <span style={{color:C.teal,cursor:"pointer",fontWeight:600}} onClick={()=>setShowImport(true)}>Import CSV instead</span></div><InputForm visibleMetrics={visibleMetrics} onSave={saveSession} existingData={editIdx!==null?sessions[editIdx]:null}/></>)}

      {view==="metrics"&&(<><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginBottom:4}}>Dashboard Metrics</div><div style={{fontSize:12,color:C.textLight,marginBottom:16}}>Toggle which metrics appear on the dashboard. Importing CSVs auto-enables new metrics.</div><MetricConfig visibleMetrics={visibleMetrics} onUpdate={updateVisible} allDataMetrics={allDataMetrics}/></>)}

      {view==="history"&&(<><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginBottom:16}}>Session History</div>{sessions.length===0?<Card style={{textAlign:"center",padding:32,color:C.textLight}}>No sessions.</Card>:sessions.slice().reverse().map((s,ri)=>{const i=sessions.length-1-ri,filled=Object.keys(s).filter(k=>k!=="date"&&k!=="notes"&&s[k]!=null).length;return(<Card key={i} style={{marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{flex:1}}><div style={{fontWeight:700,color:C.carltonNavy,fontSize:14}}>{s.date}{i===sessions.length-1&&<span style={{fontSize:10,background:C.tealLight,color:"#fff",padding:"1px 8px",borderRadius:8,marginLeft:6}}>Latest</span>}</div><div style={{fontSize:11,color:C.textLight,marginTop:2}}>{filled} metrics</div>{s.notes&&<div style={{fontSize:11,color:C.textMid,marginTop:3,fontStyle:"italic"}}>{s.notes.slice(0,100)}</div>}</div><div style={{display:"flex",gap:6,flexShrink:0}}><Btn small onClick={()=>{setEditIdx(i);setView("input");}}>Edit</Btn><Btn small danger onClick={()=>{if(confirm("Delete?"))delSession(i);}}>Delete</Btn></div></Card>);})}</>)}
    </div></>)}
    <div style={{textAlign:"center",padding:"20px 16px 32px",fontSize:11,color:C.textLight}}>Carlton AFLW Performance Reconditioning • Powered by Calibre.</div>
  </div>);
}
