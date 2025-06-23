import Layout from '../components/Layout';
import BelgiumMap from '../components/BelgiumMap';
import { 
    TableRoot, 
    Table, 
    TableHead, 
    TableRow,
    TableCell,
    TableBody,
    TableHeaderCell } from '../components/Table';
import * as XLSX from 'xlsx';
import { useState, ChangeEvent } from 'react';
import { RiFolderOpenFill, RiDownloadLine } from '@remixicon/react';

type Company = {
    name: string;
    address: string;
    valueChain: string;
}

function Heatmap() {
    const [scoreFile, setScoreFile] = useState<File | null>(null);
    const [companyFile, setCompanyFile] = useState<File | null>(null);
    const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
    const [companies, setCompanies] = useState<Array<Company>>([]);

    const [selectedCompanyIndex, setSelectedCompanyIndex] = useState<number | null>(null);

    const parseScoreExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: Array<{ Gemeente: string; Score: string | number }> =
            XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const map: Record<string, number> = {};
        rows.forEach((r) => {
            const name = String(r.Gemeente).trim();
            const raw =
            typeof r.Score === 'string' ? r.Score.replace(',', '.') : String(r.Score);
            const n = parseFloat(raw);
            if (!Number.isNaN(n)) map[name] = n;
        });

        setScoreMap(map);
        };
        reader.readAsArrayBuffer(file);
    };

    const onScoreFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setScoreFile(file);
        parseScoreExcel(file); // immediately parse!
    };

    const parseCompanyFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json<{
            Name: string;
            Postcode?: string;
            Gemeente?: string;
            Straat?: string;
            Nummer?: string | number;
            'Value Chain': string;
        }>(wb.Sheets[wb.SheetNames[0]], { defval: '' });

        const comps: Company[] = rows.map(r => ({
            name:       r.Name,
            address:    `${r.Straat || ''} ${r.Nummer || ''}, ${r.Postcode || ''} ${r.Gemeente || ''}`.trim(),
            valueChain: r['Value Chain']
        }));

        setCompanies(comps);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <Layout>
            <div className="flex">
                <h1 className="text-4xl font-semibold mt-12 mb-8">Heatmap</h1>
            </div>

            <div className="flex space-x-3 justify-between items-end">
                <div className="flex space-x-3 items-end">
                    <div className="w-full">
                        <p className="text-sm mb-2">Bedrijvenlijst</p>
        
                        <label className="block relative w-full cursor-pointer">
                        <div className="h-10 flex items-center text-sm">
                            <div className="flex items-center px-4 h-full  bg-[#21284f] rounded-l-md text-white z-10">
                            <RiFolderOpenFill className="w-4 mr-2" />
                            Bladeren
                            </div>
                            <div className="w-[250px] -ml-1 flex items-center pl-4 pr-5 h-full border border-gray-300 text-gray-500 font-normal z-0 rounded-md text-clip overflow-hidden whitespace-nowrap">
                            {companyFile?.name || 'Geen bestand gekozen'}
                            </div>
                        </div>
        
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setCompanyFile(file);
                            }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        </label>
                    </div>
        
                    <button
                        type="button"
                        className="flex items-center px-6 h-10 border border-[#21284f] bg-[#21284f] text-white text-sm rounded-full"
                        onClick={() => {
                        if (companyFile) {
                            parseCompanyFile(companyFile);
                        }
                        }}
                    >
                        <RiDownloadLine className="w-4 mr-2 -ml-1" />
                        Importeren
                    </button>
                </div>

                <div className="max-w-[225px] w-full">
                    <p className="text-sm mb-2 text-right">Gemeente Scores</p>

                    <label className="block relative w-full cursor-pointer">
                        <div className="h-10 flex items-center text-sm">
                            <div className="flex items-center px-4 h-full  bg-[#21284f] rounded-l-md text-white z-10 cursor-pointer">
                                <RiFolderOpenFill className="w-4" />
                            </div>
                            <div className="w-full -ml-1 flex items-center pl-4 pr-5 h-full border border-gray-300 text-gray-500 font-normal z-0 rounded-md text-clip overflow-hidden whitespace-nowrap cursor-pointer">
                                {scoreFile?.name || 'Geen bestand gekozen'}
                            </div>
                        </div>

                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={onScoreFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </label>
                </div>
            </div>

            <div className="rounded-lg overflow-hidden mt-5">
                <BelgiumMap 
                    scoreMap={scoreMap}
                    companies={companies}
                    selectedCompanyIndex={selectedCompanyIndex}
                    onCompanySelect={setSelectedCompanyIndex}
                />
            </div>

            <TableRoot className="mt-10">
                <Table>
                <TableHead>
                    <TableRow>
                    <TableHeaderCell className="w-2/8">Naam</TableHeaderCell>
                    <TableHeaderCell className="w-4/8">Adres</TableHeaderCell>
                    <TableHeaderCell className="w-2/8">Value Chain</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {companies.map((c, idx) => (
                    <TableRow 
                        key={idx}
                        className={selectedCompanyIndex === idx ? 'bg-gray-100' : ''}
                        onClick={() => setSelectedCompanyIndex(idx)}
                        style={{ cursor: 'pointer' }}
                    >
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.address}</TableCell>
                        <TableCell>{c.valueChain}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableRoot>
        </Layout>
    )
}

export default Heatmap;