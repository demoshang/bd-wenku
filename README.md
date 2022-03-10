# 下载百度文库 doc 为图片

## 使用

```bash
git clone https://github.com/demoshang/bd-wenku.git
cd bd-wenku
# pnpm or cnpm or yarn
npm install

# 手动替换 src/index.ts 中 百度文库url

npm start

# 生成的图片在 result 下
```

## 为什么转成图片

1. 纯 html 的话在 result/tmp 下的 txt 文件基本上就是 html 了, 可以使用, 但是会请求部分静态资源
2. 转 PDF, 会导致部分文字重叠, 目前没有找到解决方案
3. 转图片, 文字清晰, 但是不可复制
4. 转 doc, 未找到方案
5. 欢迎 PR 改进

## TODO

- [ ] 支持 prompt 输入 百度 URL
