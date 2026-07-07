# 提取与验证报告

日期：2026-07-07

## 提取结果

- 项目目录：`D:\coding\1.算命\ziwei-doushu-latest`
- 源仓库：`https://github.com/Renhuai123/ziwei-doushu`
- 分支：`main`
- HEAD：`88194a404242bfe5c6d5cc512e4117e3e245cdd5`
- 安装：`npm.cmd install` 已完成，生成 `package-lock.json`
- 构建：`npm.cmd run build` 通过
- 本地生产服务：`http://127.0.0.1:3000`

## 本地修整

开源仓库原始首页不是当前 `metisziwei.com` 的 Metis 白底展示页，因此本地版做了以下修整：

- 重建首页为 Metis 桌面展示风格。
- 下载并本地化首页展示图片到 `public/images/scenes/`。
- 补齐首页导航目标页：`twins`、`tianji`、`diji`、`renji`、`academy`、`login`。
- 补齐本地 API：
  - `POST /api/generate`
  - `POST /api/interpret`
  - `POST /api/heming`
- 新增 `lib/ziwei/local-analysis.ts`，让起盘和合盘在无云端 key 的情况下也能输出可读解读。
- 本地禁用 Vercel Analytics / Speed Insights 脚本，避免开发环境 404 噪声。
- `tsconfig.json` 排除 `release-data`、`.verification`、`.local-run`，避免 release 工具包源码参与 Next.js 类型检查。

## 验证证据

### 构建

命令：

```powershell
npm.cmd run build
```

结果：通过，Next.js 生成 44 个页面/路由，`/api/generate`、`/api/interpret`、`/api/heming` 为动态路由。

### 路由

以下路由均返回 200：

```text
/          /chart      /heming     /knowledge
/library   /twins      /tianji     /diji
/renji     /academy    /login      /terms
/privacy
```

### 浏览器交互

Playwright + Chrome 生产环境验证（最后一次验证为最新构建、最新服务）：

- `/chart`：填写 `1990-05-15 08:00`，成功生成十二宫命盘。
- `/chart`：本地命格总览生成成功，无“解读失败”。
- `/heming`：填写两人出生信息，成功生成合盘分析。
- 本地 `/`、`/chart`、`/heming` 用户流：无 console error、无 page error、无 failed request、无 4xx/5xx 资源响应。

截图证据：

```text
.verification/final-local-home-current-1280x720.png
.verification/final-live-home-1280x720.png
.verification/final-chart-1280x720.png
.verification/final-heming-1280x720.png
.verification/final-local-home-viewport-exact.png
.verification/final-live-home-viewport-after-patch.png
.verification/final-chart-after-patch.png
.verification/final-heming-after-patch.png
```

## 与线上首页一致性

对比目标：`https://metisziwei.com/`

当前本地首页在 1280x720 桌面视口中已经匹配线上首屏结构：

- 左上 `METIS` 标识与副标题。
- 右上起盘、合盘、语言、专业版入口。
- 左侧功能目录。
- 中央命盘图、角标框、第二图露出。
- 右侧 `AI Interpretation 01`。

线上页面本身在验证时有 403/百度 CSP 噪声；本地页面无这些线上运行噪声。

## Release 数据状态

GitHub latest release：

- tag：`v3.0-samples`
- 名称：`紫微斗数 51万样本数据 v3`
- 发布时间：`2026-05-07`
- 分卷：
  - `ziwei-samples-v3-part1.zip.001`
  - `ziwei-samples-v3-part2.zip.002`
  - `ziwei-samples-v3-part3.zip.003`

已写好下载校验脚本：

```text
scripts/download-release-data.ps1
```

下载与校验已完成：

```text
release-data/v3.0-samples/parts/SHA256SUMS.txt
release-data/v3.0-samples/parts/speed-test.txt
release-data/v3.0-samples/parts/ziwei-samples-v3-part1.zip.001
release-data/v3.0-samples/parts/ziwei-samples-v3-part2.zip.002
release-data/v3.0-samples/parts/ziwei-samples-v3-part3.zip.003
release-data/v3.0-samples/ziwei-samples-toolkit-v3-full-20260425.zip
release-data/v3.0-samples/extracted/ziwei-samples-toolkit
```

SHA256：

```text
part1  424b90ff4ef3cf67db0643515b3c62251f15bdb3cadd3b1414418e762c1c9369
part2  4a32ad023e265b5d6edc19fcb67752971333e5a822b5793c778cbb5f895a2bdf
part3  9628d6633123a78f67df4b9b3d49abfccfea72f8cdb936cd7bea24cdee89787e
zip    21fe90f8737931c63397f38e419bbba6e839b7f8318440ccb747f9bb3e9b1870
```

解压验证：

- 目录：`release-data/v3.0-samples/extracted/ziwei-samples-toolkit`
- 文件夹：83
- 文件：833
- `.jsonl.gz` 样本文件：720
- 解压后文件体积：约 5.474GB
- 抽检样本：`samples-out/year-1924/1924-01.jsonl.gz` 可 gunzip，可 JSON parse，包含 `birthInfo`、`chart`、`topics`、`system`。

## 已知边界

- 本地解读是基于命盘结构的离线规则解读，不是线上商业版的私有 AI 服务。
- 登录页是本地占位入口，没有接入线上账号系统。
- 线上账号、支付、私有 AI 服务、线上运营后台没有包含在开源仓库中；本地版提供可运行的排盘、离线解读、合盘和展示体验。
