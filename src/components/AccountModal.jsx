import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminPanel from './AdminPanel'; // Импортируем компонент админ-панели

export default function AccountModal({ isOpen, onClose, user }) {
  const [cars, setCars] = useState([]);
  const [history, setHistory] = useState([]);
  const [newCar, setNewCar] = useState({
    model: '',
    year: '',
    number: ''
  });
  const [loading, setLoading] = useState({
    cars: false,
    history: false,
    addCar: false,
    removeCar: {},
    removeHistory: {}
  });
  const [error, setError] = useState('');

  // Проверяем, является ли пользователь администратором
  const isAdmin = user?.username === 'admin' && user?.id === 0;

  useEffect(() => {
    if (user && isOpen) {
      fetchData();
    }
  }, [user, isOpen]);

  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, cars: true, history: true }));
      setError('');
      
      const requests = [
        axios.get(`http://localhost:5000/api/users/${user.id}/cars`),
        axios.get(`http://localhost:5000/api/users/${user.id}/history`)
      ];
      
      if (isAdmin) {
        // Для администратора загружаем дополнительные данные
        requests.push(axios.get('http://localhost:5000/api/admin/users'));
        requests.push(axios.get('http://localhost:5000/api/admin/products'));
      }
      
      const [carsResponse, historyResponse] = await Promise.all(requests);
      
      setCars(carsResponse.data);
      setHistory(historyResponse.data);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(prev => ({ ...prev, cars: false, history: false }));
    }
  };

  const handleCarChange = (e) => {
    const { name, value } = e.target;
    setNewCar(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
  };

  const addCar = async () => {
    if (!newCar.model || !newCar.year || !newCar.number) {
      setError('Заполните все поля');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, addCar: true }));
      setError('');
      
      await axios.post(`http://localhost:5000/api/users/${user.id}/cars`, newCar);
      setNewCar({ model: '', year: '', number: '' });
      await fetchData();
    } catch (err) {
      console.error('Ошибка при добавлении автомобиля:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении автомобиля');
    } finally {
      setLoading(prev => ({ ...prev, addCar: false }));
    }
  };

  const removeCar = async (carId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) return;
    
    try {
      setLoading(prev => ({ ...prev, removeCar: { ...prev.removeCar, [carId]: true } }));
      await axios.delete(`http://localhost:5000/api/cars/${carId}`);
      setCars(prev => prev.filter(car => car.id !== carId));
    } catch (err) {
      console.error('Ошибка при удалении автомобиля:', err);
      setError('Ошибка при удалении автомобиля');
    } finally {
      setLoading(prev => ({ ...prev, removeCar: { ...prev.removeCar, [carId]: false } }));
    }
  };

  const removeHistoryItem = async (historyId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;
    
    try {
      setLoading(prev => ({ ...prev, removeHistory: { ...prev.removeHistory, [historyId]: true } }));
      await axios.delete(`http://localhost:5000/api/bookings/${historyId}`);
      setHistory(prev => prev.filter(item => item.id !== historyId));
    } catch (err) {
      console.error('Ошибка при удалении записи:', err);
      setError('Ошибка при удалении записи');
    } finally {
      setLoading(prev => ({ ...prev, removeHistory: { ...prev.removeHistory, [historyId]: false } }));
    }
  };

  if (!isOpen || !user) return null;

  // Если пользователь - администратор, показываем админ-панель
  if (isAdmin) {
    return (
      <div className="modal-overlay">
        <div className="modal-content admin-modal">
          <div className="modal-header">
            <h2 className="modal-title">Панель администратора</h2>
            <button 
              className="modal-close" 
              onClick={onClose}
              disabled={Object.values(loading).some(x => typeof x === 'object' 
                ? Object.values(x).some(Boolean) 
                : Boolean(x))}
            >
              ×
            </button>
          </div>
          <AdminPanel 
            user={user} 
            onClose={onClose} 
            cars={cars} 
            history={history} 
            fetchData={fetchData}
          />
        </div>
      </div>
    );
  }

  // Обычный личный кабинет для пользователей
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Личный кабинет</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={Object.values(loading).some(x => typeof x === 'object' 
              ? Object.values(x).some(Boolean) 
              : Boolean(x))}
          >
            ×
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="account-section">
          <div className="account-info">
            <h3>Ваши данные</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">ФИО:</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Логин:</span>
                <span className="info-value">{user.username}</span>
              </div>
            </div>
          </div>
          
          <div className="account-section">
            <h3>Ваши автомобили</h3>
            
            {loading.cars ? (
              <div className="loading">Загрузка автомобилей...</div>
            ) : cars.length === 0 ? (
              <p className="no-data">У вас пока нет автомобилей</p>
            ) : (
              <div className="car-list">
                {cars.map(car => (
                  <div className="car-item" key={car.id}>
                    <div className="car-info">
                      <div className="car-model">{car.model}</div>
                      <div className="car-details">
                        {car.year} год · {car.number}
                      </div>
                    </div>
                    <button 
                      className="btn btn-danger car-remove"
                      onClick={() => removeCar(car.id)}
                      disabled={loading.removeCar[car.id]}
                    >
                      {loading.removeCar[car.id] ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="add-car-form">
              <h4>Добавить автомобиль</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Модель</label>
                  <input
                    type="text"
                    name="model"
                    value={newCar.model}
                    onChange={handleCarChange}
                    placeholder="Например: Toyota Camry"
                  />
                </div>
                
                <div className="form-group">
                  <label>Год выпуска</label>
                  <input
                    type="number"
                    name="year"
                    value={newCar.year}
                    onChange={handleCarChange}
                    placeholder="Например: 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                
                <div className="form-group">
                  <label>Гос. номер</label>
                  <input
                    type="text"
                    name="number"
                    value={newCar.number}
                    onChange={handleCarChange}
                    placeholder="Например: А123БВ777"
                  />
                </div>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={addCar}
                disabled={loading.addCar || !newCar.model || !newCar.year || !newCar.number}
              >
                {loading.addCar ? 'Добавление...' : 'Добавить автомобиль'}
              </button>
            </div>
          </div>
          
          <div className="account-section">
            <h3>История обслуживания</h3>
            
            {loading.history ? (
              <div className="loading">Загрузка истории...</div>
            ) : history.length === 0 ? (
              <p className="no-data">У вас еще не было замен масла</p>
            ) : (
              <div className="history-list">
                {history.map(record => (
                  <div className="history-item" key={record.id}>
                    <div className="history-header">
                      <span className="history-date">
                        {new Date(record.date).toLocaleDateString()} в {record.time}
                      </span>
                      <span className="history-price">{record.total_price} руб.</span>
                    </div>
                    <div className="history-car">
                      {record.car_model} ({record.car_number})
                    </div>
                    <div className="history-details">
                      <div>
                        <span className="detail-label">Услуга:</span>
                        <span>{record.service_type}</span>
                      </div>
                      <div>
                        <span className="detail-label">Масло:</span>
                        <span>{record.oil_type}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger history-remove"
                      onClick={() => removeHistoryItem(record.id)}
                      disabled={loading.removeHistory[record.id]}
                    >
                      {loading.removeHistory[record.id] ? 'Удаление...' : 'Удалить запись'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}