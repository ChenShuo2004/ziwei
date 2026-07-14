# 智谱 API 配置记录

## 已完成

- 已在 `.env.local` 配置智谱 API，不在仓库中提交真实密钥。
- 已在 `.env.example` 增加智谱配置模板。
- `/api/interpret` 已接入智谱，命盘解释优先调用智谱流式输出。
- `/api/heming` 已接入智谱，合盘分析优先调用智谱流式输出。
- 智谱调用失败时自动回退到本地解释文本，避免前端页面中断。

## 当前配置

```env
AI_PROVIDER=zhipu
ZHIPU_API_KEY=你的智谱密钥
ZHIPU_BASE_URL=https://open.bigmodel.cn/api/paas/v4
ZHIPU_MODEL=glm-4.6v
```

## 验证结果

- 当前本地配置已统一切换为 `glm-4.6v`。
- `.env.local`、`.env.example`、`lib/ai/zhipu.ts` 的默认模型均已同步为 `glm-4.6v`。
- 直连智谱 `glm-4.6v` 的最小对话请求已返回成功。
- `npm.cmd run build` 已通过，Next.js 构建时加载 `.env.local`。
- 本地开发服务已启动并通过首页访问检查：`http://127.0.0.1:3001` 返回 `200`。

## 处理建议

如果后续更换密钥，只需要更新 `.env.local` 中的 `ZHIPU_API_KEY` 并重启本地服务。`/api/interpret` 与 `/api/heming` 会优先调用智谱，失败时自动回退到本地解释文本。

```bash
npm run build
npm start
```
