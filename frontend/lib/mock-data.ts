import type { Category, Product } from "./types";

export const mockProducts: Product[] = [
  {
    id: "665000000000000000000001",
    name: "Premium UI Kit",
    category: "design",
    label: "Дизайн",
    price: 45,
    oldPrice: 69,
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&h=700&fit=crop",
    rating: 4.9,
    reviews: 142,
    seller: "North Studio",
    description: "Набор экранов, компонентов и токенов для быстрой сборки аккуратного цифрового продукта."
  },
  {
    id: "665000000000000000000002",
    name: "SaaS Dashboard",
    category: "code",
    label: "Код",
    price: 120,
    oldPrice: 180,
    image: "https://images.unsplash.com/photo-1551288049-bbbda536ad3a?w=900&h=700&fit=crop",
    rating: 4.8,
    reviews: 91,
    seller: "Flowkit",
    description: "Готовый шаблон панели управления с таблицами, графиками и авторизацией."
  },
  {
    id: "665000000000000000000003",
    name: "Mobile App Icons",
    category: "icons",
    label: "Иконки",
    price: 15,
    oldPrice: 29,
    image: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=900&h=700&fit=crop",
    rating: 4.7,
    reviews: 64,
    seller: "Glyph Lab",
    description: "Системный набор иконок для мобильных приложений, лендингов и маркетплейсов."
  },
  {
    id: "665000000000000000000004",
    name: "React Template",
    category: "code",
    label: "Код",
    price: 89,
    oldPrice: 129,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&h=700&fit=crop",
    rating: 4.9,
    reviews: 118,
    seller: "Pixel Forge",
    description: "React-шаблон с каталогом, карточками товаров и базовой интеграцией API."
  },
  {
    id: "665000000000000000000005",
    name: "Brand Identity",
    category: "design",
    label: "Дизайн",
    price: 200,
    oldPrice: 260,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=700&fit=crop",
    rating: 5,
    reviews: 76,
    seller: "Mono Mark",
    description: "Айдентика, логотип, палитра и презентационные шаблоны для запуска бренда."
  },
  {
    id: "665000000000000000000006",
    name: "3D Character",
    category: "3d",
    label: "3D",
    price: 60,
    oldPrice: 95,
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=900&h=700&fit=crop",
    rating: 4.6,
    reviews: 39,
    seller: "Renderbox",
    description: "3D-персонаж с материалами, ригом и коммерческой лицензией."
  }
];

export const categoryImages: Record<string, string> = {
  all: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&h=700&fit=crop",
  design: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=700&fit=crop",
  code: "https://images.unsplash.com/photo-1551288049-bbbda536ad3a?w=900&h=700&fit=crop",
  icons: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=900&h=700&fit=crop",
  "3d": "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=900&h=700&fit=crop",
  marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=700&fit=crop"
};

export const mockCategories: Category[] = [
  { id: "all", label: "Все", count: mockProducts.length, image: categoryImages.all },
  { id: "design", label: "Дизайн", count: 2, image: categoryImages.design },
  { id: "code", label: "Код", count: 2, image: categoryImages.code },
  { id: "icons", label: "Иконки", count: 1, image: categoryImages.icons },
  { id: "3d", label: "3D", count: 1, image: categoryImages["3d"] },
  { id: "marketing", label: "Маркетинг", count: 0, image: categoryImages.marketing }
];
