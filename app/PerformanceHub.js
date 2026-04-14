"use client";

import storage from "./storage";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine, Cell } from "recharts";
import * as Papa from "papaparse";

// ─── Design Tokens ────────────────────────────────────────────────
const C={navy:"#0C1B33",navyMid:"#162847",carltonNavy:"#0E1E2F",carltonSilver:"#A8B5C2",teal:"#2A9D8F",tealDark:"#21867A",tealLight:"#3DBDAD",coral:"#E76F51",coralLight:"#F4A261",gold:"#F4A261",green:"#22C55E",greenDark:"#16A34A",greenBg:"#DCFCE7",red:"#EF4444",redDark:"#DC2626",redBg:"#FEE2E2",amber:"#F59E0B",amberDark:"#D97706",amberBg:"#FEF3C7",blue:"#3B82F6",blueBg:"#DBEAFE",purple:"#8B5CF6",bg:"#F1F5F9",card:"#FFFFFF",text:"#0F172A",textMid:"#475569",textLight:"#94A3B8",border:"#E2E8F0",borderLight:"#F1F5F9",shadow:"0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)"};

// ─── Full Test Library ────────────────────────────────────────────
const DEFAULT_TESTS=[
  // CMJ
  {id:"cmj_jh",cat:"CMJ",name:"CMJ - Jump Height",unit:"cm",bilateral:false,on:true},
  {id:"cmj_rsi_mod",cat:"CMJ",name:"CMJ - RSI-modified",unit:"m/s",bilateral:false,on:true},
  {id:"cmj_contraction_time",cat:"CMJ",name:"CMJ - Contraction Time",unit:"ms",bilateral:false,on:true},
  {id:"cmj_cm_depth",cat:"CMJ",name:"CMJ - Countermovement Depth",unit:"cm",bilateral:false,on:true},
  {id:"cmj_con_pf_bm",cat:"CMJ",name:"CMJ - Concentric Peak Force/BM",unit:"N/kg",bilateral:false,on:true},
  {id:"cmj_fzv_bm",cat:"CMJ",name:"CMJ - Force at Zero Velocity/BM",unit:"N/kg",bilateral:false,on:false},
  {id:"cmj_con_imp100",cat:"CMJ",name:"CMJ - Concentric Impulse 100ms",unit:"N s",bilateral:false,on:false},
  {id:"cmj_con_pv",cat:"CMJ",name:"CMJ - Concentric Peak Velocity",unit:"m/s",bilateral:false,on:false},
  {id:"cmj_ecc_pf_bm",cat:"CMJ",name:"CMJ - Eccentric Peak Force/BM",unit:"N/kg",bilateral:false,on:true},
  {id:"cmj_ecc_dur",cat:"CMJ",name:"CMJ - Eccentric Duration",unit:"ms",bilateral:false,on:false},
  {id:"cmj_ecc_rfd_bm",cat:"CMJ",name:"CMJ - Eccentric Decel RFD/BM",unit:"N/s/kg",bilateral:false,on:true},
  {id:"cmj_ecc_pv",cat:"CMJ",name:"CMJ - Eccentric Peak Velocity",unit:"m/s",bilateral:false,on:false},
  {id:"cmj_ft_ct",cat:"CMJ",name:"CMJ - Flight Time:Contraction Time",unit:"ratio",bilateral:false,on:true},
  {id:"cmj_pp_bm",cat:"CMJ",name:"CMJ - Peak Power/BM",unit:"W/kg",bilateral:false,on:true},
  {id:"cmj_ecc_imp_bm",cat:"CMJ",name:"CMJ - Eccentric Decel Impulse/BM",unit:"N s/kg",bilateral:false,on:false},
  {id:"cmj_ecc_brk_asym",cat:"CMJ",name:"CMJ - Ecc Braking Impulse Asym",unit:"%",bilateral:false,on:false},
  {id:"cmj_con_imp_asym",cat:"CMJ",name:"CMJ - Concentric Impulse Asym",unit:"%",bilateral:false,on:false},
  {id:"cmj_ecc_pf_asym",cat:"CMJ",name:"CMJ - Ecc Peak Force Asym",unit:"%",bilateral:false,on:false},
  {id:"cmj_ecc_rfd_asym",cat:"CMJ",name:"CMJ - Ecc Decel RFD Asym",unit:"%",bilateral:false,on:false},
  // SL CMJ
  {id:"slcmj_jh",cat:"SL CMJ",name:"SL CMJ - Jump Height",unit:"cm",bilateral:true,on:true},
  {id:"slcmj_rsi",cat:"SL CMJ",name:"SL CMJ - mRSI",unit:"m/s",bilateral:true,on:true},
  {id:"slcmj_ct",cat:"SL CMJ",name:"SL CMJ - Contraction Time",unit:"ms",bilateral:true,on:false},
  {id:"slcmj_pf",cat:"SL CMJ",name:"SL CMJ - Peak Force",unit:"N",bilateral:true,on:true},
  {id:"slcmj_pf_bm",cat:"SL CMJ",name:"SL CMJ - Peak Force/BM",unit:"N/kg",bilateral:true,on:false},
  {id:"slcmj_pp_bm",cat:"SL CMJ",name:"SL CMJ - Peak Power/BM",unit:"W/kg",bilateral:true,on:false},
  {id:"slcmj_cmd",cat:"SL CMJ",name:"SL CMJ - Countermovement Depth",unit:"cm",bilateral:true,on:false},
  {id:"slcmj_brk_rfd",cat:"SL CMJ",name:"SL CMJ - Braking RFD",unit:"N/s",bilateral:true,on:true},
  {id:"slcmj_ecc_dur",cat:"SL CMJ",name:"SL CMJ - Eccentric Duration",unit:"ms",bilateral:true,on:false},
  // DL Hop
  {id:"dlhop_jh",cat:"Hop Tests",name:"DL Hop - Jump Height",unit:"cm",bilateral:false,on:true},
  {id:"dlhop_rsi",cat:"Hop Tests",name:"DL Hop - RSI",unit:"m/s",bilateral:false,on:true},
  {id:"dlhop_ct",cat:"Hop Tests",name:"DL Hop - Contact Time",unit:"ms",bilateral:false,on:false},
  {id:"dlhop_pf",cat:"Hop Tests",name:"DL Hop - Peak Force",unit:"N",bilateral:false,on:false},
  {id:"dlhop_ft_ct",cat:"Hop Tests",name:"DL Hop - Flight Time:Contact Time",unit:"ratio",bilateral:false,on:false},
  // SL Hop
  {id:"slhop_jh",cat:"Hop Tests",name:"SL Hop - Jump Height",unit:"cm",bilateral:true,on:true},
  {id:"slhop_rsi",cat:"Hop Tests",name:"SL Hop - RSI",unit:"m/s",bilateral:true,on:true},
  {id:"slhop_ct",cat:"Hop Tests",name:"SL Hop - Contact Time",unit:"ms",bilateral:true,on:false},
  {id:"slhop_pf",cat:"Hop Tests",name:"SL Hop - Peak Force",unit:"N",bilateral:true,on:false},
  // DL Drop Jump
  {id:"dldj_jh",cat:"Drop Jump",name:"DL Drop Jump - Jump Height",unit:"cm",bilateral:false,on:true},
  {id:"dldj_rsi",cat:"Drop Jump",name:"DL Drop Jump - RSI",unit:"m/s",bilateral:false,on:true},
  {id:"dldj_ct",cat:"Drop Jump",name:"DL Drop Jump - Contact Time",unit:"ms",bilateral:false,on:true},
  {id:"dldj_pf",cat:"Drop Jump",name:"DL Drop Jump - Peak Landing Force",unit:"N",bilateral:false,on:false},
  {id:"dldj_stiff",cat:"Drop Jump",name:"DL Drop Jump - Stiffness",unit:"N/m",bilateral:false,on:false},
  // SL Drop Jump
  {id:"sldj_jh",cat:"Drop Jump",name:"SL Drop Jump - Jump Height",unit:"cm",bilateral:true,on:true},
  {id:"sldj_rsi",cat:"Drop Jump",name:"SL Drop Jump - RSI",unit:"m/s",bilateral:true,on:true},
  {id:"sldj_ct",cat:"Drop Jump",name:"SL Drop Jump - Contact Time",unit:"ms",bilateral:true,on:true},
  {id:"sldj_pf",cat:"Drop Jump",name:"SL Drop Jump - Peak Landing Force",unit:"N",bilateral:true,on:false},
  // Natera Knee ISO Push (RSKIP)
  {id:"knee_iso_pf",cat:"Isometric - Knee",name:"Knee ISO Push - Peak Force",unit:"N",bilateral:true,on:true},
  {id:"knee_iso_rpf",cat:"Isometric - Knee",name:"Knee ISO Push - Peak Force/BW",unit:"xBW",bilateral:true,on:false},
  {id:"knee_iso_f100",cat:"Isometric - Knee",name:"Knee ISO Push - Force at 100ms",unit:"N",bilateral:true,on:true},
  {id:"knee_iso_f200",cat:"Isometric - Knee",name:"Knee ISO Push - Force at 200ms",unit:"N",bilateral:true,on:true},
  {id:"knee_iso_imp100",cat:"Isometric - Knee",name:"Knee ISO Push - Impulse 100ms",unit:"N s",bilateral:true,on:false},
  // Natera Ankle ISO Push (RSAKP)
  {id:"ankle_iso_pf",cat:"Isometric - Ankle",name:"Ankle ISO Push - Peak Force",unit:"N",bilateral:true,on:true},
  {id:"ankle_iso_rpf",cat:"Isometric - Ankle",name:"Ankle ISO Push - Peak Force/BW",unit:"xBW",bilateral:true,on:false},
  {id:"ankle_iso_f100",cat:"Isometric - Ankle",name:"Ankle ISO Push - Force at 100ms",unit:"N",bilateral:true,on:true},
  {id:"ankle_iso_f200",cat:"Isometric - Ankle",name:"Ankle ISO Push - Force at 200ms",unit:"N",bilateral:true,on:true},
  {id:"ankle_iso_imp100",cat:"Isometric - Ankle",name:"Ankle ISO Push - Impulse 100ms",unit:"N s",bilateral:true,on:false},
  // Natera Hip ISO Push (RSHIP)
  {id:"hip_iso_pf",cat:"Isometric - Hip",name:"Hip ISO Push - Peak Force",unit:"N",bilateral:true,on:true},
  {id:"hip_iso_rpf",cat:"Isometric - Hip",name:"Hip ISO Push - Peak Force/BW",unit:"xBW",bilateral:true,on:false},
  {id:"hip_iso_f100",cat:"Isometric - Hip",name:"Hip ISO Push - Force at 100ms",unit:"N",bilateral:true,on:true},
  {id:"hip_iso_f200",cat:"Isometric - Hip",name:"Hip ISO Push - Force at 200ms",unit:"N",bilateral:true,on:true},
  // Seated SL ISO Calf Raise (SLSEICR)
  {id:"calf_iso_pf",cat:"Isometric - Calf",name:"Seated Calf ISO - Peak Force",unit:"N",bilateral:true,on:true},
  {id:"calf_iso_rpf",cat:"Isometric - Calf",name:"Seated Calf ISO - Peak Force/BW",unit:"xBW",bilateral:true,on:false},
  {id:"calf_iso_netpf",cat:"Isometric - Calf",name:"Seated Calf ISO - Net Peak Force",unit:"N",bilateral:true,on:false},
  {id:"calf_iso_f50",cat:"Isometric - Calf",name:"Seated Calf ISO - Force at 50ms",unit:"N",bilateral:true,on:false},
  {id:"calf_iso_f100",cat:"Isometric - Calf",name:"Seated Calf ISO - Force at 100ms",unit:"N",bilateral:true,on:true},
  {id:"calf_iso_f200",cat:"Isometric - Calf",name:"Seated Calf ISO - Force at 200ms",unit:"N",bilateral:true,on:true},
  {id:"calf_iso_ttpf",cat:"Isometric - Calf",name:"Seated Calf ISO - Time to Peak Force",unit:"s",bilateral:true,on:false},
  // Rehab/ROM (manual entry)
  {id:"single_hop",cat:"Rehab & ROM",name:"Single Hop Test",unit:"cm",bilateral:true,on:true},
  {id:"triple_hop",cat:"Rehab & ROM",name:"Triple Hop Test",unit:"cm",bilateral:true,on:true},
  {id:"hip_ir_rom",cat:"Rehab & ROM",name:"Hip Internal Rotation - ROM",unit:"deg",bilateral:true,on:true},
  {id:"ktw",cat:"Rehab & ROM",name:"Knee To Wall - Mobility",unit:"cm",bilateral:true,on:true},
  {id:"eyes_closed_bal",cat:"Rehab & ROM",name:"Eyes Closed Balance",unit:"s",bilateral:true,on:true},
  {id:"calf_raise_cap",cat:"Rehab & ROM",name:"Calf Raise - Capacity",unit:"reps",bilateral:true,on:true},
  {id:"tibial_er_rom",cat:"Rehab & ROM",name:"Tibial External Rotation - ROM",unit:"deg",bilateral:true,on:true},
  {id:"vm_step_down",cat:"Rehab & ROM",name:"VM Step Down",unit:"/3",bilateral:true,on:true},
  {id:"kext_seated_pf",cat:"Rehab & ROM",name:"Knee Extension - Seated - Peak Force",unit:"N",bilateral:true,on:false},
  {id:"kext_60_pf",cat:"Rehab & ROM",name:"Knee Extension - Seated 60° - Peak Force",unit:"N",bilateral:true,on:false},
  {id:"hip_add",cat:"Rehab & ROM",name:"Hip Adduction - Peak Force",unit:"N",bilateral:true,on:false},
  {id:"hip_abd",cat:"Rehab & ROM",name:"Hip Abduction - Peak Force",unit:"N",bilateral:true,on:false},
];

