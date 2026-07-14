import Link from 'next/link';

export default function PreviewPage() {
  return (
    <main className="simple-ziwei-page">
      <section>
        <p>PREVIEW</p>
        <h1>预览页已并入白色主视觉</h1>
        <p className="lead">
          旧版黑底卷轴开场已经停用。当前本地版统一采用白色产品风格，起盘、合盘、知识库与古籍库都以浅色界面为主。
        </p>
        <div className="simple-actions">
          <Link href="/chart">进入起盘</Link>
          <Link href="/heming">进入合盘</Link>
          <Link href="/">返回首页</Link>
        </div>
      </section>
    </main>
  );
}
