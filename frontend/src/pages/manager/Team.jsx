import { useEffect, useState } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import MemberModal from '../../components/dashboard/MemberModal';
import api from '../../utils/api';

export default function Team() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/analytics/summary').then(r => setSummary(r.data.summary)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = summary.filter(s => {
    const matchSearch = s.user.name.toLowerCase().includes(search.toLowerCase()) || (s.user.department||'').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==='all' || (filter==='high' && s.productivity?.burnoutRisk==='high') || (filter==='anomaly' && s.productivity?.anomalyFlag);
    return matchSearch && matchFilter;
  });

  if (loading) return <div style={{display:'flex'}}><Sidebar role="manager"/><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner" style={{width:'36px',height:'36px'}}/></div></div>;

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar role="manager" />
      <main style={{ flex:1, padding:'32px', overflowY:'auto' }}>
        <div style={{ marginBottom:'28px' }}>
          <h2 style={{ fontSize:'26px', fontWeight:800, color:'#f0eeff' }}>Team</h2>
          <p style={{ color:'#7b7a99', fontSize:'14px', marginTop:'4px' }}>{summary.length} members — click any card for details</p>
        </div>
        <div style={{ display:'flex', gap:'12px', marginBottom:'24px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or department..." style={{ flex:1, background:'#1a1a28', border:'1px solid rgba(255,255,255,0.08)', color:'#f0eeff', borderRadius:'8px', padding:'10px 14px', outline:'none', fontSize:'14px' }}/>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ background:'#1a1a28', border:'1px solid rgba(255,255,255,0.08)', color:'#f0eeff', borderRadius:'8px', padding:'10px 14px', outline:'none', fontSize:'14px', cursor:'pointer' }}>
            <option value="all">All Members</option>
            <option value="high">High Burnout Risk</option>
            <option value="anomaly">Has Anomaly</option>
          </select>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>
          {filtered.map(({ user, productivity: p }, i) => (
            <div key={i} className="card" onClick={()=>setSelected({user,productivity:p})}
              style={{ cursor:'pointer', transition:'transform 0.2s, border-color 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='rgba(108,99,255,0.4)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}>
              <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(108,99,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:800, color:'#6c63ff', flexShrink:0 }}>{user.name[0]}</div>
                <div style={{ flex:1 }}><p style={{ fontSize:'15px', fontWeight:700, color:'#f0eeff' }}>{user.name}</p><p style={{ fontSize:'12px', color:'#7b7a99' }}>{user.department||'No dept'}</p></div>
                <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'999px', fontWeight:600, background:'rgba(108,99,255,0.12)', color:'#6c63ff' }}>{user.role}</span>
              </div>
              <div style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontSize:'12px', color:'#7b7a99' }}>Productivity</span>
                  <span style={{ fontSize:'14px', fontWeight:800, color:(p?.score||0)>=75?'#00d9a3':(p?.score||0)>=50?'#6c63ff':'#ff5c87' }}>{p?.score??'—'}</span>
                </div>
                <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'2px' }}><div style={{ width:`${p?.score||0}%`, height:'100%', background:'linear-gradient(90deg,#6c63ff,#00d9a3)', borderRadius:'2px' }}/></div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'999px', fontWeight:600, background:p?.burnoutRisk==='high'?'rgba(255,92,135,0.15)':p?.burnoutRisk==='medium'?'rgba(255,179,71,0.15)':'rgba(0,217,163,0.15)', color:p?.burnoutRisk==='high'?'#ff5c87':p?.burnoutRisk==='medium'?'#ffb347':'#00d9a3' }}>{p?.burnoutRisk||'low'} risk</span>
                {p?.anomalyFlag && <span style={{ fontSize:'11px', color:'#ffb347' }}>⚠ Anomaly</span>}
                <span style={{ fontSize:'12px', color:'#6c63ff' }}>View details →</span>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="card" style={{ textAlign:'center', padding:'40px', color:'#7b7a99', gridColumn:'1/-1' }}>No members found.</div>}
        </div>
      </main>
      {selected && <MemberModal member={selected} onClose={()=>setSelected(null)} />}
    </div>
  );
}
