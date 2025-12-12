import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Card} from 'antd';

import LoginForm from './LoginForm';
import { useAuth } from '../../hooks/useAuth';
import './index.css';

/**
 * 登录页面组件
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();

  // 获取重定向路径
  const from = location.state?.from?.pathname || '/home';

  // 如果已经登录，重定向到目标页面
  if (auth.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  /** 登录成功处理 */
  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <Card className="login-card" style={{ width: '40%' }} title="欢迎登录">
          <LoginForm onSuccess={handleLoginSuccess} />
        </Card>
      </div>
    </div>
  );
};

export default Login;
