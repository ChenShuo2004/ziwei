# 本地运行说明

本目录是从 `Renhuai123/ziwei-doushu` 的 `main` 分支提取并修整后的本地可运行版。

## 版本

- 源码仓库：`https://github.com/Renhuai123/ziwei-doushu`
- 分支：`main`
- 本地 HEAD：`88194a404242bfe5c6d5cc512e4117e3e245cdd5`

## 启动

```powershell
cd "D:\coding\1.算命\ziwei-doushu-latest"
npm.cmd install
npm.cmd run build
npm.cmd run start -- --hostname 127.0.0.1 --port 3000
```

打开：

```text
http://127.0.0.1:3000
```

当前这台机器上已经启动了生产服务，端口是 `3000`。

## 已补齐的本地可用功能

- 首页已经改成和 `https://metisziwei.com/` 当前桌面首页一致的 Metis 白底展示。
- `/chart` 可本地起盘，并带本地命格、感情、事业、财运、健康、性格解读。
- `/heming` 可本地合盘分析，不再依赖线上 API。
- `/api/generate`、`/api/interpret`、`/api/heming` 已补齐本地实现。
- `/twins`、`/tianji`、`/diji`、`/renji`、`/academy`、`/login` 已补入口页，避免首页链接 404。

## Release 数据

GitHub 最新 release 数据集 `v3.0-samples` 已经下载、校验、合并并解压完成：

```text
release-data\v3.0-samples\parts
release-data\v3.0-samples\ziwei-samples-toolkit-v3-full-20260425.zip
release-data\v3.0-samples\extracted\ziwei-samples-toolkit
```

数据规模：

- 分卷：3 个，均已通过 SHA256。
- 合并 zip：`ziwei-samples-toolkit-v3-full-20260425.zip`，已通过 SHA256。
- 解压目录：83 个文件夹、833 个文件、720 个 `.jsonl.gz` 样本文件，约 5.474GB。
- 抽检：`samples-out/year-1924/1924-01.jsonl.gz` 可正常 gunzip 和 JSON parse。

如需重新校验或重新下载，可运行：

```powershell
.\scripts\download-release-data.ps1
```

如果你使用 GitHub 下载镜像，可以传入镜像前缀：

```powershell
.\scripts\download-release-data.ps1 -MirrorPrefix "https://你的镜像域名/"
```

脚本会自动：

- 断点续传下载 `SHA256SUMS.txt`、`speed-test.txt` 和 3 个分卷。
- 校验每个分卷 SHA256。
- 流式合并为 `ziwei-samples-toolkit-v3-full-20260425.zip`。
- 校验合并 zip 的 SHA256。
- 使用 7-Zip 解压到 `release-data\v3.0-samples\extracted`。
