import type { MenuCategory, MenuItem } from '../types/restaurant';
import { RESTAURANT_IMAGES } from './restaurantMedia';

export const DEFAULT_MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'cat-entradas',
    name: 'Entradas',
    slug: 'entradas',
    order: 1,
    description: 'Selecção de entradas para iniciar a experiência à mesa.',
  },
  {
    id: 'cat-pratos-principais',
    name: 'Pratos Principais',
    slug: 'pratos-principais',
    order: 2,
    description: 'Pratos principais preparados com rigor e atenção ao detalhe.',
  },
  {
    id: 'cat-peixes-mariscos',
    name: 'Peixes e Mariscos',
    slug: 'peixes-e-mariscos',
    order: 3,
    description: 'Propostas frescas da costa atlântica e especialidades de peixe.',
  },
  {
    id: 'cat-massas-risottos',
    name: 'Massas e Risottos',
    slug: 'massas-e-risottos',
    order: 4,
    description: 'Massas artesanais e risottos cremosos preparados no momento.',
  },
  {
    id: 'cat-sobremesas',
    name: 'Sobremesas',
    slug: 'sobremesas',
    order: 5,
    description: 'Finalizações doces para concluir a refeição com elegância.',
  },
  {
    id: 'cat-bebidas',
    name: 'Bebidas',
    slug: 'bebidas',
    order: 6,
    description: 'Vinhos seleccionados, bebidas frescas e opções de cafetaria.',
  },
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-calzone-frango',
    categoryId: 'cat-pratos-principais',
    name: 'Calzone de Frango',
    description:
      'Massa artesanal dourada no forno com recheio delicado de frango. Descrição editável pela equipa do restaurante.',
    priceDisplay: 'Consulte a nossa equipa',
    imageUrl: RESTAURANT_IMAGES.calzone,
    featured: true,
    order: 1,
  },
  {
    id: 'item-salmao-grelhado',
    categoryId: 'cat-peixes-mariscos',
    name: 'Posta de Salmão Grelhado',
    description:
      'Posta de salmão grelhada com apresentação cuidada e ponto de cozedura preciso. Descrição editável pela equipa.',
    priceDisplay: 'Consulte a nossa equipa',
    imageUrl: RESTAURANT_IMAGES.salmao,
    featured: true,
    order: 2,
  },
  {
    id: 'item-risotto',
    categoryId: 'cat-massas-risottos',
    name: 'Risotto',
    description:
      'Risotto cremoso de textura aveludada e empratamento contemporâneo. Descrição editável pela equipa do restaurante.',
    priceDisplay: 'Consulte a nossa equipa',
    imageUrl: RESTAURANT_IMAGES.risotto,
    featured: true,
    order: 3,
  },
  {
    id: 'item-garoupa',
    categoryId: 'cat-peixes-mariscos',
    name: 'Garoupa',
    description:
      'Garoupa fresca confeccionada com elegância e atenção aos sabores naturais. Descrição editável pela equipa.',
    priceDisplay: 'Consulte a nossa equipa',
    imageUrl: RESTAURANT_IMAGES.garoupa,
    featured: true,
    order: 4,
  },
];
