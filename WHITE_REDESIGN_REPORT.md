# 白色主视觉修复记录

日期：2026-07-07

## 已完成

- `/chart` 起盘页重做为白色中轴表单页，贴近参考图结构。
- `components/BirthForm.tsx` 重写为白底、浅灰边框、圆角输入框、进度线、历法分段、真太阳时提示。
- `/chart` 起盘结果页改为白色工作台布局，左侧命盘、右侧解读。
- 起盘成功后自动回到页面顶部，避免保留表单滚动位置。
- `/heming` 合盘页改为白色双表单布局。
- 合盘分析区、追问区改为白底浅灰边框样式。
- `app/globals.css` 新增白色设计系统 token 和响应式样式。
- 其他 `simple-metis-page` 入口页统一为白底浅灰卡片风格。

## 验证

构建：

```powershell
npm.cmd run build
```

结果：通过。

本地生产服务：

```text
http://127.0.0.1:3000
```

关键路由均返回 200：

```text
/ /chart /heming /twins /tianji /diji /renji /academy /login
```

Playwright 验证通过：

- `/chart` 表单页白底风格加载正常。
- `/chart` 填写 `1990-05-15 08:00 北京 男` 后成功生成命盘。
- `/chart` 起盘后 `scrollY=0`，结果页回到顶部。
- `/heming` 填写两人信息后成功生成合盘分析。
- 移动端 `390x844` 无横向溢出。
- 无 console error、page error、failed request、4xx/5xx 资源错误。

## 截图

```text
.verification/white-chart-form-final.png
.verification/white-chart-result-final.png
.verification/white-heming-result-final.png
.verification/white-chart-form-1280x720.png
.verification/white-chart-result-1280x720.png
.verification/white-heming-form-1280x720.png
.verification/white-heming-result-1280x720.png
.verification/white-chart-form-mobile-390x844.png
```
