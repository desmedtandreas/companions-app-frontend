import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useToast } from "../components/ToastProvider";
import { 
    RiAddFill,
    RiDeleteBin6Fill,
} from "@remixicon/react";
import CreateListDialog from "../components/CreateListDialog";
import DeleteListDialog from "../components/DeleteListDialog";

type List = {
    id: string;
    name: string;
    slug: string;
    description: string;
}

function ListOverview() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [lists, setLists] = useState<List[]>([]);
    const [newListName, setNewListName] = useState("");
    const [newListDescription, setNewListDescription] = useState("");
    const { showToast } = useToast();

    const fetchLists = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/lists/`);
            if (!response.ok) {
                throw new Error("Failed to fetch lists");
            }
            const data = await response.json();
            setLists(data);
        } catch (error) {
            console.error("Error fetching lists:", error);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    const handleCreateList = async () => {
        if (!newListName.trim()) {
            return;
        }

        try {
            const rest = await fetch(`${import.meta.env.VITE_API_URL}api/lists/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newListName,
                    description: newListDescription,
                }),
            });

            if (rest.ok) {
                showToast(`Lijst "${newListName}" aangemaakt!`, 'success');
                setNewListName("");
                setNewListDescription("");
                setCreateDialogOpen(false);
                fetchLists();
            } else {
                const error = await rest.json();
                showToast('Error creating list: ' + error.message, 'error');
                setDeleteDialogOpen(true);
            }
        } catch (error) {
            console.error("Error creating list:", error); 
        }
    };

    const handleDeleteList = async (listId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/lists/${listId}/`, {
                method: "DELETE",
            });

            if (response.ok) {
                showToast('Lijst verwijderd!', 'success');
                fetchLists();
            } else {
                const error = await response.json();
                showToast('Error deleting list: ' + error.message, 'error');
            }
        } catch (error) {
            console.error("Error deleting list:", error);
        }
    };

    return (
        <Layout>

            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-semibold mt-12 mb-8">Lijsten</h1>
                <div 
                    className="flex items-center pl-3 pr-5 h-11 bg-green-400 rounded-md shadow hover:bg-green-300 cursor-pointer"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <RiAddFill className='w-6 h-6 text-white mr-2 ml-0'/>
                    <span className='text-white text-sm font-medium'>Maak lijst</span>
                </div>
            </div>

            <CreateListDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                name={newListName}
                description={newListDescription}
                onNameChange={setNewListName}
                onDescriptionChange={setNewListDescription}
                onCreate={handleCreateList}
            />

            <div className="grid grid-cols-3 gap-4 mt-5">
                {lists.map((list) => (
                    <a key={list.id} className="p-4 bg-gray-50 border-gray-200 border-2 rounded-md shadow-lg" href={`/list/${list.slug}/`}>
                        <div className="flex items-start justify-between">
                            <h3 className='text-gray-900 font-medium text-lg m-0'>{list.name}</h3>
                            <RiDeleteBin6Fill
                                className='w-4 h-4 text-red-400 cursor-pointer hover:text-red-500'
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDeleteDialogOpen(true);
                                }}
                            />

                            <DeleteListDialog
                                open={deleteDialogOpen}
                                onOpenChange={setDeleteDialogOpen}
                                listName={list.name}
                                onConfirm={() => handleDeleteList(list.id)}
                            />
                        </div>

                        <div className='flex items-center mt-2'>
                            <p className='text-gray-500 text-sm line-clamp-2'>
                                {list.description || "Geen beschrijving beschikbaar."}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
            
        </Layout>
    );
}

export default ListOverview;