import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { PetCard } from '../components/PetCard';
import { PetModal } from '../components/PetModal';
import { DonationSection } from '../components/DonationSection';
import { LedgerSection } from '../components/LedgerSection';
import { SuccessStories } from '../components/SuccessStories';
import { Footer } from '../components/Footer';
import { PlayfulPets, PetDivider } from '../components/PlayfulPets';
import { Animal, Stats, SiteSettings } from '../types';
import { animalsApi, statsApi } from '../api/client';
import { Heart, Activity, Wifi, Camera, X } from 'lucide-react';
import ThumbnailImageViewer from '../components/ui/thumbnail-image-viewer';
import { INITIAL_ANIMALS, INITIAL_STATS, INITIAL_SETTINGS } from '../data/initialData';

const getCachedData = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const HomePage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  // Instant zero-latency hydration: Page renders immediately on frame 1
  const [animals, setAnimals] = useState<Animal[]>(() =>
    getCachedData('paws_animals', INITIAL_ANIMALS)
  );
  const [stats, setStats] = useState<Stats | null>(() =>
    getCachedData('paws_stats', INITIAL_STATS)
  );
  const [settings, setSettings] = useState<SiteSettings | null>(() =>
    getCachedData('paws_settings', INITIAL_SETTINGS)
  );

  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [activeAnimalForDonation, setActiveAnimalForDonation] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [homepageLightboxUrl, setHomepageLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAnimal) {
      document.title = `🐾 Help ${selectedAnimal.name} - ${
        selectedAnimal.category === 'treatment' ? 'Emergency Surgery Fund' : 'Adopt a Friend'
      } | Paws&Hearts`;
    } else {
      document.title = '🐾 Paws&Hearts Bengaluru - Giving Every Street Dog A Second Chance';
    }
  }, [selectedAnimal]);

  useEffect(() => {
    // Check initial deep linked pet
    const checkDeepLink = (list: Animal[]) => {
      const params = new URLSearchParams(window.location.search);
      const targetSlug = slug || params.get('pet') || params.get('animal');
      if (targetSlug) {
        const match = list.find(
          (a) =>
            a.slug.toLowerCase() === targetSlug.toLowerCase() ||
            a.name.toLowerCase() === targetSlug.toLowerCase() ||
            a.id === targetSlug
        );
        if (match) {
          setSelectedAnimal(match);
          if (params.get('donate') === 'true') {
            setActiveAnimalForDonation(match.name);
          }
        }
      }
    };

    checkDeepLink(animals);

    // Background SWR sync with Neon backend (silently updates without blocking UI)
    Promise.all([
      animalsApi.getAll(),
      statsApi.getStats(true),
      statsApi.getSettings(),
    ])
      .then(([animalsRes, statsRes, settingsRes]) => {
        const fetchedAnimals = animalsRes.animals;
        setAnimals(fetchedAnimals);
        setStats(statsRes.stats);
        setSettings(settingsRes.settings);
        setIsLiveConnected(true);

        try {
          localStorage.setItem('paws_animals', JSON.stringify(fetchedAnimals));
          localStorage.setItem('paws_stats', JSON.stringify(statsRes.stats));
          localStorage.setItem('paws_settings', JSON.stringify(settingsRes.settings));
        } catch {
          // Local storage quota handled
        }

        // If an animal profile modal is currently open, refresh it with latest data
        setSelectedAnimal((current) => {
          if (!current) return current;
          const fresh = fetchedAnimals.find((a) => a.id === current.id || a.slug === current.slug);
          return fresh || current;
        });

        checkDeepLink(fetchedAnimals);
      })
      .catch((err) => {
        // Backend sleeping / free-tier spinup: Fallback dataset is already smoothly rendered!
        console.log('Background sync in progress:', err.message);
      });
  }, [slug, location.search]);

  const handleSelectAnimal = async (animal: Animal) => {
    setSelectedAnimal(animal);
    try {
      const res = await animalsApi.getBySlug(animal.slug || animal.id);
      if (res?.animal) {
        setSelectedAnimal(res.animal);
        setAnimals((prev) => prev.map((a) => (a.id === res.animal.id ? res.animal : a)));
      }
    } catch {
      // already showing initial animal data
    }
  };

  const handleDonateForAnimal = (animalName: string) => {
    setActiveAnimalForDonation(animalName);
    const el = document.getElementById('donate');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const adoptionAnimals = animals.filter(
    (a) => a.category === 'adoption' && a.status !== 'adopted' && a.status !== 'recovered'
  );

  const treatmentAnimals = animals.filter(
    (a) => a.category === 'treatment' && a.status !== 'recovered' && a.status !== 'adopted'
  );

  // Dynamically select the most recently added urgent case or active medical case
  const urgentCases = animals
    .filter((a) => a.status === 'urgent')
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const activeTreatmentCases = [...treatmentAnimals].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  const newestCases = [...animals].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  // Aggregated rescue media items for the live homepage gallery
  const allGalleryMedia = React.useMemo(() => {
    const list: any[] = [];
    animals.forEach((animal) => {
      let items: any[] = [];
      if (Array.isArray(animal.media)) {
        items = animal.media;
      } else if (typeof animal.media === 'string') {
        try {
          items = JSON.parse(animal.media);
        } catch {
          items = [];
        }
      }

      if (Array.isArray(items)) {
        items.forEach((m, idx) => {
          if (!m) return;
          const url = typeof m === 'string' ? m : m.url;
          if (!url) return;
          const isVid = m.media_type === 'video' || url.endsWith('.mp4') || url.includes('/video/');
          list.push({
            id: m.id || `${animal.id}-${idx}`,
            url,
            src: url,
            media_type: isVid ? 'video' : m.media_type || 'photo',
            caption: m.caption ? `${animal.name}: ${m.caption}` : `${animal.name}'s recovery update`,
          });
        });
      }

      if (animal.hero_image) {
        list.push({
          id: `${animal.id}-hero`,
          url: animal.hero_image,
          src: animal.hero_image,
          media_type: 'photo',
          caption: `${animal.name} - Profile Cover Photo`,
        });
      }
    });

    // Videos and medical cases first
    return list.sort((a, b) => (a.media_type === 'video' ? -1 : 1));
  }, [animals]);

  const featuredAnimal = urgentCases[0] || activeTreatmentCases[0] || newestCases[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fff0f5] relative">
      {/* 1. Seamless Doodle Paw Pattern & Baby Pink Ambient Gradient */}
      <div className="site-bg-pattern" />
      <div className="pink-ambient-glow" />

      {/* 2. Playful Floating Pets & Companion */}
      <PlayfulPets />

      <Navbar />
      <Hero
        stats={stats}
        settings={settings}
        featuredAnimal={featuredAnimal}
        onDonateForAnimal={handleDonateForAnimal}
        onSelectAnimal={handleSelectAnimal}
      />

      {/* 1. Urgent Medical Treatments Section */}
      <section id="treatment" className="py-12 sm:py-20 px-3.5 sm:px-4 max-w-6xl mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 mb-2.5 font-display">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              Critical Roadside Rescues
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
              Urgent Medical Cases 🚨
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-lg mt-1.5 font-medium">
              Survivors battling orthopedic trauma, maggot wounds, and illnesses. They rely on emergency treatment sponsorships.
            </p>
          </div>
        </div>

        {treatmentAnimals.length === 0 ? (
          <div className="bg-white/85 backdrop-blur-md rounded-3xl p-8 sm:p-12 text-center text-slate-600 font-semibold border border-pink-200/80 shadow-sm text-sm sm:text-base">
            All previous critical trauma rescues have been fully treated and rehabilitated! 🎉
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {treatmentAnimals.map((animal) => (
              <PetCard
                key={animal.id}
                animal={animal}
                onSelect={handleSelectAnimal}
                onDonate={handleDonateForAnimal}
              />
            ))}
          </div>
        )}
      </section>

      <PetDivider />

      {/* 2. Live Rescue Media & Video Gallery */}
      {allGalleryMedia.length > 0 && (
        <>
          <section id="gallery" className="py-12 sm:py-20 px-3.5 sm:px-4 max-w-6xl mx-auto w-full relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 mb-2.5 font-display">
                  <Camera className="w-3.5 h-3.5 text-pink-600" />
                  Live Rescue Timeline
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
                  Rescue Photo & Video Gallery 📸
                </h2>
                <p className="text-slate-600 text-xs sm:text-base max-w-xl mt-1.5 font-medium">
                  Watch recovery videos, veterinary surgery updates, clinic bills, and daily rehabilitation progress directly from the street.
                </p>
              </div>
            </div>

            <ThumbnailImageViewer
              title="Paws&Hearts Live Rescue Timeline"
              items={allGalleryMedia}
              onZoom={(url) => setHomepageLightboxUrl(url)}
            />
          </section>

          <PetDivider />
        </>
      )}

      {/* 3. Adoption Section */}
      <section id="adopt" className="py-12 sm:py-20 px-3.5 sm:px-4 max-w-6xl mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 mb-2.5 font-display">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              Forever Companions
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
              Adopt, Don't Shop 🏡
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-lg mt-1.5 font-medium">
              Healthy, fully vaccinated, and affectionate dogs waiting patiently for warm loving homes.
            </p>
          </div>
        </div>

        {adoptionAnimals.length === 0 ? (
          <div className="bg-white/85 backdrop-blur-md rounded-3xl p-8 sm:p-12 text-center text-slate-600 font-semibold border border-pink-200/80 shadow-sm text-sm sm:text-base">
            All previously rescued puppies have found loving foster or forever homes! Meet them in Success Stories below. 🐶
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {adoptionAnimals.map((animal) => (
              <PetCard
                key={animal.id}
                animal={animal}
                onSelect={handleSelectAnimal}
                onDonate={handleDonateForAnimal}
              />
            ))}
          </div>
        )}
      </section>

      <PetDivider />

      {/* 3. Success Stories */}
      <SuccessStories animals={animals} onSelect={handleSelectAnimal} />

      <PetDivider />

      {/* 4. Donation Section */}
      <DonationSection
        upiId={settings?.upi_id}
        payeeName={settings?.payee_name}
        activeAnimalName={activeAnimalForDonation}
        onClearActiveAnimal={() => setActiveAnimalForDonation(null)}
        animals={animals}
      />

      {/* 5. Live Transparency Ledger */}
      <LedgerSection />

      {/* Pet Lightbox Modal */}
      {selectedAnimal && (
        <PetModal
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onDonateForAnimal={handleDonateForAnimal}
        />
      )}

      {/* Homepage Fullscreen Media Lightbox */}
      {homepageLightboxUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fade-in"
          onClick={() => setHomepageLightboxUrl(null)}
        >
          <div className="absolute top-4 right-4 z-40">
            <button
              type="button"
              onClick={() => setHomepageLightboxUrl(null)}
              className="p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all shadow-lg cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div
            className="relative max-w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {homepageLightboxUrl.endsWith('.mp4') || homepageLightboxUrl.includes('/video/') ? (
              <video
                src={homepageLightboxUrl}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl bg-black"
              />
            ) : (
              <img
                src={homepageLightboxUrl}
                alt="Inspection view"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>
        </div>
      )}

      <Footer settings={settings} />
    </div>
  );
};
