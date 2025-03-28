
import React, { useState } from 'react';
import AddVatButton from './AddVatButton';

export default function MainContent() {
    const [textQuery, setTextQuery] = useState('');
    const [nextPageToken, setNextPageToken] = useState(null);
    const [location, setLocation] = useState('option1');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = () => {
        setLoading(true);
        setError(null);

        const url = `${import.meta.env.VITE_API_URL}api/maps/search/?textQuery=${textQuery + 'belgië'}`;
        console.log(url)

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setPlaces(data.places);
                setNextPageToken(data.nextPageToken || null);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    };

    const handleLoadMore = () => {
        if (!nextPageToken) return;

        setLoadingMore(true);
        setError(null);

        const url = `${import.meta.env.VITE_API_URL}api/maps/search/?textQuery=${encodeURIComponent(textQuery + 'belgië')}&nextPageToken=${encodeURIComponent(nextPageToken)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setPlaces([...places, ...data.places]);
                setNextPageToken(data.nextPageToken || null);
                setLoadingMore(false);
            })
            .catch(err => {
                setError(err);
                setLoadingMore(false);
            });
    };

    const handleVatSubmit = async (placeId, vatValue) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}api/maps/set-vat/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vat_number: vatValue,
              place_id: placeId,
              text_query: textQuery + 'belgië',
            }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to set VAT');
          }
      
          const updatedData = await response.json();
      
          // Find index of the place we're updating
          const index = places.findIndex((p) => p.place_id === placeId);
          if (index === -1) return;
      
          // Merge only the fields you want to update
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
          setError(error);
        }
    };

    return (
        <main>
            <h1>Google Maps Zoeken</h1>
            <div className="search-header">
                <div className="field-container">
                    <p>Zoekwoorden</p>
                    <input
                        className="field"
                        type="text"
                        placeholder="aannemer, bouwbedrijf, ..."
                        value={textQuery}
                        onChange={(e) => setTextQuery(e.target.value)}
                    />
                </div>
                <div>
                    <button type='button' className="small-button" onClick={handleSearch}>
                        Zoeken
                    </button>
                </div>
            </div>

            {error && (
                <div className="error">
                    Er is een fout opgetreden: {error.message}
                </div>
            )}

            <div className="table-container">
                {loading && places.length === 0 ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th className='checkbox'>
                                    <input type="checkbox" />
                                </th>
                                <th>Naam</th>
                                <th>Adres</th>
                                <th>BTW Nummer</th>
                                <th className='small'>Website</th>
                                <th className='rating-cell'>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && places.length === 0 && (
                                <tr>
                                    <td colSpan="6">Geen resultaten gevonden.</td>
                                </tr>
                            )}
                            {places.map((place, index) => (
                                <tr key={index}>
                                    <td className="checkbox">
                                        <input type="checkbox" />
                                    </td>
                                    <td>
                                        <div>
                                            <p className='table-companyname'>{place.company_name || '-'}</p>
                                            <p>{place.name}</p>
                                        </div>
                                    </td>
                                    <td>{place.address}</td>
                                    <td className='vat-cell'>
                                    {place.vat_number ? (
                                        place.vat_number
                                    ) : (
                                        <AddVatButton
                                            placeId={place.place_id}
                                            onSubmit={handleVatSubmit}
                                        />
                                    )}
                                    </td>
                                    <td className='small'>{place.website || '-'}</td>
                                    <td className='rating-cell'><div className='rating'/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="load-more">
                {nextPageToken && !loading && (
                    loadingMore ? (
                        <div className="spinner"></div>
                    ) : (
                        <button className='small-button' type="button" onClick={handleLoadMore}>
                            Meer laden...
                        </button>
                    )

                )}
            </div>
        </main>
    );
}