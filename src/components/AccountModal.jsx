import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminPanel from './AdminPanel';

export default function AccountModal({ isOpen, onClose, user }) {
  const [cars, setCars] = useState([]);
  const [history, setHistory] = useState([]);
  const [serviceBook, setServiceBook] = useState([]);
  const [newCar, setNewCar] = useState({
    model: '',
    year: '',
    number: ''
  });
  const [newServiceRecord, setNewServiceRecord] = useState({
    car_id: '',
    service_date: new Date().toISOString().split('T')[0],
    mileage: '',
    recommended_mileage: '',
    oil_type: '',
    filters_changed: '',
    notes: ''
  });
  const [loading, setLoading] = useState({
    cars: false,
    history: false,
    serviceBook: false,
    addCar: false,
    addServiceRecord: false,
    removeCar: {},
    removeHistory: {},
    removeServiceRecord: {}
  });
  const [error, setError] = useState('');

  const isAdmin = user?.username === 'admin' && user?.id === 0;

  useEffect(() => {
    if (user && isOpen) {
      fetchData();
    }
  }, [user, isOpen]);

  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, cars: true, history: true, serviceBook: true }));
      setError('');
      
      const requests = [
        axios.get(`http://localhost:5000/api/users/${user.id}/cars`),
        axios.get(`http://localhost:5000/api/users/${user.id}/history`),
        axios.get(`http://localhost:5000/api/users/${user.id}/service-book`)
      ];
      
      if (isAdmin) {
        requests.push(axios.get('http://localhost:5000/api/admin/users'));
        requests.push(axios.get('http://localhost:5000/api/admin/products'));
      }
      
      const [carsResponse, historyResponse, serviceBookResponse] = await Promise.all(requests);
      
      setCars(carsResponse.data);
      setHistory(historyResponse.data);
      setServiceBook(serviceBookResponse.data);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(prev => ({ ...prev, cars: false, history: false, serviceBook: false }));
    }
  };

  const handleCarChange = (e) => {
    const { name, value } = e.target;
    setNewCar(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
  };

  const handleServiceRecordChange = (e) => {
    const { name, value } = e.target;
    setNewServiceRecord(prev => ({
      ...prev,
      [name]: name.includes('mileage') ? parseInt(value) || '' : value
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

  const addServiceRecord = async () => {
    if (!newServiceRecord.car_id || !newServiceRecord.oil_type) {
      setError('Заполните обязательные поля (автомобиль и тип масла)');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, addServiceRecord: true }));
      setError('');

      const recordToAdd = {
        ...newServiceRecord,
        user_id: user.id
      };

      const response = await axios.post('http://localhost:5000/api/admin/service-book', recordToAdd);
      setServiceBook(prev => [...prev, response.data]);
      setNewServiceRecord({
        car_id: '',
        service_date: new Date().toISOString().split('T')[0],
        mileage: '',
        recommended_mileage: '',
        oil_type: '',
        filters_changed: '',
        notes: ''
      });
    } catch (err) {
      console.error('Ошибка при добавлении записи:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении записи');
    } finally {
      setLoading(prev => ({ ...prev, addServiceRecord: false }));
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

  const removeServiceRecord = async (recordId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись из сервисной книжки?')) return;
  
    try {
      setLoading(prev => ({ 
        ...prev, 
        removeServiceRecord: { ...prev.removeServiceRecord, [recordId]: true } 
      }));
      setError('');
  
      // Отправляем запрос на удаление
      const response = await axios.delete(
        `http://localhost:5000/api/admin/service-book/${recordId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status === 204 || status === 404
        }
      );
  
      if (response.status === 204) {
        // Успешное удаление - обновляем состояние
        setServiceBook(prev => prev.filter(record => record.id !== recordId));
      } else if (response.status === 404) {
        setError('Запись уже была удалена');
        await fetchData(); // Перезагружаем данные
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      setError(err.response?.data?.message || 
               err.response?.data?.details || 
               'Ошибка при удалении записи');
      
      // Если ошибка 404, обновляем данные
      if (err.response?.status === 404) {
        await fetchData();
      }
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        removeServiceRecord: { ...prev.removeServiceRecord, [recordId]: false } 
      }));
    }
  };

  if (!isOpen || !user) return null;

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
        
        <div className="account-sections-container">
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
            
            <div className="form-section">
              <br />
              <h3>Ваши автомобили</h3>
              
              <div className="car-list">
                {loading.cars ? (
                  <div className="loading">Загрузка автомобилей...</div>
                ) : cars.length === 0 ? (
                  <p className="no-data">У вас нет добавленных автомобилей</p>
                ) : (
                  cars.map(car => (
                    <div className="car-item" key={car.id}>
                      <div>
                        <p><strong>{car.model}</strong> ({car.year})</p>
                        <p>{car.number}</p>
                      </div>
                      <button 
                        className="btn btn-danger"
                        onClick={() => removeCar(car.id)}
                        disabled={loading.removeCar[car.id]}
                      >
                        {loading.removeCar[car.id] ? 'Удаление...' : 'Удалить'}
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Модель автомобиля</label>
                <input
                  type="text"
                  name="model"
                  value={newCar.model}
                  onChange={handleCarChange}
                  className="form-input"
                  placeholder="Например: Toyota Camry"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Год выпуска</label>
                <input
                  type="number"
                  name="year"
                  value={newCar.year}
                  onChange={handleCarChange}
                  className="form-input"
                  placeholder="Например: 2020"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Гос. номер</label>
                <input
                  type="text"
                  name="number"
                  value={newCar.number}
                  onChange={handleCarChange}
                  className="form-input"
                  placeholder="Например: А123БВ777"
                />
              </div>
              
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={addCar}
                disabled={loading.addCar}
              >
                {loading.addCar ? 'Добавление...' : 'Добавить автомобиль'}
              </button>
            </div>
          </div>

          <div className="account-section">
            <br />
            <h3>Добавить запись в сервисную книжку</h3>
            
            <div className="form-group">
              <label className="form-label">Автомобиль*</label>
              <select
                name="car_id"
                value={newServiceRecord.car_id}
                onChange={handleServiceRecordChange}
                className="form-input"
                required
              >
                <option value="">Выберите автомобиль</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.model} ({car.number})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Дата обслуживания</label>
              <input
                type="date"
                name="service_date"
                value={newServiceRecord.service_date}
                onChange={handleServiceRecordChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Пробег (км)*</label>
              <input
                type="number"
                name="mileage"
                value={newServiceRecord.mileage}
                onChange={handleServiceRecordChange}
                className="form-input"
                placeholder="Текущий пробег"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Рекомендуемый пробег (км)*</label>
              <input
                type="number"
                name="recommended_mileage"
                value={newServiceRecord.recommended_mileage}
                onChange={handleServiceRecordChange}
                className="form-input"
                placeholder="Следующее обслуживание"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Тип масла*</label>
              <input
                type="text"
                name="oil_type"
                value={newServiceRecord.oil_type}
                onChange={handleServiceRecordChange}
                className="form-input"
                placeholder="Например: 5W-30"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Замененные фильтры*</label>
              <input
                type="text"
                name="filters_changed"
                value={newServiceRecord.filters_changed}
                onChange={handleServiceRecordChange}
                className="form-input"
                placeholder="Например: масляный, воздушный"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Примечания</label>
              <textarea
                name="notes"
                value={newServiceRecord.notes}
                onChange={handleServiceRecordChange}
                className="form-input"
                placeholder="Дополнительная информация"
                rows="3"
              />
            </div>
            
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={addServiceRecord}
              disabled={loading.addServiceRecord}
            >
              {loading.addServiceRecord ? 'Добавление...' : 'Добавить запись'}
            </button>
          </div>

          <div className="account-section">
            <br />
            <h3>Сервисная книжка</h3>
            {loading.serviceBook ? (
              <div className="loading">Загрузка сервисной книжки...</div>
            ) : serviceBook.length === 0 ? (
              <p className="no-data">В вашей сервисной книжке пока нет записей</p>
            ) : (
              <div className="service-book-list">
                {serviceBook.map(record => {
                  const car = cars.find(c => c.id === record.car_id) || {};
                  return (
                    <div className="service-record" key={record.id}>
                      <div className="record-header">
                        <span className="record-date">
                          {new Date(record.service_date).toLocaleDateString()}
                        </span>
                        <span className="record-mileage">
                          Пробег: {record.mileage} км
                        </span>
                      </div>
                      <div className="record-car">
                        {car.model} ({car.number})
                      </div>
                      <div className="record-details">
                        <div>
                          <span className="detail-label">Масло:</span>
                          <span>{record.oil_type}</span>
                        </div>
                        <div>
                          <span className="detail-label">Фильтры:</span>
                          <span>{record.filters_changed}</span>
                        </div>
                        <div>
                          <span className="detail-label">Следующее ТО:</span>
                          <span>{record.recommended_mileage} км</span>
                        </div>
                        {record.notes && (
                          <div>
                            <span className="detail-label">Примечания:</span>
                            <span>{record.notes}</span>
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-danger"
                        onClick={() => removeServiceRecord(record.id)}
                        disabled={loading.removeServiceRecord[record.id]}
                      >
                        {loading.removeServiceRecord[record.id] ? 'Удаление...' : 'Удалить запись'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="account-section">
            <br />
            <h3>Запись на замену масла</h3>
            {loading.history ? (
              <div className="loading">Загрузка истории...</div>
            ) : history.length === 0 ? (
              <p className="no-data">У вас еще не было замен масла</p>
            ) : (
              <div className="history-list">
                {history.map(record => {
                  const car = cars.find(c => c.id === record.car_id) || {};
                  return (
                    <div className="history-item" key={record.id}>
                      <div className="history-header">
                        <span className="history-date">
                          {new Date(record.date).toLocaleDateString()} в {record.time}
                        </span>
                        
                      </div>
                      <div className="history-car">
                        {car.model} ({car.number})
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
                      <div className='price-text'>
                        <span className="history-price">{record.total_price} руб.</span>

                      </div> 
                      <button
                        className="btn btn-danger"
                        onClick={() => removeHistoryItem(record.id)}
                        disabled={loading.removeHistory[record.id]}
                      >
                        {loading.removeHistory[record.id] ? 'Удаление...' : 'Удалить запись'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}