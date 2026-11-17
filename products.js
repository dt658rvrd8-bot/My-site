/* =========================================================
   НАСТРОЙКИ МАГАЗИНА
   Номер WhatsApp — только цифры, в международном формате, без «+».
   ========================================================= */
const SHOP = {
  name: "М Маркет.kg",
  whatsapp: "996706067666",                                   // 0706 067 666
  phoneDisplay: "0706 067 666",
  instagram: "https://www.instagram.com/mmarket_oldbishkek/",
  address: "г. Бишкек, подземный комплекс «Олд Бишкек», бутик А7",
  hours: "С 10:00 до 22:00",
  currency: "сом",
};

/* =========================================================
   КАТЕГОРИИ
   id — используется в товарах (поле category), title — подпись.
   ========================================================= */
const CATEGORIES = [
  { id: "care",      title: "Уходовая косметика" },
  { id: "makeup",    title: "Декоративная косметика" },
  { id: "perfume",   title: "Духи" },
  { id: "bags",      title: "Женские сумки" },
  { id: "household", title: "Бытовая химия" },
];

/* =========================================================
   ТОВАРЫ
   Чтобы добавить товар — скопируйте любой объект и измените поля:
     id          — уникальный номер
     name        — название
     brand       — бренд (можно оставить "")
     category    — id категории из списка выше
     description — краткое описание (объём, особенности)
     price       — цена в сомах (число, без пробелов)
     oldPrice    — старая цена для скидки (или 0, если скидки нет)
     badge       — "hit" (Хит), "new" (Новинка) или ""
     image       — путь к фото, например "images/cream.jpg".
                   Если оставить "", будет показана заглушка.
   ========================================================= */
const PRODUCTS = [
  // ---------- Уходовая косметика ----------
  { id: 1, name: "Увлажняющий крем для лица", brand: "CeraVe", category: "care",
    description: "52 мл. С церамидами и гиалуроновой кислотой, для нормальной и сухой кожи",
    price: 1350, oldPrice: 0, badge: "hit", image: "" },
  { id: 2, name: "Сыворотка с витамином C", brand: "The Ordinary", category: "care",
    description: "30 мл. Выравнивает тон и придаёт сияние коже",
    price: 1190, oldPrice: 1400, badge: "", image: "" },
  { id: 3, name: "Мицеллярная вода Sensibio H2O", brand: "Bioderma", category: "care",
    description: "250 мл. Мягкое очищение для чувствительной кожи",
    price: 980, oldPrice: 0, badge: "", image: "" },
  { id: 4, name: "Солнцезащитный флюид SPF 50", brand: "La Roche-Posay", category: "care",
    description: "50 мл. Невесомая текстура, без белых следов",
    price: 2450, oldPrice: 0, badge: "new", image: "" },

  // ---------- Декоративная косметика ----------
  { id: 5, name: "Тушь для ресниц Lash Sensational", brand: "Maybelline", category: "makeup",
    description: "Чёрная. Объём и разделение ресниц",
    price: 750, oldPrice: 890, badge: "hit", image: "" },
  { id: 6, name: "Тональный крем Infaillible 32H", brand: "L'Oréal Paris", category: "makeup",
    description: "30 мл. Стойкое матовое покрытие, тон 120",
    price: 1290, oldPrice: 0, badge: "", image: "" },
  { id: 7, name: "Матовая помада Ruby Woo", brand: "MAC", category: "makeup",
    description: "Насыщенный классический красный, стойкий матовый финиш",
    price: 1850, oldPrice: 0, badge: "hit", image: "" },
  { id: 8, name: "Палетка теней Nude", brand: "Huda Beauty", category: "makeup",
    description: "9 оттенков. Матовые и сияющие текстуры",
    price: 2900, oldPrice: 0, badge: "new", image: "" },

  // ---------- Духи ----------
  { id: 9, name: "Coco Mademoiselle", brand: "Chanel", category: "perfume",
    description: "Парфюмерная вода, 50 мл. Цитрусово-цветочный шипр с пачули",
    price: 9800, oldPrice: 0, badge: "hit", image: "" },
  { id: 10, name: "La Vie Est Belle", brand: "Lancôme", category: "perfume",
    description: "Парфюмерная вода, 50 мл. Ирис, ваниль и пралине",
    price: 8400, oldPrice: 9200, badge: "", image: "" },
  { id: 11, name: "J'adore", brand: "Dior", category: "perfume",
    description: "Парфюмерная вода, 30 мл. Женственный цветочный букет",
    price: 7600, oldPrice: 0, badge: "", image: "" },

  // ---------- Женские сумки ----------
  { id: 12, name: "Сумка-тоут из экокожи", brand: "", category: "bags",
    description: "Бежевая, 35×28 см. Формат А4, внутренний карман на молнии",
    price: 2900, oldPrice: 0, badge: "new", image: "" },
  { id: 13, name: "Мини-сумка кросс-боди", brand: "", category: "bags",
    description: "Чёрная, 20×14 см. Регулируемый ремень, золотистая фурнитура",
    price: 2200, oldPrice: 2600, badge: "hit", image: "" },
  { id: 14, name: "Клатч вечерний", brand: "", category: "bags",
    description: "Молочный, 24×12 см. Съёмная цепочка, магнитная застёжка",
    price: 1850, oldPrice: 0, badge: "", image: "" },
  { id: 15, name: "Рюкзак городской", brand: "", category: "bags",
    description: "Карамельный, 28×32 см. Экокожа, два отделения",
    price: 3400, oldPrice: 0, badge: "", image: "" },

  // ---------- Бытовая химия ----------
  { id: 16, name: "Гель для стирки Color", brand: "Persil", category: "household",
    description: "1,95 л (~40 стирок). Сохраняет яркость цветных вещей",
    price: 890, oldPrice: 0, badge: "hit", image: "" },
  { id: 17, name: "Средство для мытья посуды «Сочный лимон»", brand: "Fairy", category: "household",
    description: "900 мл. Эффективно удаляет жир",
    price: 320, oldPrice: 0, badge: "", image: "" },
  { id: 18, name: "Кондиционер для белья «Альпийские луга»", brand: "Lenor", category: "household",
    description: "1,8 л. Мягкость и свежесть надолго",
    price: 650, oldPrice: 750, badge: "", image: "" },
  { id: 19, name: "Капсулы для посудомоечной машины Quantum", brand: "Finish", category: "household",
    description: "40 шт. Блеск без разводов и налёта",
    price: 1450, oldPrice: 0, badge: "new", image: "" },
];
