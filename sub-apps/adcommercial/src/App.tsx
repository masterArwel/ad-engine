import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <div className="adcommercial-app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<div>广告投放仪表板</div>} />
        <Route path="/campaigns" element={<div>广告活动管理</div>} />
        <Route path="/analytics" element={<div>数据分析</div>} />
      </Routes>
    </div>
  )
}

export default App
