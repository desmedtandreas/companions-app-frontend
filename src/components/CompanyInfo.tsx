import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdministratorGraph from './AdministratorGraph';
import Taglist from './TagList';
import { Badge } from './Badge';
import { 
  RiNodeTree, 
  RiBarChartFill, 
  RiDonutChartFill, 
  RiLoopLeftFill, 
  RiAddFill,
  RiCloseFill,
} from "@remixicon/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from './Table';

type Address = {
    street: string;
    house_number: string;
    postal_code: string;
    city: string;
};

type Representative = {
    first_name: string;
    last_name: string;
};

type Administrator = {
    id: number;
    administering_company: string | null;
    representatives: Representative[];
};

type Company = {
    number: string;
    name: string;
    status: string;
    enterprise_type: string;
    legalform: string;
    legalform_short: string;
    start_date: string;
    fin_fetch: string;
    website: string | null;
    tags: string[];
    addresses: Address[];
    administrators: Administrator[];
};

type KPI = {
  equity: number | null;
  turnover: number | null;
  margin: number | null;
  profit: number | null;
  net_debt: number | null;
  capex: number | null;
  remuneration: number | null;
  fte: number | null;
  real_estate: number | null;
};

type Participation = {
  id: number;
  held_company: string;
  percentage: number;
};

type AnnualAccount = {
  reference: string;
  end_fiscal_year: string;
  administrators: Administrator[];
  kpis: KPI;
  participations: Participation[];
};

type RouteParams = {
    enterprise_number: string;
};

