import React, { useEffect, useState } from 'react';
import { getMaintenanceTasks, getDrills, attendDrill, updateMaintenanceTask } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CrewDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [drills, setDrills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [t, d] = await Promise.all([getMaintenanceTasks(), getDrills({ status: 'Scheduled' })]);
    setTasks(t.data); setDrills(d.data); setLoading(false);
  };

  const handleAttend = async (drillId: string) => {
    try { await attendDrill(drillId); toast.success('Attendance marked! ✅'); loadAll(); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Error'); }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try { await updateMaintenanceTask(taskId, { status }); toast.success('Status updated'); loadAll(); }
    catch { toast.error('Failed to update'); }
  };

  const isOverdue = (t: any) => t.status !== 'Completed' && new Date(t.dueDate) < new Date();
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const overdueCount = tasks.filter(isOverdue).length;
  const upcomingDrills = drills.filter(d => new Date(d.scheduledDate) >= new Date());

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</div>
          <div className="page-subtitle">{user?.rank} · {user?.shipId?.name || 'No ship assigned'}</div>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="alert alert-danger">
          <span>⚠️</span>
          <span>You have <strong>{overdueCount} overdue task(s)</strong>. Please complete them as soon as possible.</span>
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg,#f59e0b,#ef4444)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>📋</div>
          <div className="stat-value">{pendingTasks.length}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg,#10b981,#14b8a6)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✅</div>
          <div className="stat-value">{completedTasks.length}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg,#ef4444,#f97316)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>⚠️</div>
          <div className="stat-value">{overdueCount}</div>
          <div className="stat-label">Overdue Tasks</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg,#8b5cf6,#3b82f6)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>🚨</div>
          <div className="stat-value">{upcomingDrills.length}</div>
          <div className="stat-label">Upcoming Drills</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔧 My Tasks</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tasks.length} total</span>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {tasks.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No tasks assigned</div></div>
            ) : tasks.map(task => (
              <div key={task._id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{task.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {task.shipId?.name} · Due {task.dueDate ? format(new Date(task.dueDate), 'dd MMM yyyy') : '—'}
                    </div>
                    {isOverdue(task) && <span className="badge badge-overdue" style={{ marginTop: '4px' }}>⚠️ Overdue</span>}
                  </div>
                  <select className="filter-select" style={{ fontSize: '12px', padding: '4px 8px' }}
                    value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
                    <option>Pending</option><option>In Progress</option><option>Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🚨 Upcoming Drills</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{upcomingDrills.length} scheduled</span>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {upcomingDrills.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🎉</div><div className="empty-title">No upcoming drills</div></div>
            ) : upcomingDrills.map(drill => {
              const myEntry = drill.participants?.find((p: any) => (p.userId?._id || p.userId) === user?._id);
              return (
                <div key={drill._id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{drill.title}</div>
                      <span className="badge badge-scheduled" style={{ marginRight: '6px' }}>{drill.type}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {drill.scheduledDate ? format(new Date(drill.scheduledDate), 'dd MMM yyyy') : '—'}
                      </span>
                    </div>
                    {!myEntry?.attended
                      ? <button className="btn btn-success btn-sm" onClick={() => handleAttend(drill._id)}>✅ Attend</button>
                      : <span className="badge badge-completed">✅ Attended</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewDashboard;
