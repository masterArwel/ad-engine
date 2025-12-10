import * as fs from 'fs-extra';
import * as path from 'path';
import { FileGenerator } from '../types';

/**
 * 文件生成器
 */
export class CLIFileGenerator implements FileGenerator {
  /**
   * 生成文件
   */
  async generateFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * 生成目录
   */
  async generateDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  /**
   * 复制文件
   */
  async copyFile(src: string, dest: string): Promise<void> {
    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest);
  }

  /**
   * 复制目录
   */
  async copyDir(src: string, dest: string): Promise<void> {
    await fs.copy(src, dest);
  }

  /**
   * 检查文件是否存在
   */
  async exists(filePath: string): Promise<boolean> {
    return fs.pathExists(filePath);
  }

  /**
   * 读取文件内容
   */
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  /**
   * 删除文件或目录
   */
  async remove(filePath: string): Promise<void> {
    await fs.remove(filePath);
  }

  /**
   * 获取目录下的文件列表
   */
  async readDir(dirPath: string): Promise<string[]> {
    return fs.readdir(dirPath);
  }

  /**
   * 批量生成文件
   */
  async generateFiles(files: Array<{ path: string; content: string }>): Promise<void> {
    await Promise.all(
      files.map(file => this.generateFile(file.path, file.content))
    );
  }

  /**
   * 模板文件处理
   */
  processTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    
    // 替换变量
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }

  /**
   * 确保目录存在
   */
  async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }
}
