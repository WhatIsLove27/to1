export default function Catalog() {
    const products = [
      {
        id: 1,
        title: 'Моторное масло Castrol 5W-40',
        price: '2500 руб',
        image: '/product1.jpg'
      },
      {
        id: 2,
        title: 'Моторное масло Mobil 1 0W-40',
        price: '3200 руб',
        image: '/product2.jpg'
      },
      {
        id: 3,
        title: 'Трансмиссионное масло ZIC',
        price: '1800 руб',
        image: '/product3.jpg'
      },
      {
        id: 4,
        title: 'Масляный фильтр Mann',
        price: '800 руб',
        image: '/product4.jpg'
      }
    ]
  
    return (
      <section className="catalog" id="catalog">
        <div className="container">
          <h2 className="section-title">Каталог товаров</h2>
          
          <div className="catalog-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                <img src={product.image} alt={product.title} className="product-img" />
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-price">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }