import { useState } from 'react';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    carModel: '',
    carYear: '',
    carNumber: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = isLogin 
        ? 'http://localhost:5000/api/auth/login' 
        : 'http://localhost:5000/api/auth/register';
      
      const response = await axios.post(url, formData);
      
      // Проверяем структуру ответа
      if (!response.data.user) {
        throw new Error('Неверный формат ответа от сервера');
      }
      
      onLogin(response.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 
        err.message || 
        (isLogin ? 'Ошибка входа' : 'Ошибка регистрации'));
      console.error('Auth error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{isLogin ? 'Вход' : 'Регистрация'}</h2>
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Логин</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">ФИО</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Модель автомобиля</label>
                <input
                  type="text"
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Год выпуска</label>
                <input
                  type="number"
                  name="carYear"
                  value={formData.carYear}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Гос. номер</label>
                <input
                  type="text"
                  name="carNumber"
                  value={formData.carNumber}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary auth-submit-btn"
            disabled={!formData.username || !formData.password}
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="form-toggle">
          <button 
            type="button" 
            className="btn-text"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                username: '',
                password: '',
                name: '',
                carModel: '',
                carYear: '',
                carNumber: ''
              });
            }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}