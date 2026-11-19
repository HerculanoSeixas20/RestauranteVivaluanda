import { useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { MenuSection } from './components/MenuSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ReservationSection } from './components/ReservationSection';
import { LocationSection } from './components/LocationSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { Footer } from './components/Footer';
import { AdminPanelModal } from './components/AdminPanelModal';
import type { MenuCategory, MenuItem, MenuPayload, RestaurantSettings } from './types/restaurant';
import { RESTAURANT_INFO } from './lib/restaurantMedia';
import {
  DEFAULT_MENU_CATEGORIES,
  DEFAULT_MENU_ITEMS,
} from './lib/defaultMenuData';

const DEFAULT_SETTINGS: RestaurantSettings = {
  instagramUrl: 'https://www.instagram.com/',
  facebookUrl: 'https://www.facebook.com/',
  whatsappNumber: RESTAURANT_INFO.whatsappNumber,
  phoneDisplay: RESTAURANT_INFO.phoneDisplay,
};

export default function App() {
  const [categories, setCategories] = useState<MenuCategory[]>(DEFAULT_MENU_CATEGORIES);
  const [items, setItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [preselectedDishNote, setPreselectedDishNote] = useState<string | null>(null);

  const loadMenuData = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = (await res.json()) as MenuPayload;
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch {
      // Keep verified default menu data when API is unavailable
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  useEffect(() => {
    void loadMenuData();

    if (!mapsApiKey) {
      fetch('/api/public-config')
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { mapsApiKey?: string } | null) => {
          if (data?.mapsApiKey) {
            setMapsApiKey(data.mapsApiKey);
          }
        })
        .catch(() => {
          // Graceful fallback handled in LocationSection
        });
    }
  }, [loadMenuData, mapsApiKey]);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#171916]">
      <ScrollProgressBar />

      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <MenuSection
          categories={categories}
          items={items}
          isLoading={loadingMenu}
          onReserveWithDish={(dishName) => setPreselectedDishNote(dishName)}
        />
        <ExperienceSection />
        <ReviewsSection />
        <ReservationSection preselectedDishNote={preselectedDishNote} />
        <LocationSection mapsApiKey={mapsApiKey} />
        <FinalCtaSection />
      </main>

      <Footer settings={settings} onOpenAdmin={() => setAdminOpen(true)} />

      <AdminPanelModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        categories={categories}
        items={items}
        settings={settings}
        onDataUpdated={loadMenuData}
      />
    </div>
  );
}
