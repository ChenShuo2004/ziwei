const features = [
  '完整解读项目：命格、财运、事业、感情、性格、健康、兄弟、子女、迁移、人际、田宅、福德、父母',
  '时间维度：本命、大限、流年、流月、流日、流时',
  'AI 实时问答：围绕当前命盘继续追问具体问题',
  '本地化隐私：AI 对话和最近命盘优先保存在本机',
  '自有模型接入：未来支持用户配置自己的模型 API Key',
  '三纪内容库：天纪、地纪、人纪内容持续整理',
  '全盘分析报告：支持自定义名称和下载',
  '古籍阅读：原文、白话、精解和批注逐步完善',
];

const roadmap = [
  '先完善网页端排盘、解读和报告下载',
  '再补本地历史命盘和数据同步',
  '最后再考虑移动端 App 体验',
];

export const metadata = {
  title: '功能路线图 · ziwei',
  description: 'ziwei 功能路线图：完整排盘、AI 解读、报告下载、三纪内容库和本地化隐私。',
};

export default function LoginPage() {
  return (
    <main className="simple-ziwei-page pro-page">
      <a className="simple-back" href="/">ziwei</a>

      <section className="pro-hero">
        <p>05 / ROADMAP</p>
        <h1>功能路线图</h1>
        <p className="lead">
          这里记录接下来要完善的功能。当前优先把排盘、解读、AI 追问和报告下载做稳定，不做复杂会员体系。
        </p>

        <div className="pro-actions">
          <a className="simple-button" href="/chart">立即排盘</a>
          <a className="pro-secondary-button" href="mailto:feedback@wdyziweidoushu666.com?subject=ziwei%E5%8A%9F%E8%83%BD%E5%BB%BA%E8%AE%AE">反馈建议</a>
        </div>
      </section>

      <section className="pro-benefits" aria-labelledby="features-title">
        <div className="pro-section-head">
          <p>FEATURES</p>
          <h2 id="features-title">我们要把这些能力逐步做完整</h2>
        </div>

        <div className="pro-benefit-list">
          {features.map((item, index) => (
            <article className="pro-benefit-item" key={item}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pro-launch-plan" aria-labelledby="roadmap-title">
        <div>
          <p>NEXT</p>
          <h2 id="roadmap-title">先完成，再完美</h2>
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
