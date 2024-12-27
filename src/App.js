// Основной файл приложения App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3005'

const App = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '0', max: '1000' });
  const [sortOrder, setSortOrder] = useState('asc');  // Сортировка (по возрастанию/убыванию)
  const [productsWithNoPriceIncrease, setProductsWithNoPriceIncrease] = useState([]);
  const [supplyIncrease, setSupplyIncrease] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Получение списка товаров
  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Ошибка при загрузке товаров:', error));
  }, []);

  // Получение списка поставщиков
  useEffect(() => {
    fetch(`${API_URL}/api/suppliers`)
      .then((response) => response.json())
      .then((data) => setSuppliers(data))
      .catch((error) => console.error('Ошибка при загрузке поставщиков:', error));
  }, []);

  // Фильтрация товаров по цене
  const handlePriceFilter = () => {
    fetch(`${API_URL}/api/products/filter?minPrice=${priceRange.min}&maxPrice=${priceRange.max}`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Ошибка при фильтрации товаров:', error));
  };

  // Сортировка товаров по цене
  const handleSort = (order) => {
    if (!products.length) return alert('Список продуктов пуст')
    const sortedProducts = [...products];
    sortedProducts.sort((a, b) => (order === 'asc' ? a.price - b.price : b.price - a.price));
    setProducts(sortedProducts);
    setSortOrder(order);
  };

  // Товары, цены на которые не повышались
  const handleNoPriceIncrease = () => {
    fetch(`${API_URL}/api/products/no-price-increase`)
      .then((response) => response.json())
      .then((data) => setProducts(data.slice(0,2)))
      .catch((error) => console.error('Ошибка при получении товаров без повышения цен:', error));
  };

  // Информация о поставках товара в 2023 году
  const handleSupplyIncrease = async (productId) => {
    console.log(productId)
    await fetch(`${API_URL}/api/supplies/increase?productId=${productId}`)
      .then((response) => response.json())
      .then((data) => {
        setModalData(data);
        setShowModal(true);
      })
      .catch((error) => console.error('Ошибка при получении данных о поставках:', error));
  };

  return (
    <div className="App">
      <h1>Справочник "Оптовая база"</h1>

      {/* Фильтры */}
      <div className="filters">
        <h2>Фильтры</h2>
        <div>
          <label>Цена от:</label>
          <input
            type="number"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
          />
        </div>
        <div>
          <label>Цена до:</label>
          <input
            type="number"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
          />
        </div>
        <button onClick={handlePriceFilter}>Применить фильтры</button>
        <div>
          <button onClick={() => handleSort('asc')}>Сначала дешевые</button>
          <button onClick={() => handleSort('desc')}>Сначала дорогие</button>
        </div>
        <button onClick={handleNoPriceIncrease}>Товары, цены на которые не повышались</button>
      </div>

      {/* Результаты */}
      <div className="filtered-results">
        <h2>Результаты</h2>
        <ul>
          {products.length ? products?.map((product) => (
            <li key={product.product_id}>
              {product.name} - {product.price} руб.
              <button onClick={() => handleSupplyIncrease(product.product_id)}>Посмотреть поставки</button>
            </li>
          )) : <div>Нет данных</div>}
        </ul>

        {/* Модалка с графиком или текстом */}
        {showModal && modalData && (
          <div className="modal">
            <h3>Поставки товара "{products.find((item) => item.product_id === modalData[0].product_id).name}" в 2023 году</h3>
            <p>На {modalData[0].total_quantity_2023} ед. возросли поставки товара в 2023 году по сравнению с предыдущим годом.</p>
            <button onClick={() => setShowModal(false)}>Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
