import { useEffect, useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name:'', description:'', endDate:'' });
  const [saving, setSaving]     = useState(false);

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    api.get('/projects').then(r => { setProjects(r.data.projects); setLoading(false); }).catch(console.error);
  }, []);

  const createProject = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/projects', form);
      setProjects([...projects, data.project]);
      setShowForm(false); setForm({ name:'', description:'', endDate:'' });
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const statusColor = { active:'var(--accent3)', completed:'var(--accent1)', onhold:'var(--accent4)' };

  if (loading) return (
    <div style={{ display:'flex' }}>
      <Sidebar role={user?.role} />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner" style={{ width:'36px', height:'36px' }} /></div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar role={user?.role} />
      <main style={{ flex:1, padding:'32px', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px' }}>
          <div>
            <h2 style={{ fontFamily:'Syne', fontSize:'26px', fontWeight:800 }}>Projects</h2>
            <p style={{ color:'var(--muted)', fontSize:'14px', marginTop:'4px' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          {isManager && <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ New Project</button>}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="card fade-up" style={{ marginBottom:'24px' }}>
            <h3 style={{ fontFamily:'Syne', fontWeight:700, marginBottom:'20px' }}>Create Project</h3>
            <form onSubmit={createProject} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div><label>Project Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="WorkPulse MVP" required /></div>
              <div><label>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Brief description..." /></div>
              <div><label>End Date</label><input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} /></div>
              <div style={{ display:'flex', gap:'12px' }}>
                <button className="btn-primary" type="submit" disabled={saving}>{saving ? <span className="spinner"/> : 'Create'}</button>
                <button className="btn-ghost" type="button" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Project cards */}
        {projects.length === 0
          ? <div className="card" style={{ textAlign:'center', padding:'60px' }}><p style={{ color:'var(--muted)' }}>No projects yet.{isManager ? ' Create one above!' : ''}</p></div>
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:'16px' }}>
              {projects.map(p => {
                const done  = p.tasks?.filter(t => t.status==='done').length || 0;
                const total = p.tasks?.length || 0;
                const pct   = total ? Math.round((done/total)*100) : 0;
                return (
                  <div key={p._id} className="card" style={{ position:'relative' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
                      <h3 style={{ fontFamily:'Syne', fontSize:'17px', fontWeight:700 }}>{p.name}</h3>
                      <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'999px', fontWeight:600, background:`rgba(0,0,0,0.3)`, color: statusColor[p.status] || 'var(--muted)' }}>{p.status}</span>
                    </div>
                    {p.description && <p style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'16px', lineHeight:1.6 }}>{p.description}</p>}

                    {/* Progress bar */}
                    <div style={{ marginBottom:'12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                        <span style={{ fontSize:'12px', color:'var(--muted)' }}>Progress</span>
                        <span style={{ fontSize:'12px', fontWeight:700, color:'var(--accent1)' }}>{pct}%</span>
                      </div>
                      <div style={{ height:'6px', background:'var(--surface2)', borderRadius:'3px', overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg, #6c63ff, #00d9a3)', borderRadius:'3px', transition:'width 0.5s' }} />
                      </div>
                    </div>

                    {/* Tasks */}
                    {p.tasks?.length > 0 && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                        {p.tasks.slice(0,3).map((t, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px' }}>
                            <span>{t.status==='done' ? '✅' : t.status==='inprogress' ? '🔄' : '⬜'}</span>
                            <span style={{ color: t.status==='done' ? 'var(--muted)' : 'var(--text)', textDecoration: t.status==='done' ? 'line-through' : 'none' }}>{t.title}</span>
                          </div>
                        ))}
                        {p.tasks.length > 3 && <p style={{ fontSize:'12px', color:'var(--muted)', marginTop:'4px' }}>+{p.tasks.length-3} more tasks</p>}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'16px', paddingTop:'14px', borderTop:'1px solid var(--border)' }}>
                      <span style={{ fontSize:'12px', color:'var(--muted)' }}>👤 {p.manager?.name || 'N/A'}</span>
                      <span style={{ fontSize:'12px', color:'var(--muted)' }}>{done}/{total} tasks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </main>
    </div>
  );
}
