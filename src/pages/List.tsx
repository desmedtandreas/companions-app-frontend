import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RiDeleteBin6Fill, RiPencilFill, RiLink, RiFileExcel2Fill } from "@remixicon/react";
import DeleteListDialog from "../components/DeleteListDialog";
import DeleteCompanyDialog from "../components/DeleteCompanyDialog";
import UpdateListDialog from "../components/UpdateListDialog";
import { useToast } from "../components/ToastProvider";
import BatchButton from "../components/BatchButton";
import ListCompanyTable from "../components/ListCompanyTable";

type keyfigures = {
    equity: number | null;
    turnover: number | null;
    margin: number | null;
    ebitda: number | null;
    profit: number | null;
    net_debt: number | null;
    capex: number | null;
    remuneration: number | null;
    fte: number | null;
    real_estate: number | null;
  };

type Company = {
    id: string;
    name: string;
    number: string;
    start_date: string;
    address: string;
    website: string;
    keyfigures: keyfigures
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


export function formatDateTimeShort(isoDate?: string): React.ReactElement | null {
  if (!isoDate) return null;

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return null; // Handle invalid date

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return (
    <>
      {day}/{month}/{year}
      <br />
      {hours}:{minutes}
    </>
  );
}
  

function List() {
    const { slug } = useParams<RouteParams>();
    const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);
    const [deleteCompanyDialogOpen, setDeleteCompanyDialogOpen] = useState(false);
    const [updateListDialogOpen, setUpdateListDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [newListName, setNewListName] = useState("");
    const [newListDescription, setNewListDescription] = useState("");
    const [list, setList] = useState<List>();
    const [rowSelection, setRowSelection] = useState({});
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

    const handleUpdateList = async () => {
        if (!newListName.trim()) {
            return;
        }
    
        try {
            const rest = await fetch(`${import.meta.env.VITE_API_URL}api/lists/${slug}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newListName,
                    description: newListDescription,
                }),
            });
    
            if (rest.ok) {
                showToast(`Lijst "${newListName}" bijgewerkt!`, 'success');
                setNewListName("");
                setNewListDescription("");
                setUpdateListDialogOpen(false); // Assuming you have a separate dialog for updating
                if (slug) fetchList(slug); // Refresh list data
            } else {
                const error = await rest.json();
                showToast('Error updating list: ' + error.message, 'error');
            }
        } catch (error) {
            console.error("Error updating list:", error);
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

    const handleDeleteCompanies = async () => {
        if (!list) return;
      
        const selectedCompanyNumbers = Object.keys(rowSelection)
          .map((rowId) => list.items[parseInt(rowId)]?.company.number)
          .filter(Boolean);
      
        if (selectedCompanyNumbers.length === 0) {
          showToast('Geen bedrijven geselecteerd.', 'info');
          return;
        }
      
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}api/lists/${list.slug}/remove-companies/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ companies: selectedCompanyNumbers }),
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
            `${selectedCompanyNumbers.length} bedrijf/bedrijven succesvol verwijderd uit de lijst.`,
            "success"
          );
      
          setRowSelection({}); // Clear selection
          fetchList(list.slug); // Reload updated list
      
        } catch (error) {
          console.error("Error deleting companies:", error);
          showToast("Fout bij verwijderen uit lijst", "error");
        }
      };

      const handleAddToList = async (listId: string) => {
        const selectedCompanyNumbers = Object.keys(rowSelection)
          .map((rowId) => list?.items[parseInt(rowId)]?.company?.number)
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

      const handleExport = async () => {
        if (!list) return;

        const selectedCompanyNumbers = Object.keys(rowSelection)
          .map((rowId) => list.items[parseInt(rowId)]?.company?.number)
          .filter(Boolean);
      
        const body = selectedCompanyNumbers.length > 0 ? { companies: selectedCompanyNumbers } : {};
      
        const res = await fetch(`${import.meta.env.VITE_API_URL}api/lists/${list.slug}/export-excel/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      
        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'bedrijven.xlsx';
          document.body.appendChild(a);
          a.click();
          a.remove();
        } else {
          showToast('Export mislukt.', 'error');
        }
      };
      

    useEffect(() => {
        if (slug) {
            fetchList(slug);
        }
    }, [slug]);

    return (
        <Layout>
            <div className="flex justify-between items-center mt-12">
                <h1 className="text-4xl font-semibold">{list?.name || "..."}</h1>
                <div className="flex items-center space-x-2">
                    <div 
                        className="flex items-center pl-2 pr-3 h-9 bg-gray-300 rounded-md shadow hover:bg-gray-500 cursor-pointer"
                        onClick={() => {
                            setNewListName(list?.name || "");
                            setNewListDescription(list?.description || "");
                            setUpdateListDialogOpen(true);
                          }}
                    >
                        <RiPencilFill className='w-4 h-4 text-white ml-1'/>
                    </div>
                    <div 
                        className="flex items-center pl-2 pr-3 h-9 bg-red-300 rounded-md shadow hover:bg-red-500 cursor-pointer"
                        onClick={() => setDeleteListDialogOpen(true)}
                    >
                        <RiDeleteBin6Fill className='w-4 h-4 text-white ml-1'/>
                    </div>
                </div>
            </div>

            <DeleteListDialog
                open={deleteListDialogOpen}
                onOpenChange={setDeleteListDialogOpen}
                listName={list?.name || ""}
                onConfirm={() => list && handleDeleteList(list.slug)}
            />

            <DeleteCompanyDialog
            open={deleteCompanyDialogOpen}
            onOpenChange={setDeleteCompanyDialogOpen}
            selectedCount={Object.keys(rowSelection).length}
            onConfirm={() => {
                handleDeleteCompanies();
                setDeleteCompanyDialogOpen(false); // Close after confirm
            }}
            />

            <UpdateListDialog
                open={updateListDialogOpen}
                onOpenChange={setUpdateListDialogOpen}
                name={newListName}
                description={newListDescription} 
                onNameChange={setNewListName}
                onDescriptionChange={setNewListDescription}
                onUpdate={handleUpdateList}
            />

            <div className="grid grid-cols-5 gap-4 mt-10">
                <div className="col-span-2">
                    <h3 className='text-l font-semibold'>Beschrijving</h3>
                    <p className='text-sm text-gray-500 mt-2'>{list?.description || "Geen beschrijving beschikbaar."}</p>
                </div>
                <div>
                    <h3 className='text-2xl font-semibold'>{list?.items?.length}</h3>
                    <p className='text-sm text-gray-500 mt-0'>Bedrijven</p>
                </div>
                <div>
                    <h3 className='text-l font-semibold'>Gewijzigd</h3>
                    <p className='text-sm text-gray-500 mt-2'>{formatDateTime(list?.updated_at) || "Onbekend"}</p>
                </div>
                <div>
                    <h3 className='text-l font-semibold'>Aangemaakt</h3>
                    <p className='text-sm text-gray-500 mt-2'>{formatDateTime(list?.created_at) || "Onbekend"}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-10 mb-3">
                <BatchButton
                    rowSelection={rowSelection}
                    onAdd={handleAddToList}
                    useDelete={true}
                    onDelete={() => setDeleteCompanyDialogOpen(true)}
                />
                <div 
                 className='flex items-center bg-[#1D6F42] rounded-md shadow px-4 py-2 text-white font-medium text-sm h-[40px]'
                 onClick={handleExport}
                >
                    <RiFileExcel2Fill className='w-4 h-4 mr-2 ml-0'/>
                    <span className='text-white text-sm font-medium'>Exporteren</span>
                </div>
            </div>

            {list?.items?.length ? (
                <ListCompanyTable
                    items={list.items}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
                // <TableRoot className="mt-3 rounded-md shadow border border-gray-100">
                //     <Table>
                //         <TableHead>
                //             <TableRow className="bg-gray-100">
                //             <TableHeaderCell className="text-left w-1/4">Bedrijf</TableHeaderCell>
                //             <TableHeaderCell className="text-left">EBITDA</TableHeaderCell>
                //             <TableHeaderCell className="text-left">Winst/Verlies</TableHeaderCell>
                //             <TableHeaderCell className="text-left">Eigen Verm.</TableHeaderCell>
                //             <TableHeaderCell className="text-left">Brutomarge</TableHeaderCell>
                //             <TableHeaderCell className="hidden xl:table-cell text-left">Toegevoegd</TableHeaderCell>
                //             <TableHeaderCell className="text-left w-[60px]"></TableHeaderCell>
                //             </TableRow>
                //         </TableHead>
                //         <TableBody>
                //             {list.items.map((item) => (
                //             <TableRow key={item.company.number}>
                //                 <TableCell className='font-medium'>
                //                     <div className="flex items-center">
                //                         <h3>
        
                //                             <a 
                //                                 href={`/company/${item.company.number}`}
                //                                 target="_blank"
                //                                 rel="noopener noreferrer"
                //                                 className="inline text-gray-700 font-medium w-full hover:underline focus:outline-none"
                //                             >
                //                                 {item.company.name}     
                //                             </a>
                //                         </h3>
                //                         <a
                //                             href={item.company.website}
                //                             target="_blank"
                //                             rel="noopener noreferrer"
                //                         >
                //                             <RiLink className='ml-2 w-4 h-4 text-gray-400 hover:text-gray-500' />
                //                         </a>
                //                     </div>
                                    
                //                     <p className='text-gray-500 font-normal text-xs mt-1 line-clamp-1'>
                //                         {item.company.address}
                //                     </p>
                //                     <p className='text-gray-500 font-normal text-xs mt-1'>
                //                         BE{item.company.number}
                //                     </p>
                //                 </TableCell>
                //                 <TableCell className='font-medium'>
                //                     {item.company.keyfigures?.ebitda != null
                //                         ? `€ ${(item.company.keyfigures?.ebitda as number)?.toLocaleString("nl-BE")}`
                //                         : <span className="text-gray-400 italic">Geen data</span>}
                //                 </TableCell>
                //                 <TableCell className='font-medium'>
                //                     {item.company.keyfigures?.profit != null
                //                         ? `€ ${(item.company.keyfigures?.profit as number)?.toLocaleString("nl-BE")}`
                //                         : <span className="text-gray-400 italic">Geen data</span>}
                //                 </TableCell>
                //                 <TableCell className='font-medium'>
                //                     {item.company.keyfigures?.equity != null
                //                         ? `€ ${(item.company.keyfigures?.equity as number)?.toLocaleString("nl-BE")}`
                //                         : <span className="text-gray-400 italic">Geen data</span>}
                //                 </TableCell>
                //                 <TableCell className='font-medium'>
                //                     {item.company.keyfigures?.margin != null
                //                         ? `€ ${(item.company.keyfigures?.margin as number)?.toLocaleString("nl-BE")}`
                //                         : <span className="text-gray-400 italic">Geen data</span>}
                //                 </TableCell>
                //                 <TableCell className='hidden xl:table-cell font-normal text-xs'>
                //                     {formatDateTimeShort(item.created_at)}
                //                 </TableCell>
                //                 <TableCell >
                //                     <RiDeleteBin6Fill
                //                         className='w-4 h-4 text-red-400 cursor-pointer hover:text-red-500'
                //                         onClick={() => setSelectedCompany(item.company)}
                //                     />
                //                 </TableCell>
                //             </TableRow>
                //             ))}
                //         </TableBody>
                //     </Table>
                // </TableRoot>
                ) : (
                <div className="flex items-center justify-center bg-gray-100 h-96 rounded-md shadow mt-10 text-center text-sm text-gray-500">
                    <h3 className="text-lg">Nog geen bedrijven toegevoegd!</h3>
                </div>
                )}
            
        </Layout>
    );
}

export default List;