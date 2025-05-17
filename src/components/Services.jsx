export default function Services() {
    const services = [
      {
        id: 1,
        title: 'Замена моторного масла',
        description: 'Полная замена моторного масла и фильтра с проверкой всех систем двигателя.',
        image: '/services1.png'
      },
      {
        id: 2,
        title: 'Замена трансмиссионного масла',
        description: 'Профессиональная замена масла в коробке передач с диагностикой состояния.',
        image: '/services2.png'
      },
      {
        id: 3,
        title: 'Замена масляного, воздушного и салонного фильтра',
        description: 'Замена фильтра с проверкой состояния',
        image: '/services3.png'
      },
      {
        id: 4,
        title: 'Комплексное ТО',
        description: 'Полная техническое обслуживание вашего автомобиля',
        image: '/services4.png'
      }
    ]
  
    return (
      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">Услуги замены масла</h2>
          
          <div className="services-grid">
            {services.map(service => (
              <div className="service-item" key={service.id}>
                <img src={service.image} alt={service.title} className="service-img" />
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }