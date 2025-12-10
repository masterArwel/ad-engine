import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './MicroAppContainer.css';

/**
 * 微应用容器组件
 * 负责控制常驻微应用容器 (#subapp-viewport) 的显示状态
 * 容器始终存在于 DOM 中，只通过 CSS 类控制可见性
 */
const MicroAppContainer = () => {
  const location = useLocation();

  // 检查当前路由是否是微应用路由
  const isMicroAppRoute = location.pathname.startsWith('/ad-commercial') ||
                         location.pathname.startsWith('/vue-app') ||
                         location.pathname.startsWith('/react-app');

  // 提取微应用名称
  const currentAppName = location.pathname.split('/')[1];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const loadingRef = useRef(false);
  const mountedRef = useRef(false); // 跟踪微应用是否已挂载
  const currentAppRef = useRef<string>(''); // 跟踪当前加载的微应用

  useEffect(() => {
    const globalContainer = document.getElementById('subapp-viewport');
    
    if (!globalContainer) {
      setTimeout(() => setError(true), 0);
      return;
    }

    if (isMicroAppRoute) {
      // 激活容器显示
      globalContainer.classList.add('active');
      globalContainer.classList.remove('loading');
      
      // 检查是否是真正的微应用切换
      const isAppSwitch = currentAppRef.current !== currentAppName;
      
      if (isAppSwitch) {
        // 真正的微应用切换，更新当前应用并重置状态
        currentAppRef.current = currentAppName;
        mountedRef.current = false; // 重置挂载状态
        setTimeout(() => {
          setLoading(true);
          setError(false);
          loadingRef.current = true;
        }, 0);
      } else {
        // 同一微应用内的路由切换，不执行任何加载逻辑
        return;
      }
        
        // 监听微应用加载完成
        const handleMicroAppMount = () => {
          setLoading(false);
          loadingRef.current = false;
          mountedRef.current = true; // 标记微应用已挂载
          globalContainer.classList.remove('loading');
        };

        // 监听微应用加载错误
        const handleMicroAppError = () => {
          setLoading(false);
          loadingRef.current = false;
          mountedRef.current = false; // 重置挂载状态
          setError(true);
          globalContainer.classList.remove('loading');
        };

        // 检查微应用是否已加载
        const checkMicroAppMounted = () => {
          if (globalContainer.children.length > 0) {
            const hasContent = Array.from(globalContainer.children).some(child => {
              if (child.nodeType === Node.ELEMENT_NODE) {
                const element = child as Element;
                // 检查是否有实际内容
                return element.textContent?.trim() || element.children.length > 0;
              }
              return child.textContent?.trim();
            });

            if (hasContent && !mountedRef.current) {
              handleMicroAppMount();
            }
          }
        };

        // 初始检查 - 如果容器已经有内容，直接标记为加载完成
        setTimeout(checkMicroAppMounted, 100);

        // 监听 DOM 变化
        const observer = new MutationObserver(() => {
          setTimeout(checkMicroAppMounted, 100);
        });

        observer.observe(globalContainer, {
          childList: true,
          subtree: true,
          characterData: true
        });

        // 监听 qiankun 事件
        window.addEventListener('single-spa:app-change', handleMicroAppMount);
        window.addEventListener('single-spa:no-app-change', handleMicroAppError);

        // 超时处理
        const timeout = setTimeout(() => {
          if (loadingRef.current) {
            setError(true);
            setLoading(false);
            loadingRef.current = false;
          }
        }, 10000);

        return () => {
          observer.disconnect();
          window.removeEventListener('single-spa:app-change', handleMicroAppMount);
          window.removeEventListener('single-spa:no-app-change', handleMicroAppError);
          clearTimeout(timeout);
        };
    } else {
      // 隐藏容器
      globalContainer.classList.remove('active', 'loading');
      setTimeout(() => {
        setLoading(false);
        setError(false);
        loadingRef.current = false;
        mountedRef.current = false; // 重置挂载状态
        currentAppRef.current = ''; // 重置当前应用
      }, 0);
    }
  }, [currentAppName, isMicroAppRoute]); // 只依赖微应用名称，不依赖完整路径

  // 如果不是微应用路由，不渲染任何内容
  if (!isMicroAppRoute) {
    return null;
  }

  return (
    <div className="micro-app-container">
      {/* 加载状态覆盖层 */}
      {loading && (
        <div className="micro-app-loading-overlay">
          <div className="loading-spinner"></div>
          <p>正在加载微应用...</p>
        </div>
      )}

      {/* 错误状态覆盖层 */}
      {error && (
        <div className="micro-app-error-overlay">
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
      )}
    </div>
  );
};

export default MicroAppContainer;