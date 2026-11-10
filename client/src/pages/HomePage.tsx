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
import { Heart, Activity } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [activeAnimalForDonation, setActiveAnimalForDonation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Increment visit and fetch
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

        // Check deep linked pet from route /pet/:slug or query ?pet=... or ?animal=...
        const params = new URLSearchParams(window.location.search);
        const targetSlug = slug || params.get('pet') || params.get('animal');
        if (targetSlug) {
          const match = fetchedAnimals.find(
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
      })
      .catch((err) => {
        console.error('Initial load failed:', err);
      })
      .finally(() => setLoading(false));
  }, [slug, location.search]);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#fff0f5] relative">
      {/* 1. Seamless Doodle Paw Pattern & Baby Pink Ambient Gradient */}
      <div className="site-bg-pattern" />
      <div className="pink-ambient-glow" />

      {/* 2. Playful Floating Pets & Companion */}
      <PlayfulPets />

      <Navbar />
      <Hero stats={stats} settings={settings} />

      {/* 1. Urgent Medical Treatments Section */}
      <section id="treatment" className="py-20 px-4 max-w-6xl mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 mb-3 font-display">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              Critical Roadside Rescues
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
              Urgent Medical Cases 🚨
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-lg mt-2 font-medium">
              Survivors battling orthopedic trauma, maggot wounds, and illnesses. They rely on emergency treatment sponsorships.
            </p>
          </div>
        </div>

        {treatmentAnimals.length === 0 && !loading ? (
          <div className="bg-white/85 backdrop-blur-md rounded-3xl p-12 text-center text-slate-600 font-semibold border border-pink-200/80 shadow-sm">
            All previous critical trauma rescues have been fully treated and rehabilitated! 🎉
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {treatmentAnimals.map((animal) => (
              <PetCard
                key={animal.id}
                animal={animal}
                onSelect={setSelectedAnimal}
                onDonate={handleDonateForAnimal}
              />
            ))}
          </div>
        )}
      </section>

      <PetDivider />

      {/* 2. Adoption Section */}
      <section id="adopt" className="py-20 px-4 max-w-6xl mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 mb-3 font-display">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              Forever Companions
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
              Adopt, Don't Shop 🏡
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-lg mt-2 font-medium">
              Healthy, fully vaccinated, and affectionate dogs waiting patiently for warm loving homes.
            </p>
          </div>
        </div>

        {adoptionAnimals.length === 0 && !loading ? (
          <div className="bg-white/85 backdrop-blur-md rounded-3xl p-12 text-center text-slate-600 font-semibold border border-pink-200/80 shadow-sm">
            All previously rescued puppies have found loving foster or forever homes! Meet them in Success Stories below. 🐶
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adoptionAnimals.map((animal) => (
              <PetCard
                key={animal.id}
                animal={animal}
                onSelect={setSelectedAnimal}
                onDonate={handleDonateForAnimal}
              />
            ))}
          </div>
        )}
      </section>

      <PetDivider />

      {/* 3. Success Stories */}
      <SuccessStories animals={animals} onSelect={setSelectedAnimal} />

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
      <PetModal
        animal={selectedAnimal}
        onClose={() => setSelectedAnimal(null)}
        onDonateForAnimal={handleDonateForAnimal}
      />

      <Footer settings={settings} />
    </div>
  );
};
