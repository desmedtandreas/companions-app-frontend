import React, { useEffect, useRef, useState } from 'react';
import AddVatButton from './AddVatButton';
import PlacesTable from './PlacesTable';
import BatchButton from './BatchButton';
import { useToast } from './ToastProvider';

type List = {
  id: string;
  name: string;
};

type Place = {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  vat_number?: string;
  company_name?: string;
  company_id?: string;
};

export default function MainContent() {
  const [textQuery, setTextQuery] = useState<string>('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [radius, setRadius] = useState<string>('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [lists, setLists] = useState<List[]>([]);
  const { showToast } = useToast();


  const handleSearch = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const url = `${import.meta.env.VITE_API_URL}api/maps/search/?textQuery=${textQuery}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const firstData: { places: Place[]; nextPageToken?: string } = await response.json();
      let allPlaces = [...firstData.places];
      let currentToken = firstData.nextPageToken || null;
  
      // Keep loading more pages
      while (currentToken) {
        const nextUrl = `${import.meta.env.VITE_API_URL}api/maps/search/?textQuery=${textQuery}&nextPageToken=${encodeURIComponent(currentToken)}`;
        const nextResponse = await fetch(nextUrl);
        if (!nextResponse.ok) {
          throw new Error(`HTTP error! status: ${nextResponse.status}`);
        }
        const nextData: { places: Place[]; nextPageToken?: string } = await nextResponse.json();
  
        allPlaces = [...allPlaces, ...nextData.places];
        currentToken = nextData.nextPageToken || null;
  
        // If your API needs a delay between nextPageToken fetches (Google sometimes does), you can uncomment this:
        // await new Promise(resolve => setTimeout(resolve, 2000));
      }
  
      setPlaces(allPlaces);
      setNextPageToken(null); // No more pages
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  const handleVatSubmit = async (placeId: string, vatValue: string, website?: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/maps/set-vat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: website ? website : '',
          vat_number: vatValue,
          place_id: placeId,
          text_query: textQuery,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set VAT');
      }

      const updatedData: {
        vat_number: string;
        company_name: string;
        company_id: string;
      } = await response.json();

      const index = places.findIndex((p) => p.place_id === placeId);
      if (index === -1) return;

      const updatedPlace = {
        ...places[index],
        vat_number: updatedData.vat_number,
        company_name: updatedData.company_name,
        company_id: updatedData.company_id,
      };

      const newPlaces = [...places];
      newPlaces[index] = updatedPlace;
      setPlaces(newPlaces);
    } catch (error) {
      console.error('Error updating VAT:', error);
      setError(error as Error);
    }
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}api/lists/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch lists');
        }
        return res.json();
      })
      .then((data) => {
        // Convert from API format to expected shape for BatchButton
        const formatted = data.map((list: any) => ({
          id: list.slug,
          name: list.name,
        }));
        setLists(formatted);
      })
      .catch((err) => {
        console.error('Error fetching lists:', err);
      });
  }, []);

  const handleAddToList = async (listId: string) => {
    const selectedCompanyNumbers = Object.keys(rowSelection)
      .map((rowId) => places[parseInt(rowId)]?.vat_number)
      .filter(Boolean);
  
    if (selectedCompanyNumbers.length === 0) {
      showToast('Geen bedrijven geselecteerd.', 'info');
      return;
    }
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/lists/${listId}/add-companies/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: selectedCompanyNumbers }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        showToast(`${data.added} bedrijven toegevoegd aan de lijst.`, 'success');
      } else {
        showToast('Fout bij toevoegen: ' + (data.error || 'Onbekende fout'), 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Verzoek mislukt.');
    }
  };

  return (
    <main className="">
      <h1 className="text-4xl font-semibold mt-12 mb-8">Google Maps Zoeken</h1>
      <div className="flex items-end space-x-5">
        <div className="w-1/3">
          <p className="text-sm my-2">Zoekwoorden</p>
          <input
            className="box-border h-10 rounded-md border border-gray-300 w-full m-0 text-sm"
            type="text"
            placeholder="aannemer, bouwbedrijf, ..."
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
          />
        </div>
        <div>
          <button
            type="button"
            className="px-5 h-10 border border-[#21284f] bg-[#21284f] text-white rounded-full"
            onClick={handleSearch}
          >
            Zoeken
          </button>
        </div>
      </div>
      {error && <div className="error">Er is een fout opgetreden: {error.message}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          <div className="mt-10 mb-3">
            <BatchButton 
              rowSelection={rowSelection}
              onAdd={handleAddToList}
              useDelete={false}
            />
          </div>
          <PlacesTable
              places={places}
              onVatSubmit={handleVatSubmit}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
          />
        </div>
      )}
    </main>
  );
}