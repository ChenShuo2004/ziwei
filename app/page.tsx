import HomeScrollStage, { type HomeModule } from '@/components/HomeScrollStage';

const modules: HomeModule[] = [
  {
    no: '01',
    eyebrow: 'DESTINY ENGINE',
    title: '紫微命盘',
    description: '输入生辰，查看您的紫微命盘与传统知识解读',
    href: '/chart',
    image: '/images/scenes/home-ziwei-doushu-b.jpg',
  },
  {
    no: '02',
    eyebrow: 'SYNASTRY',
    title: '合盘分析',
    description: '对比两人命盘，研究宫位与星曜在关系中的应用',
    href: '/heming',
    image: '/images/scenes/synastry.webp',
  },
  {
    no: '03',
    eyebrow: 'CHART TWINS',
    title: '命理学双子',
    description: '匹配同命盘配置，研究相同星曜与宫位组合的数据样本（真人地理分布即将上线）',
    href: '/twins',
    image: '/images/scenes/destiny-twins.webp',
  },
  {
    no: '04',
    eyebrow: 'TIAN JI',
    title: '天纪 · 命理',
    description: '上知天文 — 紫微斗数命理体系',
    href: '/tianji',
    image: '/images/scenes/sanji-tianji.jpg',
  },
  {
    no: '05',
    eyebrow: 'DI JI',
    title: '地纪 · 堪舆',
    description: '下知地理 — 风水堪舆经典',
    href: '/diji',
    image: '/images/scenes/sanji-diji.jpg',
  },
  {
    no: '06',
    eyebrow: 'REN JI',
    title: '人纪 · 中医',
    description: '中知人事 — 黄帝内经养生纲领',
    href: '/renji',
    image: '/images/scenes/sanji-renji.jpg',
  },
  {
    no: '07',
    eyebrow: 'ACADEMY',
    title: '学术中心',
    description: '14 主星 × 13 宫位 + 6 部古籍原典',
    href: '/academy',
    image: '/images/scenes/hero-clean.jpg',
  },
];

const footerLinks = [
  { href: '/chart', text: '01起盘' },
  { href: '/heming', text: '02合盘' },
  { href: '/knowledge', text: '03知识库' },
  { href: '/library', text: '04古籍库' },
];

export default function HomePage() {
  return (
    <main className="metis-home">
      <a className="skip-link" href="#main-content">跳转到主要内容</a>

      <header className="metis-header" aria-label="主导航">
        <a className="brand" href="/" aria-label="Metis 紫微首页">
          <span>METIS</span>
          <small>紫微斗数 · 三纪</small>
        </a>

        <nav className="top-links" aria-label="顶部快捷入口">
          <a href="/chart">起盘</a>
          <a href="/heming">合盘</a>
          <a href="/login">登录</a>
          <button type="button">中</button>
          <button type="button" className="muted">EN</button>
          <button type="button" className="pill">专业版</button>
          <button type="button" className="menu" aria-label="菜单">☰</button>
        </nav>
      </header>

      <h1 className="sr-only">
        Metis紫薇 紫微斗数在线排盘 · AI 命盘解读 · 合盘 · 命运双胞胎 —— 输入出生年月日时，即时排出紫微命盘并获得 AI 深度文化解读
      </h1>

      <HomeScrollStage modules={modules} />

      <section className="beam">
        <p>METIS 紫微斗数文化研究平台</p>
        <h2>以命盘为入口，进入天 · 地 · 人三纪体系</h2>
        <a className="beam-button" href="/chart">查看命盘 →</a>
      </section>

      <footer className="metis-footer">
        <nav aria-label="页脚导航">
          {footerLinks.map((link) => <a href={link.href} key={link.href}>{link.text}</a>)}
        </nav>
        <div className="legal">
          <a href="/terms">免责声明</a>
          <a href="/privacy">隐私</a>
          <a href="mailto:feedback@wdyziweidoushu666.com?subject=%E8%BF%9D%E6%B3%95%E5%92%8C%E4%B8%8D%E8%89%AF%E4%BF%A1%E6%81%AF%E4%B8%BE%E6%8A%A5">举报</a>
          <a href="https://beian.miit.gov.cn/">渝ICP备2026013379号-1</a>
          <a href="https://beian.mps.gov.cn/">渝公网安备50019002505469号</a>
        </div>
      </footer>
    </main>
  );
}
