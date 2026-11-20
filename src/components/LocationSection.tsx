import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
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
import {
  Clock,
  Crosshair,
  Layers,
  LocateFixed,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Route as RouteIcon,
  Utensils,
  X,
} from 'lucide-react';
import { RESTAURANT_INFO, buildWhatsAppDirectUrl } from '../lib/restaurantMedia';
import { LuxuryButton } from './LuxuryButton';

interface LocationSectionProps {
  mapsApiKey: string;
  mapsConfigLoaded?: boolean;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

type MapViewType = 'hybrid' | 'satellite' | 'roadmap';

interface PolylineHandle {
  setOptions: (opts: {
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
  }) => void;
  setMap: (target: unknown) => void;
}

interface ComputedRouteResult {
  distanceMeters?: number;
  durationMillis?: number;
  viewport?: unknown;
  createPolylines: () => PolylineHandle[];
}

interface RoutesLibraryShape {
  Route?: {
    computeRoutes: (request: {
      origin: string | LatLngLiteral;
      destination: LatLngLiteral;
      travelMode: 'DRIVING' | 'WALKING';
      fields: string[];
    }) => Promise<{ routes?: ComputedRouteResult[] }>;
  };
}

interface RouteSummary {
  distanceKm: string;
  durationMins: number;
  originLabel: string;
}

// Verified via Google Maps Places API (Restaurante Viva Luanda, R. de São Tomé nº 2, Miramar)
const VIVA_LUANDA_LOCATION: LatLngLiteral = {
  lat: -8.8123975,
  lng: 13.2435357,
};

const LUANDA_QUICK_ORIGINS = [
  'Marginal de Luanda, Luanda, Angola',
  'Ilha de Luanda, Luanda, Angola',
  'Talatona, Luanda, Angola',
  'Aeroporto Internacional 4 de Fevereiro, Luanda, Angola',
];

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('429') ||
    msg.includes('Quota')
  );
}

interface VivaLuandaMarkerLayerProps {
  placePosition: LatLngLiteral;
  onPlaceResolved: (pos: LatLngLiteral, label: string, sublabel: string) => void;
  placeLabel: string;
  placeSublabel: string;
  infoOpen: boolean;
  onToggleInfo: (open: boolean) => void;
  onOpenRoutePlanner: () => void;
}

function VivaLuandaMarkerLayer({
  placePosition,
  onPlaceResolved,
  placeLabel,
  placeSublabel,
  infoOpen,
  onToggleInfo,
  onOpenRoutePlanner,
}: VivaLuandaMarkerLayerProps) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [markerRef, marker] = useAdvancedMarkerRef();

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
          onPlaceResolved(
            loc,
            firstPlace.displayName || RESTAURANT_INFO.name,
            firstPlace.formattedAddress || RESTAURANT_INFO.address
          );
        }
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    }

    void resolveLocation();
    return () => {
      cancelled = true;
    };
  }, [placesLib, map, onPlaceResolved]);

  const handleMarkerClick = useCallback(() => {
    onToggleInfo(!infoOpen);
  }, [infoOpen, onToggleInfo]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={placePosition}
        onClick={handleMarkerClick}
        title={placeLabel}
      >
        <Pin background="#C4A46A" borderColor="#171916" glyphColor="#171916" scale={1.25} />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={280}
          onCloseClick={() => onToggleInfo(false)}
        >
          <div className="p-1.5 text-[#171916]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#51483D] font-semibold">
              Miramar · Luanda
            </p>
            <p className="font-serif text-base font-semibold mt-0.5">{placeLabel}</p>
            <p className="mt-1 text-xs text-[#51483D] leading-snug">{placeSublabel}</p>
            <p className="mt-1 text-[11px] text-[#51483D]/80 tabular-nums">
              Plus Code: {RESTAURANT_INFO.plusCode}
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenRoutePlanner}
                className="inline-flex items-center gap-1.5 bg-[#171916] text-[#F3EBDD] px-2.5 py-1.5 text-[11px] uppercase tracking-[0.1em] font-medium hover:bg-[#51483D] transition-colors cursor-pointer"
              >
                <RouteIcon className="w-3 h-3 text-[#C4A46A]" />
                Traçar Rota Aqui
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

interface InSiteRouteLayerProps {
  origin: string | LatLngLiteral | null;
  originLabel: string;
  destination: LatLngLiteral;
  recenterSignal: number;
  onRouteComputed: (summary: RouteSummary | null) => void;
  onRouteLoading: (loading: boolean) => void;
  onRouteError: (message: string | null) => void;
}

