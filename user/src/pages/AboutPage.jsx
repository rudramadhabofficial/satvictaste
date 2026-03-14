export default function AboutPage() {
  return (
    <section className="section">
      <div className="container-tight about-layout">
        <div className="about-text">
          <h1 className="section-title">About SatvicTaste</h1>
          <p className="about-lead" style={{ fontSize: '1.25rem', color: 'var(--muted)', marginTop: '24px', lineHeight: '1.6' }}>
            SatvicTaste is built to help people discover calm, clean and spiritually-aligned food places — without noise,
            ads or endless scrolling. The focus is on trust, simplicity and verified satvik, Jain-friendly options.
          </p>
          <p className="about-body" style={{ marginTop: '32px', lineHeight: '1.8' }}>
            Every listing aims to reflect honest practices around ingredients, preparation and intention. This project
            started as a small effort to make it easier for families and seekers to find food that supports their lifestyle,
            wherever they travel.
          </p>
        </div>
        <div className="about-founder" style={{ marginTop: '64px', textAlign: 'center', padding: '48px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <img src="/founder.jpg" alt="Founder" className="about-founder-photo" style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '24px', objectFit: 'cover' }} />
          <h2 className="about-founder-name">Founder</h2>
          <p className="about-founder-tagline" style={{ color: 'var(--muted)' }}>
            Vision for calm, trustworthy food discovery.
          </p>
        </div>
      </div>
    </section>
  )
}
