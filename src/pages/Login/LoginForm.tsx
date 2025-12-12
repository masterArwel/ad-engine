
import { Form, Input, Button, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { emailRules, passwordRules } from '../../utils/validation';
import type { LoginFormFields } from '../../types/auth';

interface LoginFormProps {
  /** 登录成功回调 */
  onSuccess?: () => void;
  /** 显示注册链接 */
  showRegisterLink?: boolean;
}

const LoginForm = (props: LoginFormProps) => {
  const { onSuccess, showRegisterLink = true } = props;
  const [form] = Form.useForm<LoginFormFields>();
  const { login, auth } = useAuth();

  /** 处理表单提交 */
  const handleSubmit = async (values: LoginFormFields) => {
    const success = await login({
      email: values.email,
      password: values.password,
    });

    if (success) {
      // 如果选择了记住我，可以在这里处理相关逻辑
      if (values.remember) {
        localStorage.setItem('remember_email', values.email);
      } else {
        localStorage.removeItem('remember_email');
      }

      onSuccess?.();
    }
  };

  return (
    <>
      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="邮箱地址"
          rules={emailRules}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入邮箱地址"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={passwordRules}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
            autoComplete="current-password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item>
          <Link to="/reset-password" className="forgot-password-link">
            忘记密码？
          </Link>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={auth.loading}
            block
            size="large"
          >
            登录
          </Button>
        </Form.Item>

        {showRegisterLink && (
          <>
            <Form.Item>
              <Space className="register-link-container">
                <span>还没有账号？</span>
                <Link to="/register">立即注册</Link>
              </Space>
            </Form.Item>
          </>
        )}
      </Form>

      {/* 开发环境显示测试账号 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="test-accounts">
          <Divider plain>测试账号</Divider>
          <div className="test-account-list">
            <div className="test-account-item">
              <strong>管理员:</strong> admin@example.com / 123456
            </div>
            <div className="test-account-item">
              <strong>普通用户:</strong> user@example.com / 123456
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
