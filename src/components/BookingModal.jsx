import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BookingModal({ isOpen, onClose, user }) {
  const [cars, setCars] = useState([]);
  const [bookingData, setBookingData] = useState({
    carId: '',
    serviceType: 'Замена моторного масла',
    oilType: 'Castrol 5W-40',
    date: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const services = [
    { id: 1, name: 'Замена моторного масла', price: 1500 },
    { id: 2, name: 'Замена трансмиссионного масла', price: 2000 },
    { id: 3, name: 'Замена масла в дифференциале', price: 1800 },
    { id: 4, name: 'Комплексная замена жидкостей', price: 3500 }
  ];

  const oils = [
    { id: 1, name: 'Castrol 5W-40', price: 2500 },
    { id: 2, name: 'Mobil 1 0W-40', price: 3200 },
    { id: 3, name: 'ZIC трансмиссионное', price: 1800 },
    { id: 4, name: 'Liqui Moly 10W-60', price: 2800 }
  ];

  useEffect(() => {
    if (user && isOpen) {
      fetchCars();
      // Устанавливаем текущую дату как минимальную
      const today = new Date().toISOString().split('T')[0];
      setBookingData(prev => ({ ...prev, date: today }));
    }
  }, [user, isOpen]);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${user.id}/cars`);
      setCars(response.data);
      if (response.data.length > 0) {
        setBookingData(prev => ({ ...prev, carId: response.data[0].id }));
      }
    } catch (err) {
      console.error('Ошибка при получении автомобилей:', err);
      setError('Не удалось загрузить список автомобилей');
    }
  };

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    const service = services.find(s => s.name === bookingData.serviceType);
    const oil = oils.find(o => o.name === bookingData.oilType);
    return (service?.price || 0) + (oil?.price || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!bookingData.carId) {
      setError('Выберите автомобиль');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/bookings', {
        userId: user.id,
        carId: bookingData.carId,
        serviceType: bookingData.serviceType,
        oilType: bookingData.oilType,
        date: bookingData.date,
        time: bookingData.time,
        totalPrice: calculateTotal()
      });
      
      if (response.data && response.data.id) {
        alert('Запись успешно создана!');
        onClose();
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (err) {
      console.error('Ошибка при создании записи:', err);
      setError(err.response?.data?.message || 'Ошибка при создании записи');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Запись на замену масла</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Выберите автомобиль</label>
            <select
              name="carId"
              value={bookingData.carId}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            >
              {cars.map(car => (
                <option key={car.id} value={car.id}>
                  {car.model} ({car.year}, {car.number})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Выберите услугу</label>
            <select
              name="serviceType"
              value={bookingData.serviceType}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            >
              {services.map(service => (
                <option key={service.id} value={service.name}>
                  {service.name} ({service.price} руб.)
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Выберите масло</label>
            <select
              name="oilType"
              value={bookingData.oilType}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            >
              {oils.map(oil => (
                <option key={oil.id} value={oil.name}>
                  {oil.name} ({oil.price} руб.)
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Дата</label>
            <input
              type="date"
              name="date"
              value={bookingData.date}
              onChange={handleChange}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Время</label>
            <input
              type="time"
              name="time"
              value={bookingData.time}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <h3>Примерная стоимость: {calculateTotal()} руб.</h3>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Записаться'}
          </button>
        </form>
      </div>
    </div>
  );
}