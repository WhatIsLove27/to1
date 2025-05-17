export default function WhyUs() {
    const reasons = [
      {
        id: 1,
        title: 'Опытные мастера',
        description: 'Наши специалисты имеют более 5 лет опыта',
        image: '/why1.png'
      },
      {
        id: 2,
        title: 'Гарантия качества',
        description: 'Предоставляем гарантию до 1 года на все работы',
        image: '/why4.png'
      },
      {
        id: 3,
        title: 'Оригинальные масла',
        description: 'Используем только сертифицированные масла',
        image: '/why5.png'
      },
      {
        id: 4,
        title: 'Быстрое обслуживание',
        description: 'Среднее время замены масла - 30 минут',
        image: '/why3.png'
      }
    ]
  
    return (
      <section className="why-us" id="about">
        <div className="container">
          <h2 className="section-title">Почему выбирают нас</h2>
          
          <div className="why-us-grid">
            {reasons.map(reason => (
              <div className="why-us-item" key={reason.id}>
                <img src={reason.image} alt={reason.title} className="why-us-img" />
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }