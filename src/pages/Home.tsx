import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

/**
 * 首页组件
 */
const Home: React.FC = () => {
  const features = [
    {
      title: '微前端架构',
      description: '基于 qiankun 的微前端解决方案，支持多技术栈应用集成',
      icon: '🏗️',
    },
    {
      title: 'TypeScript 支持',
      description: '完整的 TypeScript 类型定义，提供更好的开发体验',
      icon: '📝',
    },
    {
      title: '状态共享',
      description: '全局状态管理，支持主应用与微应用间的数据通信',
      icon: '🔄',
    },
    {
      title: '样式隔离',
      description: '完善的样式隔离机制，避免应用间样式冲突',
      icon: '🎨',
    },
    {
      title: '路由管理',
      description: '统一的路由管理，支持微应用路由嵌套',
      icon: '🛣️',
    },
    {
      title: '开发友好',
      description: '热更新、错误边界、开发工具等完善的开发体验',
      icon: '⚡',
    },
  ];

  const microApps = [
    {
      name: 'Vue 应用',
      path: '/vue-app',
      description: '基于 Vue 3 + Vite 的微应用示例',
      status: 'development',
      port: 3001,
    },
    {
      name: 'React 应用',
      path: '/react-app',
      description: '基于 React 18 + Vite 的微应用示例',
      status: 'development',
      port: 3002,
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            微前端基座应用
          </h1>
          <p className="hero-subtitle">
            基于 Vite + React + TypeScript + qiankun 构建的现代化微前端解决方案
          </p>
          <div className="hero-actions">
            <Link to="/vue-app" className="btn btn-primary">
              体验 Vue 应用
            </Link>
            <Link to="/react-app" className="btn btn-secondary">
              体验 React 应用
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">核心特性</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Micro Apps Section */}
      <section className="micro-apps-section">
        <div className="container">
          <h2 className="section-title">微应用列表</h2>
          <div className="micro-apps-grid">
            {microApps.map((app, index) => (
              <div key={index} className="micro-app-card">
                <div className="app-header">
                  <h3 className="app-name">{app.name}</h3>
                  <span className={`app-status ${app.status}`}>
                    {app.status === 'development' ? '开发中' : '已上线'}
                  </span>
                </div>
                <p className="app-description">{app.description}</p>
                <div className="app-info">
                  <span className="app-port">端口: {app.port}</span>
                </div>
                <div className="app-actions">
                  <Link to={app.path} className="btn btn-outline">
                    访问应用
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="quick-start-section">
        <div className="container">
          <h2 className="section-title">快速开始</h2>
          <div className="quick-start-content">
            <div className="step-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>启动基座应用</h4>
                  <code>npm run dev</code>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>启动微应用</h4>
                  <code>cd micro-apps/vue-app && npm run dev</code>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>访问应用</h4>
                  <p>在浏览器中访问对应的路由即可体验微前端应用</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

