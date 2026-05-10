import React, { useEffect, useState } from 'react';
import { getMaintenanceTasks, createMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask, getShips, getUsers } from '../api/services';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusBadge: Record<string,string> = { 'Pending':'badge-pending','In Progress':'badge-progress','Completed':'badge-completed' };
const priorityBadge: Record<string,string> = { 'High':'badge-high','Medium':'badge-medium','Low':'badge-low' };
const emptyForm = { title:'',description:'',shipId:'',assignedTo:'',priority:'Medium',dueDate:'',status:'Pending' };

const MaintenancePage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [crew, setCrew] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ shipId:'',status:'',priority:'' });
  const [noteModal, setNoteModal] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadTasks(); }, [filters]);

  const loadAll = async () => {
    const [t, s, u] = await Promise.all([getMaintenanceTasks(), getShips(), getUsers({ role:'crew' })]);
    setTasks(t.data); setShips(s.data); setCrew(u.data); setLoading(false);
  };

  const loadTasks = async () => {
    const params: any = {};
    if (filters.shipId) params.shipId = filters.shipId;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    const res = await getMaintenanceTasks(params);
    setTasks(res.data);
  };

  const openCreate = () => { setEditTask(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (task: any) => {
    setEditTask(task);
    setForm({ title:task.title, description:task.description, shipId:task.shipId?._id||'', assignedTo:task.assignedTo?._id||'', priority:task.priority, dueDate:task.dueDate?.split('T')[0]||'', status:task.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title||!form.shipId||!form.dueDate) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      editTask ? await updateMaintenanceTask(editTask._id, form) : await createMaintenanceTask(form);
      toast.success(editTask ? 'Task updated' : 'Task created');
      setShowModal(false); loadTasks();
    } catch (e:any) { toast.error(e?.response?.data?.message || 'Error saving'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await deleteMaintenanceTask(id); toast.success('Deleted'); loadTasks();
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await updateMaintenanceTask(noteModal._id, { note: noteText });
    toast.success('Note added'); setNoteModal(null); setNoteText(''); loadTasks();
  };

  const isOverdue = (t: any) => t.status !== 'Completed' && new Date(t.dueDate) < new Date();

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Maintenance Tasks</div>
          <div className="page-subtitle">{tasks.length} tasks · {tasks.filter(isOverdue).length} overdue</div>
        </div>
        <button id="create-task-btn" className="btn btn-primary" onClick={openCreate}>+ New Task</button>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={filters.shipId} onChange={e => setFilters(f=>({...f,shipId:e.target.value}))}>
          <option value="">All Ships</option>
          {ships.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select className="filter-select" value={filters.status} onChange={e => setFilters(f=>({...f,status:e.target.value}))}>
          <option value="">All Status</option>
          {['Pending','In Progress','Completed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.priority} onChange={e => setFilters(f=>({...f,priority:e.target.value}))}>
          <option value="">All Priority</option>
          {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
        </select>
        {(filters.shipId||filters.status||filters.priority) &&
          <button className="btn btn-secondary btn-sm" onClick={()=>setFilters({shipId:'',status:'',priority:''})}>✕ Clear</button>}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Task</th><th>Ship</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
            <tbody>
              {tasks.length===0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🔧</div><div className="empty-title">No tasks found</div></div></td></tr>
              ) : tasks.map(task => (
                <tr key={task._id}>
                  <td>
                    <div style={{fontWeight:600}}>{task.title}</div>
                    {isOverdue(task) && <span className="badge badge-overdue" style={{marginTop:'4px'}}>⚠️ Overdue</span>}
                  </td>
                  <td style={{color:'var(--text-secondary)'}}>{task.shipId?.name||'—'}</td>
                  <td style={{color:'var(--text-secondary)'}}>{task.assignedTo?.name||<span style={{color:'var(--text-muted)'}}>Unassigned</span>}</td>
                  <td><span className={`badge ${priorityBadge[task.priority]}`}>{task.priority}</span></td>
                  <td><span className={`badge ${statusBadge[task.status]}`}>{task.status}</span></td>
                  <td style={{color:isOverdue(task)?'var(--accent-red)':'var(--text-secondary)',fontSize:'13px'}}>
                    {task.dueDate ? format(new Date(task.dueDate),'dd MMM yyyy') : '—'}
                  </td>
                  <td>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="btn btn-secondary btn-sm" onClick={()=>{setNoteModal(task);setNoteText('');}}>📝</button>
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(task)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(task._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editTask?'✏️ Edit Task':'➕ New Task'}</span>
              <button className="btn btn-secondary btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Task title"/></div>
              <div className="form-group"><label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Description"/></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Ship *</label>
                  <select className="form-select" value={form.shipId} onChange={e=>setForm(f=>({...f,shipId:e.target.value}))}>
                    <option value="">Select Ship</option>
                    {ships.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Assign To</label>
                  <select className="form-select" value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))}>
                    <option value="">Unassigned</option>
                    {crew.map(c=><option key={c._id} value={c._id}>{c.name} ({c.rank})</option>)}
                  </select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                    {['High','Medium','Low'].map(p=><option key={p}>{p}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                    {['Pending','In Progress','Completed'].map(s=><option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div className="form-group"><label className="form-label">Due Date *</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':editTask?'Update':'Create Task'}</button>
            </div>
          </div>
        </div>
      )}

      {noteModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setNoteModal(null)}>
          <div className="modal" style={{maxWidth:'420px'}}>
            <div className="modal-header">
              <span className="modal-title">📝 Notes — {noteModal.title}</span>
              <button className="btn btn-secondary btn-icon" onClick={()=>setNoteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {noteModal.notes?.map((n:any,i:number)=>(
                <div key={i} style={{background:'var(--glass)',borderRadius:'8px',padding:'10px 12px',marginBottom:'8px',fontSize:'13px'}}>
                  <div>{n.text}</div>
                  <div style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'4px'}}>by {n.addedBy?.name||'Unknown'}</div>
                </div>
              ))}
              <div className="form-group" style={{marginTop:'8px'}}><label className="form-label">New Note</label>
                <textarea className="form-textarea" placeholder="Add a note…" value={noteText} onChange={e=>setNoteText(e.target.value)}/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setNoteModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddNote}>Add Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
