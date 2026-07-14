import { RENJI_MODULES } from '@/lib/nihai';

export const metadata = {
  title: '人纪 · 中医 · ziwei',
  description: '中知人事：黄帝内经、针灸、神农本草经、伤寒论与金匮要略。',
};

export default function RenjiPage() {
  return (
    <main className="simple-ziwei-page">
      <a className="simple-back" href="/">ziwei</a>
      <section>
        <p>06 / REN JI</p>
        <h1>人纪 · 中医</h1>
        <div className="simple-hero-image" style={{ backgroundImage: 'url("/images/scenes/sanji-renji.jpg")' }} />
        <p className="lead">中知人事 — 黄帝内经养生纲领。</p>
        <div className="simple-grid">
          {RENJI_MODULES.map((item) => (
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
