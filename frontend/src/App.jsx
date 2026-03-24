import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Profile    from './pages/Profile';
import Attendance from './pages/Attendance';
import Kanban     from './pages/Kanban';
import Reports    from './pages/Reports';
import ManagerDashboard  from './pages/manager/ManagerDashboard';
import Team       from './pages/manager/Team';
import Analytics  from './pages/manager/Analytics';
import Alerts     from './pages/manager/Alerts';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Activity   from './pages/employee/Activity';
import Privacy    from './pages/employee/Privacy';
import Projects   from './pages/Projects';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0f' }}><div className="spinner" style={{ width:'40px', height:'40px' }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={user.role === 'employee' ? '/employee' : '/manager'} replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? (user.role === 'employee' ? '/employee' : '/manager') : '/login'} replace />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Manager routes */}
      <Route path="/manager"           element={<ProtectedRoute allowedRoles={['manager','admin']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/team"      element={<ProtectedRoute allowedRoles={['manager','admin']}><Team /></ProtectedRoute>} />
      <Route path="/manager/projects"  element={<ProtectedRoute allowedRoles={['manager','admin']}><Projects /></ProtectedRoute>} />
      <Route path="/manager/kanban"    element={<ProtectedRoute allowedRoles={['manager','admin']}><Kanban /></ProtectedRoute>} />
      <Route path="/manager/analytics" element={<ProtectedRoute allowedRoles={['manager','admin']}><Analytics /></ProtectedRoute>} />
      <Route path="/manager/alerts"    element={<ProtectedRoute allowedRoles={['manager','admin']}><Alerts /></ProtectedRoute>} />
      <Route path="/manager/attendance" element={<ProtectedRoute allowedRoles={['manager','admin']}><Attendance /></ProtectedRoute>} />
      <Route path="/manager/reports"   element={<ProtectedRoute allowedRoles={['manager','admin']}><Reports /></ProtectedRoute>} />

      {/* Employee routes */}
      <Route path="/employee"           element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/activity"  element={<ProtectedRoute allowedRoles={['employee']}><Activity /></ProtectedRoute>} />
      <Route path="/employee/projects"  element={<ProtectedRoute allowedRoles={['employee']}><Projects /></ProtectedRoute>} />
      <Route path="/employee/kanban"    element={<ProtectedRoute allowedRoles={['employee']}><Kanban /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><Attendance /></ProtectedRoute>} />
      <Route path="/employee/privacy"   element={<ProtectedRoute allowedRoles={['employee']}><Privacy /></ProtectedRoute>} />

      {/* Shared routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotifProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NotifProvider>
    </AuthProvider>
  );
}
