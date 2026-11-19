export const RESTAURANT_IMAGES = {
  hero: '/src/assets/images/hero_viva_luanda_1795092359961.jpg',
  about: '/src/assets/images/about_interior_lounge_1795092359745.jpg',
  calzone: '/src/assets/images/dish_calzone_frango_1795092360006.jpg',
  salmao: '/src/assets/images/dish_salmao_grelhado_1795092359233.jpg',
  risotto: '/src/assets/images/dish_risotto_gourmet_1795092358747.jpg',
  garoupa: '/src/assets/images/dish_garoupa_gourmet_1795092359083.jpg',
  romantic: '/src/assets/images/experience_romantic_table_1795092359955.jpg',
  business: '/src/assets/images/experience_business_lunch_1795092360114.jpg',
} as const;

export const RESTAURANT_INFO = {
  name: 'Restaurante Viva Luanda',
  shortName: 'Viva Luanda',
  address: 'Rua de São Tomé, n.º 2, Miramar, Luanda, Angola',
  phoneDisplay: '+244 946 302 896',
  phoneHref: 'tel:+244946302896',
  whatsappNumber: '244946302896',
  plusCode: '56QV+2C, Luanda, Angola',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=56QV%2B2C+Luanda+Angola',
  googleDirectionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=56QV%2B2C%2C+Luanda%2C+Angola',
  priceRange: 'Kz 20.000+ por pessoa',
  ratingValue: '4.2',
  ratingMax: '5',
  reviewCount: 378,
  closingNote:
    'Encerramento indicado às 23:00. Confirme os horários diários de funcionamento directamente com a nossa equipa.',
} as const;

export function buildWhatsAppReservationUrl(params: {
  fullName: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  referenceCode?: string;
}): string {
  const lines = [
    'Olá, Restaurante Viva Luanda. Gostaria de solicitar uma reserva:',
    '',
    params.referenceCode ? `Referência: ${params.referenceCode}` : null,
    `Nome completo: ${params.fullName}`,
    `Telefone: ${params.phone}`,
    params.email ? `Email: ${params.email}` : null,
    `Data da reserva: ${params.date}`,
    `Hora pretendida: ${params.time}`,
    `Número de pessoas: ${params.guests}`,
    params.notes ? `Observações especiais: ${params.notes}` : null,
    '',
    'Aguardo a confirmação de disponibilidade pela vossa equipa. Obrigado.',
  ].filter((line): line is string => line !== null);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encoded}`;
}

export function buildWhatsAppDirectUrl(customMessage?: string): string {
  const message =
    customMessage ??
    'Olá, Restaurante Viva Luanda. Gostaria de obter informações sobre disponibilidade e reservas.';
  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
