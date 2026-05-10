import React, { useEffect, useState } from 'react';
import { getDrills, attendDrill } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const statusBadge: Record<string, string> = { 'Scheduled': 'badge-scheduled', 'Completed': 'badge-completed', 'Missed': 'badge-missed' };

const CrewDrillsPage: React.FC = () => {
  const { user } = useAuth();
  const [drills, setDrills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { load(); }, [filterStatus]);

  const load = async () => {
    const params: any = {};
    if (filterStatus) params.status = filterStatus;
    const res = await getDrills(params);
    setDrills(res.data); setLoading(false);
  };

  const handleAttend = async (drillId: string) => {
    try { await attendDrill(drillId); toast.success('Attendance marked! ✅'); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Error'); }
  };

  const getMyEntry = (drill: any) =>
    drill.participants?.find((p: any) => (p.userId?._id || p.userId) === user?._id);

  const upcoming = drills.filter(d => d.status === 'Scheduled' && !isPast(new Date(d.scheduledDate)));
  const past = drills.filter(d => d.status !== 'Scheduled' || isPast(new Date(d.scheduledDate)));

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Drill Schedule</div>
          <div className="page-subtitle">{upcoming.length} upcoming · {drills.filter(d => d.status === 'Completed').length} completed</div>
        </div>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Scheduled', 'Completed', 'Missed'].map(s => <option key={s}>{s}</option>)}
        </select>
        {filterStatus && <button className="btn btn-secondary btn-sm" onClick={() => setFilterStatus('')}>✕ Clear</button>}
      </div>

      {upcoming.length > 0 && (
        <>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Upcoming Drills
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {upcoming.map(drill => {
              const myEntry = getMyEntry(drill);
              return (
                <div key={drill._id} className="card" style={{ border: myEntry?.attended ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)' }}>
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{drill.title}</div>
                          <span className="badge badge-scheduled">{drill.type}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🚢 {drill.shipId?.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--accent-purple)' }}>
                            📅 {format(new Date(drill.scheduledDate), 'dd MMM yyyy')}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            👥 {drill.participants?.length} participants
                          </span>
                        </div>
                        {drill.notes && <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>📌 {drill.notes}</div>}
                      </div>
                      {myEntry ? (
                        myEntry.attended
                          ? <span className="badge badge-completed" style={{ padding: '8px 14px', fontSize: '12px' }}>✅ Attended</span>
                          : <button className="btn btn-success" onClick={() => handleAttend(drill._id)}>✅ Mark Attended</button>
                      ) : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Not assigned</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Past Drills
          </div>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Drill</th><th>Type</th><th>Ship</th><th>Date</th><th>Status</th><th>My Attendance</th></tr></thead>
                <tbody>
                  {past.map(drill => {
                    const myEntry = getMyEntry(drill);
                    return (
                      <tr key={drill._id}>
                        <td style={{ fontWeight: 600 }}>{drill.title}</td>
                        <td><span className="badge badge-scheduled">{drill.type}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{drill.shipId?.name || '—'}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          {format(new Date(drill.scheduledDate), 'dd MMM yyyy')}
                        </td>
                        <td><span className={`badge ${statusBadge[drill.status] || 'badge-pending'}`}>{drill.status}</span></td>
                        <td>
                          {myEntry ? (
                            myEntry.attended
                              ? <span className="badge badge-completed">✅ Attended</span>
                              : <span className="badge badge-missed">❌ Missed</span>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>N/A</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {drills.length === 0 && (
        <div className="card"><div className="empty-state"><div className="empty-icon">🚨</div><div className="empty-title">No drills found</div></div></div>
      )}
    </div>
  );
};

export default CrewDrillsPage;
