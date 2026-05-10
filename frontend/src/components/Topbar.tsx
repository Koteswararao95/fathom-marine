import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Compliance Dashboard', subtitle: 'Fleet overview & compliance monitoring' },
  '/maintenance': { title: 'Maintenance Tasks', subtitle: 'Ship maintenance scheduling & tracking' },
  '/drills': { title: 'Safety Drills', subtitle: 'Drill scheduling & participation' },
  '/ships': { title: 'Ships', subtitle: 'Fleet management' },
  '/users': { title: 'Crew Members', subtitle: 'User & crew management' },
  '/crew': { title: 'My Dashboard', subtitle: 'Your tasks & upcoming drills' },
  '/crew/tasks': { title: 'My Tasks', subtitle: 'Maintenance tasks assigned to you' },
  '/crew/drills': { title: 'Drill Schedule', subtitle: 'Upcoming safety drills' },
};

const Topbar: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const info = pageTitles[pathname] || { title: 'Fathom Marine', subtitle: '' };
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{info.title}</div>
        <div className="topbar-subtitle">{info.subtitle}</div>
      </div>
      <div className="topbar-right">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            👋 Welcome, {user?.name?.split(' ')[0]}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{now}</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
