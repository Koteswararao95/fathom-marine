import React, { useEffect, useState } from 'react';
import { getShips, createShip, updateShip, deleteShip } from '../api/services';
import toast from 'react-hot-toast';

const emptyForm = { name:'',imoNumber:'',type:'Cargo',flag:'',status:'Active' };
const shipTypes = ['Cargo','Tanker','Container','Passenger','Bulk Carrier','Ro-Ro','Other'];

const ShipsPage: React.FC = () => {
  const [ships, setShips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editShip, setEditShip] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await getShips(); setShips(res.data); setLoading(false);
  };
  const openCreate = () => { setEditShip(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: any) => {
    setEditShip(s);
    setForm({ name:s.name, imoNumber:s.imoNumber, type:s.type, flag:s.flag, status:s.status });
    setShowModal(true);
  };
  const handleSave = async () => {
    if (!form.name||!form.imoNumber||!form.flag) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      editShip ? await updateShip(editShip._id, form) : await createShip(form);
      toast.success(editShip ? 'Ship updated' : 'Ship added');
      setShowModal(false); load();
    } catch (e:any) { toast.error(e?.response?.data?.message||'Error'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Remove this ship?')) return;
    await deleteShip(id); toast.success('Removed'); load();
  };

  const statusColor: Record<string,string> = { 'Active':'badge-completed','Docked':'badge-pending','Under Maintenance':'badge-progress' };

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div><div className="page-title">Ships</div><div className="page-subtitle">{ships.length} vessels in fleet</div></div>
        <button id="add-ship-btn" className="btn btn-primary" onClick={openCreate}>+ Add Ship</button>
      </div>
      <div className="grid-auto" style={{marginBottom:'0'}}>
        {ships.length===0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">🚢</div><div className="empty-title">No ships yet</div></div></div>
        ) : ships.map(s=>(
          <div key={s._id} className="ship-compliance-card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
              <div style={{fontSize:'28px'}}>🚢</div>
              <span className={`badge ${statusColor[s.status]||'badge-pending'}`}>{s.status}</span>
            </div>
            <div style={{fontWeight:700,fontSize:'15px',marginBottom:'4px'}}>{s.name}</div>
            <div style={{fontSize:'12px',color:'var(--text-muted)',marginBottom:'12px'}}>{s.imoNumber}</div>
            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              <span className="badge badge-progress">{s.type}</span>
              <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>🏴 {s.flag}</span>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:'center'}} onClick={()=>openEdit(s)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(s._id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editShip?'✏️ Edit Ship':'🚢 Add Ship'}</span>
              <button className="btn btn-secondary btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Ship Name *</label>
                <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="MV Neptune Star"/></div>
              <div className="form-group"><label className="form-label">IMO Number *</label>
                <input className="form-input" value={form.imoNumber} onChange={e=>setForm(f=>({...f,imoNumber:e.target.value}))} placeholder="IMO1234567"/></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    {shipTypes.map(t=><option key={t}>{t}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Flag *</label>
                  <input className="form-input" value={form.flag} onChange={e=>setForm(f=>({...f,flag:e.target.value}))} placeholder="Panama"/></div>
              </div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  {['Active','Docked','Under Maintenance'].map(s=><option key={s}>{s}</option>)}
                </select></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':editShip?'Update':'Add Ship'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipsPage;