const CAT_COLORS={"CMJ":C.teal,"SL CMJ":"#0EA5E9","Hop Tests":C.blue,"Drop Jump":"#6366F1","Isometric - Knee":C.coral,"Isometric - Ankle":"#F97316","Isometric - Hip":"#EC4899","Isometric - Calf":C.gold,"Rehab & ROM":C.green,"Reactive & Springs":"#06B6D4"};

// ═══════════════════════════════════════════════════════════════════
// FORCEDECKS CSV PARSER — ALL TEST TYPES
// ═══════════════════════════════════════════════════════════════════

const FD_TEST_TYPE_INFO = {
  CMJ: { label: "Countermovement Jump", bilateral: false },
  SLCMJ: { label: "Single Leg CMJ", bilateral: true },
  DLHOP: { label: "DL Hop Test", bilateral: false },
  SLHOP: { label: "SL Hop Test", bilateral: true },
  DLDJ: { label: "DL Drop Jump", bilateral: false },
  SLDJ: { label: "SL Drop Jump", bilateral: true },
  RSKIP: { label: "Natera Knee ISO Push", bilateral: true },
  RSAKP: { label: "Natera Ankle ISO Push", bilateral: true },
  RSHIP: { label: "Natera Hip ISO Push", bilateral: true },
  SLSEICR: { label: "Seated SL ISO Calf Raise", bilateral: true },
};

