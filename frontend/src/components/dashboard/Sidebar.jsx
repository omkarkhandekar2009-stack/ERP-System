import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotifBell from './NotifBell';

const NavItem = ({ to, icon, label, active }) => (
  <Link to={to} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 16px', borderRadius:'10px', textDecoration:'none', fontSize:'14px', fontWeight: active ? 600 : 400, color: active ? 'var(--text)' : 'var(--muted)', background: active ? 'rgba(108,99,255,0.15)' : 'transparent', transition:'all 0.2s', marginBottom:'4px' }}>
    <span style={{ fontSize:'18px' }}>{icon}</span>
    {label}
  </Link>
);

export default function Sidebar({ role }) {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();

  const managerLinks = [
    { to:'/manager',            icon:'📊', label:'Dashboard'  },
    { to:'/manager/team',       icon:'👥', label:'Team'       },
    { to:'/manager/projects',   icon:'📋', label:'Projects'   },
    { to:'/manager/kanban',     icon:'🗂️', label:'Kanban'     },
    { to:'/manager/analytics',  icon:'🧠', label:'Analytics'  },
    { to:'/manager/alerts',     icon:'🔔', label:'AI Alerts'  },
    { to:'/manager/attendance', icon:'📅', label:'Attendance' },
    { to:'/manager/reports',    icon:'📥', label:'Reports'    },
    { to:'/profile',            icon:'👤', label:'Profile'    },
  ];

  const employeeLinks = [
    { to:'/employee',            icon:'📊', label:'Dashboard'  },
    { to:'/employee/activity',   icon:'⏱️', label:'My Activity' },
    { to:'/employee/projects',   icon:'📋', label:'Projects'   },
    { to:'/employee/kanban',     icon:'🗂️', label:'Kanban'     },
    { to:'/employee/attendance', icon:'📅', label:'Attendance' },
    { to:'/employee/privacy',    icon:'🔒', label:'Privacy'    },
    { to:'/profile',             icon:'👤', label:'Profile'    },
  ];

  const links = role === 'manager' ? managerLinks : employeeLinks;

  return (
    <div style={{ width:'240px', minHeight:'100vh', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:'24px 16px', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', paddingLeft:'8px' }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'20px', fontWeight:800 }} className="grad-text">WorkPulse</h1>
          <p style={{ fontSize:'11px', color:'var(--muted)', marginTop:'4px', textTransform:'uppercase', letterSpacing:'1px' }}>{role} view</p>
        </div>
        <NotifBell />
      </div>

      <nav style={{ flex:1 }}>
        {links.map(l => <NavItem key={l.to} {...l} active={pathname === l.to} />)}
      </nav>

      {/* User info */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:'16px', marginTop:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'rgba(108,99,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'var(--accent1)' }}>
            {user?.name?.[0]}
          </div>
          <div>
            <p style={{ fontSize:'13px', fontWeight:600 }}>{user?.name}</p>
            <p style={{ fontSize:'11px', color:'var(--muted)' }}>{user?.department}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost" style={{ width:'100%', padding:'8px', fontSize:'13px' }}>Sign Out</button>
      </div>
    </div>
  );
}
