import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Edit3,
  MessageCircle,
  Plus,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';
import type {
  MenuCategory,
  MenuItem,
  ReservationRequest,
  ReservationStatus,
  RestaurantSettings,
} from '../types/restaurant';
import { RESTAURANT_IMAGES } from '../lib/restaurantMedia';

interface AdminPanelModalProps {
  open: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  items: MenuItem[];
  settings: RestaurantSettings;
  onDataUpdated: () => Promise<void>;
}

type AdminTab = 'reservations' | 'menu' | 'settings';

const AVAILABLE_DISH_IMAGES = [
  { label: 'Calzone de Frango', value: RESTAURANT_IMAGES.calzone },
  { label: 'Posta de Salmão Grelhado', value: RESTAURANT_IMAGES.salmao },
  { label: 'Risotto', value: RESTAURANT_IMAGES.risotto },
  { label: 'Garoupa', value: RESTAURANT_IMAGES.garoupa },
  { label: 'Sala Viva Luanda', value: RESTAURANT_IMAGES.about },
];

export function AdminPanelModal({
  open,
  onClose,
  categories,
  items,
  settings,
  onDataUpdated,
}: AdminPanelModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('reservations');
  const [reservations, setReservations] = useState<ReservationRequest[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'Todas' | ReservationStatus>('Todas');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Category creation / editing state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Menu item creation / editing state
  const [newDishCategory, setNewDishCategory] = useState(categories[0]?.id ?? '');
  const [newDishName, setNewDishName] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('Consulte a nossa equipa');
  const [newDishImage, setNewDishImage] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState<{
    name: string;
    description: string;
    priceDisplay: string;
    categoryId: string;
  }>({ name: '', description: '', priceDisplay: '', categoryId: '' });

  // Settings form state
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl);

  useEffect(() => {
    setInstagramUrl(settings.instagramUrl);
    setFacebookUrl(settings.facebookUrl);
  }, [settings]);

  useEffect(() => {
    if (!newDishCategory && categories.length > 0) {
      setNewDishCategory(categories[0].id);
    }
  }, [categories, newDishCategory]);

  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = (await res.json()) as { reservations: ReservationRequest[] };
        setReservations(data.reservations);
      }
    } finally {
      setLoadingReservations(false);
    }
  };

  useEffect(() => {
    if (open) {
      void fetchReservations();
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const showToast = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 3500);
  };

  const handleReservationStatus = async (id: string, status: ReservationStatus) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchReservations();
      showToast(`Estado do pedido actualizado para ${status}.`);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchReservations();
      showToast('Pedido de reserva removido.');
    }
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() }),
    });
    if (res.ok) {
      setNewCatName('');
      setNewCatDesc('');
      await onDataUpdated();
      showToast('Categoria adicionada com sucesso.');
    }
  };

  const handleSaveCategoryName = async (id: string) => {
    if (!editingCatName.trim()) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingCatName.trim() }),
    });
    if (res.ok) {
      setEditingCatId(null);
      await onDataUpdated();
      showToast('Categoria actualizada.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await onDataUpdated();
      showToast('Categoria removida.');
    }
  };

  const handleCreateDish = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim() || !newDishCategory) return;
    const res = await fetch('/api/menu-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: newDishCategory,
        name: newDishName.trim(),
        description: newDishDesc.trim() || 'Descrição editável pela equipa.',
        priceDisplay: newDishPrice.trim() || 'Consulte a nossa equipa',
        imageUrl: newDishImage || undefined,
        featured: true,
      }),
    });
    if (res.ok) {
      setNewDishName('');
      setNewDishDesc('');
      setNewDishPrice('Consulte a nossa equipa');
      setNewDishImage('');
      await onDataUpdated();
      showToast('Prato adicionado à carta.');
    }
  };

  const handleStartEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditItemForm({
      name: item.name,
      description: item.description,
      priceDisplay: item.priceDisplay,
      categoryId: item.categoryId,
    });
  };

  const handleSaveEditItem = async (id: string) => {
    const res = await fetch(`/api/menu-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editItemForm),
    });
    if (res.ok) {
      setEditingItemId(null);
      await onDataUpdated();
      showToast('Prato actualizado.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await onDataUpdated();
      showToast('Prato removido da carta.');
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instagramUrl, facebookUrl }),
    });
    if (res.ok) {
      await onDataUpdated();
      showToast('Ligações sociais actualizadas.');
    }
  };

  const filteredReservations =
    statusFilter === 'Todas'
      ? reservations
      : reservations.filter((r) => r.status === statusFilter);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#171916]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-panel-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F3EBDD] text-[#171916] w-full max-w-5xl max-h-[90vh] flex flex-col border border-[#C4A46A]/40 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#171916] text-[#F3EBDD] px-6 py-5 flex items-center justify-between border-b border-[#C4A46A]/30">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#C4A46A]">
                  Restaurante Viva Luanda
                </p>
                <h2 id="admin-panel-title" className="font-serif text-2xl sm:text-3xl mt-0.5">
                  Área de Gestão
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar área de gestão"
                className="w-10 h-10 inline-flex items-center justify-center text-[#F3EBDD]/80 hover:text-[#C4A46A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-[#e8decd] px-6 border-b border-[#51483D]/15 flex items-center gap-2 overflow-x-auto">
              {(
                [
                  { id: 'reservations', label: 'Pedidos de Reserva' },
                  { id: 'menu', label: 'Menu & Categorias' },
                  { id: 'settings', label: 'Redes Sociais' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3.5 text-xs font-semibold tracking-[0.08em] uppercase border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'border-[#171916] text-[#171916]'
                      : 'border-transparent text-[#51483D] hover:text-[#171916]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {feedbackBanner && (
              <div className="bg-[#171916] text-[#C4A46A] px-6 py-2.5 text-xs font-medium">
                {feedbackBanner}
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              {activeTab === 'reservations' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(['Todas', 'Pendente', 'Confirmada', 'Cancelada'] as const).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setStatusFilter(status)}
                            className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                              statusFilter === status
                                ? 'bg-[#171916] text-[#F3EBDD]'
                                : 'bg-white/70 text-[#51483D] hover:bg-white'
                            }`}
                          >
                            {status}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => void fetchReservations()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#51483D]/30 text-xs font-medium text-[#171916] hover:bg-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Actualizar
                    </button>
                  </div>

                  {loadingReservations ? (
                    <p className="text-sm text-[#51483D]">A carregar pedidos de reserva...</p>
                  ) : filteredReservations.length === 0 ? (
                    <div className="p-10 bg-white/60 border border-[#51483D]/15 text-center">
                      <p className="font-serif text-xl text-[#171916]">
                        Sem pedidos de reserva nesta vista
                      </p>
                      <p className="mt-1 text-sm text-[#51483D]">
                        Os novos pedidos enviados pelo formulário do website aparecerão aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#51483D]/15 border border-[#51483D]/15 bg-white/80">
                      {filteredReservations.map((resItem) => {
                        const phoneClean = resItem.phone.replace(/\D/g, '');
                        const replyUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(
                          `Olá ${resItem.fullName}, escrevemos do Restaurante Viva Luanda relativamente ao seu pedido de reserva (${resItem.referenceCode}) para ${resItem.date} às ${resItem.time}.`
                        )}`;

                        return (
                          <div
                            key={resItem.id}
                            className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#51483D]">
                                <span className="font-semibold text-[#171916] tabular-nums">
                                  {resItem.referenceCode}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-[#171916]">
                                  Estado: {resItem.status}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {resItem.date} às {resItem.time}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {resItem.guests}{' '}
                                  {resItem.guests === 1 ? 'pessoa' : 'pessoas'}
                                </span>
                              </div>
                              <h3 className="font-serif text-xl text-[#171916] font-medium">
                                {resItem.fullName}
                              </h3>
                              <p className="text-sm text-[#51483D] tabular-nums">
                                {resItem.phone}
                                {resItem.email ? ` · ${resItem.email}` : ''}
                              </p>
                              {resItem.notes && (
                                <p className="text-xs text-[#51483D] italic">
                                  Obs.: {resItem.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {resItem.status !== 'Confirmada' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleReservationStatus(resItem.id, 'Confirmada')
                                  }
                                  className="px-3 py-2 bg-[#171916] text-[#F3EBDD] text-xs font-medium hover:bg-[#51483D] transition-colors"
                                >
                                  Confirmar
                                </button>
                              )}
                              {resItem.status !== 'Cancelada' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleReservationStatus(resItem.id, 'Cancelada')
                                  }
                                  className="px-3 py-2 border border-[#51483D]/30 text-[#171916] text-xs font-medium hover:bg-[#F3EBDD] transition-colors"
                                >
                                  Cancelar
                                </button>
                              )}
                              <a
                                href={replyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C4A46A] text-[#171916] text-xs font-semibold hover:bg-[#d3b680] transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                              <button
                                type="button"
                                onClick={() => void handleDeleteReservation(resItem.id)}
                                aria-label={`Eliminar pedido ${resItem.referenceCode}`}
                                className="p-2 text-[#51483D] hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'menu' && (
                <div className="space-y-10">
                  {/* Categories Management */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-2xl text-[#171916]">
                      Categorias da Carta
                    </h3>

                    <form
                      onSubmit={handleCreateCategory}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white/70 p-4 border border-[#51483D]/15"
                    >
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Nova categoria (ex.: Sugestões do Dia)"
                        required
                        className="sm:col-span-4 bg-white border border-[#51483D]/25 px-3 py-2.5 text-sm focus:outline-none focus:border-[#171916]"
                      />
                      <input
                        type="text"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder="Nota opcional"
                        className="sm:col-span-5 bg-white border border-[#51483D]/25 px-3 py-2.5 text-sm focus:outline-none focus:border-[#171916]"
                      />
                      <button
                        type="submit"
                        className="sm:col-span-3 inline-flex items-center justify-center gap-1.5 bg-[#171916] text-[#F3EBDD] px-4 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase hover:bg-[#51483D] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </form>

                    <div className="divide-y divide-[#51483D]/15 border border-[#51483D]/15 bg-white/80">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="px-4 py-3 flex items-center justify-between gap-4"
                        >
                          {editingCatId === cat.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingCatName}
                                onChange={(e) => setEditingCatName(e.target.value)}
                                className="flex-1 bg-white border border-[#171916] px-3 py-1.5 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => void handleSaveCategoryName(cat.id)}
                                className="px-3 py-1.5 bg-[#171916] text-white text-xs"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCatId(null)}
                                className="px-2 py-1.5 text-xs text-[#51483D]"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-medium text-sm text-[#171916]">
                                  {cat.name}
                                </p>
                                {cat.description && (
                                  <p className="text-xs text-[#51483D]">{cat.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCatId(cat.id);
                                    setEditingCatName(cat.name);
                                  }}
                                  aria-label={`Editar categoria ${cat.name}`}
                                  className="p-2 text-[#51483D] hover:text-[#171916]"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteCategory(cat.id)}
                                  aria-label={`Eliminar categoria ${cat.name}`}
                                  className="p-2 text-[#51483D] hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dishes Management */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-2xl text-[#171916]">
                      Pratos & Sugestões
                    </h3>

                    <form
                      onSubmit={handleCreateDish}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/70 p-4 border border-[#51483D]/15"
                    >
                      <select
                        value={newDishCategory}
                        onChange={(e) => setNewDishCategory(e.target.value)}
                        className="bg-white border border-[#51483D]/25 px-3 py-2.5 text-sm"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={newDishName}
                        onChange={(e) => setNewDishName(e.target.value)}
                        placeholder="Nome do prato *"
                        className="bg-white border border-[#51483D]/25 px-3 py-2.5 text-sm"
                      />
                      <input
                        type="text"
                        value={newDishPrice}
                        onChange={(e) => setNewDishPrice(e.target.value)}
                        placeholder="Preço ou 'Consulte a nossa equipa'"
                        className="bg-white border border-[#51483D]/25 px-3 py-2.5 text-sm"
                      />
                      <select
                        value={newDishImage}
                        onChange={(e) => setNewDishImage(e.target.value)}
                        className="bg-white border border-[#51483D]/25 px-3 py-2.5 text-sm"
                      >
                        <option value="">Sem fotografia associada</option>
                        {AVAILABLE_DISH_IMAGES.map((img) => (
                          <option key={img.value} value={img.value}>
                            Foto: {img.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newDishDesc}
                        onChange={(e) => setNewDishDesc(e.target.value)}
                        placeholder="Descrição editável do prato"
                        className="sm:col-span-2 bg-white border border-[#51483D]/25 px-3 py-2.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-[#C4A46A] text-[#171916] px-4 py-3 text-xs font-semibold tracking-[0.08em] uppercase hover:bg-[#d3b680] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Prato ao Menu
                      </button>
                    </form>

                    <div className="divide-y divide-[#51483D]/15 border border-[#51483D]/15 bg-white/80">
                      {items.map((item) => {
                        const catName =
                          categories.find((c) => c.id === item.categoryId)?.name ??
                          'Sem categoria';
                        return (
                          <div key={item.id} className="p-4 space-y-3">
                            {editingItemId === item.id ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={editItemForm.name}
                                  onChange={(e) =>
                                    setEditItemForm((p) => ({
                                      ...p,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="bg-white border border-[#171916] px-3 py-2 text-sm"
                                />
                                <input
                                  type="text"
                                  value={editItemForm.priceDisplay}
                                  onChange={(e) =>
                                    setEditItemForm((p) => ({
                                      ...p,
                                      priceDisplay: e.target.value,
                                    }))
                                  }
                                  className="bg-white border border-[#171916] px-3 py-2 text-sm"
                                />
                                <input
                                  type="text"
                                  value={editItemForm.description}
                                  onChange={(e) =>
                                    setEditItemForm((p) => ({
                                      ...p,
                                      description: e.target.value,
                                    }))
                                  }
                                  className="sm:col-span-2 bg-white border border-[#171916] px-3 py-2 text-sm"
                                />
                                <div className="sm:col-span-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void handleSaveEditItem(item.id)}
                                    className="px-4 py-2 bg-[#171916] text-white text-xs font-semibold uppercase"
                                  >
                                    Guardar Alterações
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingItemId(null)}
                                    className="px-4 py-2 text-xs text-[#51483D]"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-xs text-[#51483D]">
                                    {catName} · {item.priceDisplay}
                                  </p>
                                  <h4 className="font-serif text-xl text-[#171916]">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-[#51483D] mt-1">
                                    {item.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditItem(item)}
                                    aria-label={`Editar ${item.name}`}
                                    className="p-2 text-[#51483D] hover:text-[#171916]"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteItem(item.id)}
                                    aria-label={`Remover ${item.name}`}
                                    className="p-2 text-[#51483D] hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <form
                  onSubmit={handleSaveSettings}
                  className="max-w-xl space-y-5 bg-white/80 p-6 border border-[#51483D]/15"
                >
                  <h3 className="font-serif text-2xl text-[#171916]">
                    Ligações das Redes Sociais
                  </h3>
                  <p className="text-sm text-[#51483D]">
                    Actualize os endereços oficiais do Instagram e do Facebook apresentados
                    no rodapé do website.
                  </p>

                  <div>
                    <label
                      htmlFor="set-instagram"
                      className="block text-xs uppercase tracking-wider text-[#51483D] font-semibold mb-1.5"
                    >
                      URL do Instagram
                    </label>
                    <input
                      id="set-instagram"
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="w-full bg-white border border-[#51483D]/25 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="set-facebook"
                      className="block text-xs uppercase tracking-wider text-[#51483D] font-semibold mb-1.5"
                    >
                      URL do Facebook
                    </label>
                    <input
                      id="set-facebook"
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      className="w-full bg-white border border-[#51483D]/25 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#171916] text-[#F3EBDD] text-xs font-semibold tracking-[0.1em] uppercase hover:bg-[#51483D] transition-colors"
                  >
                    Guardar Ligações
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
