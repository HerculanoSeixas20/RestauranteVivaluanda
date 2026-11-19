import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  MenuCategory,
  MenuItem,
  ReservationRequest,
  ReservationStatus,
  RestaurantSettings,
} from '../src/types/restaurant.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel
  ? '/tmp/viva-luanda-data'
  : path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'viva-luanda.json');

interface DatabaseState {
  categories: MenuCategory[];
  items: MenuItem[];
  reservations: ReservationRequest[];
  settings: RestaurantSettings;
}

const DEFAULT_DB: DatabaseState = {
  categories: [
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
  ],
  items: [
    {
      id: 'item-calzone-frango',
      categoryId: 'cat-pratos-principais',
      name: 'Calzone de Frango',
      description:
        'Massa artesanal dourada no forno com recheio delicado de frango. Descrição editável pela equipa do restaurante.',
      priceDisplay: 'Consulte a nossa equipa',
      imageUrl: '/src/assets/images/dish_calzone_frango_1795092360006.jpg',
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
      imageUrl: '/src/assets/images/dish_salmao_grelhado_1795092359233.jpg',
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
      imageUrl: '/src/assets/images/dish_risotto_gourmet_1795092358747.jpg',
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
      imageUrl: '/src/assets/images/dish_garoupa_gourmet_1795092359083.jpg',
      featured: true,
      order: 4,
    },
  ],
  reservations: [],
  settings: {
    instagramUrl: 'https://www.instagram.com/',
    facebookUrl: 'https://www.facebook.com/',
    whatsappNumber: '244946302896',
    phoneDisplay: '+244 946 302 896',
  },
};

function ensureDb(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return structuredClone(DEFAULT_DB);
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DatabaseState>;
    return {
      categories: Array.isArray(parsed.categories)
        ? parsed.categories
        : structuredClone(DEFAULT_DB.categories),
      items: Array.isArray(parsed.items)
        ? parsed.items
        : structuredClone(DEFAULT_DB.items),
      reservations: Array.isArray(parsed.reservations) ? parsed.reservations : [],
      settings: parsed.settings ?? structuredClone(DEFAULT_DB.settings),
    };
  } catch {
    return structuredClone(DEFAULT_DB);
  }
}

