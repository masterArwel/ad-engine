import React, { useState, useEffect } from 'react';
import { authApi, userApi, commonApi } from '../services';
import type { UserInfo, LoginParams } from '../types/api';
import './ApiExample.css';

/**
 * API 使用示例页面
 */
const ApiExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [loginForm, setLoginForm] = useState<LoginParams>({
    username: '',
    password: '',
  });

  // 获取用户列表示例
  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUserList({
        pageNum: 1,
        pageSize: 10,
      });
      
      if (response.success) {
        setUserList(response.data.list);
        console.log('用户列表获取成功:', response.data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前用户信息示例
  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      
      if (response.success) {
        setCurrentUser(response.data);
        console.log('当前用户信息:', response.data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 登录示例
  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      alert('请输入用户名和密码');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login(loginForm);
      
      if (response.success) {
        console.log('登录成功:', response.data);
        alert('登录成功！');
        // 登录成功后可以获取用户信息
        await fetchCurrentUser();
      }
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  // 文件上传示例
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await commonApi.uploadFile(file, (progress) => {
        console.log('上传进度:', progress + '%');
      });
      
      if (response.success) {
        console.log('文件上传成功:', response.data);
        alert(`文件上传成功！访问地址: ${response.data.url}`);
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取字典数据示例
  const fetchDictData = async () => {
    try {
      const response = await commonApi.getDictData('user_status');
      
      if (response.success) {
        console.log('字典数据:', response.data);
      }
    } catch (error) {
      console.error('获取字典数据失败:', error);
    }
  };

  // 健康检查示例
  const checkHealth = async () => {
    try {
      const response = await commonApi.healthCheck();
      
      if (response.success) {
        console.log('系统状态:', response.data);
        alert(`系统状态: ${response.data.status}`);
      }
    } catch (error) {
      console.error('健康检查失败:', error);
    }
  };

  useEffect(() => {
    // 页面加载时执行一些初始化操作
    fetchDictData();
  }, []);

  return (
    <div className="api-example">
      <div className="page-header">
        <h1>API 调用示例</h1>
        <p>演示如何使用封装的 API 服务进行数据请求</p>
      </div>

      <div className="example-sections">
        {/* 认证相关 */}
        <section className="example-section">
          <h2>认证 API 示例</h2>
          <div className="form-group">
            <label>用户名：</label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              placeholder="请输入用户名"
            />
          </div>
          <div className="form-group">
            <label>密码：</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="请输入密码"
            />
          </div>
          <div className="button-group">
            <button onClick={handleLogin} disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </button>
            <button onClick={fetchCurrentUser}>获取当前用户</button>
          </div>
          
          {currentUser && (
            <div className="user-info">
              <h3>当前用户信息：</h3>
              <p>用户名: {currentUser.username}</p>
              <p>昵称: {currentUser.nickname}</p>
              <p>邮箱: {currentUser.email}</p>
            </div>
          )}
        </section>

        {/* 用户管理 */}
        <section className="example-section">
          <h2>用户管理 API 示例</h2>
          <div className="button-group">
            <button onClick={fetchUserList} disabled={loading}>
              {loading ? '加载中...' : '获取用户列表'}
            </button>
          </div>
          
          {userList.length > 0 && (
            <div className="user-list">
              <h3>用户列表：</h3>
              <table>
                <thead>
                  <tr>
                    <th>用户名</th>
                    <th>昵称</th>
                    <th>邮箱</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.nickname}</td>
                      <td>{user.email}</td>
                      <td>{user.status === 1 ? '正常' : '禁用'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 通用 API */}
        <section className="example-section">
          <h2>通用 API 示例</h2>
          <div className="form-group">
            <label>文件上传：</label>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>
          <div className="button-group">
            <button onClick={checkHealth}>系统健康检查</button>
            <button onClick={fetchDictData}>获取字典数据</button>
          </div>
        </section>

        {/* API 使用说明 */}
        <section className="example-section">
          <h2>API 使用说明</h2>
          <div className="usage-guide">
            <h3>1. 基本用法</h3>
            <pre>{`
// 导入 API 服务
import { authApi, userApi, commonApi } from '@/services';

// 调用 API
const response = await userApi.getUserList({ pageNum: 1, pageSize: 10 });
if (response.success) {
  console.log('数据:', response.data);
}
            `}</pre>

            <h3>2. 错误处理</h3>
            <pre>{`
try {
  const response = await authApi.login(loginParams);
  // 处理成功响应
} catch (error) {
  // 错误已在请求拦截器中统一处理
  console.error('请求失败:', error);
}
            `}</pre>

            <h3>3. 文件上传</h3>
            <pre>{`
const response = await commonApi.uploadFile(file, (progress) => {
  console.log('上传进度:', progress + '%');
});
            `}</pre>

            <h3>4. 自定义请求</h3>
            <pre>{`
import { request } from '@/services';

const response = await request({
  url: '/custom/api',
  method: 'POST',
  data: { key: 'value' },
});
            `}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApiExample;


