import { DIJI_MODULES } from '@/lib/nihai';

export const metadata = {
  title: '地纪 · 堪舆 · ziwei',
  description: '下知地理：风水堪舆经典与倪师地纪构想整理。',
};

export default function DijiPage() {
  return (
    <main className="simple-ziwei-page">
      <a className="simple-back" href="/">ziwei</a>
      <section>
        <p>05 / DI JI</p>
        <h1>地纪 · 堪舆</h1>
        <div className="simple-hero-image" style={{ backgroundImage: 'url("/images/scenes/sanji-diji.jpg")' }} />
        <p className="lead">下知地理 — 风水堪舆经典。</p>
        <div className="simple-grid">
          {DIJI_MODULES.map((item) => (
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
