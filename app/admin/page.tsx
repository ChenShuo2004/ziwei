import { canViewAdminStats, getQuestionStats, getStatsDayKey } from '@/lib/admin-stats';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatDate(value: string | null) {
  if (!value) return '暂无';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(value));
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!canViewAdminStats(token)) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-6 py-16 text-[#28231c]">
        <section className="mx-auto max-w-xl rounded-2xl border border-[#ded6c8] bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.18em] text-[#8b7357]">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold">需要后台访问口令</h1>
          <p className="mt-4 text-sm leading-6 text-[#6f6558]">
            请在地址后加上 <code>?token=你的 ADMIN_ACCESS_TOKEN</code> 访问后台统计。
          </p>
        </section>
      </main>
    );
  }

  const stats = await getQuestionStats();
  const latestDays = Object.entries(stats.daily).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14);
  const todayKey = getStatsDayKey();

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-6 py-10 text-[#28231c]">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-3 border-b border-[#ded6c8] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#8b7357]">WARMTH Admin</p>
            <h1 className="mt-3 text-4xl font-semibold">提问统计后台</h1>
          </div>
          <p className="text-sm text-[#6f6558]">最后提问：{formatDate(stats.lastAskedAt)}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#ded6c8] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8b7357]">问过问题的人数</p>
            <strong className="mt-3 block text-5xl font-semibold">{formatNumber(stats.uniqueVisitors)}</strong>
          </article>
          <article className="rounded-2xl border border-[#ded6c8] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8b7357]">总提问次数</p>
            <strong className="mt-3 block text-5xl font-semibold">{formatNumber(stats.totalQuestions)}</strong>
          </article>
          <article className="rounded-2xl border border-[#ded6c8] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8b7357]">今日提问</p>
            <strong className="mt-3 block text-5xl font-semibold">
              {formatNumber(stats.daily[todayKey] ?? 0)}
            </strong>
          </article>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[#ded6c8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">入口分布</h2>
            <dl className="mt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#eee8dd] pb-3">
                <dt className="text-[#6f6558]">命盘解读</dt>
                <dd className="text-2xl font-semibold">{formatNumber(stats.sources.chart)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#6f6558]">合盘分析</dt>
                <dd className="text-2xl font-semibold">{formatNumber(stats.sources.heming)}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-[#ded6c8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">最近 14 天</h2>
            <div className="mt-5 space-y-3">
              {latestDays.length > 0 ? (
                latestDays.map(([day, count]) => (
                  <div className="flex items-center justify-between gap-4" key={day}>
                    <span className="text-sm text-[#6f6558]">{day}</span>
                    <span className="h-2 flex-1 rounded-full bg-[#eee8dd]">
                      <span
                        className="block h-2 rounded-full bg-[#8b7357]"
                        style={{ width: `${Math.max(8, Math.min(100, count * 12))}%` }}
                      />
                    </span>
                    <strong className="w-10 text-right">{formatNumber(count)}</strong>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6f6558]">还没有提问记录。</p>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
