export default function Hero({ onBookClick }) {
    return (
      <section className="hero" id="home">
          <div className="hero-content">
            <h1 className="hero-title">Профессиональная замена масла</h1>
            <p className="hero-subtitle">Быстро, качественно, с гарантией!</p>
            <button className="btn btn-primary" onClick={onBookClick}>Записаться</button>
          </div>
          <img src="/1.png" alt="Замена масла" className="hero-img" />

        
      </section>
    )
  }