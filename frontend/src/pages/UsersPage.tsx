import React, { useEffect, useState } from 'react';
import { getUsers, getShips } from '../api/services';
import API from '../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name:'',email:'',password:'',role:'crew',shipId:'',rank:'' };

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [u, s] = await Promise.all([getUsers(), getShips()]);
    setUsers(u.data); setShips(s.data); setLoading(false);
  };

  const filtered = filterRole ? users.filter(u => u.role === filterRole) : users;

  const handleCreate = async () => {
    if (!form.name||!form.email||!form.password) { toast.error('Name, email and password required'); return; }
    setSaving(true);
    try {
      await API.post('/auth/register', form);
      toast.success('User created'); setShowModal(false); setForm(emptyForm); loadAll();
    } catch (e:any) { toast.error(e?.response?.data?.message||'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this user?')) return;
    await API.delete(`/users/${id}`); toast.success('User removed'); loadAll();
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div><div className="page-title">Crew Members</div><div className="page-subtitle">{users.length} users registered</div></div>
        <button id="add-user-btn" className="btn btn-primary" onClick={()=>{setForm(emptyForm);setShowModal(true);}}>+ Add User</button>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={filterRole} onChange={e=>setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="crew">Crew</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Rank</th><th>Ship</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No users found</div></div></td></tr>
              ) : filtered.map(u=>(
                <tr key={u._id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div className="user-avatar" style={{width:'32px',height:'32px',fontSize:'13px'}}>{u.name?.charAt(0)}</div>
                      <span style={{fontWeight:600}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--text-secondary)',fontSize:'13px'}}>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td style={{color:'var(--text-secondary)'}}>{u.rank||'—'}</td>
                  <td style={{color:'var(--text-secondary)'}}>{u.shipId?.name||<span style={{color:'var(--text-muted)'}}>—</span>}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(u._id)}>🗑️</button>
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
              <span className="modal-title">👤 Add User</span>
              <button className="btn btn-secondary btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="John Smith"/></div>
                <div className="form-group"><label className="form-label">Email *</label>
                  <input type="email" className="form-input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="john@marine.com"/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Password *</label>
                  <input type="password" className="form-input" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••"/></div>
                <div className="form-group"><label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                    <option value="crew">Crew</option>
                    <option value="admin">Admin</option>
                  </select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Rank / Position</label>
                  <input className="form-input" value={form.rank} onChange={e=>setForm(f=>({...f,rank:e.target.value}))} placeholder="Chief Engineer"/></div>
                <div className="form-group"><label className="form-label">Assign to Ship</label>
                  <select className="form-select" value={form.shipId} onChange={e=>setForm(f=>({...f,shipId:e.target.value}))}>
                    <option value="">No Ship</option>
                    {ships.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
                  </select></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving?'Creating…':'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
