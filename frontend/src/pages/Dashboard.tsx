import React, { useEffect, useState } from 'react';
import { getCompliance } from '../api/services';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getCompliance();
      setData(res.data);
    } catch {
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return null;

  const { globalStats, ships } = data;

  const barData = ships.map((s: any) => ({
    name: s.ship.name.replace('MV ', '').replace('SS ', ''),
    Maintenance: s.maintenance.complianceRate,
    Drills: s.drills.complianceRate,
  }));

  const pieData = [
    { name: 'Compliant', value: globalStats.totalShips - globalStats.nonCompliantShips },
    { name: 'Non-Compliant', value: globalStats.nonCompliantShips },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Compliance Dashboard</div>
          <div className="page-subtitle">Real-time fleet monitoring & compliance overview</div>
        </div>
        <button className="btn btn-secondary" onClick={loadData}>🔄 Refresh</button>
      </div>

      {/* Alert banner for overdue */}
      {(globalStats.totalOverdueTasks > 0 || globalStats.totalMissedDrills > 0) && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          <span>⚠️</span>
          <span>
            <strong>Attention Required:</strong> {globalStats.totalOverdueTasks} overdue maintenance task(s) and {globalStats.totalMissedDrills} missed drill(s) across the fleet.
          </span>
        </div>
      )}

      {/* Global Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #3b82f6, #06b6d4)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>🚢</div>
          <div className="stat-value">{globalStats.totalShips}</div>
          <div className="stat-label">Total Ships</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #10b981, #14b8a6)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>📈</div>
          <div className="stat-value">{globalStats.avgCompliance}%</div>
          <div className="stat-label">Avg Fleet Compliance</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #ef4444, #f97316)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>⚠️</div>
          <div className="stat-value">{globalStats.totalOverdueTasks}</div>
          <div className="stat-label">Overdue Tasks</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #f59e0b, #ef4444)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>🚨</div>
          <div className="stat-value">{globalStats.totalMissedDrills}</div>
          <div className="stat-label">Missed Drills</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'linear-gradient(90deg, #ef4444, #8b5cf6)' } as any}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>🔴</div>
          <div className="stat-value">{globalStats.nonCompliantShips}</div>
          <div className="stat-label">Non-Compliant Ships</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Compliance by Ship</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar dataKey="Maintenance" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="Drills" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🍩 Fleet Compliance Status</span>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', minHeight: '220px' }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_: any, index: number) => (
                    <Cell key={index} fill={index === 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Compliant ({pieData[0].value})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Non-Compliant ({pieData[1].value})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Ship Compliance */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🚢 Ship-by-Ship Compliance</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ships.map((s: any) => (
              <div
                key={s.ship._id}
                className={`ship-compliance-card ${s.isNonCompliant ? 'non-compliant' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{s.ship.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.ship.imoNumber} · {s.ship.status}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: s.overallCompliance >= 70 ? '#10b981' : '#ef4444' }}>
                      {s.overallCompliance}%
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Overall Compliance</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>🔧 Maintenance</span>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{s.maintenance.complianceRate}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.maintenance.complianceRate}%`, background: s.maintenance.complianceRate >= 70 ? '#10b981' : '#ef4444' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>✅ {s.maintenance.completed} done</span>
                      {s.maintenance.overdue > 0 && <span style={{ fontSize: '11px', color: '#ef4444' }}>⚠️ {s.maintenance.overdue} overdue</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>🚨 Drills</span>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{s.drills.complianceRate}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.drills.complianceRate}%`, background: s.drills.complianceRate >= 70 ? '#10b981' : '#ef4444' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>✅ {s.drills.completed} done</span>
                      {s.drills.missed > 0 && <span style={{ fontSize: '11px', color: '#ef4444' }}>⚠️ {s.drills.missed} missed</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
