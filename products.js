/* =========================================================
   НАСТРОЙКИ МАГАЗИНА
   Замените номер WhatsApp и ссылку Instagram на реальные.
   Номер — только цифры, в международном формате, без «+».
   ========================================================= */
const SHOP = {
  name: "М Маркет",
  whatsapp: "996706067666",                                   // 0706 067 666
  instagram: "https://www.instagram.com/mmarket_oldbishkek/",
  address: "г. Бишкек, подземный комплекс «Олд Бишкек», бутик А7",
  hours: "Ежедневно с 10:00 до 20:00",
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
     category    — id категории из списка выше
     description — краткое описание (бренд, объём, особенности)
     price       — цена в сомах (число, без пробелов)
     image       — путь к фото, например "images/cream.jpg".
                   Если оставить "", будет показана стильная заглушка.
   ========================================================= */
const PRODUCTS = [
  // ---------- Уходовая косметика ----------
  {
    id: 1,
    name: "Увлажняющий крем для лица",
    category: "care",
    description: "CeraVe, 52 мл. С церамидами и гиалуроновой кислотой, для нормальной и сухой кожи",
    price: 1350,
    image: "",
  },
  {
    id: 2,
    name: "Сыворотка с витамином C",
    category: "care",
    description: "The Ordinary, 30 мл. Выравнивает тон и придаёт сияние коже",
    price: 1190,
    image: "",
  },
  {
    id: 3,
    name: "Мицеллярная вода",
    category: "care",
    description: "Bioderma Sensibio H2O, 250 мл. Мягкое очищение для чувствительной кожи",
    price: 980,
    image: "",
  },
  {
    id: 4,
    name: "Солнцезащитный флюид SPF 50",
    category: "care",
    description: "La Roche-Posay Anthelios, 50 мл. Невесомая текстура, без белых следов",
    price: 2450,
    image: "",
  },

  // ---------- Декоративная косметика ----------
  {
    id: 5,
    name: "Тушь для ресниц",
    category: "makeup",
    description: "Maybelline Lash Sensational, чёрная. Объём и разделение ресниц",
    price: 750,
    image: "",
  },
  {
    id: 6,
    name: "Тональный крем",
    category: "makeup",
    description: "L'Oréal Infaillible 32H, 30 мл. Стойкое матовое покрытие, тон 120",
    price: 1290,
    image: "",
  },
  {
    id: 7,
    name: "Матовая помада",
    category: "makeup",
    description: "MAC Retro Matte, оттенок Ruby Woo. Насыщенный классический красный",
    price: 1850,
    image: "",
  },
  {
    id: 8,
    name: "Палетка теней",
    category: "makeup",
    description: "Huda Beauty Nude, 9 оттенков. Матовые и сияющие текстуры",
    price: 2900,
    image: "",
  },

  // ---------- Духи ----------
  {
    id: 9,
    name: "Chanel Coco Mademoiselle",
    category: "perfume",
    description: "Парфюмерная вода, 50 мл. Цитрусово-цветочный шипр с пачули",
    price: 9800,
    image: "",
  },
  {
    id: 10,
    name: "Lancôme La Vie Est Belle",
    category: "perfume",
    description: "Парфюмерная вода, 50 мл. Сладкий аромат ириса, ванили и пралине",
    price: 8400,
    image: "",
  },
  {
    id: 11,
    name: "Dior J'adore",
    category: "perfume",
    description: "Парфюмерная вода, 30 мл. Женственный цветочный букет",
    price: 7600,
    image: "",
  },

  // ---------- Женские сумки ----------
  {
    id: 12,
    name: "Сумка-тоут из экокожи",
    category: "bags",
    description: "Цвет бежевый, 35×28 см. Вмещает формат А4, внутренний карман на молнии",
    price: 2900,
    image: "",
  },
  {
    id: 13,
    name: "Мини-сумка кросс-боди",
    category: "bags",
    description: "Цвет чёрный, 20×14 см. Регулируемый ремень, золотистая фурнитура",
    price: 2200,
    image: "",
  },
  {
    id: 14,
    name: "Клатч вечерний",
    category: "bags",
    description: "Цвет молочный, 24×12 см. Съёмная цепочка, магнитная застёжка",
    price: 1850,
    image: "",
  },
  {
    id: 15,
    name: "Рюкзак городской",
    category: "bags",
    description: "Цвет карамель, 28×32 см. Экокожа, два отделения",
    price: 3400,
    image: "",
  },

  // ---------- Бытовая химия ----------
  {
    id: 16,
    name: "Гель для стирки",
    category: "household",
    description: "Persil Color, 1,95 л (~40 стирок). Сохраняет яркость цветных вещей",
    price: 890,
    image: "",
  },
  {
    id: 17,
    name: "Средство для мытья посуды",
    category: "household",
    description: "Fairy «Сочный лимон», 900 мл. Эффективно удаляет жир",
    price: 320,
    image: "",
  },
  {
    id: 18,
    name: "Кондиционер для белья",
    category: "household",
    description: "Lenor «Альпийские луга», 1,8 л. Мягкость и свежесть надолго",
    price: 650,
    image: "",
  },
  {
    id: 19,
    name: "Капсулы для посудомоечной машины",
    category: "household",
    description: "Finish Quantum, 40 шт. Блеск без разводов и налёта",
    price: 1450,
    image: "",
  },
];
