import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import App from './App'
import './index.css'

let root: ReactDOM.Root | null = null

function render(props: any = {}) {
  const { container, routerBase } = props
  let containerEl: HTMLElement | null = null;

  if (container) {
    // 微前端环境：直接使用传入的容器
    containerEl = container;
  } else {
    // 独立运行：查找页面中的 #root 元素
    containerEl = document.getElementById('root');
  }

  if (!containerEl) {
    return;
  }
  
  if (!root) {
    root = ReactDOM.createRoot(containerEl)
  }
  
  root.render(
    <React.StrictMode>
      <BrowserRouter basename={routerBase || '/ad-commercial'}>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

renderWithQiankun({
  mount(props) {
    render(props)
  },
  bootstrap() {
    // 微应用启动
  },
  unmount() {
    if (root) {
      root.unmount()
      root = null
    }
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
