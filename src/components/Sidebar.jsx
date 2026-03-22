import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Compass,
    Users,
    User,
    LogOut,
    ChevronRight,
    Settings as SettingsIcon,
    Bell,
    Moon,
    Sun,
    BarChart3,
    Plus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import CreateCollectionModal from './CreateCollectionModal';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();

    const mainNavItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/explore', label: 'Explore', icon: Compass },
        { path: '/creators', label: 'Creators', icon: Users },
    ];

    const userNavItems = isAuthenticated ? [
        { path: '/profile/me', label: 'Profile', icon: User },
        { path: '/notifications', label: 'Notifications', icon: Bell },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/settings', label: 'Settings', icon: SettingsIcon },
    ] : [];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* Desktop/Tablet Sidebar */}
            <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} desktop-sidebar`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">d</div>
                        {isExpanded && <span className="logo-text">dropp.</span>}
                    </div>

                    <button
                        className="sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        <ChevronRight className={`toggle-icon ${isExpanded ? 'rotated' : ''}`} size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {/* Main navigation items */}
                    <div className="sidebar-section">
                        {mainNavItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`sidebar-item ${isActive(path) ? 'active' : ''}`}
                                title={!isExpanded ? label : ''}
                            >
                                <div className="sidebar-item-icon">
                                    <Icon size={20} />
                                    {path === '/notifications' && unreadCount > 0 && (
                                        <div className="sidebar-badge">{unreadCount}</div>
                                    )}
                                </div>
                                {isExpanded && <span className="sidebar-item-label">{label}</span>}
                                {isActive(path) && <div className="sidebar-item-indicator" />}
                            </Link>
                        ))}
                    </div>

                    {isAuthenticated && userNavItems.length > 0 && (
                        <>
                            <div className="sidebar-divider" />
                            <div className="sidebar-section">
                                {userNavItems.map(({ path, label, icon: Icon }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`sidebar-item ${isActive(path) ? 'active' : ''}`}
                                        title={!isExpanded ? label : ''}
                                    >
                                        <div className="sidebar-item-icon">
                                            <Icon size={20} />
                                            {path === '/notifications' && unreadCount > 0 && (
                                                <div className="sidebar-badge">{unreadCount}</div>
                                            )}
                                        </div>
                                        {isExpanded && <span className="sidebar-item-label">{label}</span>}
                                        {isActive(path) && <div className="sidebar-item-indicator" />}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    {/* Theme Toggle */}
                    <button
                        className="sidebar-item theme-toggle"
                        onClick={toggleTheme}
                        title={!isExpanded ? (theme === 'light' ? 'Dark mode' : 'Light mode') : ''}
                    >
                        <div className="sidebar-item-icon">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        {isExpanded && (
                            <span className="sidebar-item-label">
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        )}
                    </button>

                    {/* Logout */}
                    {isAuthenticated && (
                        <button
                            className="sidebar-item logout-btn"
                            onClick={handleLogout}
                            title={!isExpanded ? 'Logout' : ''}
                        >
                            <div className="sidebar-item-icon">
                                <LogOut size={20} />
                            </div>
                            {isExpanded && <span className="sidebar-item-label">Logout</span>}
                        </button>
                    )}
                </div>
            </aside>

            {/* Mobile: Home · Explore · Create · Creators · Profile (notifications on Home header) */}
            <nav className="bottom-nav">
                <Link
                    to="/"
                    className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-icon-wrapper">
                        <Home size={22} />
                    </div>
                    <span className="bottom-nav-label">Home</span>
                </Link>
                <Link
                    to="/explore"
                    className={`bottom-nav-item ${isActive('/explore') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-icon-wrapper">
                        <Compass size={22} />
                    </div>
                    <span className="bottom-nav-label">Explore</span>
                </Link>
                <button
                    type="button"
                    className="bottom-nav-item bottom-nav-create"
                    onClick={() => setCreateModalOpen(true)}
                    aria-label="Create collection"
                >
                    <div className="bottom-nav-icon-wrapper bottom-nav-create-icon-wrap">
                        <span className="bottom-nav-create-pill">
                            <Plus size={22} strokeWidth={2.5} />
                        </span>
                    </div>
                    <span className="bottom-nav-label">Create</span>
                </button>
                <Link
                    to="/creators"
                    className={`bottom-nav-item ${isActive('/creators') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-icon-wrapper">
                        <Users size={22} />
                    </div>
                    <span className="bottom-nav-label">Creators</span>
                </Link>
                <Link
                    to="/profile/me"
                    className={`bottom-nav-item ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-icon-wrapper">
                        <User size={22} />
                    </div>
                    <span className="bottom-nav-label">Profile</span>
                </Link>
            </nav>

            <CreateCollectionModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />
        </>
    );
};

export default Sidebar;

