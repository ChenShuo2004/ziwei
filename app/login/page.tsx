export const metadata = {
  title: '登录 · Metis紫薇',
  description: '本地开源版登录占位页。',
};

export default function LoginPage() {
  return (
    <main className="simple-metis-page">
      <a className="simple-back" href="/">METIS</a>
      <section>
        <p>05 / LOGIN</p>
        <h1>登录</h1>
        <p className="lead">登录、短信验证、会员与支付属于线上运营层，官方开源仓库未包含。本地版保留入口，不阻塞排盘、合盘、知识库与古籍库使用。</p>
        <a className="simple-button" href="/chart">直接起盘 →</a>
      </section>
    </main>
  );
}
