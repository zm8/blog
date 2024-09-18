import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const baseDir = path.join(__dirname, 'docs/src/pages');

// 获取指定目录下的所有子目录名称
function getSubDirectories(dir: string): string[] {
  return fs.readdirSync(dir).filter((item) => {
    return fs.statSync(path.join(dir, item)).isDirectory();
  });
}

// 获取指定目录下的所有 .md 文件
function getMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((file) => {
    return path.extname(file) === '.md';
  });
}

// 首字母大写
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 生成结构对象
export function generateStructure() {
  const categories = getSubDirectories(baseDir);
  return categories.map((category) => {
    const categoryPath = path.join(baseDir, category);
    const mdFiles = getMarkdownFiles(categoryPath);
    const items = mdFiles.map((file) => {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      let title = lines[0].replace(/^#\s*/, '').trim();

      if (!title) {
        for (const line of lines) {
          if (line.startsWith('#')) {
            title = line.replace(/^#\s*/, '').trim();
            break;
          }
        }
      }

      if (!title) {
        title = path.basename(file, '.md');
      }

      return {
        link: `${category}/${path.basename(file, '.md')}`,
        text: title,
      };
    });
    return {
      collapsed: false,
      text: capitalizeFirstLetter(category),
      items: items,
    };
  });
}