// Column → app field mappings per test type
// For bilateral ISO tests, (L) and (R) columns map to _L/_R suffixes
const FD_MAPS = {
  CMJ: {
    "Jump Height (Imp-Mom) [cm]":"cmj_jh","RSI-modified (Imp-Mom) [m/s]":"cmj_rsi_mod",
    "Contraction Time [ms]":"cmj_contraction_time","Countermovement Depth [cm]":"cmj_cm_depth",
    "Concentric Peak Force / BM [N/kg]":"cmj_con_pf_bm","Force at Zero Velocity / BM [N/kg]":"cmj_fzv_bm",
    "Concentric Impulse-100ms [N s]":"cmj_con_imp100","Concentric Peak Velocity [m/s]":"cmj_con_pv",
    "Eccentric Peak Force / BM [N/kg]":"cmj_ecc_pf_bm","Eccentric Duration [ms]":"cmj_ecc_dur",
    "Eccentric Deceleration RFD / BM [N/s/kg]":"cmj_ecc_rfd_bm","Eccentric Peak Velocity [m/s]":"cmj_ecc_pv",
    "Flight Time:Contraction Time":"cmj_ft_ct","Peak Power / BM [W/kg]":"cmj_pp_bm",
    "Eccentric Deceleration Impulse / BM [N s/kg]":"cmj_ecc_imp_bm",
    "Eccentric Braking Impulse % (Asym) (%)":"cmj_ecc_brk_asym","Concentric Impulse % (Asym) (%)":"cmj_con_imp_asym",
    "Eccentric Peak Force % (Asym) (%)":"cmj_ecc_pf_asym","Eccentric Deceleration RFD % (Asym) (%)":"cmj_ecc_rfd_asym",
  },
  // SL CMJ — bilateral: uses (L)/(R) columns for jump height, RSI, peak force etc.
  SLCMJ: {
    "Jump Height (Imp-Mom) [cm] (L)":"slcmj_jh_L","Jump Height (Imp-Mom) [cm] (R)":"slcmj_jh_R",
    "RSI-modified (Imp-Mom) [m/s] (L)":"slcmj_rsi_L","RSI-modified (Imp-Mom) [m/s] (R)":"slcmj_rsi_R",
    "Contraction Time [ms] (L)":"slcmj_ct_L","Contraction Time [ms] (R)":"slcmj_ct_R",
    "Peak Vertical Force [N] (L)":"slcmj_pf_L","Peak Vertical Force [N] (R)":"slcmj_pf_R",
    "Peak Vertical Force / BM [N/kg] (L)":"slcmj_pf_bm_L","Peak Vertical Force / BM [N/kg] (R)":"slcmj_pf_bm_R",
    "Peak Power / BM [W/kg] (L)":"slcmj_pp_bm_L","Peak Power / BM [W/kg] (R)":"slcmj_pp_bm_R",
    "Countermovement Depth [cm] (L)":"slcmj_cmd_L","Countermovement Depth [cm] (R)":"slcmj_cmd_R",
    "Eccentric Deceleration RFD [N/s] (L)":"slcmj_brk_rfd_L","Eccentric Deceleration RFD [N/s] (R)":"slcmj_brk_rfd_R",
    "Braking RFD [N/s] (L)":"slcmj_brk_rfd_L","Braking RFD [N/s] (R)":"slcmj_brk_rfd_R",
    "Eccentric Duration [ms] (L)":"slcmj_ecc_dur_L","Eccentric Duration [ms] (R)":"slcmj_ecc_dur_R",
  },
  // DL Hop — unilateral (single value)
  DLHOP: {
    "Jump Height (Flight Time) [cm]":"dlhop_jh","Jump Height (Imp-Mom) [cm]":"dlhop_jh",
    "RSI (Flight Time) [m/s]":"dlhop_rsi","RSI-modified (Imp-Mom) [m/s]":"dlhop_rsi",
    "Contact Time [ms]":"dlhop_ct","Ground Contact Time [ms]":"dlhop_ct",
    "Peak Vertical Force [N]":"dlhop_pf",
    "Flight Time:Contraction Time":"dlhop_ft_ct","Flight Time:Contact Time":"dlhop_ft_ct",
  },
  // SL Hop — bilateral
  SLHOP: {
    "Jump Height (Flight Time) [cm] (L)":"slhop_jh_L","Jump Height (Flight Time) [cm] (R)":"slhop_jh_R",
    "Jump Height (Imp-Mom) [cm] (L)":"slhop_jh_L","Jump Height (Imp-Mom) [cm] (R)":"slhop_jh_R",
    "RSI (Flight Time) [m/s] (L)":"slhop_rsi_L","RSI (Flight Time) [m/s] (R)":"slhop_rsi_R",
    "RSI-modified (Imp-Mom) [m/s] (L)":"slhop_rsi_L","RSI-modified (Imp-Mom) [m/s] (R)":"slhop_rsi_R",
    "Contact Time [ms] (L)":"slhop_ct_L","Contact Time [ms] (R)":"slhop_ct_R",
    "Ground Contact Time [ms] (L)":"slhop_ct_L","Ground Contact Time [ms] (R)":"slhop_ct_R",
    "Peak Vertical Force [N] (L)":"slhop_pf_L","Peak Vertical Force [N] (R)":"slhop_pf_R",
  },
  // DL Drop Jump
  DLDJ: {
    "Jump Height (Flight Time) [cm]":"dldj_jh","Jump Height (Imp-Mom) [cm]":"dldj_jh",
    "RSI (Flight Time) [m/s]":"dldj_rsi","RSI-modified (Imp-Mom) [m/s]":"dldj_rsi",
    "Contact Time [ms]":"dldj_ct","Ground Contact Time [ms]":"dldj_ct",
    "Peak Landing Force [N]":"dldj_pf","Peak Vertical Force [N]":"dldj_pf",
    "Stiffness [N/m]":"dldj_stiff","Vertical Stiffness [N/m]":"dldj_stiff",
  },
  // SL Drop Jump — bilateral
  SLDJ: {
    "Jump Height (Flight Time) [cm] (L)":"sldj_jh_L","Jump Height (Flight Time) [cm] (R)":"sldj_jh_R",
    "Jump Height (Imp-Mom) [cm] (L)":"sldj_jh_L","Jump Height (Imp-Mom) [cm] (R)":"sldj_jh_R",
    "RSI (Flight Time) [m/s] (L)":"sldj_rsi_L","RSI (Flight Time) [m/s] (R)":"sldj_rsi_R",
    "Contact Time [ms] (L)":"sldj_ct_L","Contact Time [ms] (R)":"sldj_ct_R",
    "Ground Contact Time [ms] (L)":"sldj_ct_L","Ground Contact Time [ms] (R)":"sldj_ct_R",
    "Peak Landing Force [N] (L)":"sldj_pf_L","Peak Landing Force [N] (R)":"sldj_pf_R",
    "Peak Vertical Force [N] (L)":"sldj_pf_L","Peak Vertical Force [N] (R)":"sldj_pf_R",
  },
};

// ISO tests share the same column structure — generate maps dynamically
function makeISOMap(prefix){return{
  "Peak Vertical Force [N] (L)":`${prefix}_pf_L`,"Peak Vertical Force [N] (R)":`${prefix}_pf_R`,
  "Peak Vertical Force / BW  (L)":`${prefix}_rpf_L`,"Peak Vertical Force / BW  (R)":`${prefix}_rpf_R`,
  "Peak Vertical Force / BW (L)":`${prefix}_rpf_L`,"Peak Vertical Force / BW (R)":`${prefix}_rpf_R`,
  "Peak Vertical Force / BM [N/kg] (L)":`${prefix}_rpf_L`,"Peak Vertical Force / BM [N/kg] (R)":`${prefix}_rpf_R`,
  "Force at 100ms [N] (L)":`${prefix}_f100_L`,"Force at 100ms [N] (R)":`${prefix}_f100_R`,
  "Force at 200ms [N] (L)":`${prefix}_f200_L`,"Force at 200ms [N] (R)":`${prefix}_f200_R`,
  "Force at 50ms [N] (L)":`${prefix}_f50_L`,"Force at 50ms [N] (R)":`${prefix}_f50_R`,
  "Absolute Impulse - 100ms [N s] (L)":`${prefix}_imp100_L`,"Absolute Impulse - 100ms [N s] (R)":`${prefix}_imp100_R`,
  "Peak Vertical Force (Net of BW) [N] (L)":`${prefix}_netpf_L`,"Peak Vertical Force (Net of BW) [N] (R)":`${prefix}_netpf_R`,
  "Start Time to Peak Force [s] (L)":`${prefix}_ttpf_L`,"Start Time to Peak Force [s] (R)":`${prefix}_ttpf_R`,
};}
FD_MAPS.RSKIP = makeISOMap("knee_iso");
FD_MAPS.RSAKP = makeISOMap("ankle_iso");
FD_MAPS.RSHIP = makeISOMap("hip_iso");
FD_MAPS.SLSEICR = makeISOMap("calf_iso");

function parseFDDate(r){if(!r)return"";const p=r.trim().split("/");if(p.length===3)return`${p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`;return r;}
function parseAsymVal(r){if(!r||typeof r!=="string")return null;const m=r.trim().match(/^([\d.]+)\s*(L|R)$/);return m?parseFloat(m[1]):parseFloat(r)||null;}

