import { useCallback, useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Clock, MapPin, MessageCircle, Navigation, Phone, Utensils } from 'lucide-react';
import { RESTAURANT_INFO, buildWhatsAppDirectUrl } from '../lib/restaurantMedia';
import { LuxuryButton } from './LuxuryButton';

interface LocationSectionProps {
  mapsApiKey: string;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

// Viewport center for Luanda while Google Maps Places API resolves exact Plus Code coordinates
const LUANDA_VIEWPORT_CENTER: LatLngLiteral = {
  lat: -8.8147,
  lng: 13.2302,
};

function VivaLuandaMarkerLayer() {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [placePosition, setPlacePosition] = useState<LatLngLiteral | null>(
    null
  );
  const [placeLabel, setPlaceLabel] = useState<string>(RESTAURANT_INFO.name);
  const [placeSublabel, setPlaceSublabel] = useState<string>(RESTAURANT_INFO.address);
  const [infoOpen, setInfoOpen] = useState(true);

  useEffect(() => {
    if (!placesLib || !map) return;

    let cancelled = false;

    async function resolveLocation() {
      try {
        const response = await placesLib!.Place.searchByText({
          textQuery: `Restaurante Viva Luanda, ${RESTAURANT_INFO.plusCode}`,
          fields: ['id', 'displayName', 'formattedAddress', 'location'],
          maxResultCount: 1,
        });

        const firstPlace = response?.places?.[0];
        if (!cancelled && firstPlace?.location) {
          const loc = {
            lat: firstPlace.location.lat(),
            lng: firstPlace.location.lng(),
          };
          setPlacePosition(loc);
          if (firstPlace.displayName) setPlaceLabel(firstPlace.displayName);
          if (firstPlace.formattedAddress) setPlaceSublabel(firstPlace.formattedAddress);
          map!.panTo(loc);
          map!.setZoom(16);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('429') ||
          msg.includes('Quota')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    }

    void resolveLocation();
    return () => {
      cancelled = true;
    };
  }, [placesLib, map]);

  const handleMarkerClick = useCallback(() => {
    setInfoOpen((prev) => !prev);
  }, []);

  if (!placePosition) {
    return null;
  }

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={placePosition}
        onClick={handleMarkerClick}
        title={placeLabel}
      >
        <Pin background="#C4A46A" borderColor="#171916" glyphColor="#171916" scale={1.15} />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-[#171916]">
            <p className="font-serif text-base font-semibold">{placeLabel}</p>
            <p className="mt-0.5 text-xs text-[#51483D]">{placeSublabel}</p>
            <a
              href={RESTAURANT_INFO.googleDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-[#171916] underline"
            >
              Obter Direcções
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function LocationSection({ mapsApiKey }: LocationSectionProps) {
  const [mapLoadError, setMapLoadError] = useState(false);

  return (
    <section
      id="contactos"
      className="bg-white text-[#171916] py-20 sm:py-28 border-t border-[#51483D]/15"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-stretch">
          {/* Verified Location & Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-[#51483D] font-semibold mb-3">
                Localização & Contactos
              </p>
              <h2
                className="font-serif text-[#171916] font-normal leading-[1.12] text-balance"
                style={{ fontSize: 'clamp(2rem, 3.4vw, 3rem)' }}
              >
                Estamos à sua espera.
              </h2>

              <div className="mt-8 divide-y divide-[#51483D]/15 border-t border-b border-[#51483D]/15">
                <div className="py-4 flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#C4A46A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#51483D] font-semibold">
                      Morada
                    </p>
                    <p className="mt-1 text-sm sm:text-base text-[#171916]">
                      {RESTAURANT_INFO.address}
                    </p>
                    <p className="mt-0.5 text-xs text-[#51483D] tabular-nums">
                      Google Maps: {RESTAURANT_INFO.plusCode}
                    </p>
                  </div>
                </div>

                <div className="py-4 flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#C4A46A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#51483D] font-semibold">
                      Telefone & WhatsApp
                    </p>
                    <a
                      href={RESTAURANT_INFO.phoneHref}
                      className="mt-1 inline-block text-sm sm:text-base text-[#171916] hover:text-[#51483D] transition-colors tabular-nums font-medium"
                    >
                      {RESTAURANT_INFO.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="py-4 flex items-start gap-4">
                  <Clock className="w-5 h-5 text-[#C4A46A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#51483D] font-semibold">
                      Horário de Funcionamento
                    </p>
                    <p className="mt-1 text-sm text-[#51483D] leading-relaxed">
                      {RESTAURANT_INFO.closingNote}
                    </p>
                  </div>
                </div>

                <div className="py-4 flex items-start gap-4">
                  <Utensils className="w-5 h-5 text-[#C4A46A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#51483D] font-semibold">
                      Serviços & Referência de Preço
                    </p>
                    <p className="mt-1 text-sm text-[#171916]">
                      Dine-in · Takeaway · Delivery
                    </p>
                    <p className="mt-0.5 text-xs text-[#51483D] tabular-nums">
                      Faixa de preço: {RESTAURANT_INFO.priceRange}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Futuristic Direct Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <LuxuryButton
                variant="obsidian"
                size="md"
                href={RESTAURANT_INFO.googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="w-3.5 h-3.5 text-[#C4A46A]" />
                Obter Direcções
              </LuxuryButton>

              <LuxuryButton
                variant="outline-light"
                size="md"
                href={RESTAURANT_INFO.phoneHref}
              >
                <Phone className="w-3.5 h-3.5 text-[#C4A46A]" />
                Ligar Agora
              </LuxuryButton>

              <LuxuryButton
                variant="gold"
                size="md"
                href={buildWhatsAppDirectUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Contactar pelo WhatsApp
              </LuxuryButton>
            </div>
          </div>

          {/* Interactive Google Map */}
          <div className="lg:col-span-7">
            <div className="w-full h-[420px] lg:h-full min-h-[440px] border border-[#51483D]/20 bg-[#F3EBDD] overflow-hidden relative">
              {mapsApiKey && !mapLoadError ? (
                <APIProvider
                  apiKey={mapsApiKey}
                  libraries={['places', 'marker']}
                  language="pt-PT"
                  region="AO"
                  onError={() => setMapLoadError(true)}
                >
                  <GoogleMap
                    defaultCenter={LUANDA_VIEWPORT_CENTER}
                    defaultZoom={14}
                    mapId="DEMO_MAP_ID"
                    gestureHandling="cooperative"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <VivaLuandaMarkerLayer />
                  </GoogleMap>
                </APIProvider>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#F3EBDD] to-[#e6dccb]">
                  <MapPin className="w-9 h-9 text-[#C4A46A] mb-4" strokeWidth={1.4} />
                  <h3 className="font-serif text-2xl text-[#171916]">
                    {RESTAURANT_INFO.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#51483D] max-w-md">
                    {RESTAURANT_INFO.address}
                  </p>
                  <p className="mt-1 text-xs text-[#51483D] tabular-nums">
                    Localização Google Maps: {RESTAURANT_INFO.plusCode}
                  </p>
                  <div className="mt-6">
                    <LuxuryButton
                      variant="obsidian"
                      size="md"
                      href={RESTAURANT_INFO.googleDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#C4A46A]" />
                      Abrir no Google Maps
                    </LuxuryButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
