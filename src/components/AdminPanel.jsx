import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ user, onClose, fetchData }) {
  const [activeTab, setActiveTab] = useState('products');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'oil'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [serviceRecord, setServiceRecord] = useState({
    user_id: '',
    car_id: '',
    service_date: new Date().toISOString().split('T')[0],
    mileage: '',
    recommended_mileage: '',
    oil_type: '',
    filters_changed: '',
    notes: ''
  });
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/users?search=${searchTerm}`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCars = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/cars`);
      setCars(response.data);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Ошибка загрузки автомобилей');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price) {
      setError('Заполните обязательные поля');
      return;
    }
  
    try {
      setLoading(true);
      
      if (isEditing) {
        // Редактирование существующего товара
        await axios.put(`http://localhost:5000/api/admin/products/${newProduct.id}`, {
          ...newProduct,
          price: parseFloat(newProduct.price)
        });
        alert('Товар успешно обновлен!');
      } else {
        // Добавление нового товара
        await axios.post('http://localhost:5000/api/admin/products', {
          ...newProduct,
          price: parseFloat(newProduct.price)
        });
        alert('Товар успешно добавлен!');
      }
      
      // Сброс формы и обновление списка
      resetProductForm();
      fetchProducts();
    } catch (err) {
      console.error('Ошибка при сохранении товара:', err);
      setError(err.response?.data?.message || 'Ошибка при сохранении товара');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/admin/service-book', serviceRecord);
      setServiceRecord({
        user_id: '',
        car_id: '',
        service_date: new Date().toISOString().split('T')[0],
        mileage: '',
        recommended_mileage: '',
        oil_type: '',
        filters_changed: '',
        notes: ''
      });
      alert('Запись в сервисную книжку добавлена!');
    } catch (err) {
      console.error('Error adding service record:', err);
      setError(err.response?.data?.message || 'Ошибка при добавлении записи');
    } finally {
      setLoading(false);
    }
  };
  const resetProductForm = () => {
    setNewProduct({
      id: null,
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: 'oil'
    });
    setIsEditing(false);
  };
  const editProduct = (product) => {
    setNewProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category: product.category
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/admin/products/${productId}`);
      fetchProducts();
      alert('Товар успешно удален!');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Ошибка при удалении товара');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Управление товарами
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Поиск пользователей
        </button>
        <button 
          className={activeTab === 'service' ? 'active' : ''}
          onClick={() => setActiveTab('service')}
        >
          Сервисная книжка
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Загрузка...</div>}

      {activeTab === 'products' && (
        <div className="admin-section">
          <h3>{isEditing ? 'Редактировать товар' : 'Добавить новый товар'}</h3>
          <form onSubmit={handleProductSubmit}>
            <div className="form-group">
              <label>Название*</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Описание</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Цена*</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Ссылка на изображение</label>
              <input
                type="url"
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label>Категория</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option value="oil">Масло</option>
                <option value="filter">Фильтр</option>
                <option value="accessory">Аксессуар</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Добавить товар')}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetProductForm}
                  disabled={loading}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          {/* Список товаров */}
          <h3 style={{marginTop: '30px'}}>Список товаров</h3>
          {products.length === 0 ? (
            <p className="no-data">Товары отсутствуют</p>
          ) : (
            <div className="products-list">
              {products.map(product => (
                <div key={product.id} className="product-item">
                  <div className="product-item-header">
                    <h4>{product.name}</h4>
                    <span className="product-item-price">{product.price} руб.</span>
                  </div>
                  <p className="product-item-category">Категория: {product.category}</p>
                  {product.description && (
                    <p className="product-item-description">{product.description}</p>
                  )}
                  {product.image_url && (
                    <div className="product-item-image">
                      <img src={product.image_url} alt={product.name} />
                    </div>
                  )}
                  <div className="product-item-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => editProduct(product)}
                      disabled={loading}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteProduct(product.id)}
                      disabled={loading}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-section form-group">
          <h3>Поиск пользователей</h3>
          <input
            type="text"
            placeholder="Поиск по ФИО"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <h4>{user.name}</h4>
                <p>Логин: {user.username}</p>
                <button 
                  onClick={() => {
                    setServiceRecord({...serviceRecord, user_id: user.id});
                    fetchUserCars(user.id);
                    setActiveTab('service');
                  }}
                  disabled={loading}
                  className='btn-product'
                >
                  Добавить сервис
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'service' && (
        <div className="admin-section">
          <h3>Добавить запись в сервисную книжку</h3>
          <form onSubmit={handleServiceSubmit}>
            <div className="form-group">
              <label>Пользователь:</label>
              <input
                type="text"
                value={users.find(u => u.id === serviceRecord.user_id)?.name || ''}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Автомобиль:</label>
              <select
                value={serviceRecord.car_id}
                onChange={(e) => setServiceRecord({...serviceRecord, car_id: e.target.value})}
                required
              >
                <option value="">Выберите автомобиль</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.model} ({car.year}, {car.number})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Дата обслуживания:</label>
              <input
                type="date"
                value={serviceRecord.service_date}
                onChange={(e) => setServiceRecord({...serviceRecord, service_date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Пробег (км):</label>
              <input
                type="number"
                value={serviceRecord.mileage}
                onChange={(e) => setServiceRecord({...serviceRecord, mileage: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Рекомендуемый пробег (км):</label>
              <input
                type="number"
                value={serviceRecord.recommended_mileage}
                onChange={(e) => setServiceRecord({...serviceRecord, recommended_mileage: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Масло:</label>
              <input
                type="text"
                value={serviceRecord.oil_type}
                onChange={(e) => setServiceRecord({...serviceRecord, oil_type: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Замененные фильтры:</label>
              <input
                type="text"
                value={serviceRecord.filters_changed}
                onChange={(e) => setServiceRecord({...serviceRecord, filters_changed: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Примечания:</label>
              <textarea
                value={serviceRecord.notes}
                onChange={(e) => setServiceRecord({...serviceRecord, notes: e.target.value})}
              />
            </div>
            <button type="submit" disabled={loading} className='btn-admin'>
              {loading ? 'Сохранение...' : 'Сохранить запись'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}