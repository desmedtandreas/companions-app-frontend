import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CompanyTable from './CompanyTable';
import { RiMenuAddFill } from '@remixicon/react';

type Address = {
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
};

type Company = {
  name: string;
  number: string;
  start_date: string;
  addresses?: Address[];
};

export default function CompanySearcher() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [textQuery, setTextQuery] = useState<string>(initialQuery);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [rowSelection, setRowSelection] = useState({});

  const fetchCompanies = (query: string) => {
    if (!query) return;

    setLoading(true);
    setError(null);

    const cleanedQuery = cleanQueryInput(query);
    const url = `${import.meta.env.VITE_API_URL}api/companies/search/?q=${cleanedQuery}`;
    console.log('🔍 Fetching:', url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Company[]) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err);
        setLoading(false);
      });
  };

  const cleanQueryInput = (input: string): string => {
    let trimmed = input.trim();

    if (trimmed.toUpperCase().startsWith('BE')) {
      trimmed = trimmed.slice(2);
    }

    if (/^[\d\s.]+$/.test(trimmed)) {
      trimmed = trimmed.replace(/\D/g, '');
    }

    return trimmed;
  };

  // Debounce search to avoid calling API too often
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(textQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [textQuery]);

  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      navigate(`/company-search/?q=${debouncedQuery}`);
    }
    fetchCompanies(debouncedQuery);
  }, [debouncedQuery, navigate, initialQuery]);

  const handleSearch = () => {
    navigate(`/company-search/?q=${textQuery}`);
    fetchCompanies(textQuery);
  };

  return (
    <main>
      <h1 className="text-4xl font-semibold mt-12 mb-8">Bedrijf Zoeken</h1>
      <div className="flex items-end space-x-5">
        <div className="w-1/3">
          <p className="text-sm my-2">Zoekwoorden</p>
          <input
            className="box-border h-10 rounded-md border border-gray-300 w-full m-0 text-sm"
            type="text"
            placeholder="Naam of BTW nummer"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
          />
        </div>
        <div>
          <button type="button" 
            className="px-5 h-10 border border-[#21284f] bg-[#21284f] text-white rounded-full"
            onClick={handleSearch}>
            Zoeken
          </button>
        </div>
      </div>

      { Object.keys(rowSelection).length === 0 ? (
        <div className='flex mt-10 mb-4'>
          <div className='flex items-center text-sm text-gray-400 bg-gray-100 py-2 px-4 rounded-md shadow'>
            <RiMenuAddFill className='ml-0 mr-3 h-4 w-4' />
            Voeg toe aan lijst
          </div>
        </div>
      ) : (
        <div className='flex items-center mt-10 mb-4'>
          <div className='flex items-center text-sm text-white bg-[#21284f] p-2 px-4 rounded-md shadow'>
            <RiMenuAddFill className='mr-3 h-4 w-4 m-0' />
            Voeg toe aan lijst
          </div>
          <p className='text-sm ml-4' >
            {Object.keys(rowSelection).length} geselecteerde bedrij{Object.keys(rowSelection).length > 1 ? 'ven' : 'f'}
          </p>
        </div>
      )}
      

      {error && (
        <div className="error">
          Er is een fout opgetreden: {error.message}
        </div>
      )}

      <CompanyTable
          companies={companies}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
      />
    </main>
  );
}