'use client';

export default function ZiweiMysteriesError({ reset }: { reset: () => void }) {
  return (
    <main className="ziwei-home mysteries-page">
      <div className="library-empty library-empty--page">
        <div className="library-empty__icon" aria-hidden="true">!</div>
        <h2>紫薇秘术加载失败</h2>
        <p>页面数据暂时无法读取，请重试一次。</p>
        <button type="button" className="library-button library-button--primary interactive-ring" onClick={reset}>
          重新加载
        </button>
      </div>
    </main>
  );
}
