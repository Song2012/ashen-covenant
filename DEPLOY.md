# 发布网页版试玩

这是静态网页游戏，无需运行后端。Vite 已配置 `base: './'`，构建资源使用相对路径，可以部署到 GitHub Pages 的仓库子目录。

## GitHub Pages

个人免费账户可使用公开仓库发布 GitHub Pages，适合此试玩版。公开仓库会同时公开源代码；请勿提交账号密钥、个人存档或 `.env` 文件。实际服务限制以 GitHub 当前政策为准。

1. 登录你的 GitHub 账户，创建公开仓库，将项目源文件和 `package-lock.json` 上传到 `main` 分支。保留 `.github/workflows/deploy.yml`；不用上传 `node_modules`、`dist` 或 `artifacts`。
2. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 打开 **Actions → Deploy GitHub Pages → Run workflow**，选择 `main` 并运行。以后每次推送到 `main` 都会自动发布。
4. 工作流会安装依赖、运行引擎测试、构建并部署。全部成功后，在部署任务或 **Settings → Pages** 中打开实际网站地址。

工作流使用 GitHub 自动提供的临时令牌，无需自己配置访问令牌。首次创建仓库、登录与授权需要使用你自己的账户。仓库未启用 Pages 时，配置步骤可能失败；完成第 2 步后重跑即可。

本地预检：

```sh
npm ci
npm test
npm run build
npm run preview
```

## 其他静态托管

- **Cloudflare Pages**：登录后连接仓库，构建命令填 `npm run build`，输出目录填 `dist`，使用 Node.js 22。
- **Netlify**：登录后连接仓库，构建命令填 `npm run build`，发布目录填 `dist`；也可将本地构建好的 `dist` 目录拖入其手动部署页面。

两者均有免费方案，但流量、构建次数及其他配额随平台政策变化；发布前核对账户显示的限制。它们不依赖这里的 GitHub Pages 工作流。

## 试玩版边界

发布后可以把网站链接分享给朋友。每人的角色和离线收益保存在各自浏览器中；更换域名或浏览器不会自动迁移存档。首领队友与市场仍是本地模拟，静态托管不会自动变成真实多人世界，也不提供跨设备账户、共享交易行或服务器验证。实现这些功能需要后端与数据库。
