import { Link } from 'react-router-dom'

export default function Header({ user, onLoginClick, onAccountClick, onLogout }) {
  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/">
          <img src="/logo.png" alt="Логотип" className="logo" />
        </Link>
        
        <nav className="nav-links">
          <a href="/#home">Главная</a>
          <a href="/#services">Услуги</a>
          <a href="/#catalog">Продукция</a>
          <a href="/#about">О нас</a>
          <a href="/#contacts">Контакты</a>
        </nav>
        
        {user ? (
          <div className="auth-buttons">
            <button className="btn" onClick={onAccountClick}>Личный кабинет</button>
            <button className="btn btn-primary" onClick={onLogout}>Выйти</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onLoginClick}>Вход / Регистрация</button>
        )}
      </div>
    </header>
  )
}