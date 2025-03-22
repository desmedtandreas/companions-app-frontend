
import React, { useState } from 'react';

export default function MainContent() {
    const [textQuery, setTextQuery] = useState('');
    const [location, setLocation] = useState('option1');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = () => {
        setLoading(true);
        setError(null);

        const url = `${process.env.VITE_API_URL}/api/maps-search/?textQuery=${encodeURIComponent(textQuery)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setResults(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    };

    return (
        <main>
            <h1>Maps Company Search</h1>
            <div className="search-header">
                <div>
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
                    <p>Locatie</p>
                    <select className="field" value={location} onChange={(e) => setLocation(e.target.value)}>
                        <option value="option1">Vlaanderen</option>
                        <option value="option2">België</option>
                    </select>
                </div>
                <div>
                    <button type="button" onClick={handleSearch}>
                        Zoeken
                    </button>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
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
                                <th className='rating'>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && results.length === 0 && (
                                <tr>
                                    <td colSpan="6">Geen resultaten gevonden.</td>
                                </tr>
                            )}
                            {results.map((result, index) => (
                                <tr key={index}>
                                    <td className="checkbox">
                                        <input type="checkbox" />
                                    </td>
                                    <td>{result.name}</td>
                                    <td>{result.address}</td>
                                    <td>{result.vat_number || '-'}</td>
                                    <td className='small'>{result.website || '-'}</td>
                                    <td className='rating'><div /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {error && <p className="error">Fout: {error.message}</p>}
        </main>
    );
}