export default function CompanyInfo() {
  const { enterprise_number } = useParams<RouteParams>();
  const [companyInfo, setCompanyInfo] = useState<Company | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [annualAccounts, setAnnualAccounts] = useState<AnnualAccount[]>([]);
  const [selectedDate, setSelectedDate] = useState("2024-01-01")
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [financialError, setFinancialError] = useState<Error | null>(null);

  const metrics = [
    { code: "21/28", label: "Activa", prefix: "€", align: "left" },
    { code: "9901", label: "Winst", prefix: "€", align: "left" },
    { code: "17/49", label: "Schulden", prefix: "€", align: "left" },
    { code: "1001", label: "Werknemers", suffix: "FTE", align: "left" },
  ]

  const kpi = [
    { tag: "equity", label: "Eigen Vermogen", prefix: "€" },
    { tag: "turnover", label: "Omzet", prefix: "€" },
    { tag: "margin", label: "Brutomarge", prefix: "€" },
    { tag: "ebitda", label: "EBITDA", prefix: "€" },
    { tag: "profit", label: "Winst/Verlies", prefix: "€" },
    { tag: "net_debt", label: "Netto Schuldpositie", prefix: "€" },
    { tag: "capex", label: "Capex Noden", prefix: "€" },
    { tag: "remuneration", label: "Bezoldigingen", prefix: "€" },
    { tag: "fte", label: "FTE", suffix: "FTE" },
    { tag: "real_estate", label: "Vastgoed", prefix: "€" },
  ];

  const loadCompanyInfo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/companies/${enterprise_number}/`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Company = await res.json();
      setCompanyInfo(data);
      setTags(data.tags);
    } catch (err) {
      setError(err as Error);
    }
  };
  
  const loadFinancialData = async (sync = false) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/companies/${enterprise_number}/annual-accounts/${sync ? '?sync=true' : ''}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: AnnualAccount[] = await res.json();
      setAnnualAccounts(data);
      setSelectedDate(data[0]?.end_fiscal_year ?? null);
      setFinancialError(null); // ✅ clear on success
    } catch (err) {
      setFinancialError(err as Error);
    }
  };

  useEffect(() => {
    if (!enterprise_number) return;
  
    setLoading(true);
  
    const fetchData = async () => {
      try {
        await loadCompanyInfo();
      } catch (err) {
        console.error("❌ Failed to fetch company info", err);
        setError(err as Error); // optional
      }
  
      try {
        await loadFinancialData();
      } catch (err) {
        console.error("⚠️ Failed to fetch financial data", err);
        setFinancialError(err as Error); // optional
      }
  
      setLoading(false);
    };
  
    fetchData();
  }, [enterprise_number]);

  const syncFinancials = async () => {
    setLoading(true);
    await loadFinancialData(true);
    setLoading(false);
  };

  const handleAddTag = async (tag: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/companies/${enterprise_number}/add-tag/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
  
      if (!response.ok) throw new Error("Failed to add tag");
      const data = await response.json();
      setTags(data.tags);
    } catch (err) {
      console.error("Failed to add tag", err);
    }
  };
  
  const handleRemoveTag = async (tag: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}api/companies/${enterprise_number}/remove-tag/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
  
      if (!response.ok) throw new Error("Failed to remove tag");
      const data = await response.json();
      setTags(data.tags);
    } catch (err) {
      console.error("Failed to remove tag", err);
    }
  };

if (loading || !companyInfo) {
  return (
    <main>
      <p>Loading...</p>
    </main>
  );
}

  return (
    <main>
      <div className='flex align-center justify-between mt-12'>
        <div className='flex items-center overflow-hidden'>
          <h1 className='text-4xl font-semibold truncate overflow-hidden whitespace-nowrap min-w-0'>{companyInfo.name}</h1>
          <h1 className='text-4xl font-light text-slate-400 ml-2'>{companyInfo.legalform_short}</h1>
          <Badge className='m-5' variant="success">
            {companyInfo.status}
          </Badge>
        </div>
        {companyInfo.fin_fetch && (
        <div className='items-center hidden md:flex'>

          <span className='text-xs text-right text-gray-400'>
            Synchronisatie: <br />{companyInfo.fin_fetch}
          </span>
          <RiLoopLeftFill 
            className='w-4 h- ml-3 cursor-pointer text-green-500'
            onClick={syncFinancials}
          />
          
        </div>
      )}
      </div>
      <div className="mt-10">
        <h3 className='text-l font-semibold'>Bedrijfsinformatie</h3>
        <div className="grid grid-flow-col grid- grid-rows-2 grid-cols-[auto_auto_auto_minmax(_25%,_25%)] gap-6 mt-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Ondernemingsnummer</p>
            <p className="font-medium">BE {companyInfo.number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Adres</p>
            <p className="font-medium">
              {companyInfo.addresses[0].street} {companyInfo.addresses[0].house_number}, {companyInfo.addresses[0].postal_code} {companyInfo.addresses[0].city}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="font-medium">{companyInfo.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Type</p>
            <p className="font-medium">{companyInfo.enterprise_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Oprichting</p>
            <p className="font-medium">{companyInfo.start_date}</p>
          </div>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            <p className="text-sm text-gray-500 mb-1">Website</p>
            <a 
              href={companyInfo.website || "#"} 
              className="font-medium overflow-hidden text-ellipsis whitespace-nowrap" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {companyInfo.website || "-"}
            </a>
          </div>
          <div className="row-span-2">
            <div className="max-w-[">
              <p className="text-sm text-gray-500 mb-1">Tags</p>
              <Taglist
                tags={tags}
                onAdd={handleAddTag}
                onRemove={handleRemoveTag}
              />
            </div>
          </div>
        </div>
      </div>

      <Tabs className="mt-14" defaultValue="tab1">
        <TabsList variant="line">
          <TabsTrigger value="tab1" className="inline-flex gap-2">
            <RiDonutChartFill className="-ml-1 size-4" aria-hidden="true" />
            KPI's
          </TabsTrigger>
          <TabsTrigger value="tab2" className="inline-flex gap-2">
            <RiNodeTree className="-ml-1 size-4" aria-hidden="true" />
            Structuur
          </TabsTrigger>
          <TabsTrigger value="tab3" className="inline-flex gap-2">
            <RiBarChartFill className="-ml-1 size-4" aria-hidden="true" />
            Financieel
          </TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="tab1">
            {financialError || annualAccounts.length === 0 ? (
              <div className="flex items-center justify-center h-96 shadow rounded-md border border-gray-100 p-3 bg-gray-50">
                <p className="text-gray-500">
                  {financialError
                    ? `Fout bij het ophalen van financiële gegevens: ${financialError.message}`
                    : "Geen financiële gegevens beschikbaar."}
                </p>
              </div>
            ) : (
            <TableRoot className="rounded-md shadow border-gray-100">
              <Table>
                <TableHead className="bg-gray-100">
                  <TableRow>
                    <TableHeaderCell className="w-[15%] font-normal"></TableHeaderCell>
                    {annualAccounts.map((account) => (
                      <TableHeaderCell key={account.reference} className="text-right">
                        {account.end_fiscal_year}
                      </TableHeaderCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kpi.map((metric) => (
                    <TableRow key={metric.tag}>
                      <TableHeaderCell>{metric.label}</TableHeaderCell>
                      {annualAccounts.map((account) => {
                        const raw = account.kpis?.[metric.tag as keyof KPI]
                        const value =
                          typeof raw === "number"
                            ? raw.toLocaleString("nl-BE")
                            : raw ?? "-"

                        return (
                          <TableCell key={account.reference} className="text-right">
                            {metric.prefix ? `${metric.prefix} ` : ""}
                            {value}
                            {metric.suffix ? ` ${metric.suffix}` : ""}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableRoot>
            )}
          </TabsContent>
          <TabsContent value="tab2">
            {financialError || annualAccounts.length === 0 ? (
              <div className="flex items-center justify-center h-96 shadow rounded-md border border-gray-100 p-3 bg-gray-50">
                <p className="text-gray-500">
                  {financialError
                    ? `Fout bij het ophalen van financiële gegevens: ${financialError.message}`
                    : "Geen financiële gegevens beschikbaar."}
                </p>
              </div>
            ) : (
            <div className="flex gap-4">
              <Tabs
                value={selectedDate}
                onValueChange={setSelectedDate}
                orientation="vertical"
              >
                <TabsList
                  orientation="vertical"
                  variant="line"
                  className="min-w-[120px]"
                >
                  {annualAccounts.map((account) => (
                    <TabsTrigger key={account.reference} value={account.end_fiscal_year}>
                      {account.end_fiscal_year}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Optional: if you want to add per-tab content later */}
                <div className="ml-2 hidden">
                  {annualAccounts.map((account) => (
                    <TabsContent
                      key={account.reference}
                      value={account.end_fiscal_year}
                    />
                  ))}
                </div>
              </Tabs>

              <div className="flex-1 rounded-md shadow border border-gray-100 p-3 bg-gray-50">
                <AdministratorGraph
                  key={selectedDate}
                  administrators={
                    annualAccounts.find((a) => a.end_fiscal_year === selectedDate)?.administrators ?? []
                  }
                  participations={
                    annualAccounts.find((p) => p.end_fiscal_year === selectedDate)?.participations ?? []
                  }
                  companyName={companyInfo.name}
                  companyId={companyInfo.number}
                />
              </div>
            </div>
            )}
          </TabsContent>
          <TabsContent value="tab3">
            {financialError || annualAccounts.length === 0 ? (
              <div className="flex items-center justify-center h-96 shadow rounded-md border border-gray-100 p-3 bg-gray-50">
                <p className="text-gray-500">
                  {financialError
                    ? `Fout bij het ophalen van financiële gegevens: ${financialError.message}`
                    : "Geen financiële gegevens beschikbaar."}
                </p>
              </div>
            ) : (
              <div>Your content for tab 3 goes here.</div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
