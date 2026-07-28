# 紫微斗数 · 开源排盘引擎

基于倪海夏《天纪》教学体系的紫微斗数排盘与知识库项目。仓库聚焦于可复用的排盘算法、四化系统、格局知识库、古籍原文和现代化前端体验，适合学习、研究与二次开发。

> 本项目用于传统命理学习与软件研究，不构成医疗、法律、财务或其他专业建议。

<p align="center">
  <a href="https://metisziwei.com">在线体验</a> ·
  <a href="https://github.com/ChenShuo2004/ziwei">GitHub</a> ·
  <a href="https://x.com/ChenshuoAI">关注作者</a>
</p>

## 在线体验

- 主站：[metisziwei.com](https://metisziwei.com)
- Preview：[ziwei-kohl.vercel.app](https://ziwei-kohl.vercel.app)

## 项目定位

紫微斗数的学习通常需要同时处理历法换算、命宫定位、主星安置、四化关系、格局判断和古籍阅读。本项目将这些能力拆分为可维护的 TypeScript 模块，并通过 Next.js 前端提供排盘工作台、命盘详情、古籍阅读和知识百科。

## 核心能力

| 模块 | 说明 |
| --- | --- |
| 排盘算法 | 安命宫、定五行局、安十四主星、辅星、大限与流年 |
| 四化系统 | 支持禄、权、科、忌及天干四化关系 |
| 格局知识库 | 维护紫府同宫、日月并明、七杀朝斗等经典格局规则 |
| 合盘分析 | 提供基于双盘信息的关系分析方法与知识结构 |
| 古籍阅读 | 整理《骨髓赋》《紫微斗数全集》《紫微斗数全书》等内容 |
| 知识百科 | 覆盖十四主星、十二宫位和 SEO 友好的结构化知识页 |
| 多端体验 | 支持亮色/暗色主题与移动端适配 |

## 技术栈

- Next.js 15 · React 19 · TypeScript
- Tailwind CSS · Framer Motion · Motion
- `iztro` · `lunar-javascript`
- Vercel · PostgreSQL · Redis（按部署配置启用）

## 本地运行

```bash
git clone https://github.com/ChenShuo2004/ziwei.git
cd ziwei
npm install
cp .env.example .env.local
npm run dev
```

开发服务器默认运行在 `http://127.0.0.1:3001`。

常用命令：

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

## 项目结构

```text
app/          # Next.js App Router 页面与路由
components/   # 排盘、命盘、古籍和通用 UI 组件
lib/ziwei/    # 排盘算法、四化、格局与类型定义
lib/classics/ # 古籍原文与结构化内容
lib/seo/      # 星曜与宫位知识图谱
scripts/      # 开发辅助与质量检查脚本
```

## 开源范围

当前仓库主要开放排盘算法、前端界面、知识库与静态内容。平台运营相关的 AI 解读 Prompt、后端接口、用户系统、支付、风控和部署配置不一定包含在开源版本中。

## 免责声明

紫微斗数属于传统文化与命理研究领域。请将本项目用于学习、研究和软件开发，不要将生成内容作为现实决策的唯一依据。

## 作者

由 [陈硕（KAI）](https://github.com/ChenShuo2004) 构建。

- X / Twitter：[@ChenshuoAI](https://x.com/ChenshuoAI)
- 产品主页：[metisziwei.com](https://metisziwei.com)

## 致谢与许可

部分知识体系、数据与古籍内容来自公开资料及相关开源项目。使用、再分发或商业化前，请核对仓库中的许可证、数据来源和上游项目要求，并保留必要的 attribution。
