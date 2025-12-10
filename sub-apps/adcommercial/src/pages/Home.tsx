import React from 'react'

const Home: React.FC = () => {
  return (
    <div>
      <h1>🚀 广告投放管理系统</h1>
      <p>欢迎使用广告投放管理微应用！</p>
      
      <div className="feature-grid">
        <div className="feature-card">
          <h3>📊 实时数据</h3>
          <p>查看广告投放的实时数据和效果分析</p>
        </div>
        
        <div className="feature-card">
          <h3>🎯 精准投放</h3>
          <p>基于用户画像进行精准的广告投放</p>
        </div>
        
        <div className="feature-card">
          <h3>💰 成本优化</h3>
          <p>智能优化广告成本，提升ROI</p>
        </div>
        
        <div className="feature-card">
          <h3>📈 效果分析</h3>
          <p>详细的广告效果分析和报表生成</p>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p>当前时间: {new Date().toLocaleString()}</p>
        <p>微应用状态: ✅ 正常运行</p>
      </div>
    </div>
  )
}

export default Home
