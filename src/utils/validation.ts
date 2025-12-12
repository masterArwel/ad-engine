/**
 * 表单验证规则工具
 */

import type { Rule } from 'antd/es/form';

/** 邮箱验证正则 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** 密码验证正则（至少8位，包含字母和数字） */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/** 验证码正则（6位数字） */
const VERIFICATION_CODE_REGEX = /^\d{6}$/;

/**
 * 邮箱验证规则
 */
export const emailRules: Rule[] = [
  {
    required: true,
    message: '请输入邮箱地址',
  },
  {
    type: 'email',
    message: '请输入有效的邮箱地址',
  },
  {
    pattern: EMAIL_REGEX,
    message: '邮箱格式不正确',
  },
];

/**
 * 密码验证规则
 */
export const passwordRules: Rule[] = [
  {
    required: true,
    message: '请输入密码',
  },
  {
    min: 6,
    message: '密码至少6位',
  },
  // {
  //   pattern: PASSWORD_REGEX,
  //   message: '密码必须包含字母和数字',
  // },
];

/**
 * 确认密码验证规则
 * @param getFieldValue 获取表单字段值的方法
 * @param passwordField 密码字段名，默认为 'password'
 */
export const confirmPasswordRules = (
  getFieldValue: (name: string) => any,
  passwordField: string = 'password'
): Rule[] => [
  {
    required: true,
    message: '请确认密码',
  },
  {
    validator: (_, value) => {
      if (!value || getFieldValue(passwordField) === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('两次输入的密码不一致'));
    },
  },
];

/**
 * 姓名验证规则
 */
export const nameRules: Rule[] = [
  {
    required: true,
    message: '请输入姓名',
  },
  {
    min: 2,
    message: '姓名至少2个字符',
  },
  {
    max: 20,
    message: '姓名不能超过20个字符',
  },
  {
    pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
    message: '姓名只能包含中文、英文和空格',
  },
];

/**
 * 验证码验证规则
 */
export const verificationCodeRules: Rule[] = [
  {
    required: true,
    message: '请输入验证码',
  },
  {
    pattern: VERIFICATION_CODE_REGEX,
    message: '请输入6位数字验证码',
  },
];

/**
 * 协议同意验证规则
 */
export const agreementRules: Rule[] = [
  {
    validator: (_, value) => {
      if (value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('请阅读并同意用户协议'));
    },
  },
];

/**
 * 手机号验证规则
 */
export const phoneRules: Rule[] = [
  {
    required: true,
    message: '请输入手机号',
  },
  {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号',
  },
];

/**
 * 通用必填验证规则
 * @param message 错误提示信息
 */
export const requiredRule = (message: string): Rule => ({
  required: true,
  message,
});

/**
 * 长度验证规则
 * @param min 最小长度
 * @param max 最大长度
 * @param message 错误提示信息
 */
export const lengthRule = (min: number, max: number, message?: string): Rule => ({
  min,
  max,
  message: message || `长度应在${min}-${max}个字符之间`,
});

/**
 * 自定义验证规则
 * @param validator 验证函数
 */
export const customRule = (validator: (rule: any, value: any) => Promise<void>): Rule => ({
  validator,
});

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * 验证密码强度
 * @param password 密码
 * @returns 是否有效
 */
export const isValidPassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

/**
 * 验证验证码格式
 * @param code 验证码
 * @returns 是否有效
 */
export const isValidVerificationCode = (code: string): boolean => {
  return VERIFICATION_CODE_REGEX.test(code);
};

/**
 * 获取密码强度等级
 * @param password 密码
 * @returns 强度等级 (weak | medium | strong)
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  
  let score = 0;
  
  // 长度加分
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // 包含小写字母
  if (/[a-z]/.test(password)) score += 1;
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) score += 1;
  
  // 包含数字
  if (/\d/.test(password)) score += 1;
  
  // 包含特殊字符
  if (/[@$!%*#?&]/.test(password)) score += 1;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};
