export const metadata = {
  title: '学术中心 · ziwei',
  description: '14 主星、13 宫位与古籍原典入口。',
};

const links = [
  { href: '/ziwei-mysteries', title: '紫薇秘术', desc: '知识讲解、星曜体系与古籍原文统一入口' },
  { href: '/chart', title: '紫微命盘', desc: '输入生辰，查看排盘结果' },
  { href: '/heming', title: '合盘分析', desc: '双盘对照与关系研究' },
];

export default function AcademyPage() {
  return (
    <main className="simple-ziwei-page">
      <a className="simple-back" href="/">ziwei</a>
      <section>
        <p>07 / ACADEMY</p>
        <h1>学术中心</h1>
        <div className="simple-hero-image" style={{ backgroundImage: 'url("/images/scenes/hero-clean.jpg")' }} />
        <p className="lead">紫薇秘术、排盘工具与合盘分析。本地版把知识讲解、古籍原文与实用工具整合为可直接访问的入口。</p>
        <div className="simple-grid">
          {links.map((item) => (
            <a href={item.href} key={item.href}>
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
