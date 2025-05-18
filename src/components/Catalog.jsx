import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Ошибка при получении товаров:', err);
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="catalog" id="catalog">
        <div className="container">
          <h2 className="section-title">Каталог товаров</h2>
          <div className="loading">Загрузка товаров...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="catalog" id="catalog">
        <div className="container">
          <h2 className="section-title">Каталог товаров</h2>
          <div className="error-message">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="catalog" id="catalog">
      <div className="container">
        <h2 className="section-title">Каталог товаров</h2>
        
        {products.length === 0 ? (
          <p className="no-data"></p>
        ) : (
          <div className="catalog-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                <div className="product-image-container">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="product-img"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  ) : (
                    <div className="product-img-placeholder">
                      <span>Нет изображения</span>
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-description">
                    {product.description || 'Описание отсутствует'}
                  </p>
                  <div className="product-footer">
                    <span className="product-price">{product.price} руб.</span>
                    <span className="product-category">{product.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}