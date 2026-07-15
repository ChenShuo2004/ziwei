# Windows Local Setup

PowerShell on this machine blocks `npm.ps1`, so use `npm.cmd`.

```powershell
cd "D:\coding\1.算命\ziwei-doushu-latest"
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:3001
```

Validation commands:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```
