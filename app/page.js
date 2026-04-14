'use client';
import dynamic from 'next/dynamic';
const Hub = dynamic(() => import('./PerformanceHub'), { ssr: false, loading: () => <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',fontFamily:'system-ui'}}><div style={{fontSize:16,color:'#0E1E2F',fontWeight:600}}>Loading Carlton AFLW Reconditioning Hub...</div></div> });
export default function Page() { return <Hub />; }
