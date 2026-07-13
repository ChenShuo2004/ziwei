const benefits = [
  '全部解读项目解锁：兄弟、子女、迁移、人际、田宅、福德、父母',
  '全部排盘：本命、大限、流年、流月、流日、时辰',
  'AI 实时问答：平台 AI 每日 20 次，支持自有模型不限次数',
  'AI 对话数据本地化：不上云，隐私不外流',
  '自有模型 API Key 接入：AI 调用走专属通道，更私密',
  '《天纪》：紫微斗数、易经、推命学、面相学、字理文化',
  '《地纪》：风水地理、形势、理气、阳宅阴宅',
  '《人纪》：针灸、黄帝内经、神农本草、伤寒金匮',
  '紫微斗数全盘分析报告：完整下载，可自定义名称与标签',
  '六部古籍与四层精解全开，支持倪师批注',
];

const roadmap = [
  '手机端 App 专业版优先开放体验',
  '多端数据同步',
  'iOS 优先上架',
];

export const metadata = {
  title: '专业版 · Metis紫薇',
  description: 'Metis紫薇专业版权益：全项目解读、全时序排盘、AI 问答、本地化隐私、自有模型接入、三纪知识库与专业报告。',
};

export default function LoginPage() {
  return (
    <main className="simple-metis-page pro-page">
      <a className="simple-back" href="/">METIS</a>

      <section className="pro-hero">
        <p>05 / PRO</p>
        <h1>专业版</h1>
        <p className="lead">
          面向真正想长期研究自己命盘的用户：解锁完整排盘、深度解读、AI 追问、三纪知识库与可下载报告。
        </p>

        <div className="pro-actions">
          <a className="simple-button" href="/chart">先体验起盘</a>
          <a className="pro-secondary-button" href="mailto:feedback@wdyziweidoushu666.com?subject=Metis%E7%B4%AB%E8%96%87%E4%B8%93%E4%B8%9A%E7%89%88%E7%AD%89%E5%BE%85%E5%90%8D%E5%8D%95">加入等待名单</a>
        </div>
      </section>

      <section className="pro-benefits" aria-labelledby="pro-benefits-title">
        <div className="pro-section-head">
          <p>PRO ACCESS</p>
          <h2 id="pro-benefits-title">截图里的专业版权益，我建议这样落地</h2>
        </div>

        <div className="pro-benefit-list">
          {benefits.map((item, index) => (
            <article className="pro-benefit-item" key={item}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pro-launch-plan" aria-labelledby="pro-launch-title">
        <div>
          <p>LAUNCH PLAN</p>
          <h2 id="pro-launch-title">MVP 先做等待名单，不急着接复杂会员系统</h2>
        </div>
        <ul>
          {roadmap.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
