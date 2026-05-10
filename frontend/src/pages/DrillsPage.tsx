import React, { useEffect, useState } from 'react';
import { getDrills, createDrill, updateDrill, deleteDrill, getShips, getUsers } from '../api/services';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusBadge: Record<string,string> = { 'Scheduled':'badge-scheduled','Completed':'badge-completed','Missed':'badge-missed' };
const drillTypes = ['Fire Drill','Evacuation Drill','Man Overboard','Oil Spill','Medical Emergency','Other'];
const emptyForm = { title:'',type:'Fire Drill',shipId:'',scheduledDate:'',status:'Scheduled',notes:'',participants:[] as string[] };

const DrillsPage: React.FC = () => {
  const [drills, setDrills] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [crew, setCrew] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDrill, setEditDrill] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ shipId:'',status:'',type:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadDrills(); }, [filters]);

  const loadAll = async () => {
    const [d,s,u] = await Promise.all([getDrills(), getShips(), getUsers({ role:'crew' })]);
    setDrills(d.data); setShips(s.data); setCrew(u.data); setLoading(false);
  };

  const loadDrills = async () => {
    const params: any = {};
    if (filters.shipId) params.shipId = filters.shipId;
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    const res = await getDrills(params);
    setDrills(res.data);
  };

  const openCreate = () => { setEditDrill(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (drill: any) => {
    setEditDrill(drill);
    setForm({
      title: drill.title, type: drill.type, shipId: drill.shipId?._id||'',
      scheduledDate: drill.scheduledDate?.split('T')[0]||'',
      status: drill.status, notes: drill.notes||'',
      participants: drill.participants?.map((p:any)=>p.userId?._id||p.userId)||[]
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title||!form.shipId||!form.scheduledDate) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        participants: form.participants.map((uid: string) => ({ userId: uid }))
      };
      editDrill ? await updateDrill(editDrill._id, payload) : await createDrill(payload);
      toast.success(editDrill ? 'Drill updated' : 'Drill scheduled');
      setShowModal(false); loadDrills();
    } catch (e:any) { toast.error(e?.response?.data?.message || 'Error saving'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this drill?')) return;
    await deleteDrill(id); toast.success('Deleted'); loadDrills();
  };

  const toggleParticipant = (uid: string) => {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(uid)
        ? f.participants.filter(p => p !== uid)
        : [...f.participants, uid]
    }));
  };

  const isMissed = (d: any) => d.status !== 'Completed' && new Date(d.scheduledDate) < new Date();

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Safety Drills</div>
          <div className="page-subtitle">{drills.length} drills · {drills.filter(isMissed).length} missed</div>
        </div>
        <button id="create-drill-btn" className="btn btn-primary" onClick={openCreate}>+ Schedule Drill</button>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={filters.shipId} onChange={e=>setFilters(f=>({...f,shipId:e.target.value}))}>
          <option value="">All Ships</option>
          {ships.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select className="filter-select" value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
          <option value="">All Status</option>
          {['Scheduled','Completed','Missed'].map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))}>
          <option value="">All Types</option>
          {drillTypes.map(t=><option key={t}>{t}</option>)}
        </select>
        {(filters.shipId||filters.status||filters.type) &&
          <button className="btn btn-secondary btn-sm" onClick={()=>setFilters({shipId:'',status:'',type:''})}>✕ Clear</button>}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Drill</th><th>Type</th><th>Ship</th><th>Status</th><th>Scheduled</th><th>Participants</th><th>Actions</th></tr></thead>
            <tbody>
              {drills.length===0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🚨</div><div className="empty-title">No drills scheduled</div></div></td></tr>
              ) : drills.map(drill=>(
                <tr key={drill._id}>
                  <td>
                    <div style={{fontWeight:600}}>{drill.title}</div>
                    {isMissed(drill) && <span className="badge badge-missed" style={{marginTop:'4px'}}>⚠️ Missed</span>}
                  </td>
                  <td><span className="badge badge-scheduled">{drill.type}</span></td>
                  <td style={{color:'var(--text-secondary)'}}>{drill.shipId?.name||'—'}</td>
                  <td><span className={`badge ${statusBadge[drill.status]}`}>{drill.status}</span></td>
                  <td style={{color:isMissed(drill)?'var(--accent-red)':'var(--text-secondary)',fontSize:'13px'}}>
                    {drill.scheduledDate ? format(new Date(drill.scheduledDate),'dd MMM yyyy') : '—'}
                  </td>
                  <td>
                    <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>
                      {drill.participants?.filter((p:any)=>p.attended).length} / {drill.participants?.length} attended
                    </div>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(drill)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(drill._id)}>🗑️</button>
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
              <span className="modal-title">{editDrill?'✏️ Edit Drill':'🚨 Schedule Drill'}</span>
              <button className="btn btn-secondary btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Drill title"/></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Type *</label>
                  <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    {drillTypes.map(t=><option key={t}>{t}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Ship *</label>
                  <select className="form-select" value={form.shipId} onChange={e=>setForm(f=>({...f,shipId:e.target.value}))}>
                    <option value="">Select Ship</option>
                    {ships.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
                  </select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Scheduled Date *</label>
                  <input type="date" className="form-input" value={form.scheduledDate} onChange={e=>setForm(f=>({...f,scheduledDate:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                    {['Scheduled','Completed','Missed'].map(s=><option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div className="form-group"><label className="form-label">Participants</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',maxHeight:'120px',overflowY:'auto',padding:'8px',background:'var(--bg-secondary)',borderRadius:'8px',border:'1px solid var(--border)'}}>
                  {crew.map(c=>(
                    <label key={c._id} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',cursor:'pointer',padding:'4px 8px',borderRadius:'6px',background:form.participants.includes(c._id)?'rgba(59,130,246,0.15)':'transparent',border:form.participants.includes(c._id)?'1px solid rgba(59,130,246,0.3)':'1px solid transparent'}}>
                      <input type="checkbox" checked={form.participants.includes(c._id)} onChange={()=>toggleParticipant(c._id)} style={{accentColor:'var(--accent-blue)'}}/>
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group"><label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Additional notes"/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':editDrill?'Update':'Schedule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;
