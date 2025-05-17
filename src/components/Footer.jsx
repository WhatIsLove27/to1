export default function Footer() {
    return (
      <footer className="footer" id="contacts">
        <div className="container footer-container">
          <div className="contact-info">
            <h3>Свяжитесь с нами</h3>
            <p>Адрес: г. Якутск, ул. 202, д. 16г, бокс 36</p>
            <p>Телефон: +7 (968) 150-76-49</p>
            <p>Email: To1@gmail.com</p>
            <p>График работы: Без выходных, Пн-Вс 9:00-21:00</p>
            <div className="footer-map">
            <iframe 
                        src="https://yandex.ru/map-widget/v1/?um=constructor%3A1a2b3c4d5e6f7g8h9i0j&amp;source=constructor" 
                        className="footer-map"
                        title="Карта расположения"
                    ></iframe>
            </div>
          </div>
          
          <div className="footer-nav">
            <h3>Навигация</h3>
            <a href="/">Главная</a>
            <a href="/#services">Услуги</a>
            <a href="/#catalog">Продукция</a>
            <a href="/#about">О нас</a>
            <a href="/#contacts">Контакты</a>
          </div>
        </div>
      </footer>
    )
  }