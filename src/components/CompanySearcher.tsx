import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RiMenuAddFill, RiSearchLine, RiDownloadLine, RiFolderOpenFill } from '@remixicon/react';
import { useToast } from './ToastProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
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

export default function CompanySearcher() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [textQuery, setTextQuery] = useState<string>(initialQuery);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelColumnName, setExcelColumnName] = useState<string>("number");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const { showToast } = useToast();

  const parseVAT = (input: string): string => {
    return input
      .toUpperCase()
      .replace(/^BE\s?/, "")
      .replace(/\D/g, "");
  };

  const fetchCompanies = (query: string) => {
    if (!query) return;

    setLoading(true);
    setError(null);

    const cleanedQuery = cleanQueryInput(query);
    const url = `${import.meta.env.VITE_API_URL}api/company-search/?q=${cleanedQuery}`;
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

  const handleExcelUpload = async (file: File | null, columnName: string) => {
    if (!file) {
      showToast('Selecteer een bestand.', 'info');
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("column", columnName);
  
    const res = await fetch(`${import.meta.env.VITE_API_URL}api/company-search/upload_excel/`, {
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) {
      alert("Fout bij uploaden van Excel.");
      return;
    }
  
    const companies = await res.json();
    setCompanies(companies);
  };

  const handleBulkSearch = async () => {
    const raw = textAreaRef.current?.value || "";
  
    const numbers = raw
      .split(/[\n,]+/)
      .map((n) => parseVAT(n.trim()))
      .filter((n) => n.length > 0);
  
    if (numbers.length === 0) {
      alert("Voer geldige BTW-nummers in.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/company-search/bulk/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers }),
      });
  
      if (!res.ok) throw new Error("Fout bij ophalen van bedrijven");
  
      const data: Company[] = await res.json();
      setCompanies(data);
      setRowSelection({});
    } catch (err) {
      console.error(err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

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
      <Tabs defaultValue="tab1" className="mt-12">
        <div className="flex items-center justify-between gap-8 mb-10">
          <h1 className="text-4xl font-semibold">Bedrijven</h1>
          <TabsList className="flex gap-2" variant="solid">
            <TabsTrigger value="tab1">Zoeken</TabsTrigger>
            <TabsTrigger value="tab2">Bulk Text</TabsTrigger>
            <TabsTrigger value="tab3">Bulk File</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="tab1">
        <div className="flex items-end space-x-5">
          <div className="w-1/3">
            <p className="text-sm mb-2">Zoekwoorden</p>
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
              className="flex items-center px-7 h-10 border border-[#21284f] bg-[#21284f] text-white text-sm rounded-full mt-3"
              onClick={handleSearch}>
              <RiSearchLine className="w-4 mr-2 -ml-1" />
              Zoeken
            </button>
          </div>
        </div>
        </TabsContent>
        <TabsContent value="tab2">
            <div className="w-full">
              <p className="text-sm mb-2">Zoekwoorden</p>
              <textarea
                ref={textAreaRef}
                className="box-border h-24 rounded-md border border-gray-300 w-full m-0 text-sm"
                placeholder="Lijst aan BTW nummers, gescheiden door een spatie, comma of nieuwe regel"
              />
            </div>
            <div>
              <button type="button" 
                className="flex items-center px-7 h-10 border border-[#21284f] bg-[#21284f] text-white text-sm rounded-full mt-3"
                onClick={handleBulkSearch}>
                <RiSearchLine className="w-4 mr-2 -ml-1" />
                Zoeken
              </button>
            </div>
          </TabsContent>
          <TabsContent value="tab3" className="flex space-x-3 justify-start items-end">
            <div className="w-1/4">
              <p className="text-sm mb-2">Kolomnaam</p>
              <input
                type="text"
                placeholder="Bijv. BTW nummer"
                value={excelColumnName}
                onChange={(e) => setExcelColumnName(e.target.value)}
                className="box-border h-10 rounded-md border border-gray-300 w-full px-2 text-sm"
              />
            </div>

            <div className="w-1/3">
              <p className="text-sm mb-2">Excel bestand</p>

              <label className="block relative w-full cursor-pointer">
                <div className="h-10 flex items-center text-sm">
                  <div className="flex items-center px-4 h-full  bg-[#21284f] rounded-l-md text-white z-10">
                    <RiFolderOpenFill className="w-4 mr-2" />
                    Bladeren
                  </div>
                  <div className="w-full -ml-1 flex items-center pl-4 pr-5 h-full border border-gray-300 text-gray-500 font-normal z-0 rounded-md text-clip overflow-hidden whitespace-nowrap">
                    {selectedFile?.name || 'Geen bestand gekozen'}
                  </div>
                </div>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            <button
              type="button"
              className="flex items-center px-6 h-10 border border-[#21284f] bg-[#21284f] text-white text-sm rounded-full"
              onClick={() => handleExcelUpload(selectedFile, excelColumnName)}
            >
              <RiDownloadLine className="w-4 mr-2 -ml-1" />
              Importeren
            </button>
          </TabsContent>
      </Tabs>

      <div className="mt-12 mb-3">
        <BatchButton 
          rowSelection={rowSelection}
          onAdd={handleAddToList}
          useDelete={false}
        />
      </div>

      
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