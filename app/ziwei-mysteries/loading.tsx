export default function ZiweiMysteriesLoading() {
  return (
    <main className="ziwei-home mysteries-page">
      <div className="library-skeleton library-skeleton--hero" />
      <div className="library-shell__content">
        <div className="library-skeleton library-skeleton--toolbar" />
        <div className="mysteries-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="library-skeleton library-skeleton--card" key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