function InSiteRouteLayer({
  origin,
  originLabel,
  destination,
  recenterSignal,
  onRouteComputed,
  onRouteLoading,
  onRouteError,
}: InSiteRouteLayerProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes') as RoutesLibraryShape | null;
  const polylinesRef = useRef<PolylineHandle[]>([]);

  useEffect(() => {
    if (!map || recenterSignal === 0) return;
    map.panTo(destination);
    map.setZoom(17);
  }, [map, destination, recenterSignal]);

  useEffect(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!origin) {
      onRouteComputed(null);
      onRouteError(null);
      onRouteLoading(false);
      return;
    }

    if (!routesLib?.Route || !map) return;

    let cancelled = false;
    onRouteLoading(true);
    onRouteError(null);

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    })
      .then(({ routes }) => {
        if (cancelled) return;
        onRouteLoading(false);

        const primaryRoute = routes?.[0];
        if (!primaryRoute) {
          onRouteComputed(null);
          onRouteError(
            'Não foi possível calcular esta rota automaticamente. Experimente outro ponto de partida em Luanda.'
          );
          return;
        }

        const newPolylines = primaryRoute.createPolylines();
        newPolylines.forEach((polyline) => {
          polyline.setOptions({
            strokeColor: '#C4A46A',
            strokeWeight: 5,
            strokeOpacity: 0.95,
          });
          polyline.setMap(map);
        });
        polylinesRef.current = newPolylines;

        if (primaryRoute.viewport) {
          (map as unknown as { fitBounds: (bounds: unknown) => void }).fitBounds(
            primaryRoute.viewport
          );
        }

        const distanceKm = ((primaryRoute.distanceMeters ?? 0) / 1000).toFixed(1);
        const durationMins = Math.max(1, Math.round((primaryRoute.durationMillis ?? 0) / 60000));

        onRouteComputed({
          distanceKm,
          durationMins,
          originLabel,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        onRouteLoading(false);
        onRouteComputed(null);
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onRouteError(
          'Cálculo de rota indisponível para este ponto. Pode consultar directamente a localização do restaurante no mapa satélite acima.'
        );
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [
    origin,
    originLabel,
    destination,
    routesLib,
    map,
    onRouteComputed,
    onRouteLoading,
    onRouteError,
  ]);

  return null;
}

export function LocationSection({
  mapsApiKey,
  mapsConfigLoaded = true,
}: LocationSectionProps) {
  const [mapLoadError, setMapLoadError] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<MapViewType>('hybrid');
  const [placePosition, setPlacePosition] = useState<LatLngLiteral>(VIVA_LUANDA_LOCATION);
  const [placeLabel, setPlaceLabel] = useState<string>(RESTAURANT_INFO.name);
  const [placeSublabel, setPlaceSublabel] = useState<string>(RESTAURANT_INFO.address);
  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const [recenterSignal, setRecenterSignal] = useState(0);

  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  const [originInput, setOriginInput] = useState('');
  const [activeOrigin, setActiveOrigin] = useState<string | LatLngLiteral | null>(null);
  const [activeOriginLabel, setActiveOriginLabel] = useState('');
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const handlePlaceResolved = useCallback(
    (pos: LatLngLiteral, label: string, sublabel: string) => {
      setPlacePosition(pos);
      setPlaceLabel(label);
      setPlaceSublabel(sublabel);
    },
    []
  );

  const handleFocusRestaurant = useCallback(() => {
    setInfoOpen(true);
    setRecenterSignal((prev) => prev + 1);
  }, []);

  const handleOpenInSiteDirections = useCallback(() => {
    setRoutePanelOpen(true);
    setInfoOpen(true);
    mapContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleClearRoute = useCallback(() => {
    setActiveOrigin(null);
    setActiveOriginLabel('');
    setRouteSummary(null);
    setRouteError(null);
    setOriginInput('');
    setRecenterSignal((prev) => prev + 1);
  }, []);

  const handleRouteSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = originInput.trim();
    if (!trimmed) return;
    const query = trimmed.toLowerCase().includes('luanda') ? trimmed : `${trimmed}, Luanda, Angola`;
    setActiveOrigin(query);
    setActiveOriginLabel(trimmed);
  };

  const handleQuickOrigin = (place: string) => {
    const shortName = place.split(',')[0];
    setOriginInput(shortName);
    setActiveOrigin(place);
    setActiveOriginLabel(shortName);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setRouteError('Geolocalização não suportada neste navegador.');
      return;
    }
    setGeoLoading(true);
    setRouteError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        setActiveOrigin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setActiveOriginLabel('A sua localização actual');
        setOriginInput('A minha localização actual');
      },
      () => {
        setGeoLoading(false);
        setRouteError(
          'Não foi possível obter a sua localização GPS. Seleccione um ponto de partida em Luanda.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
                      Localização Satélite · {RESTAURANT_INFO.plusCode}
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
                onClick={handleOpenInSiteDirections}
              >
                <Navigation className="w-3.5 h-3.5 text-[#C4A46A]" />
                Traçar Rota no Mapa
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

          {/* Interactive Satellite Map Embedded Directly on the Website */}
          <div className="lg:col-span-7" ref={mapContainerRef}>
            <div className="w-full h-[460px] lg:h-full min-h-[480px] border border-[#51483D]/25 bg-[#171916] overflow-hidden relative">
              {mapsApiKey && !mapLoadError ? (
                <APIProvider
                  apiKey={mapsApiKey}
                  libraries={['places', 'marker', 'routes']}
                  language="pt-PT"
                  region="AO"
                  onError={() => setMapLoadError(true)}
                >
                  <GoogleMap
                    defaultCenter={VIVA_LUANDA_LOCATION}
                    defaultZoom={17}
                    mapId="DEMO_MAP_ID"
                    mapTypeId={mapTypeId}
                    mapTypeControl={false}
                    streetViewControl={true}
                    fullscreenControl={true}
                    gestureHandling="cooperative"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <VivaLuandaMarkerLayer
                      placePosition={placePosition}
                      onPlaceResolved={handlePlaceResolved}
                      placeLabel={placeLabel}
                      placeSublabel={placeSublabel}
                      infoOpen={infoOpen}
                      onToggleInfo={setInfoOpen}
                      onOpenRoutePlanner={() => setRoutePanelOpen(true)}
                    />
                    <InSiteRouteLayer
                      origin={activeOrigin}
                      originLabel={activeOriginLabel}
                      destination={placePosition}
                      recenterSignal={recenterSignal}
                      onRouteComputed={setRouteSummary}
                      onRouteLoading={setRouteLoading}
                      onRouteError={setRouteError}
                    />
                  </GoogleMap>

                  {/* Top-Left In-Site Satellite & Recenter Controls */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
                    <div
                      className="inline-flex items-center bg-[#171916]/90 backdrop-blur-md border border-[#C4A46A]/40 p-0.5 shadow-lg"
                      role="group"
                      aria-label="Modo de visualização do mapa"
                    >
                      <span className="hidden sm:inline-flex items-center px-2 text-[#C4A46A]">
                        <Layers className="w-3.5 h-3.5" />
                      </span>
                      <button
                        type="button"
                        onClick={() => setMapTypeId('hybrid')}
                        className={`px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] font-medium transition-colors cursor-pointer ${
                          mapTypeId === 'hybrid'
                            ? 'bg-[#C4A46A] text-[#171916]'
                            : 'text-[#F3EBDD]/85 hover:text-white'
                        }`}
                      >
                        Satélite
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapTypeId('satellite')}
                        className={`px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] font-medium transition-colors cursor-pointer ${
                          mapTypeId === 'satellite'
                            ? 'bg-[#C4A46A] text-[#171916]'
                            : 'text-[#F3EBDD]/85 hover:text-white'
                        }`}
                      >
                        Vista Aérea
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapTypeId('roadmap')}
                        className={`px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] font-medium transition-colors cursor-pointer ${
                          mapTypeId === 'roadmap'
                            ? 'bg-[#C4A46A] text-[#171916]'
                            : 'text-[#F3EBDD]/85 hover:text-white'
                        }`}
                      >
                        Mapa
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleFocusRestaurant}
                      className="inline-flex items-center gap-1.5 bg-[#171916]/90 backdrop-blur-md border border-[#C4A46A]/40 px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-medium text-[#F3EBDD] hover:border-[#C4A46A] hover:text-[#C4A46A] transition-colors shadow-lg cursor-pointer"
                      title="Centrar no Restaurante Viva Luanda"
                    >
                      <LocateFixed className="w-3.5 h-3.5 text-[#C4A46A]" />
                      <span className="hidden sm:inline">Centrar</span>
                    </button>

                    {!routePanelOpen && (
                      <button
                        type="button"
                        onClick={() => setRoutePanelOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-[#C4A46A] text-[#171916] px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold hover:bg-[#d4b67d] transition-colors shadow-lg cursor-pointer"
                      >
                        <RouteIcon className="w-3.5 h-3.5" />
                        <span>Rota no Site</span>
                      </button>
                    )}
                  </div>

                  {/* Bottom In-Site Route & Location Drawer */}
                  {routePanelOpen ? (
                    <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-[390px] z-10 bg-[#171916]/95 backdrop-blur-md border border-[#C4A46A]/45 p-4 text-[#F3EBDD] shadow-2xl">
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <RouteIcon className="w-4 h-4 text-[#C4A46A]" />
                          <p className="text-xs uppercase tracking-[0.16em] text-[#C4A46A] font-semibold">
                            Rota até ao Viva Luanda
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRoutePanelOpen(false)}
                          className="text-[#F3EBDD]/70 hover:text-white p-1 cursor-pointer"
                          aria-label="Fechar painel de rota"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleRouteSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={originInput}
                          onChange={(e) => setOriginInput(e.target.value)}
                          placeholder="Ponto de partida (ex: Talatona)"
                          className="flex-1 bg-white/10 border border-[#C4A46A]/30 px-3 py-2 text-xs text-white placeholder:text-[#F3EBDD]/50 focus:outline-none focus:border-[#C4A46A]"
                        />
                        <button
                          type="submit"
                          disabled={routeLoading}
                          className="bg-[#C4A46A] text-[#171916] px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-semibold hover:bg-[#d4b67d] transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          {routeLoading ? '...' : 'Ir'}
                        </button>
                      </form>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={geoLoading || routeLoading}
                          className="inline-flex items-center gap-1.5 border border-[#C4A46A]/45 bg-[#C4A46A]/15 px-2.5 py-1 text-[11px] text-[#F3EBDD] hover:bg-[#C4A46A]/25 transition-colors cursor-pointer"
                        >
                          <Crosshair className="w-3 h-3 text-[#C4A46A]" />
                          {geoLoading ? 'A localizar...' : 'A Minha Localização'}
                        </button>
                        {LUANDA_QUICK_ORIGINS.slice(0, 3).map((origin) => {
                          const label = origin.split(',')[0];
                          return (
                            <button
                              key={origin}
                              type="button"
                              onClick={() => handleQuickOrigin(origin)}
                              className="border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-[#F3EBDD]/85 hover:border-[#C4A46A]/50 hover:text-white transition-colors cursor-pointer"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {routeSummary && (
                        <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="text-[#F3EBDD]/70 text-[11px]">
                              Desde <span className="text-white">{routeSummary.originLabel}</span>
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-[#C4A46A] tabular-nums">
                              {routeSummary.distanceKm} km · ~{routeSummary.durationMins} min de carro
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleClearRoute}
                            className="text-[11px] uppercase tracking-[0.1em] text-[#F3EBDD]/75 hover:text-white underline cursor-pointer"
                          >
                            Limpar
                          </button>
                        </div>
                      )}

                      {routeError && (
                        <p className="mt-2.5 text-[11px] text-amber-200/95 leading-snug">
                          {routeError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="hidden sm:flex absolute bottom-3 left-3 z-10 items-center gap-2.5 bg-[#171916]/88 backdrop-blur-md border border-[#C4A46A]/35 px-3.5 py-2 text-xs text-[#F3EBDD] shadow-lg">
                      <MapPin className="w-3.5 h-3.5 text-[#C4A46A] shrink-0" />
                      <span className="font-medium">{placeLabel}</span>
                      <span className="text-[#C4A46A]/60">·</span>
                      <span className="text-[#F3EBDD]/80">{placeSublabel}</span>
                    </div>
                  )}
                </APIProvider>
              ) : !mapsConfigLoaded && !mapLoadError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#171916] text-[#F3EBDD]">
                  <MapPin className="w-8 h-8 text-[#C4A46A] animate-pulse mb-3" strokeWidth={1.4} />
                  <p className="text-xs uppercase tracking-[0.2em] text-[#C4A46A]">
                    A carregar mapa satélite...
                  </p>
                </div>
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
                    Localização Satélite: {RESTAURANT_INFO.plusCode}
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
