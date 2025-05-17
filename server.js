import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // В реальном приложении используйте хеширование!
};
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'OilChange',
  password: '1234',
  port: 5432,
});

// Создание таблиц
const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_book (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
        service_date DATE NOT NULL,
        mileage INTEGER NOT NULL,
        recommended_mileage INTEGER NOT NULL,
        oil_type VARCHAR(100) NOT NULL,
        filters_changed VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        number VARCHAR(20) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
        service_type VARCHAR(100) NOT NULL,
        oil_type VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        total_price INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Таблицы созданы');
  } catch (err) {
    console.error('Ошибка при создании таблиц:', err);
  }
};

await createTables();

//вход
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return res.json({ 
      user: {
        id: 0,
        username: 'admin',
        name: 'Administrator',
        isAdmin: true
      }
    });
  }
  if (!username || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }
  
  try {
    // Ищем пользователя
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    const user = userResult.rows[0];
    
    // Проверяем пароль (в реальном приложении используйте хеширование!)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }
    
    // Получаем автомобили пользователя
    const carsResult = await pool.query(
      'SELECT * FROM cars WHERE user_id = $1',
      [user.id]
    );
    
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        cars: carsResult.rows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});
// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  const { username, password, name, carModel, carYear, carNumber } = req.body;

  try {
    await pool.query('BEGIN');

    // Создаем пользователя
    const userResult = await pool.query(
      'INSERT INTO users (username, password, name) VALUES ($1, $2, $3) RETURNING *',
      [username, password, name]
    );

    // Добавляем автомобиль
    const carResult = await pool.query(
      'INSERT INTO cars (user_id, model, year, number) VALUES ($1, $2, $3, $4) RETURNING *',
      [userResult.rows[0].id, carModel, carYear, carNumber]
    );

    await pool.query('COMMIT');

    res.json({
      user: {
        id: userResult.rows[0].id,
        username: userResult.rows[0].username,
        name: userResult.rows[0].name
      },
      car: carResult.rows[0]
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

//админ
app.get('/api/admin/users', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM users';
    const params = [];
    
    if (search) {
      query += ' WHERE name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка поиска пользователей' });
  }
});
app.post('/api/admin/products', async (req, res) => {
  try {
    const { name, description, price, image_url, category } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, image_url, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка добавления товара' });
  }
});

app.post('/api/admin/service-book', async (req, res) => {
  try {
    const { user_id, car_id, service_date, mileage, recommended_mileage, oil_type, filters_changed, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO service_book 
       (user_id, car_id, service_date, mileage, recommended_mileage, oil_type, filters_changed, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, car_id, service_date, mileage, recommended_mileage, oil_type, filters_changed, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка добавления записи' });
  }
});

// Получение автомобилей пользователя
app.get('/api/users/:userId/cars', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM cars WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения автомобилей' });
  }
});

// Добавление автомобиля
app.post('/api/users/:userId/cars', async (req, res) => {
  const { userId } = req.params;
  const { model, year, number } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO cars (user_id, model, year, number) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, model, year, number]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка добавления автомобиля' });
  }
});

// Удаление автомобиля
app.delete('/api/cars/:carId', async (req, res) => {
  const { carId } = req.params;

  try {
    await pool.query('DELETE FROM cars WHERE id = $1', [carId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка удаления автомобиля' });
  }
});

// История замен масла
app.get('/api/users/:userId/history', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT b.*, c.model as car_model, c.number as car_number 
       FROM bookings b
       LEFT JOIN cars c ON b.car_id = c.id
       WHERE b.user_id = $1
       ORDER BY b.date DESC, b.time DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения истории' });
  }
});

// Создание записи на замену масла
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка удаления записи' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { userId, carId, serviceType, oilType, date, time, totalPrice } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO bookings 
       (user_id, car_id, service_type, oil_type, date, time, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, carId, serviceType, oilType, date, time, totalPrice]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка создания записи' });
  }
});

//товар
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения товаров' });
  }
});
app.get('/api/admin/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения товаров' });
  }
});
// Удаление товара
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка удаления товара' });
  }
});
// Получение списка пользователей
app.get('/api/admin/users', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, username, name FROM users';
    const params = [];
    
    if (search) {
      query += ' WHERE name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка поиска пользователей' });
  }
});
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});