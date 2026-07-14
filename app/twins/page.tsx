export const metadata = {
  title: '命理学双子 · ziwei',
  description: '匹配同命盘配置，研究相同星曜与宫位组合的数据样本。',
};

export default function TwinsPage() {
  return (
    <main className="simple-ziwei-page">
      <a className="simple-back" href="/">ziwei</a>
      <section>
        <p>03 / CHART TWINS</p>
        <h1>命理学双子</h1>
        <div className="simple-hero-image" style={{ backgroundImage: 'url("/images/scenes/destiny-twins.webp")' }} />
        <p className="lead">匹配同命盘配置，研究相同星曜与宫位组合的数据样本。真人地理分布模块仍属于线上运营层，本地版保留展示入口。</p>
        <a className="simple-button" href="/chart">先查看命盘 →</a>
      </section>
    </main>
  );
}
