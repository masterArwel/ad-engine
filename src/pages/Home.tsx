import React from 'react';
import './Home.css';

/**
 * 首页组件
 */
const Home: React.FC = () => {

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
        </div>
      </section>

    </div>
  );
};

export default Home;

