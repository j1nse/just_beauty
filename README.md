# JUST BEAUTY

这是一个部署到 GitHub Pages 的静态图片展示站，主打宇宙感、沉浸式转场和精致的图片浏览体验。

## 技术栈

- Vite + React + TypeScript
- Framer Motion，用于共享转场和覆盖层动效
- Sharp，用于本地增量图片处理
- AVIF 图片输出管线

## 基础路径

构建时通过 `SITE_BASE` 控制站点基础路径。

- `SITE_BASE=/beauty/` 对应 `https://j1nse.github.io/beauty/`
- `SITE_BASE=/just_beauty/` 对应 `https://j1nse.github.io/just_beauty/`

当前仓库对应的 GitHub Pages 地址是：

```bash
SITE_BASE=/just_beauty/ npm run build
```

## 本地工作流

1. 安装依赖：

   ```bash
   npm install
   ```

2. 将原图放入 `source-images/` 下的分类目录：

   ```text
   source-images/
     美女/
     风景/
     游戏/
   ```

3. 处理图片：

   ```bash
   npm run images
   ```

4. 启动本地开发环境：

   ```bash
   npm run dev
   ```

5. 构建 GitHub Pages 产物：

   ```bash
   SITE_BASE=/just_beauty/ npm run build
   ```

6. 如果你想一条命令完成“重新处理图片 + 构建”：

   ```bash
   SITE_BASE=/just_beauty/ npm run build:gallery
   ```

## 图片处理管线

- 原始图片保留在本地 `source-images/`
- 生成后的资源写入 `public/generated/images`
- 前端读取的清单文件写入 `public/generated/manifest.json`
- 机器生成的状态写入 `content/photo-registry.json`
- 可人工编辑的文案元数据写入 `content/photo-metadata.json`
- 通过“文件路径 + 文件签名”做增量检测
- 重新编码为 AVIF 时会剥离 EXIF 信息

## GitHub Pages

仓库内已经包含 GitHub Pages 部署工作流：`.github/workflows/deploy.yml`。  
请保证 workflow 里的 `SITE_BASE` 与最终访问路径一致。

GitHub Actions 部署流程刻意 **不会** 执行 `npm run images`，因为原始图片不提交到仓库，线上部署只依赖已经生成好的 AVIF 和 manifest。

GitHub 仓库还需要一次性设置：

1. 打开 `Settings -> Pages`
2. 在 `Build and deployment` 下将 `Source` 设为 `GitHub Actions`

如果这一步没有启用，`actions/configure-pages@v5` 可能会报 `Get Pages site failed` 或 `Not Found`。

## 可编辑元数据

执行 `npm run images` 后，脚本会维护一个适合手工编辑的文件：

`content/photo-metadata.json`

你需要修改图片标题、文案时，只编辑这个文件，不要手改 registry。

```json
{
  "version": 1,
  "categories": {
    "美女": [
      {
        "source": "美女/example.jpg",
        "title": "月下肖像",
        "caption": "可选的一句短文案。"
      }
    ]
  }
}
```

- `title` 是卡片和详情页显示的标题
- `caption` 是可选文案，可以为空字符串
- 文件按分类分组，便于持续新增图片后整理
- `content/photo-registry.json` 是生成状态，不建议手工修改
