'use client';

import dynamic from 'next/dynamic';

const PerformanceHub = dynamic(() => import('./PerformanceHub'), { 
  ssr: false,
  loading: () => (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',fontFamily:'system-ui'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:16,color:'#0C1B33',fontWeight:600}}>Loading Carlton AFLW Reconditioning Hub...</div>
      </div>
    </div>
  )
});

export default function Page() {
  return <PerformanceHub />;
}
