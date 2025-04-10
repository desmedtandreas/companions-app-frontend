import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RiDeleteBin6Fill } from "@remixicon/react";
import DeleteListDialog from "../components/DeleteListDialog";
import DeleteCompanyDialog from "../components/DeleteCompanyDialog";
import { useToast } from "../components/ToastProvider";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFoot,
    TableHead,
    TableHeaderCell,
    TableRoot,
    TableRow,
} from "../components/Table";

type Company = {
    id: string;
    name: string;
    number: string;
    start_date: string;
    address: string;
};

type Item = {
    id: string;
    company: Company;
    created_at: string;
}

type List = {
    id: string;
    name: string;
    slug: string;
    description: string;
    created_at: string;
    updated_at: string;
    items: Item[];
};

type RouteParams = {
    slug: string;
};

export function formatDateTime(isoDate: string | undefined): string {
    if (!isoDate) return "";
  
    const date = new Date(isoDate);
    return date.toLocaleString("nl-BE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

function List() {
    const { slug } = useParams<RouteParams>();
    const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);
    const [deleteCompanyDialogOpen, setDeleteCompanyDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [list, setList] = useState<List>();
    const { showToast } = useToast();

    const fetchList = async (listId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/lists/${slug}/`);
            if (!response.ok) {
                throw new Error("Failed to fetch list");
            }
            const data = await response.json();
            setList(data);
        } catch (error) {
            console.error("Error fetching list:", error);
        }
    };

    const handleDeleteList = async (listId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/lists/${listId}/`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete list");
            }

            setDeleteListDialogOpen(false);
            window.location.href = "/list-overview";
            showToast("Lijst succesvol verwijderd", "success");
        } catch (error) {
            console.error("Error deleting list:", error);
        }
    };

    const handleCompanyDelete = async (slug: string, companyNumber: string, companyName: string, onSuccess?: () => void) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}api/lists/${slug}/remove-company/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ company: companyNumber }),
            }
          );
      
          if (!response.ok) {
            const errorData = await response.json();
            showToast(
              `Fout bij verwijderen uit lijst: ${errorData.message || "Onbekend"}`,
              "error"
            );
            return;
          }
      
          const data = await response.json();
          showToast(
            `Bedrijf "${companyName}" succesvol verwijderd uit de lijst.`,
            "success"
          );
          setSelectedCompany(null);
          fetchList(slug);
            
          if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error deleting company from list:", error);
            showToast("Fout bij verwijderen uit lijst", "error");
        }
      };

    useEffect(() => {
        if (slug) {
            fetchList(slug);
        }
    }, [slug]);

    return (
        <Layout>
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-semibold mt-12 mb-8">{list?.name || "..."}</h1>
                <div 
                    className="flex items-center pl-2 pr-3 h-9 bg-red-400 rounded-md shadow hover:bg-red-300 cursor-pointer"
                    onClick={() => setDeleteListDialogOpen(true)}
                >
                    <RiDeleteBin6Fill className='w-4 h-4 text-white mr-2 ml-0'/>
                    <span className='text-white text-xs font-medium'>Verwijder</span>
                </div>
            </div>

            <DeleteListDialog
                open={deleteListDialogOpen}
                onOpenChange={setDeleteListDialogOpen}
                listName={list?.name || ""}
                onConfirm={() => list && handleDeleteList(list.slug)}
            />

            <DeleteCompanyDialog
                open={!!selectedCompany}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        setSelectedCompany(null);
                    }
                }}
                companyName={selectedCompany?.name || ""}
                onConfirm={() => 
                    list?.slug && selectedCompany?.number && handleCompanyDelete(list.slug, selectedCompany.number, selectedCompany.name)}
            />


            <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="col-span-2">
                    <h3 className='text-l font-semibold'>Beschrijving</h3>
                    <p className='text-sm text-gray-500 mt-3'>{list?.description || "Geen beschrijving beschikbaar."}</p>
                </div>
                <div>
                    <h3 className='text-l font-semibold'>Gewijzigd</h3>
                    <p className='text-sm text-gray-500 mt-3'>{formatDateTime(list?.updated_at) || "Onbekend"}</p>
                </div>
                <div>
                    <h3 className='text-l font-semibold'>Aangemaakt</h3>
                    <p className='text-sm text-gray-500 mt-3'>{formatDateTime(list?.created_at) || "Onbekend"}</p>
                </div>
            </div> 

            {list?.items?.length ? (
                <TableRoot className="mt-10 rounded-md shadow border border-gray-100">
                    <Table>
                        <TableHead>
                            <TableRow className="bg-gray-100">
                            <TableHeaderCell className="text-left">Naam</TableHeaderCell>
                            <TableHeaderCell className="text-left">Adres</TableHeaderCell>
                            <TableHeaderCell className="text-left w-1/6">BTW Nummer</TableHeaderCell>
                            <TableHeaderCell className="text-left w-1/6">Oprichting</TableHeaderCell>
                            <TableHeaderCell className="text-left w-[60px]"></TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {list.items.map((item) => (
                            <TableRow key={item.company.number}>
                                <TableCell className='font-medium'>
                                    <a 
                                        href={`/company/${item.company.number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col text-left text-gray-700 font-medium w-full hover:underline focus:outline-none"
                                    >
                                        {item.company.name}
                                    </a>
                                </TableCell>
                                <TableCell>{item.company.address}</TableCell>
                                <TableCell>{item.company.number}</TableCell>
                                <TableCell>{item.company.start_date}</TableCell>
                                <TableCell >
                                    <RiDeleteBin6Fill
                                        className='w-4 h-4 text-red-400 cursor-pointer hover:text-red-500'
                                        onClick={() => setSelectedCompany(item.company)}
                                    />
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableRoot>
                ) : (
                <div className="flex items-center justify-center bg-gray-100 h-96 rounded-md shadow mt-10 text-center text-sm text-gray-500">
                    <h3 className="text-lg">Nog geen bedrijven toegevoegd!</h3>
                </div>
                )}
            
        </Layout>
    );
}

export default List;