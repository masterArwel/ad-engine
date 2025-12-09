import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './MicroAppContainer.css';

/**
 * 微应用容器组件
 */
const MicroAppContainer: React.FC = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 当路由变化时，确保容器存在
    if (containerRef.current) {
      console.log('MicroApp container mounted for:', location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="micro-app-container">
      {/* 加载状态 */}
      <div className="micro-app-loading" id="micro-app-loading">
        <div className="loading-spinner"></div>
        <p>正在加载微应用...</p>
      </div>
      
      {/* 微应用挂载点 */}
      <div 
        id="subapp-viewport" 
        ref={containerRef}
        className="micro-app-viewport"
      />
      
      {/* 错误状态 */}
      <div className="micro-app-error" id="micro-app-error" style={{ display: 'none' }}>
        <div className="error-content">
          <h3>微应用加载失败</h3>
          <p>请检查微应用是否正常运行，或联系管理员。</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicroAppContainer;

