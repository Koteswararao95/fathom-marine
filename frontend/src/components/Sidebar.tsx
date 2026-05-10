import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/maintenance', icon: '🔧', label: 'Maintenance' },
    { to: '/drills', icon: '🚨', label: 'Safety Drills' },
    { to: '/ships', icon: '🚢', label: 'Ships' },
    { to: '/users', icon: '👥', label: 'Crew Members' },
  ];

  const crewNav = [
    { to: '/crew', icon: '🏠', label: 'My Dashboard' },
    { to: '/crew/tasks', icon: '🔧', label: 'My Tasks' },
    { to: '/crew/drills', icon: '🚨', label: 'Drill Schedule' },
  ];

  const navItems = isAdmin ? adminNav : crewNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">⚓</div>
          <div>
            <div className="logo-text">Fathom Marine</div>
            <div className="logo-sub">Operations System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">
          {isAdmin ? 'Administration' : 'Crew Portal'}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/' || item.to === '/crew'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
