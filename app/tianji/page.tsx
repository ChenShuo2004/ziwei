import { TIANJI_MODULES } from '@/lib/nihai';

export const metadata = {
  title: '天纪 · 命理 · Metis紫薇',
  description: '上知天文：紫微斗数、易经、堪舆、推命、面相、测字。',
};

export default function TianjiPage() {
  return (
    <main className="simple-metis-page">
      <a className="simple-back" href="/">METIS</a>
      <section>
        <p>04 / TIAN JI</p>
        <h1>天纪 · 命理</h1>
        <div className="simple-hero-image" style={{ backgroundImage: 'url("/images/scenes/sanji-tianji.jpg")' }} />
        <p className="lead">上知天文 — 紫微斗数命理体系。</p>
        <div className="simple-grid">
          {TIANJI_MODULES.slice(0, 6).map((item) => (
            <article key={item.id}>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
