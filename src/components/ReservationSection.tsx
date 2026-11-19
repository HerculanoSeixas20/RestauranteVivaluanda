import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageCircle,
  Users,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { ReservationRequest } from '../types/restaurant';
import { buildWhatsAppReservationUrl } from '../lib/restaurantMedia';
import { LuxuryButton } from './LuxuryButton';

interface ReservationSectionProps {
  onReservationCreated?: (reservation: ReservationRequest) => void;
  preselectedDishNote?: string | null;
}

const TIME_SLOTS = [
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
];

const QUICK_TIMES = ['13:00', '19:30', '20:30', '21:30'];
const QUICK_GUESTS = ['2', '4', '6', '8'];

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ReservationSection({
  onReservationCreated,
  preselectedDishNote,
}: ReservationSectionProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState('2');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedReservation, setSubmittedReservation] =
    useState<ReservationRequest | null>(null);

  useEffect(() => {
    if (preselectedDishNote) {
      setSubmittedReservation(null);
      setNotes((prev) => {
        const prefix = `Sugestão de interesse: ${preselectedDishNote}`;
        if (prev.includes(preselectedDishNote)) return prev;
        return prev ? `${prev}\n${prefix}` : prefix;
      });
    }
  }, [preselectedDishNote]);

  const validateForm = (): string | null => {
    if (fullName.trim().length < 2) {
      return 'Por favor, indique o seu nome completo.';
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      return 'Por favor, indique um número de telefone válido (ex.: +244 946 302 896).';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'O endereço de email indicado não parece válido.';
    }
    if (!date) {
      return 'Por favor, seleccione a data da reserva.';
    }
    if (date < getTodayDateString()) {
      return 'Seleccione uma data igual ou posterior a hoje.';
    }
    if (!time) {
      return 'Por favor, seleccione a hora pretendida.';
    }
    const guestCount = Number(guests);
    if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 40) {
      return 'Indique um número válido de pessoas (entre 1 e 40).';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          date,
          time,
          guests: Number(guests),
          notes: notes.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as ReservationRequest & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Não foi possível registar o pedido de reserva.');
      }

      setSubmittedReservation(payload);
      onReservationCreated?.(payload);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao enviar o pedido. Tente novamente ou contacte-nos pelo WhatsApp.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedReservation(null);
    setErrorMessage(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  const whatsappPreviewUrl = submittedReservation
    ? buildWhatsAppReservationUrl({
        fullName: submittedReservation.fullName,
        phone: submittedReservation.phone,
        email: submittedReservation.email,
        date: submittedReservation.date,
        time: submittedReservation.time,
        guests: submittedReservation.guests,
        notes: submittedReservation.notes,
        referenceCode: submittedReservation.referenceCode,
      })
    : buildWhatsAppReservationUrl({
        fullName: fullName.trim() || 'Cliente',
        phone: phone.trim() || 'A indicar',
        email: email.trim() || undefined,
        date,
        time,
        guests: Number(guests) || 2,
        notes: notes.trim() || undefined,
      });

  return (
    <section
      id="reservas"
      className="bg-[#171916] text-[#F3EBDD] py-20 sm:py-28 border-t border-[#C4A46A]/20"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Editorial Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="text-xs tracking-[0.22em] uppercase text-[#C4A46A] font-medium mb-4">
              Pedidos de Reserva
            </p>
            <h2
              className="font-serif text-white font-normal leading-[1.1] text-balance"
              style={{ fontSize: 'clamp(2.1rem, 3.6vw, 3.25rem)' }}
            >
              A sua próxima experiência começa aqui.
            </h2>

            <p className="mt-6 text-base text-[#F3EBDD]/80 leading-relaxed">
              Preencha os seus dados para enviar um pedido de reserva directamente à
              nossa equipa e concluir o envio pelo WhatsApp, caso deseje atendimento
              imediato.
            </p>

            <div className="mt-8 p-6 border border-[#C4A46A]/35 bg-white/[0.03]">
              <p className="text-xs tracking-[0.16em] uppercase text-[#C4A46A] font-semibold">
                Informação Importante
              </p>
              <p className="mt-2 text-sm text-[#F3EBDD]/85 leading-relaxed">
                O envio deste formulário constitui um{' '}
                <strong className="text-white font-medium">pedido de reserva</strong> e
                não garante confirmação automática. A disponibilidade da mesa será
                sempre confirmada pela equipa do Restaurante Viva Luanda.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 space-y-3 text-sm text-[#F3EBDD]/75">
              <p>
                <span className="text-[#C4A46A] font-medium">Atendimento directo:</span>{' '}
                <a
                  href="tel:+244946302896"
                  className="text-white hover:text-[#C4A46A] transition-colors tabular-nums"
                >
                  +244 946 302 896
                </a>
              </p>
              <p>
                <span className="text-[#C4A46A] font-medium">Horário indicado:</span>{' '}
                Encerramento às 23:00 (confirme os horários diários com a equipa).
              </p>
            </div>
          </motion.div>

          {/* Form or Confirmation Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 bg-[#1e211c] border border-[#C4A46A]/30 p-6 sm:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.35)]"
          >
            {submittedReservation ? (
              <div className="space-y-6" role="status" aria-live="polite">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-7 h-7 text-[#C4A46A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs tracking-[0.18em] uppercase text-[#C4A46A] font-semibold">
                      Pedido Registado · {submittedReservation.referenceCode}
                    </p>
                    <h3 className="mt-1 font-serif text-3xl text-white font-normal">
                      Pedido de reserva enviado com sucesso.
                    </h3>
                    <p className="mt-2 text-sm text-[#F3EBDD]/80 leading-relaxed">
                      O seu pedido ficou registado como{' '}
                      <strong className="text-white">Aguarda Confirmação</strong>. A
                      nossa equipa irá verificar a disponibilidade e entrar em contacto.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-y border-white/10 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#F3EBDD]/55">
                      Nome completo
                    </span>
                    <p className="mt-1 text-white font-medium">
                      {submittedReservation.fullName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#F3EBDD]/55">
                      Telefone
                    </span>
                    <p className="mt-1 text-white font-medium tabular-nums">
                      {submittedReservation.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#F3EBDD]/55">
                      Data e Hora Pretendidas
                    </span>
                    <p className="mt-1 text-white font-medium tabular-nums">
                      {submittedReservation.date} · {submittedReservation.time}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#F3EBDD]/55">
                      Número de pessoas
                    </span>
                    <p className="mt-1 text-white font-medium tabular-nums">
                      {submittedReservation.guests}{' '}
                      {submittedReservation.guests === 1 ? 'pessoa' : 'pessoas'}
                    </p>
                  </div>
                  {submittedReservation.notes && (
                    <div className="sm:col-span-2">
                      <span className="text-xs uppercase tracking-wider text-[#F3EBDD]/55">
                        Observações especiais
                      </span>
                      <p className="mt-1 text-[#F3EBDD]/90">
                        {submittedReservation.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <LuxuryButton
                    variant="gold"
                    size="md"
                    href={whatsappPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar Pedido pelo WhatsApp
                  </LuxuryButton>

                  <LuxuryButton variant="glass" size="md" onClick={handleReset}>
                    Novo Pedido
                  </LuxuryButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 p-4 bg-red-950/50 border border-red-400/40 text-red-100 text-sm"
                  >
                    <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="res-fullname"
                      className="block text-xs tracking-[0.12em] uppercase text-[#F3EBDD]/80 mb-2"
                    >
                      Nome completo *
                    </label>
                    <input
                      id="res-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex.: Ana Paula Mendes"
                      className="w-full bg-[#171916] border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C4A46A] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="res-phone"
                      className="block text-xs tracking-[0.12em] uppercase text-[#F3EBDD]/80 mb-2"
                    >
                      Número de telefone *
                    </label>
                    <input
                      id="res-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+244 9XX XXX XXX"
                      className="w-full bg-[#171916] border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C4A46A] transition-colors tabular-nums"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="res-email"
                      className="block text-xs tracking-[0.12em] uppercase text-[#F3EBDD]/80 mb-2"
                    >
                      Email (opcional)
                    </label>
                    <input
                      id="res-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@exemplo.com"
                      className="w-full bg-[#171916] border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C4A46A] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="res-date"
                      className="block text-xs tracking-[0.12em] uppercase text-[#F3EBDD]/80 mb-2"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C4A46A]" />
                        Data da reserva *
                      </span>
                    </label>
                    <input
                      id="res-date"
                      type="date"
                      required
                      min={getTodayDateString()}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#171916] border border-white/15 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#C4A46A] transition-colors tabular-nums"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="res-time"
                      className="block text-xs tracking-[0.12em] uppercase text-[#F3EBDD]/80 mb-2"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C4A46A]" />
                        Hora pretendida *
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        id="res-time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-[#171916] border border-white/15 px-3 py-3.5 text-sm text-white focus:outline-none focus:border-[#C4A46A] transition-colors tabular-nums"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {QUICK_TIMES.map((qt) => (
                        <button
                          key={qt}
                          type="button"
                          onClick={() => setTime(qt)}
                          className={`px-2.5 py-1 text-[11px] tabular-nums border transition-colors ${
                            time === qt
                              ? 'bg-[#C4A46A] text-[#171916] border-[#C4A46A] font-semibold'
                              : 'bg-[#171916] text-[#F3EBDD]/75 border-white/15 hover:border-[#C4A46A]/60'
                          }`}
                        >
                          {qt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="res-guests"
                      className="block text-xs tracking-[0.12em] uppercase text-[#F3EBDD]/80 mb-2"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#C4A46A]" />
                        Número de pessoas *
                      </span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {QUICK_GUESTS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setGuests(q)}
                          className={`px-4 py-3 text-xs tabular-nums border transition-colors ${
                            guests === q
                              ? 'bg-[#C4A46A] text-[#171916] border-[#C4A46A] font-semibold'
                              : 'bg-[#171916] text-[#F3EBDD]/80 border-white/15 hover:border-[#C4A46A]/60'
                          }`}
                        >
                          {q} pessoas
                        </button>
                      ))}
                      <input
                        id="res-guests"
                        type="number"
                        min={1}
                        max={40}
                        required
                        aria-label="Outro número de pessoas"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-24 bg-[#171916] border border-white/15 px-3 py-3 text-sm text-white focus:outline-none focus:border-[#C4A46A] transition-colors tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="res-notes"
                      className="block text-xs tracking-[0.12em] uppercase text-[#F3EBDD]/80 mb-2"
                    >
                      Observações especiais
                    </label>
                    <textarea
                      id="res-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Indique preferência de mesa, celebração especial ou necessidades alimentares."
                      className="w-full bg-[#171916] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#C4A46A] transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <LuxuryButton variant="gold" size="lg" type="submit" disabled={submitting}>
                    <Sparkles className="w-4 h-4" />
                    {submitting ? 'A registar pedido...' : 'Solicitar Reserva'}
                  </LuxuryButton>

                  <LuxuryButton
                    variant="glass"
                    size="md"
                    href={whatsappPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C4A46A]" />
                    Enviar pelo WhatsApp
                  </LuxuryButton>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