function parseForceDecksCSV(csvText){
  const result=Papa.parse(csvText,{header:true,skipEmptyLines:true});
  if(!result.data||result.data.length===0)return{error:"No data found in CSV"};
  const headers=result.meta.fields.map(f=>f.trim());
  const rows=result.data;
  const testType=(rows[0]["Test Type"]||"").trim();
  const info=FD_TEST_TYPE_INFO[testType];
  if(!info)return{error:`Unknown ForceDecks test type: "${testType}". Supported: ${Object.keys(FD_TEST_TYPE_INFO).join(", ")}`};
  const map=FD_MAPS[testType];
  if(!map)return{error:`No column mapping for test type: "${testType}"`};

  // Group by athlete + date
  const grouped={};
  for(const row of rows){
    const name=(row["Name"]||"").trim();
    const date=parseFDDate((row["Date"]||"").trim());
    if(!name||!date)continue;
    const key=`${name}|||${date}`;
    if(!grouped[key])grouped[key]={name,date,row};
  }

  const sessions=[];
  for(const{name,date,row}of Object.values(grouped)){
    const session={date,_athlete:name,_testType:testType,_bw:parseFloat(row["BW [KG]"])||null};
    // Try to match every mapping
    for(const[csvCol,appField]of Object.entries(map)){
      // Find header (ForceDecks has trailing spaces sometimes)
      let val=null;
      for(const f of result.meta.fields){
        if(f.trim()===csvCol){val=row[f];break;}
      }
      if(val===undefined||val===null||val==="")continue;
      val=String(val).trim();
      if(csvCol.includes("(Asym)")){
        const n=parseAsymVal(val);if(n!==null)session[appField]=n;
      } else {
        const n=parseFloat(val);
        if(!isNaN(n))session[appField]=csvCol.toLowerCase().includes("depth")?Math.abs(n):n;
      }
    }
    sessions.push(session);
  }

  const byAthlete={};
  for(const s of sessions){
    const name=s._athlete;if(!byAthlete[name])byAthlete[name]=[];
    const c={...s};delete c._athlete;delete c._testType;delete c._bw;
    byAthlete[name].push(c);
  }

  const mapped=sessions.length>0?Object.keys(sessions[0]).filter(k=>!k.startsWith("_")&&k!=="date").length:0;
  return{testType,testLabel:info.label,byAthlete,totalSessions:sessions.length,athletes:Object.keys(byAthlete),mappedFields:mapped};
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
function Modal({title,onClose,children,wide}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",justifyContent:"center",alignItems:"flex-start",zIndex:200,backdropFilter:"blur(2px)",overflowY:"auto",padding:"40px 16px"}} onClick={onClose}><Card style={{width:wide?580:360,padding:28,maxWidth:"100%"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontWeight:700,fontSize:18,color:C.carltonNavy}}>{title}</span><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.textLight,padding:4}}>✕</button></div>{children}</Card></div>);}

// ─── CSV Importer ────────────────────────────────────────────────
function CSVImporter({onImport,onClose,existingAthletes}){
  const[dragOver,setDragOver]=useState(false);const[parsed,setParsed]=useState(null);const[error,setError]=useState(null);const[selAthletes,setSelAthletes]=useState({});const fileRef=useRef();
  const handleFile=f=>{if(!f)return;setError(null);const r=new FileReader();r.onload=e=>{const res=parseForceDecksCSV(e.target.result);if(res.error){setError(res.error);return;}setParsed(res);const s={};res.athletes.forEach(a=>{s[a]=true;});setSelAthletes(s);};r.readAsText(f);};
  const doImport=()=>{if(!parsed)return;const ath={};for(const[name,sess]of Object.entries(parsed.byAthlete)){if(!selAthletes[name])continue;ath[name]=sess;}onImport(ath,parsed.testType,parsed.testLabel);};
  const totalSel=Object.values(selAthletes).filter(Boolean).length;
  const totalSess=parsed?Object.entries(parsed.byAthlete).filter(([n])=>selAthletes[n]).reduce((s,[,ss])=>s+ss.length,0):0;
  return(<Modal title="Import ForceDecks CSV" onClose={onClose} wide>{!parsed?(<>
    <div onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer?.files?.[0]);}} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${dragOver?C.teal:C.border}`,borderRadius:12,padding:40,textAlign:"center",cursor:"pointer",background:dragOver?"#F0FDFA":C.bg}}>
      <div style={{fontSize:36,marginBottom:8}}>📄</div>
      <div style={{fontWeight:600,color:C.text,marginBottom:4}}>Drop ForceDecks CSV here or click to browse</div>
      <div style={{fontSize:11,color:C.textLight,lineHeight:1.6}}>Supports: CMJ, SL CMJ, DL Hop, SL Hop, DL Drop Jump, SL Drop Jump,<br/>Natera Knee/Ankle/Hip ISO Push, Seated SL ISO Calf Raise</div>
      <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
    </div>{error&&<div style={{marginTop:12,padding:12,borderRadius:8,background:C.redBg,color:C.redDark,fontSize:13}}>{error}</div>}
  </>):(<>
    <Card style={{background:"#F0FDFA",borderColor:C.teal,marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>✅</span><div><div style={{fontWeight:700,color:C.carltonNavy}}>CSV Parsed — {parsed.testLabel}</div><div style={{fontSize:12,color:C.textMid}}>Type: <b>{parsed.testType}</b> • {parsed.totalSessions} sessions • {parsed.mappedFields} fields mapped</div></div></div></Card>
    <div style={{fontWeight:700,fontSize:14,color:C.carltonNavy,marginBottom:8}}>Athletes</div>
    {parsed.athletes.map(name=>{const sess=parsed.byAthlete[name];const exists=existingAthletes.includes(name);const dates=sess.map(s=>s.date).sort();return(<div key={name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.borderLight}`}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontWeight:600,color:C.text}}>{name}</span>{exists&&<span style={{fontSize:10,background:C.amberBg,color:C.amberDark,padding:"1px 6px",borderRadius:4}}>Will merge</span>}</div><div style={{fontSize:11,color:C.textLight,marginTop:2}}>{sess.length} session{sess.length>1?"s":""} • {dates[0]} → {dates[dates.length-1]}</div></div><Toggle on={!!selAthletes[name]} onToggle={()=>setSelAthletes(p=>({...p,[name]:!p[name]}))}/></div>);})}
    <div style={{fontWeight:700,fontSize:14,color:C.carltonNavy,marginTop:16,marginBottom:8}}>Mapped Fields</div>
    <div style={{maxHeight:180,overflowY:"auto",background:C.bg,borderRadius:8,padding:12}}>{(()=>{const s=Object.values(parsed.byAthlete)[0]?.[0]||{};return Object.entries(s).filter(([k,v])=>k!=="date"&&v!=null).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:12,borderBottom:`1px solid ${C.borderLight}`}}><span style={{color:C.text,fontWeight:500}}>{k}</span><span style={{color:C.teal,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{v}</span></div>));})()}</div>
    <div style={{display:"flex",gap:8,marginTop:20}}><Btn style={{flex:1}} onClick={()=>{setParsed(null);setError(null);}}>← Back</Btn><Btn accent style={{flex:2}} onClick={doImport}>Import {totalSel} athlete{totalSel!==1?"s":""} ({totalSess} sessions)</Btn></div>
  </>)}</Modal>);
}

