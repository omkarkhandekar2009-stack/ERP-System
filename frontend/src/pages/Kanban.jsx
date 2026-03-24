import { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { id:'todo',       label:'📋 To Do',      color:'#7b7a99' },
  { id:'inprogress', label:'🔄 In Progress', color:'#6c63ff' },
  { id:'review',     label:'👀 In Review',   color:'#ffb347' },
  { id:'done',       label:'✅ Done',        color:'#00d9a3' },
];

const DEMO_TASKS = [
  { id:1, title:'Design login page', assignee:'Sarah K.', priority:'high',   column:'done',       tag:'Frontend' },
  { id:2, title:'Build REST API',     assignee:'Rahul M.', priority:'high',   column:'inprogress', tag:'Backend'  },
  { id:3, title:'Write product spec', assignee:'Priya N.', priority:'medium', column:'done',       tag:'Product'  },
  { id:4, title:'Dashboard UI',       assignee:'Sarah K.', priority:'high',   column:'inprogress', tag:'Frontend' },
  { id:5, title:'Setup MongoDB',      assignee:'Rahul M.', priority:'low',    column:'done',       tag:'DevOps'   },
  { id:6, title:'Write unit tests',   assignee:'Priya N.', priority:'medium', column:'todo',       tag:'QA'       },
  { id:7, title:'Deploy to Vercel',   assignee:'Rahul M.', priority:'high',   column:'todo',       tag:'DevOps'   },
  { id:8, title:'User onboarding',    assignee:'Sarah K.', priority:'low',    column:'review',     tag:'Frontend' },
  { id:9, title:'API documentation',  assignee:'Priya N.', priority:'medium', column:'review',     tag:'Backend'  },
];

const priorityColor = { high:'#ff5c87', medium:'#ffb347', low:'#00d9a3' };
const tagColor = { Frontend:'rgba(108,99,255,0.2)', Backend:'rgba(255,92,135,0.2)', Product:'rgba(0,217,163,0.2)', DevOps:'rgba(255,179,71,0.2)', QA:'rgba(168,157,255,0.2)' };

export default function Kanban() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title:'', assignee:'', priority:'medium', tag:'Frontend' });

  const onDragStart = (task) => setDragging(task);
  const onDragOver = (e, colId) => { e.preventDefault(); setDragOver(colId); };
  const onDrop = (colId) => {
    if (!dragging) return;
    setTasks(tasks.map(t => t.id === dragging.id ? {...t, column: colId} : t));
    setDragging(null); setDragOver(null);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setTasks([...tasks, { ...newTask, id: Date.now(), column:'todo' }]);
    setNewTask({ title:'', assignee:'', priority:'medium', tag:'Frontend' });
    setShowForm(false);
  };

  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));

  const inp = { background:'#1a1a28', border:'1px solid rgba(255,255,255,0.08)', color:'#f0eeff', borderRadius:'8px', padding:'8px 12px', width:'100%', outline:'none', fontSize:'13px' };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar role={user?.role} />
      <main style={{ flex:1, padding:'32px', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px' }}>
          <div>
            <h2 style={{ fontSize:'26px', fontWeight:800, color:'#f0eeff' }}>Kanban Board</h2>
            <p style={{ color:'#7b7a99', fontSize:'14px', marginTop:'4px' }}>{tasks.length} tasks across {COLUMNS.length} columns</p>
          </div>
          <button className="btn-primary" onClick={()=>setShowForm(!showForm)}>+ Add Task</button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <div className="card" style={{ marginBottom:'24px' }}>
            <h3 style={{ fontWeight:700, color:'#f0eeff', marginBottom:'16px' }}>New Task</h3>
            <form onSubmit={addTask} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:'12px', alignItems:'end' }}>
              <div><label style={{ fontSize:'11px', color:'#7b7a99', display:'block', marginBottom:'4px' }}>Task Title</label><input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="Enter task..." style={inp} required /></div>
              <div><label style={{ fontSize:'11px', color:'#7b7a99', display:'block', marginBottom:'4px' }}>Assignee</label><input value={newTask.assignee} onChange={e=>setNewTask({...newTask,assignee:e.target.value})} placeholder="Name" style={inp} /></div>
              <div><label style={{ fontSize:'11px', color:'#7b7a99', display:'block', marginBottom:'4px' }}>Priority</label><select value={newTask.priority} onChange={e=>setNewTask({...newTask,priority:e.target.value})} style={inp}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
              <div><label style={{ fontSize:'11px', color:'#7b7a99', display:'block', marginBottom:'4px' }}>Tag</label><select value={newTask.tag} onChange={e=>setNewTask({...newTask,tag:e.target.value})} style={inp}><option>Frontend</option><option>Backend</option><option>Product</option><option>DevOps</option><option>QA</option></select></div>
              <button className="btn-primary" type="submit" style={{ padding:'8px 20px' }}>Add</button>
            </form>
          </div>
        )}

        {/* Kanban Columns */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', alignItems:'start' }}>
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.column === col.id);
            return (
              <div key={col.id} onDragOver={e=>onDragOver(e,col.id)} onDrop={()=>onDrop(col.id)}
                style={{ background: dragOver===col.id ? 'rgba(108,99,255,0.05)' : '#12121a', border:`1px solid ${dragOver===col.id ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:'14px', padding:'16px', minHeight:'200px', transition:'all 0.2s' }}>
                {/* Column header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                  <p style={{ fontSize:'13px', fontWeight:700, color:col.color }}>{col.label}</p>
                  <span style={{ fontSize:'11px', background:'rgba(255,255,255,0.08)', color:'#7b7a99', padding:'2px 8px', borderRadius:'999px', fontWeight:600 }}>{colTasks.length}</span>
                </div>

                {/* Tasks */}
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {colTasks.map(task => (
                    <div key={task.id} draggable onDragStart={()=>onDragStart(task)}
                      style={{ background:'#1a1a28', borderRadius:'10px', padding:'14px', cursor:'grab', border:'1px solid rgba(255,255,255,0.06)', transition:'transform 0.1s', userSelect:'none' }}
                      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'10px' }}>
                        <p style={{ fontSize:'13px', fontWeight:600, color:'#f0eeff', lineHeight:1.4, flex:1 }}>{task.title}</p>
                        <button onClick={()=>deleteTask(task.id)} style={{ background:'none', border:'none', color:'#7b7a99', cursor:'pointer', fontSize:'14px', padding:'0 0 0 8px', lineHeight:1 }}>×</button>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'999px', background: tagColor[task.tag] || 'rgba(255,255,255,0.1)', color:'#f0eeff', fontWeight:600 }}>{task.tag}</span>
                        <span style={{ fontSize:'10px', fontWeight:700, color: priorityColor[task.priority] }}>● {task.priority}</span>
                      </div>
                      {task.assignee && <p style={{ fontSize:'11px', color:'#7b7a99', marginTop:'8px' }}>👤 {task.assignee}</p>}
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div style={{ textAlign:'center', padding:'24px', color:'#7b7a99', fontSize:'13px', border:'2px dashed rgba(255,255,255,0.06)', borderRadius:'8px' }}>
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
