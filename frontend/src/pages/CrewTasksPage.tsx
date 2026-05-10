import React, { useEffect, useState } from 'react';
import { getMaintenanceTasks, updateMaintenanceTask } from '../api/services';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusBadge: Record<string, string> = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Completed': 'badge-completed' };
const priorityBadge: Record<string, string> = { 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };

const CrewTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [noteModal, setNoteModal] = useState<any>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => { load(); }, [filterStatus]);

  const load = async () => {
    const params: any = {};
    if (filterStatus) params.status = filterStatus;
    const res = await getMaintenanceTasks(params);
    setTasks(res.data); setLoading(false);
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try { await updateMaintenanceTask(taskId, { status }); toast.success('Status updated'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await updateMaintenanceTask(noteModal._id, { note: noteText });
    toast.success('Note added'); setNoteModal(null); setNoteText(''); load();
  };

  const isOverdue = (t: any) => t.status !== 'Completed' && new Date(t.dueDate) < new Date();

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">My Tasks</div>
          <div className="page-subtitle">{tasks.length} tasks · {tasks.filter(isOverdue).length} overdue</div>
        </div>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Pending', 'In Progress', 'Completed'].map(s => <option key={s}>{s}</option>)}
        </select>
        {filterStatus && <button className="btn btn-secondary btn-sm" onClick={() => setFilterStatus('')}>✕ Clear</button>}
      </div>

      {tasks.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No tasks found</div></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map(task => (
            <div key={task._id} className="card">
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{task.title}</div>
                      <span className={`badge ${priorityBadge[task.priority]}`}>{task.priority}</span>
                      <span className={`badge ${statusBadge[task.status]}`}>{task.status}</span>
                      {isOverdue(task) && <span className="badge badge-overdue">⚠️ Overdue</span>}
                    </div>
                    {task.description && <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{task.description}</div>}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🚢 {task.shipId?.name || '—'}</span>
                      <span style={{ fontSize: '12px', color: isOverdue(task) ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                        📅 Due: {task.dueDate ? format(new Date(task.dueDate), 'dd MMM yyyy') : '—'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <select className="filter-select" value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)} style={{ fontSize: '12px' }}>
                      <option>Pending</option><option>In Progress</option><option>Completed</option>
                    </select>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setNoteModal(task); setNoteText(''); }}>📝</button>
                  </div>
                </div>
                {task.notes?.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                    {task.notes.map((n: any, i: number) => (
                      <div key={i} style={{ background: 'var(--glass)', borderRadius: '6px', padding: '8px 10px', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {n.text} <span style={{ color: 'var(--text-muted)' }}>— {n.addedBy?.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {noteModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setNoteModal(null)}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <span className="modal-title">📝 Add Note</span>
              <button className="btn btn-secondary btn-icon" onClick={() => setNoteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Note for: {noteModal.title}</label>
                <textarea className="form-textarea" placeholder="Write your note…" value={noteText} onChange={e => setNoteText(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setNoteModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddNote}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewTasksPage;