function saveDb(state: DatabaseState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function createApiApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'Restaurante Viva Luanda' });
  });

  app.get('/api/public-config', (_req, res) => {
    const mapsApiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    res.json({ mapsApiKey });
  });

  app.get('/api/menu', (_req, res) => {
    const db = ensureDb();
    const categories = [...db.categories].sort((a, b) => a.order - b.order);
    const items = [...db.items].sort((a, b) => a.order - b.order);
    res.json({
      categories,
      items,
      settings: db.settings,
    });
  });

  app.post('/api/categories', (req, res) => {
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
      return;
    }
    const db = ensureDb();
    const maxOrder = db.categories.reduce((max, c) => Math.max(max, c.order), 0);
    const category: MenuCategory = {
      id: createId('cat'),
      name: name.trim(),
      slug: slugify(name.trim()),
      order: maxOrder + 1,
      description: description?.trim() || '',
    };
    db.categories.push(category);
    saveDb(db);
    res.status(201).json(category);
  });

  app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, order } = req.body as Partial<MenuCategory>;
    const db = ensureDb();
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Categoria não encontrada.' });
      return;
    }
    const current = db.categories[index];
    const nextName = typeof name === 'string' && name.trim() ? name.trim() : current.name;
    db.categories[index] = {
      ...current,
      name: nextName,
      slug: slugify(nextName),
      description: typeof description === 'string' ? description.trim() : current.description,
      order: typeof order === 'number' ? order : current.order,
    };
    saveDb(db);
    res.json(db.categories[index]);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const db = ensureDb();
    const exists = db.categories.some((c) => c.id === id);
    if (!exists) {
      res.status(404).json({ error: 'Categoria não encontrada.' });
      return;
    }
    db.categories = db.categories.filter((c) => c.id !== id);
    db.items = db.items.filter((item) => item.categoryId !== id);
    saveDb(db);
    res.json({ deleted: true });
  });

  app.post('/api/menu-items', (req, res) => {
    const { categoryId, name, description, priceDisplay, imageUrl, featured } =
      req.body as Partial<MenuItem>;
    if (!categoryId || !name || !name.trim()) {
      res.status(400).json({ error: 'Categoria e nome do prato são obrigatórios.' });
      return;
    }
    const db = ensureDb();
    if (!db.categories.some((c) => c.id === categoryId)) {
      res.status(400).json({ error: 'Categoria seleccionada inválida.' });
      return;
    }
    const maxOrder = db.items.reduce((max, item) => Math.max(max, item.order), 0);
    const item: MenuItem = {
      id: createId('item'),
      categoryId,
      name: name.trim(),
      description: description?.trim() || 'Descrição editável pela equipa do restaurante.',
      priceDisplay: priceDisplay?.trim() || 'Consulte a nossa equipa',
      imageUrl: imageUrl?.trim() || undefined,
      featured: Boolean(featured),
      order: maxOrder + 1,
    };
    db.items.push(item);
    saveDb(db);
    res.status(201).json(item);
  });

  app.put('/api/menu-items/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<MenuItem>;
    const db = ensureDb();
    const index = db.items.findIndex((i) => i.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Prato não encontrado.' });
      return;
    }
    const current = db.items[index];
    db.items[index] = {
      ...current,
      categoryId: body.categoryId ?? current.categoryId,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : current.name,
      description: typeof body.description === 'string' ? body.description.trim() : current.description,
      priceDisplay:
        typeof body.priceDisplay === 'string' && body.priceDisplay.trim()
          ? body.priceDisplay.trim()
          : 'Consulte a nossa equipa',
      imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() || undefined : current.imageUrl,
      featured: typeof body.featured === 'boolean' ? body.featured : current.featured,
      order: typeof body.order === 'number' ? body.order : current.order,
    };
    saveDb(db);
    res.json(db.items[index]);
  });

  app.delete('/api/menu-items/:id', (req, res) => {
    const { id } = req.params;
    const db = ensureDb();
    const before = db.items.length;
    db.items = db.items.filter((i) => i.id !== id);
    if (db.items.length === before) {
      res.status(404).json({ error: 'Prato não encontrado.' });
      return;
    }
    saveDb(db);
    res.json({ deleted: true });
  });

  app.put('/api/settings', (req, res) => {
    const body = req.body as Partial<RestaurantSettings>;
    const db = ensureDb();
    db.settings = {
      ...db.settings,
      instagramUrl:
        typeof body.instagramUrl === 'string' && body.instagramUrl.trim()
          ? body.instagramUrl.trim()
          : db.settings.instagramUrl,
      facebookUrl:
        typeof body.facebookUrl === 'string' && body.facebookUrl.trim()
          ? body.facebookUrl.trim()
          : db.settings.facebookUrl,
    };
    saveDb(db);
    res.json(db.settings);
  });

  app.get('/api/reservations', (_req, res) => {
    const db = ensureDb();
    const sorted = [...db.reservations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ reservations: sorted });
  });

  app.post('/api/reservations', (req, res) => {
    const { fullName, phone, email, date, time, guests, notes } = req.body as {
      fullName?: string;
      phone?: string;
      email?: string;
      date?: string;
      time?: string;
      guests?: number;
      notes?: string;
    };

    if (!fullName || fullName.trim().length < 2) {
      res.status(400).json({ error: 'Por favor, indique o seu nome completo.' });
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      res.status(400).json({ error: 'Por favor, indique um número de telefone válido.' });
      return;
    }
    if (!date || !time) {
      res.status(400).json({ error: 'Seleccione a data e a hora pretendidas.' });
      return;
    }
    const parsedGuests = Number(guests);
    if (!Number.isFinite(parsedGuests) || parsedGuests < 1 || parsedGuests > 40) {
      res.status(400).json({ error: 'Indique um número válido de pessoas (1 a 40).' });
      return;
    }

    const db = ensureDb();
    const referenceCode = `VL-${Math.floor(100000 + Math.random() * 900000)}`;
    const reservation: ReservationRequest = {
      id: createId('res'),
      referenceCode,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      date,
      time,
      guests: parsedGuests,
      notes: notes?.trim() || undefined,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
    };

    db.reservations.unshift(reservation);
    saveDb(db);
    res.status(201).json(reservation);
  });

  app.patch('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status?: ReservationStatus };
    if (!status || !['Pendente', 'Confirmada', 'Cancelada'].includes(status)) {
      res.status(400).json({ error: 'Estado de reserva inválido.' });
      return;
    }
    const db = ensureDb();
    const index = db.reservations.findIndex((r) => r.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Pedido de reserva não encontrado.' });
      return;
    }
    db.reservations[index] = { ...db.reservations[index], status };
    saveDb(db);
    res.json(db.reservations[index]);
  });

  app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const db = ensureDb();
    const before = db.reservations.length;
    db.reservations = db.reservations.filter((r) => r.id !== id);
    if (db.reservations.length === before) {
      res.status(404).json({ error: 'Pedido de reserva não encontrado.' });
      return;
    }
    saveDb(db);
    res.json({ deleted: true });
  });

  return app;
}