// ─── Display Cards ───────────────────────────────────────────────
function BilateralCard({test,data,pb,prev}){const l=data?.[`${test.id}_L`],r=data?.[`${test.id}_R`];if(l==null&&r==null)return null;const lsi=calcLSI(l,r),lo=l<r?"L":l>r?"R":null;
  const S=({label,val,isLo,pbV,pv})=>{const d=val!=null&&pv!=null?val-pv:null;return(<div style={{flex:1,background:isLo?"#FEF2F2":"#F0FDF4",borderRadius:10,padding:14,border:`1px solid ${isLo?"#FECACA":"#BBF7D0"}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:11,color:C.textLight,fontWeight:700,letterSpacing:.5}}>{label}</span>{isLo&&<span style={{fontSize:10,background:C.coral,color:"#fff",padding:"1px 8px",borderRadius:6,fontWeight:600}}>Lower</span>}</div><div style={{fontSize:26,fontWeight:800,color:C.text}}>{val??'—'} <span style={{fontSize:12,fontWeight:400,color:C.textLight}}>{test.unit}</span></div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:4}}>{pbV!=null&&<span style={{fontSize:10,color:C.textLight}}>PB: {pbV}</span>}{d!=null&&d!==0&&<span style={{fontSize:10,fontWeight:600,color:d>0?C.greenDark:C.redDark}}>{d>0?"▲":"▼"} {Math.abs(Math.round(d*10)/10)}</span>}</div></div>);};
  return(<Card style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontWeight:600,fontSize:14,color:C.text}}>{test.name}</span><LSIPill lsi={lsi} side={lo}/></div><div style={{display:"flex",gap:10}}><S label="LEFT" val={l} isLo={lo==="L"} pbV={pb?.[`${test.id}_L`]} pv={prev?.[`${test.id}_L`]}/><S label="RIGHT" val={r} isLo={lo==="R"} pbV={pb?.[`${test.id}_R`]} pv={prev?.[`${test.id}_R`]}/></div></Card>);}

function UnilateralCard({test,data,pb,prev}){const v=data?.[test.id];if(v==null)return null;const d=v!=null&&prev?.[test.id]!=null?v-prev[test.id]:null;
  return(<Card style={{marginBottom:10}}><span style={{fontWeight:600,fontSize:14,color:C.text}}>{test.name}</span><div style={{fontSize:30,fontWeight:800,color:C.text,marginTop:6}}>{v} <span style={{fontSize:12,fontWeight:400,color:C.textLight}}>{test.unit}</span></div><div style={{display:"flex",gap:8,alignItems:"center",marginTop:4}}>{pb?.[test.id]!=null&&<span style={{fontSize:10,color:C.textLight}}>PB: {pb[test.id]}</span>}{d!=null&&d!==0&&<span style={{fontSize:10,fontWeight:600,color:d>0?C.greenDark:C.redDark}}>{d>0?"▲":"▼"} {Math.abs(Math.round(d*10)/10)}</span>}</div></Card>);}

function QuadrantChart({title,subtitle,xLabel,yLabel,xKey,yKey,sessions,quadrants}){const data=sessions.map((s,i)=>({x:s[xKey],y:s[yKey],date:s.date,i})).filter(d=>d.x!=null&&d.y!=null);if(data.length===0)return null;const latest=data[data.length-1],xs=data.map(d=>d.x),ys=data.map(d=>d.y);const xMid=(Math.min(...xs)+Math.max(...xs))/2,yMid=(Math.min(...ys)+Math.max(...ys))/2;const qi=latest.x>=xMid&&latest.y>=yMid?1:latest.x<xMid&&latest.y>=yMid?0:latest.x>=xMid?3:2;const qC=[C.redBg,C.greenBg,C.redBg,C.blueBg],qT=[C.coral,C.greenDark,C.redDark,C.blue];
  return(<Card style={{flex:1,minWidth:300,marginBottom:12}}><div style={{fontWeight:700,fontSize:15,color:C.carltonNavy}}>{title}</div><div style={{fontSize:11,color:C.textLight,marginBottom:10}}>{subtitle||`${xLabel} vs ${yLabel}`}</div><div style={{position:"relative"}}>{quadrants&&<div style={{position:"absolute",top:8,left:45,right:8,bottom:28,zIndex:0,pointerEvents:"none"}}><span style={{position:"absolute",top:0,left:0,fontSize:8,color:qT[0],fontWeight:700,background:qC[0],padding:"1px 5px",borderRadius:4}}>{quadrants[0]}</span><span style={{position:"absolute",top:0,right:0,fontSize:8,color:qT[1],fontWeight:700,background:qC[1],padding:"1px 5px",borderRadius:4}}>{quadrants[1]}</span><span style={{position:"absolute",bottom:0,left:0,fontSize:8,color:qT[2],fontWeight:700,background:qC[2],padding:"1px 5px",borderRadius:4}}>{quadrants[2]}</span><span style={{position:"absolute",bottom:0,right:0,fontSize:8,color:qT[3],fontWeight:700,background:qC[3],padding:"1px 5px",borderRadius:4}}>{quadrants[3]}</span></div>}<ResponsiveContainer width="100%" height={200}><ScatterChart margin={{top:16,right:8,bottom:8,left:8}}><CartesianGrid strokeDasharray="3 3" stroke={C.borderLight}/><XAxis type="number" dataKey="x" domain={['auto','auto']} tick={{fontSize:9}} stroke={C.border}/><YAxis type="number" dataKey="y" domain={['auto','auto']} tick={{fontSize:9}} stroke={C.border}/><ReferenceLine x={xMid} stroke={C.textLight} strokeDasharray="5 5" strokeOpacity={.5}/><ReferenceLine y={yMid} stroke={C.textLight} strokeDasharray="5 5" strokeOpacity={.5}/><Tooltip content={({payload})=>{if(!payload?.[0])return null;const d=payload[0].payload;return<div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:8,fontSize:11}}><div style={{fontWeight:700}}>{d.date}</div><div>{xLabel}: {d.x}</div><div>{yLabel}: {d.y}</div></div>;}}/><Scatter data={data}>{data.map((e,i)=><Cell key={i} fill={i===data.length-1?C.carltonNavy:C.carltonSilver} r={i===data.length-1?6:3.5} opacity={i===data.length-1?1:.45}/>)}</Scatter></ScatterChart></ResponsiveContainer></div>{latest&&quadrants&&<div style={{marginTop:6,padding:"6px 10px",borderRadius:8,background:qC[qi],fontSize:12,fontWeight:700,color:qT[qi]}}>{quadrants[qi]} ✓</div>}</Card>);}

function AsymRow({name,l,r}){const a=calcAsym(l,r);if(a===null)return null;const s=getStatus(a),total=l+r,lp=total>0?(l/total)*100:50;return(<div style={{display:"flex",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.borderLight}`,gap:6}}><div style={{flex:2.5,fontSize:11,color:C.text,fontWeight:500,minWidth:160}}>{name}</div><div style={{flex:2,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9,color:C.textLight,width:48,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>L: {l}</span><div style={{flex:1,height:7,borderRadius:4,background:C.borderLight,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",left:0,top:0,bottom:0,width:`${lp}%`,background:s==="flag"?C.red:s==="monitor"?C.amber:C.green,borderRadius:4}}/></div><span style={{fontSize:9,color:C.textLight,width:48,fontVariantNumeric:"tabular-nums"}}>R: {r}</span></div><Pill status={s} value={a}/></div>);}

function ProfileRadar({scores}){const data=Object.entries(scores).map(([k,v])=>({subject:k.charAt(0).toUpperCase()+k.slice(1),value:v}));const best=data.reduce((a,b)=>a.value>b.value?a:b,{value:0}),worst=data.reduce((a,b)=>a.value<b.value?a:b,{value:101});return(<Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}><div style={{fontWeight:700,fontSize:16,color:C.carltonNavy}}>Athlete Profile</div><div style={{display:"flex",gap:12}}><span style={{fontSize:11}}><span style={{color:C.textLight}}>Superpower: </span><span style={{fontWeight:700,color:C.teal}}>{best.subject}</span></span><span style={{fontSize:11}}><span style={{color:C.textLight}}>Focus: </span><span style={{fontWeight:700,color:C.coral}}>{worst.subject}</span></span></div></div><ResponsiveContainer width="100%" height={240}><RadarChart data={data} cx="50%" cy="50%"><PolarGrid stroke={C.border}/><PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:C.text}}/><PolarRadiusAxis angle={90} domain={[0,100]} tick={{fontSize:8,fill:C.textLight}}/><Radar dataKey="value" stroke={C.carltonNavy} fill={C.teal} fillOpacity={.25} strokeWidth={2} dot={{r:3,fill:C.carltonNavy}}/></RadarChart></ResponsiveContainer></Card>);}

// ─── Test Config / Add Test ──────────────────────────────────────
function AddTestModal({tests,onAdd,onClose}){const cats=[...new Set(tests.map(t=>t.cat))];const[name,setName]=useState("");const[unit,setUnit]=useState("");const[bilateral,setBilateral]=useState(true);const[cat,setCat]=useState(cats[0]||"");const[newCat,setNewCat]=useState("");const[useNew,setUseNew]=useState(false);
  const save=()=>{if(!name.trim()||!unit.trim())return;const fc=useNew?newCat.trim():cat;if(!fc)return;onAdd({id:name.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_")+"_"+Date.now().toString(36),cat:fc,name:name.trim(),unit:unit.trim(),bilateral,on:true});onClose();};
  return(<Modal title="Add New Test" onClose={onClose} wide><div style={{marginBottom:14}}><label style={{fontSize:12,color:C.textLight,fontWeight:600,display:"block",marginBottom:4}}>Test Name *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Nordic Hamstring - Peak Force" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box"}}/></div><div style={{display:"flex",gap:12,marginBottom:14}}><div style={{flex:1}}><label style={{fontSize:12,color:C.textLight,fontWeight:600,display:"block",marginBottom:4}}>Unit *</label><input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="N, cm, ratio..." style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box"}}/></div><div style={{flex:1}}><label style={{fontSize:12,color:C.textLight,fontWeight:600,display:"block",marginBottom:4}}>Type</label><div style={{display:"flex",gap:8,marginTop:6}}><button onClick={()=>setBilateral(true)} style={{flex:1,padding:"8px 0",borderRadius:8,border:`2px solid ${bilateral?C.teal:C.border}`,background:bilateral?"#F0FDFA":"#fff",fontWeight:600,fontSize:12,cursor:"pointer"}}>L/R</button><button onClick={()=>setBilateral(false)} style={{flex:1,padding:"8px 0",borderRadius:8,border:`2px solid ${!bilateral?C.teal:C.border}`,background:!bilateral?"#F0FDFA":"#fff",fontWeight:600,fontSize:12,cursor:"pointer"}}>Single</button></div></div></div><div style={{marginBottom:14}}><label style={{fontSize:12,color:C.textLight,fontWeight:600,display:"block",marginBottom:4}}>Category</label><div style={{display:"flex",gap:8,marginBottom:8}}><button onClick={()=>setUseNew(false)} style={{padding:"4px 12px",borderRadius:6,border:`1px solid ${!useNew?C.teal:C.border}`,background:!useNew?"#F0FDFA":"#fff",fontSize:11,cursor:"pointer",fontWeight:600}}>Existing</button><button onClick={()=>setUseNew(true)} style={{padding:"4px 12px",borderRadius:6,border:`1px solid ${useNew?C.teal:C.border}`,background:useNew?"#F0FDFA":"#fff",fontSize:11,cursor:"pointer",fontWeight:600}}>+ New</button></div>{useNew?<input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="e.g. Hamstring Strength" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box"}}/>:<select value={cat} onChange={e=>setCat(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box",background:"#fff"}}>{cats.map(c=><option key={c} value={c}>{c}</option>)}</select>}</div><div style={{display:"flex",gap:8,marginTop:20}}><Btn style={{flex:1}} onClick={onClose}>Cancel</Btn><Btn primary style={{flex:1}} onClick={save}>Add Test</Btn></div></Modal>);}

function TestConfig({tests,onUpdate,onAddTest,onDeleteTest}){const[search,setSearch]=useState("");const filtered=search?tests.filter(t=>t.name.toLowerCase().includes(search.toLowerCase())||t.cat.toLowerCase().includes(search.toLowerCase())):tests;const grouped={};filtered.forEach(t=>{if(!grouped[t.cat])grouped[t.cat]=[];grouped[t.cat].push(t);});const toggleTest=id=>{onUpdate(tests.map(t=>t.id===id?{...t,on:!t.on}:t));};const toggleCat=cat=>{const ts=tests.filter(t=>t.cat===cat);const allOn=ts.every(t=>t.on);onUpdate(tests.map(t=>t.cat===cat?{...t,on:!allOn}:t));};
  return(<div><div style={{position:"sticky",top:92,zIndex:80,background:C.bg,paddingBottom:12}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tests..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box",background:"#fff"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,flexWrap:"wrap",gap:8}}><span style={{fontSize:12,color:C.textLight}}>{tests.filter(t=>t.on).length}/{tests.length} enabled</span><div style={{display:"flex",gap:6}}><Btn small onClick={()=>onUpdate(tests.map(t=>({...t,on:true})))}>All On</Btn><Btn small onClick={()=>onUpdate(tests.map(t=>({...t,on:false})))}>All Off</Btn><Btn small primary onClick={onAddTest}>+ Add Test</Btn></div></div></div>{Object.entries(grouped).map(([cat,cts])=>{const allOn=cts.every(t=>t.on);return(<Card key={cat} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,cursor:"pointer"}} onClick={()=>toggleCat(cat)}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:CAT_COLORS[cat]||C.purple}}/><span style={{fontWeight:700,fontSize:14,color:C.carltonNavy}}>{cat}</span><span style={{fontSize:11,color:C.textLight}}>{cts.filter(t=>t.on).length}/{cts.length}</span></div><Toggle on={allOn} onToggle={()=>toggleCat(cat)}/></div>{cts.map(t=>(<div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0 6px 18px",borderTop:`1px solid ${C.borderLight}`,gap:8}}><div style={{flex:1,minWidth:0}}><span style={{fontSize:12,color:C.text}}>{t.name}</span><span style={{fontSize:10,color:C.textLight,marginLeft:6}}>{t.unit}{t.bilateral?" • L/R":""}</span></div><div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}><Toggle on={t.on} onToggle={()=>toggleTest(t.id)} size={18}/><button onClick={e=>{e.stopPropagation();if(confirm(`Delete "${t.name}"?`))onDeleteTest(t.id);}} style={{background:"none",border:"none",cursor:"pointer",color:C.textLight,fontSize:14,padding:"2px 4px"}}>✕</button></div></div>))}</Card>);})}</div>);}

// ─── Input Form ──────────────────────────────────────────────────
function InputForm({tests,onSave,existingData}){const active=tests.filter(t=>t.on);const grouped={};active.forEach(t=>{if(!grouped[t.cat])grouped[t.cat]=[];grouped[t.cat].push(t);});const[form,setForm]=useState(existingData||{date:new Date().toISOString().split("T")[0]});const[notes,setNotes]=useState(existingData?.notes||"");const set=(k,v)=>setForm(p=>({...p,[k]:v===""?undefined:isNaN(parseFloat(v))?v:parseFloat(v)}));
  return(<div><Card style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:14,color:C.carltonNavy,marginBottom:8}}>Session Date</div><input type="date" value={form.date||""} onChange={e=>set("date",e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:14,width:"100%",boxSizing:"border-box"}}/></Card>{Object.entries(grouped).map(([cat,ts])=>(<Card key={cat} style={{marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><div style={{width:8,height:8,borderRadius:"50%",background:CAT_COLORS[cat]||C.purple}}/><span style={{fontWeight:700,fontSize:14,color:C.carltonNavy}}>{cat}</span></div>{ts.map(t=>(<div key={t.id} style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:4}}>{t.name} <span style={{color:C.textLight,fontWeight:400}}>({t.unit})</span></div>{t.bilateral?(<div style={{display:"flex",gap:8}}><input type="number" step="any" placeholder="Left" value={form[`${t.id}_L`]??""} onChange={e=>set(`${t.id}_L`,e.target.value)} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13}}/><input type="number" step="any" placeholder="Right" value={form[`${t.id}_R`]??""} onChange={e=>set(`${t.id}_R`,e.target.value)} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13}}/></div>):(<input type="number" step="any" placeholder="Value" value={form[t.id]??""} onChange={e=>set(t.id,e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box"}}/>)}</div>))}</Card>))}<Card style={{marginBottom:14}}><div style={{fontWeight:700,fontSize:14,color:C.carltonNavy,marginBottom:8}}>Key Takeaways / Notes</div><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Strong progress in..., Focus area is..." style={{width:"100%",minHeight:80,padding:10,borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/></Card><Btn primary style={{width:"100%",padding:"14px 0",fontSize:15}} onClick={()=>onSave({...form,notes})}>Save Session</Btn></div>);}

// ═══════════════════ MAIN APP ═══════════════════
export default function App(){
  const[view,setView]=useState("dashboard");const[athletes,setAthletes]=useState({});const[cur,setCur]=useState("");const[tests,setTests]=useState(DEFAULT_TESTS);const[showAdd,setShowAdd]=useState(false);const[showAddTest,setShowAddTest]=useState(false);const[showImport,setShowImport]=useState(false);const[newName,setNewName]=useState("");const[loading,setLoading]=useState(true);const[editIdx,setEditIdx]=useState(null);const[toast,setToast]=useState(null);

  useEffect(()=>{(async()=>{try{const r=await storage.get("carlton-recon-v4");if(r?.value){const d=JSON.parse(r.value);setAthletes(d.athletes||{});setCur(d.cur||"");if(d.tests?.length)setTests(d.tests);}}catch(e){}setLoading(false);})();},[]);
  const persist=useCallback(async(a,c,t)=>{try{await storage.set("carlton-recon-v4",JSON.stringify({athletes:a,cur:c,tests:t}));}catch(e){}},[]);
  const updateTests=t=>{setTests(t);persist(athletes,cur,t);};
  const addTest=t=>{const u=[...tests,t];setTests(u);persist(athletes,cur,u);};
  const deleteTest=id=>{const u=tests.filter(t=>t.id!==id);setTests(u);persist(athletes,cur,u);};
  const addAthlete=()=>{if(!newName.trim())return;const n=newName.trim(),u={...athletes,[n]:athletes[n]||[]};setAthletes(u);setCur(n);setNewName("");setShowAdd(false);persist(u,n,tests);};
  const removeAthlete=()=>{const u={...athletes};delete u[cur];const next=Object.keys(u)[0]||"";setAthletes(u);setCur(next);persist(u,next,tests);};
  const saveSession=data=>{const ss=[...(athletes[cur]||[])];if(editIdx!==null)ss[editIdx]=data;else ss.push(data);ss.sort((a,b)=>(a.date||"").localeCompare(b.date||""));const u={...athletes,[cur]:ss};setAthletes(u);persist(u,cur,tests);setView("dashboard");setEditIdx(null);};
  const delSession=i=>{const ss=[...(athletes[cur]||[])];ss.splice(i,1);const u={...athletes,[cur]:ss};setAthletes(u);persist(u,cur,tests);};
  const handleCSVImport=(imported,testType,testLabel)=>{const updated={...athletes};let totalNew=0;for(const[name,newSess]of Object.entries(imported)){const existing=updated[name]||[];const existDates=new Set(existing.map(s=>s.date));const toAdd=newSess.filter(s=>!existDates.has(s.date));updated[name]=[...existing,...toAdd].sort((a,b)=>(a.date||"").localeCompare(b.date||""));totalNew+=toAdd.length;}const first=Object.keys(imported)[0]||cur;setAthletes(updated);if(!cur&&first)setCur(first);persist(updated,cur||first,tests);setShowImport(false);setToast(`✅ Imported ${totalNew} session${totalNew!==1?"s":""} (${testLabel}) for ${Object.keys(imported).length} athlete${Object.keys(imported).length!==1?"s":""}`);setTimeout(()=>setToast(null),5000);};

  const sessions=athletes[cur]||[],latest=sessions[sessions.length-1]||{},prev=sessions.length>=2?sessions[sessions.length-2]:null;
  const pbs=useMemo(()=>{const pb={};for(const s of sessions)for(const[k,v]of Object.entries(s)){if(k==="date"||k==="notes")continue;const n=parseFloat(v);if(!isNaN(n)&&(pb[k]===undefined||n>pb[k]))pb[k]=n;}return pb;},[sessions]);
  const activeTests=tests.filter(t=>t.on);const activeCats={};activeTests.forEach(t=>{if(!activeCats[t.cat])activeCats[t.cat]=[];activeCats[t.cat].push(t);});
  const profileScores=useMemo(()=>{if(!latest.date)return{strength:0,power:0,reactive:0,jump:0,symmetry:0};const kA=((latest.knee_iso_pf_L||0)+(latest.knee_iso_pf_R||0))/2;const strength=Math.min(100,Math.round(kA/40));const jump=Math.min(100,Math.round((latest.cmj_jh||0)/.35));const reactive=Math.min(100,Math.round((latest.cmj_ft_ct||0)/0.012));const power=Math.min(100,Math.round((latest.cmj_pp_bm||0)/.55));let lS=0,lC=0;activeTests.filter(t=>t.bilateral).forEach(t=>{const lsi=calcLSI(latest[`${t.id}_L`],latest[`${t.id}_R`]);if(lsi!==null){lS+=lsi;lC++;}});return{strength,power,reactive,jump,symmetry:lC>0?Math.round(lS/lC):0};},[latest,activeTests]);
  const asymmetries=useMemo(()=>{const list=[];activeTests.filter(t=>t.bilateral).forEach(t=>{const l=latest[`${t.id}_L`],r=latest[`${t.id}_R`];if(l!=null&&r!=null)list.push({name:t.name,l,r,asym:calcAsym(l,r),status:getStatus(calcAsym(l,r))});});list.sort((a,b)=>b.asym-a.asym);return list;},[latest,activeTests]);

  if(loading)return<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",fontFamily:"system-ui"}}><div style={{fontSize:16,color:C.carltonNavy,fontWeight:600}}>Loading...</div></div>;

  return(<div style={{fontFamily:"system-ui,-apple-system,sans-serif",background:C.bg,minHeight:"100vh",color:C.text}}>
    <div style={{background:`linear-gradient(135deg,${C.carltonNavy} 0%,#142338 100%)`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 10px rgba(0,0,0,0.2)"}}><div><div style={{color:"#fff",fontSize:15,fontWeight:800,letterSpacing:1.2}}>CARLTON AFLW</div><div style={{color:C.carltonSilver,fontSize:10,letterSpacing:2.5,marginTop:1}}>PERFORMANCE RECONDITIONING</div></div><div style={{display:"flex",gap:8,alignItems:"center"}}>{Object.keys(athletes).length>0&&<select value={cur} onChange={e=>{setCur(e.target.value);persist(athletes,e.target.value,tests);}} style={{padding:"6px 10px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:12,cursor:"pointer"}}>{Object.keys(athletes).map(a=><option key={a} value={a} style={{color:"#000"}}>{a}</option>)}</select>}<Btn small style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff"}} onClick={()=>setShowAdd(true)}>+ Athlete</Btn><Btn small style={{background:C.teal,border:"none",color:"#fff"}} onClick={()=>setShowImport(true)}>📄 Import</Btn></div></div>
    {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:C.greenBg,color:C.greenDark,padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:13,zIndex:300,boxShadow:"0 4px 12px rgba(0,0,0,0.15)",border:`1px solid ${C.green}`}}>{toast}</div>}
    {showAdd&&<Modal title="Add Athlete" onClose={()=>{setShowAdd(false);setNewName("");}}><input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAthlete()} placeholder="Athlete name" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,boxSizing:"border-box",marginBottom:14}}/><div style={{display:"flex",gap:8}}><Btn style={{flex:1}} onClick={()=>{setShowAdd(false);setNewName("");}}>Cancel</Btn><Btn primary style={{flex:1}} onClick={addAthlete}>Add</Btn></div></Modal>}
    {showAddTest&&<AddTestModal tests={tests} onAdd={addTest} onClose={()=>setShowAddTest(false)}/>}
    {showImport&&<CSVImporter onImport={handleCSVImport} onClose={()=>setShowImport(false)} existingAthletes={Object.keys(athletes)}/>}

    {!cur?(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"70vh",gap:16}}><div style={{width:80,height:80,borderRadius:20,background:C.carltonNavy,display:"flex",alignItems:"center",justifyContent:"center",color:C.carltonSilver,fontWeight:800,fontSize:14,textAlign:"center",lineHeight:1.2,padding:8}}>CARLTON<br/>AFLW</div><div style={{fontSize:18,fontWeight:700,color:C.carltonNavy}}>Performance Reconditioning Hub</div><div style={{fontSize:13,color:C.textLight,textAlign:"center",maxWidth:300}}>Add an athlete or import ForceDecks CSVs to get started.</div><div style={{display:"flex",gap:8}}><Btn primary onClick={()=>setShowAdd(true)}>+ Add Athlete</Btn><Btn accent onClick={()=>setShowImport(true)}>📄 Import CSV</Btn></div></div>):(
    <><div style={{display:"flex",gap:0,background:"#fff",borderBottom:`1px solid ${C.border}`,position:"sticky",top:56,zIndex:90,overflowX:"auto"}}>{[{key:"dashboard",label:"📊 Dashboard"},{key:"input",label:"➕ New Session"},{key:"tests",label:"⚙️ Tests"},{key:"history",label:"📋 History"}].map(t=>(<button key={t.key} onClick={()=>{setView(t.key);setEditIdx(null);}} style={{padding:"12px 18px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:view===t.key?C.carltonNavy:C.textLight,borderBottom:view===t.key?`3px solid ${C.teal}`:"3px solid transparent",whiteSpace:"nowrap"}}>{t.label}</button>))}</div>
    <div style={{maxWidth:820,margin:"0 auto",padding:"20px 16px",paddingBottom:60}}>
      {view==="dashboard"&&(<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}><div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${C.carltonNavy},#1a3050)`,display:"flex",alignItems:"center",justifyContent:"center",color:C.carltonSilver,fontWeight:800,fontSize:17}}>{cur.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div><div><div style={{fontSize:22,fontWeight:800,color:C.carltonNavy}}>{cur}</div><div style={{fontSize:12,color:C.textLight}}>{latest.date?`Latest: ${latest.date} • ${sessions.length} session${sessions.length!==1?"s":""}`:"No sessions yet"}</div></div></div><Btn small danger onClick={()=>{if(confirm(`Delete ${cur}?`))removeAthlete();}}>Delete</Btn></div>
        {sessions.length===0?(<Card style={{textAlign:"center",padding:48}}><div style={{fontSize:44,marginBottom:12,opacity:.4}}>📊</div><div style={{fontSize:15,fontWeight:600,color:C.carltonNavy,marginBottom:20}}>No testing data yet</div><div style={{display:"flex",gap:8,justifyContent:"center"}}><Btn accent onClick={()=>setShowImport(true)}>📄 Import CSV</Btn><Btn primary onClick={()=>setView("input")}>+ Manual Session</Btn></div></Card>):(<>
          {latest.notes&&<Card style={{marginBottom:20,borderLeft:`4px solid ${C.teal}`,background:"#F0FDFA"}}><div style={{fontWeight:700,fontSize:15,color:C.carltonNavy,marginBottom:6}}>Key Takeaways</div><div style={{fontSize:13,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{latest.notes}</div></Card>}
          <div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginBottom:4}}>Performance Results</div>
          {Object.entries(activeCats).map(([cat,ts])=>{const hasData=ts.some(t=>t.bilateral?(latest[`${t.id}_L`]!=null||latest[`${t.id}_R`]!=null):latest[t.id]!=null);if(!hasData)return null;return(<div key={cat}><SectionHead title={cat} color={CAT_COLORS[cat]||C.purple} count={ts.filter(t=>t.bilateral?latest[`${t.id}_L`]!=null:latest[t.id]!=null).length}/>{ts.map(t=>t.bilateral?<BilateralCard key={t.id} test={t} data={latest} pb={pbs} prev={prev}/>:<UnilateralCard key={t.id} test={t} data={latest} pb={pbs} prev={prev}/>)}</div>);})}
          <div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginTop:32,marginBottom:12}}>Performance Insights</div>
          <ProfileRadar scores={profileScores}/>
          <div style={{fontWeight:700,fontSize:18,color:C.carltonNavy,marginTop:28,marginBottom:12}}>Jump Profiling</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><QuadrantChart title="Neuromuscular Profile" xLabel="Peak Power/BM" yLabel="Jump Height" xKey="cmj_pp_bm" yKey="cmj_jh" sessions={sessions} quadrants={["Reactive","Explosive","Underpowered","Powerful"]}/><QuadrantChart title="CMJ Strategy" xLabel="RSI-modified" yLabel="Jump Height" xKey="cmj_rsi_mod" yKey="cmj_jh" sessions={sessions} quadrants={["High but Slow","Fast & High","Slow & Low","Fast but Low"]}/></div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><QuadrantChart title="Eccentric Profile" xLabel="Ecc Decel RFD/BM" yLabel="Ecc Peak Force/BM" xKey="cmj_ecc_rfd_bm" yKey="cmj_ecc_pf_bm" sessions={sessions} quadrants={["Fast but Weak","Strong & Fast","Low Capacity","Strong but Slow"]}/><QuadrantChart title="Reactive Strength" xLabel="Jump Height" yLabel="FT:CT Ratio" xKey="cmj_jh" yKey="cmj_ft_ct" sessions={sessions} quadrants={["Slow SSC","Complete Athlete","Develop Reactivity","Fast SSC"]}/></div>
          <div style={{fontWeight:700,fontSize:18,color:C.carltonNavy,marginTop:28,marginBottom:12}}>Isometric Joint Profiling</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><QuadrantChart title="Knee ISO Profile" xLabel="Peak Force" yLabel="Force at 200ms" xKey="_kpf" yKey="_kf2" sessions={sessions.map(s=>({...s,_kpf:s.knee_iso_pf_L&&s.knee_iso_pf_R?(s.knee_iso_pf_L+s.knee_iso_pf_R)/2:null,_kf2:s.knee_iso_f200_L&&s.knee_iso_f200_R?(s.knee_iso_f200_L+s.knee_iso_f200_R)/2:null}))} quadrants={["Fast but Weak","Strong & Fast","Low Capacity","Strong but Slow"]}/><QuadrantChart title="Ankle ISO Profile" xLabel="Peak Force" yLabel="Force at 200ms" xKey="_apf" yKey="_af2" sessions={sessions.map(s=>({...s,_apf:s.ankle_iso_pf_L&&s.ankle_iso_pf_R?(s.ankle_iso_pf_L+s.ankle_iso_pf_R)/2:null,_af2:s.ankle_iso_f200_L&&s.ankle_iso_f200_R?(s.ankle_iso_f200_L+s.ankle_iso_f200_R)/2:null}))} quadrants={["Fast but Weak","Strong & Fast","Low Capacity","Strong but Slow"]}/></div>
          {asymmetries.length>0&&(<><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginTop:32,marginBottom:12}}>Asymmetry Dashboard</div><Card><div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap"}}>{[["Normal (≤10%)",C.green],["Monitor (10-15%)",C.amber],["Flag (>15%)",C.red]].map(([l,c])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:c}}/><span style={{fontSize:10,color:C.textLight}}>{l}</span></div>))}</div><div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><span style={{fontSize:12,fontWeight:700,color:C.redDark}}>{asymmetries.filter(a=>a.status==="flag").length} Flag</span><span style={{fontSize:12,fontWeight:700,color:C.amberDark}}>{asymmetries.filter(a=>a.status==="monitor").length} Monitor</span><span style={{fontSize:12,fontWeight:700,color:C.greenDark}}>{asymmetries.filter(a=>a.status==="normal").length} Normal</span></div>{asymmetries.map((a,i)=><AsymRow key={i} name={a.name} l={a.l} r={a.r}/>)}</Card></>)}
        </>)}
      </>)}
      {view==="input"&&(<><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginBottom:4}}>{editIdx!==null?"Edit Session":"New Testing Session"}</div><div style={{fontSize:12,color:C.textLight,marginBottom:16}}>{activeTests.length} tests enabled • <span style={{color:C.teal,cursor:"pointer",fontWeight:600}} onClick={()=>setView("tests")}>Configure</span> • <span style={{color:C.teal,cursor:"pointer",fontWeight:600}} onClick={()=>setShowImport(true)}>Import CSV instead</span></div><InputForm tests={tests} onSave={saveSession} existingData={editIdx!==null?sessions[editIdx]:null}/></>)}
      {view==="tests"&&(<><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginBottom:4}}>Test Configuration</div><div style={{fontSize:12,color:C.textLight,marginBottom:16}}>Toggle tests, add new ones, or create custom categories.</div><TestConfig tests={tests} onUpdate={updateTests} onAddTest={()=>setShowAddTest(true)} onDeleteTest={deleteTest}/></>)}
      {view==="history"&&(<><div style={{fontWeight:800,fontSize:20,color:C.carltonNavy,marginBottom:16}}>Session History</div>{sessions.length===0?<Card style={{textAlign:"center",padding:32,color:C.textLight}}>No sessions recorded.</Card>:sessions.slice().reverse().map((s,ri)=>{const i=sessions.length-1-ri,filled=Object.keys(s).filter(k=>k!=="date"&&k!=="notes"&&s[k]!=null).length;return(<Card key={i} style={{marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{flex:1}}><div style={{fontWeight:700,color:C.carltonNavy,fontSize:14}}>{s.date}{i===sessions.length-1&&<span style={{fontSize:10,background:C.tealLight,color:"#fff",padding:"1px 8px",borderRadius:8,marginLeft:6}}>Latest</span>}</div><div style={{fontSize:11,color:C.textLight,marginTop:2}}>{filled} metrics</div>{s.notes&&<div style={{fontSize:11,color:C.textMid,marginTop:3,fontStyle:"italic"}}>{s.notes.slice(0,100)}</div>}</div><div style={{display:"flex",gap:6,flexShrink:0}}><Btn small onClick={()=>{setEditIdx(i);setView("input");}}>Edit</Btn><Btn small danger onClick={()=>{if(confirm("Delete?"))delSession(i);}}>Delete</Btn></div></Card>);})}</>)}
    </div></>)}
    <div style={{textAlign:"center",padding:"20px 16px 32px",fontSize:11,color:C.textLight}}>Carlton AFLW Performance Reconditioning • Powered by Calibre.</div>
  </div>);
}
