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

    const fetchCompanies = (textQuery) => {
        if (!textQuery) return;
    
        setLoading(true);
        setError(null);
    
        const cleanedQuery = cleanQueryInput(textQuery);
        const url = `${import.meta.env.VITE_API_URL}api/companies/search/?q=${cleanedQuery}`;
        console.log("🔍 Fetching:", url);
    
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }53
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

    const cleanQueryInput = (input) => {
        let trimmed = input.trim();
    
        // Remove leading 'BE' (case-insensitive)
        if (trimmed.toUpperCase().startsWith('BE')) {
            trimmed = trimmed.slice(2);
        }
    
        // If input is mostly digits (or only contains digits, spaces, and dots)
        if (/^[\d\s.]+$/.test(trimmed)) {
            // Remove all non-digit characters
            trimmed = trimmed.replace(/\D/g, '');
        }
    
        return trimmed;
    };

    // Debounce search to avoid calling API too often
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(textQuery);
        }, 500);  // Delay of 500ms after typing stops

        return () => clearTimeout(timer);
    }, [textQuery]);

    // Fetch companies whenever debouncedQuery changes
    useEffect(() => {
        if (debouncedQuery !== initialQuery) {
            navigate(`/company-search/?q=${debouncedQuery}`);
        }
        fetchCompanies(debouncedQuery);
    }, [debouncedQuery, navigate, initialQuery]);

    const handleSearch = () => {
        // Push query to URL on "search" button click
        navigate(`/company-search/?q=${textQuery}`);
        fetchCompanies(textQuery);
    };

    return (
        <main>
            <h1>Bedrijf Zoeken</h1>
            <div className="search-header">
                <div className="field-container">
                    <p>Zoekwoorden</p>
                    <input
                        className="field"
                        type="text"
                        placeholder="Naam of BTW nummer"
                        value={textQuery}
                        onChange={(e) => {
                            const input = e.target.value;
                            setTextQuery(input);
                        }}  // Set text query as the user types
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
