import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { getGlobalState, setGlobalState, onGlobalStateChange, type GlobalState } from '../config/qiankun';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

/**
 * 主布局组件
 */
const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout, initAuth } = useAuth();
  const [globalState, setGlobalStateLocal] = useState<GlobalState>(getGlobalState());

  useEffect(() => {
    // 监听全局状态变化
    const unsubscribe = onGlobalStateChange((state) => {
      setGlobalStateLocal(state);
    });

    return unsubscribe;
  }, []);

  // 初始化认证状态
  useEffect(() => {
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleThemeToggle = () => {
    const newTheme = globalState.theme === 'light' ? 'dark' : 'light';
    setGlobalState({ theme: newTheme });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={`layout ${globalState.theme}`}>
      {/* 顶部导航栏 */}
      <header className="layout-header">
        <div className="header-left">
          <h1 className="logo">
            <Link to="/home">微前端基座</Link>
          </h1>
        </div>
        
        <nav className="header-nav">
          <Link 
            to="/home" 
            className={location.pathname === '/home' ? 'active' : ''}
          >
            首页
          </Link>
          <Link 
            to="/ad-commercial" 
            className={location.pathname.startsWith('/ad-commercial') ? 'active' : ''}
          >
            广告投放管理
          </Link>
          <Link 
            to="/vue-app" 
            className={location.pathname.startsWith('/vue-app') ? 'active' : ''}
          >
            数据报表管理
          </Link>
          <Link 
            to="/react-app" 
            className={location.pathname.startsWith('/react-app') ? 'active' : ''}
          >
            创意素材管理
          </Link>
        </nav>

        <div className="header-right">
          <button 
            className="theme-toggle"
            onClick={handleThemeToggle}
            title={`切换到${globalState.theme === 'light' ? '暗色' : '亮色'}主题`}
          >
            {globalState.theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {auth.isAuthenticated && auth.user ? (
            <div className="user-info">
              <img 
                src={auth.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                alt={auth.user.name}
                className="user-avatar"
              />
              <span className="user-name">{auth.user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                退出
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={handleLogin}>
              登录
            </button>
          )}
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* 底部 */}
      <footer className="layout-footer">
        <p>&copy; 2024 微前端基座项目. Powered by qiankun + Vite + React + TypeScript</p>
      </footer>
    </div>
  );
};

export default Layout;

