import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function CompanySearcher() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const initialQuery = searchParams.get('q') || '';
    const [textQuery, setTextQuery] = useState(initialQuery);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCompanies = (query) => {
        if (!query) return;

        setLoading(true);
        setError(null);

        const url = `${import.meta.env.VITE_API_URL}api/companies/search/?q=${query}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setCompanies(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    };

    // Run search on load if there's a query in the URL
    useEffect(() => {
        if (initialQuery) {
            fetchCompanies(initialQuery);
        }
    }, []);

    const handleSearch = () => {
        // Push query to URL
        navigate(`/company-search/?q=${textQuery}`);
        fetchCompanies(textQuery);
    };

    return (
        <main>
            <h1>Maps Company Search</h1>
            <div className="search-header">
                <div className="field-container">
                    <p>Zoekwoorden</p>
                    <input
                        className="field"
                        type="text"
                        placeholder="Naam of BTW nummer"
                        value={textQuery}
                        onChange={(e) => setTextQuery(e.target.value)}
                    />
                </div>
                <div>
                    <button type="button" className="small-button" onClick={handleSearch}>
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
                {loading && companies.length === 0 ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th className="checkbox">
                                    <input type="checkbox" />
                                </th>
                                <th>Naam</th>
                                <th>Adres</th>
                                <th>BTW Nummer</th>
                                <th>Oprichting</th>
                                <th className="rating-cell">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && companies.length === 0 && (
                                <tr>
                                    <td colSpan="6">Geen resultaten gevonden.</td>
                                </tr>
                            )}
                            {companies.map((company, index) => (
                                <tr
                                    key={index}
                                    className="clickable-row"
                                    onClick={() => navigate(`/company/${company.number.replace(/\D/g, '')}`)}
                                >
                                    <td className="checkbox">
                                        <input type="checkbox" />
                                    </td>
                                    <td>{company.name}</td>
                                    <td>
                                        {company.addresses?.[0]
                                            ? `${company.addresses[0].street} ${company.addresses[0].house_number}, ${company.addresses[0].postal_code} ${company.addresses[0].city}`
                                            : 'Geen adres'}
                                    </td>
                                    <td className="vat-cell">BE{company.number}</td>
                                    <td className="small">{company.start_date}</td>
                                    <td className="rating-cell">
                                        <div className="rating" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </main>
    );
}