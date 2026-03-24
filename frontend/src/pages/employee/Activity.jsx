import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Sidebar from '../../components/dashboard/Sidebar';
import api from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const categoryIcon = { coding: '💻', browsing: '🌐', communication: '💬', design: '🎨', docs: '📄', meeting: '🎥', idle: '💤', other: '📱' };
const categoryColor = { coding: '#6c63ff', browsing: '#ff5c87', communication: '#00d9a3', design: '#a89dff', docs: '#ffb347', meeting: '#ff5c87', idle: '#555', other: '#7b7a99' };

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get('/activity/me')
      .then(r => setActivities(r.data.activities))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group by category for chart
  const catMap = {};
  activities.forEach(a => { catMap[a.category] = (catMap[a.category] || 0) + a.durationSeconds; });
  const cats   = Object.keys(catMap);
  const barData = {
    labels: cats.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    datasets: [{
      label: 'Minutes',
      data: cats.map(c => Math.round(catMap[c] / 60)),
      backgroundColor: cats.map(c => categoryColor[c] || '#7b7a99'),
      borderRadius: 6,
    }],
  };

  const totalActive = activities.filter(a => a.category !== 'idle').reduce((s, a) => s + a.durationSeconds, 0);

  if (loading) return (
    <div style={{ display: 'flex' }}>
      <Sidebar role="employee" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="employee" />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '26px', fontWeight: 800 }}>My Activity</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>{activities.length} events logged today · {(totalActive / 3600).toFixed(1)}h active</p>
        </div>

        {activities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>⏱️</p>
            <p style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No activity yet</p>
            <p style={{ color: 'var(--muted)' }}>Start the desktop app to begin tracking your work.</p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Time by Category</p>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#7b7a99' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#7b7a99' }, grid: { color: 'rgba(255,255,255,0.04)' } } } }} height={70} />
            </div>

            {/* Log */}
            <div className="card">
              <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Activity Log</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--surface2)', borderRadius: '10px', borderLeft: `3px solid ${categoryColor[a.category] || '#555'}` }}>
                    <span style={{ fontSize: '18px' }}>{categoryIcon[a.category] || '📱'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600 }}>{a.isPrivate ? '[Private Session]' : a.appName}</p>
                      {!a.isPrivate && a.windowTitle && <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{a.windowTitle.slice(0, 60)}{a.windowTitle.length > 60 ? '…' : ''}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: categoryColor[a.category] }}>{Math.round(a.durationSeconds / 60)} min</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(a.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
