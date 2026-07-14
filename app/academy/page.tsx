export const metadata = {
  title: '学术中心 · ziwei',
  description: '14 主星、13 宫位与古籍原典入口。',
};

const links = [
  { href: '/knowledge', title: '命理百科', desc: '14 主星 × 13 宫位知识库' },
  { href: '/library', title: '古籍原典', desc: '紫微斗数全集、全书、骨髓赋' },
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
        <p className="lead">14 主星 × 13 宫位 + 古籍原典。本地版把公开知识库、古籍库与排盘工具整合为可直接访问的入口。</p>
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
