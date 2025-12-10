import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { getGlobalState, setGlobalState, onGlobalStateChange, type GlobalState } from '../config/qiankun';
import './Layout.css';

/**
 * 主布局组件
 */
const Layout: React.FC = () => {
  const location = useLocation();
  const [globalState, setGlobalStateLocal] = useState<GlobalState>(getGlobalState());

  useEffect(() => {
    // 监听全局状态变化
    const unsubscribe = onGlobalStateChange((state, prev) => {
      console.log('Global state changed:', state, prev);
      setGlobalStateLocal(state);
    });

    return unsubscribe;
  }, []);

  const handleThemeToggle = () => {
    const newTheme = globalState.theme === 'light' ? 'dark' : 'light';
    setGlobalState({ theme: newTheme });
  };

  const handleLogin = () => {
    setGlobalState({
      user: {
        id: '1',
        name: '管理员',
        avatar: 'https://via.placeholder.com/32',
      },
      token: 'mock-token-123',
    });
  };

  const handleLogout = () => {
    setGlobalState({
      user: undefined,
      token: undefined,
    });
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
            to="/api-example" 
            className={location.pathname === '/api-example' ? 'active' : ''}
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
          
          {globalState.user ? (
            <div className="user-info">
              <img 
                src={globalState.user.avatar} 
                alt={globalState.user.name}
                className="user-avatar"
              />
              <span className="user-name">{globalState.user.name}</span>
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

