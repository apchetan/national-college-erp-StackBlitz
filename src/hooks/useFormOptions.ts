import { useState, useEffect } from 'react';

let citiesCache: string[] | null = null;
let specialisationsCache: Record<string, string[]> | null = null;
let loadingPromise: Promise<void> | null = null;

export function useFormOptions() {
  const [cities, setCities] = useState<string[]>([]);
  const [specialisations, setSpecialisations] = useState<Record<string, string[]>>({});
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      if (citiesCache && specialisationsCache) {
        setCities(citiesCache);
        setSpecialisations(specialisationsCache);
        setLoadingOptions(false);
        return;
      }

      if (loadingPromise) {
        await loadingPromise;
        if (citiesCache && specialisationsCache) {
          setCities(citiesCache);
          setSpecialisations(specialisationsCache);
          setLoadingOptions(false);
        }
        return;
      }

      loadingPromise = (async () => {
        try {
          const [citiesResponse, specialisationsResponse] = await Promise.all([
            fetch('/data/cities.json'),
            fetch('/data/specialisations.json')
          ]);

          if (!citiesResponse.ok || !specialisationsResponse.ok) {
            throw new Error('Failed to load form options');
          }

          const citiesData = await citiesResponse.json();
          const specialisationsData = await specialisationsResponse.json();

          citiesCache = citiesData;
          specialisationsCache = specialisationsData;

          setCities(citiesData);
          setSpecialisations(specialisationsData);
        } catch (error) {
          console.error('Error loading form options:', error);
          setCities([]);
          setSpecialisations({});
        } finally {
          setLoadingOptions(false);
          loadingPromise = null;
        }
      })();

      await loadingPromise;
    };

    loadOptions();
  }, []);

  return { cities, specialisations, loadingOptions };
}
