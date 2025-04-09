import React, { useEffect, useRef, useState } from 'react';
import AddVatButton from './AddVatButton';
import PlacesTable from './PlacesTable';

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

  const handleSearch = () => {
    setLoading(true);
    setError(null);

    const url = `${import.meta.env.VITE_API_URL}api/maps/search/?textQuery=${textQuery}&location=${location}&radius=${radius}`;
    console.log(url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { places: Place[]; nextPageToken?: string }) => {
        setPlaces(data.places);
        setNextPageToken(data.nextPageToken || null);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err);
        setLoading(false);
      });
  };

  const handleLoadMore = () => {
    if (!nextPageToken) return;

    setLoadingMore(true);
    setError(null);

    const url = `${import.meta.env.VITE_API_URL}api/maps/search/?textQuery=${textQuery}&location=${location}&radius=${radius}&nextPageToken=${encodeURIComponent(nextPageToken)}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { places: Place[]; nextPageToken?: string }) => {
        setPlaces([...places, ...data.places]);
        setNextPageToken(data.nextPageToken || null);
        setLoadingMore(false);
      })
      .catch((err: Error) => {
        setError(err);
        setLoadingMore(false);
      });
  };

  const handleVatSubmit = async (placeId: string, vatValue: string, website: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/maps/set-vat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: website,
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

  return (
    <main className="">
      <h1 className="text-4xl font-semibold mt-12 mb-8">Google Maps Zoeken</h1>
      <div className="flex items-end space-x-5">
        <div className="w-1/4">
          <p className="text-sm my-2">Zoekwoorden</p>
          <input
            className="box-border h-10 rounded-md border border-gray-300 w-full m-0 text-sm"
            type="text"
            placeholder="aannemer, bouwbedrijf, ..."
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
          />
        </div>
        <div className="w-1/5">
          <p className="text-sm my-2">Plaats</p>
          <input
            className="box-border h-10 rounded-md border border-gray-300 w-full m-0 text-sm"
            type="text"
            placeholder="Antwerpen"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="w-28">
          <p className="text-sm my-2">Radius (km)</p>
          <input
            className="box-border h-10 rounded-md border border-gray-300 w-full m-0 text-sm"
            type="text"
            placeholder="50"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
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
      <PlacesTable
          places={places}
          onVatSubmit={handleVatSubmit}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
      />
      <div className="flex justify-center mt-7">
      {nextPageToken && !loading && (
        loadingMore ? (
          <div className="spinner" />
        ) : (
          <button className="bg-[#21284f] text-white rounded-full py-2 px-4" type="button" onClick={handleLoadMore}>
            Meer laden...
          </button>
        )
      )}
      </div>
    </main>
  );
}