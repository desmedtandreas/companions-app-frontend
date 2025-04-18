import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RiMenuAddFill } from '@remixicon/react';
import { useToast } from './ToastProvider';
import CompanyTable from './CompanyTable';
import BatchButton from './BatchButton';

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

type List = {
  id: string;
  name: string;
};

export default function CompanySearcher() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [textQuery, setTextQuery] = useState<string>(initialQuery);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const { showToast } = useToast();

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

  const handleSearch = () => {
    navigate(`/company-search/?q=${textQuery}`);
    fetchCompanies(textQuery);
  };

  const handleAddToList = async (listId: string) => {
    const selectedCompanyNumbers = Object.keys(rowSelection)
      .map((rowId) => companies[parseInt(rowId)]?.number)
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

      <BatchButton 
        rowSelection={rowSelection}
        lists={lists}
        onAdd={handleAddToList}
      />
      
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