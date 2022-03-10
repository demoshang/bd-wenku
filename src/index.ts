import { ensureDir, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { getBrowser } from './puppeteer';
import { getHtml } from './wenku/html';
import { screen } from './wenku/screen';

const url = `http://bdwk.588230.com/wk.php?urls=${encodeURIComponent(
  '这里为百度文库的URL, 仅支持 doc 文档',
)}`;

const resultDir = resolve(__dirname, '../result');
const tmpDir = resolve(resultDir, 'tmp');

(async () => {
  console.log('获取 网页内容中');
  const { title, html } = await getHtml(url);

  await ensureDir(tmpDir);

  const tmpPath = resolve(tmpDir, `${title}.txt`);
  const pngPath = resolve(resultDir, `${title}.png`);

  // 保存下, 方便debug
  await writeFile(tmpPath, html);

  console.log('html 转 图片');
  await screen(html, pngPath);

  console.log('关闭所有页面');
  (await getBrowser()).close();

  process.exit(0);
})();
