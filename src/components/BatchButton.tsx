import { useState, useEffect } from 'react';
import { RiAddFill, RiMenuAddFill } from '@remixicon/react';
import CreateListDialog from './CreateListDialog';
import { useToast } from './ToastProvider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './Select';

type List = {
    id: string;
    slug: string;
    name: string;
}

interface BatchButtonProps {
    rowSelection: Record<string, unknown>;
    text?: string;
    onAdd: (listSlug: string) => void;
    useDelete: boolean;
    onDelete?: () => void;
    
}

function BatchButton({ rowSelection, text, onAdd, useDelete, onDelete }: BatchButtonProps) {
    const [selectedListSlug, setSelectedListSlug] = useState<string | undefined>(undefined);
    const [selectOpen, setSelectOpen] = useState(false);
    const [lists, setLists] = useState<List[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [newListDescription, setNewListDescription] = useState("");
    const [newListId, setNewListId] = useState<string | undefined>(undefined);
    const selectedCount = Object.keys(rowSelection).length;
    const isEnabled = selectedCount > 0;
    const { showToast } = useToast();

    const buttonClass = isEnabled
        ? 'flex-shrink-0 flex items-center text-sm text-white bg-[#21284f] h-9 px-4 rounded-md shadow cursor-pointer'
        : 'flex-shrink-0 flex items-center text-sm text-gray-400 bg-gray-200 h-9 px-4 rounded-md shadow cursor-not-allowed';

    const deleteButtonClass = isEnabled
        ? 'flex items-center bg-red-500 rounded-md shadow px-4 py-2 text-white text-sm h-[40px] cursor-pointer'
        : 'flex items-center bg-gray-200 rounded-md shadow px-4 py-2 text-gray-400 text-sm h-[40px] cursor-not-allowed';
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

    const handleAdd = () => {
        if (!selectedListSlug) return;
        onAdd(selectedListSlug); 
    };

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
                const data = await rest.json();
                showToast(`Lijst "${data.name}" aangemaakt!`, 'success');
                setNewListName("");
                setNewListDescription("");
                setCreateDialogOpen(false);
                setSelectedListSlug(data.slug);
                setLists(prev => [...prev, data]);
            } else {
                const error = await rest.json();
                showToast('Error creating list: ' + error.message, 'error');
            }
        } catch (error) {
            console.error("Error creating list:", error); 
        }
    };

    return (
        <div>
            <div className='flex items-center space-x-2'>
                {useDelete && (
                    <div 
                        className={deleteButtonClass} 
                        onClick={isEnabled ? onDelete : undefined}
                    >
                        Verwijder
                    </div>
                )}
                <div className='flex items-center w-[450px] p-1 bg-gray-100 rounded-md shadow border-gray-200 border space-x-1'>
                    <div 
                        className={buttonClass}
                        onClick={isEnabled ? handleAdd : undefined}
                    >
                        <RiMenuAddFill className='mr-3 h-4 w-4 m-0' />
                        {text || 'Voeg toe aan lijst'}
                    </div>
                    <Select
                        value={selectedListSlug}
                        onValueChange={(value) => {
                            setSelectedListSlug(value);
                            setSelectOpen(false);
                        }}
                        disabled={!isEnabled}
                        open={selectOpen}
                        onOpenChange={setSelectOpen}
                    >
                        <SelectTrigger className='h-9'>
                            <SelectValue placeholder="Kies een lijst" />
                        </SelectTrigger>
                        <SelectContent>
                            {lists.map(list => (
                                <SelectItem key={list.id} value={list.slug}>{list.name}</SelectItem>
                            ))}
                            <div className="px-1 pt-2 pb-1 border-t border-gray-100">
                                <button
                                    className="w-full flex items-center text-left text-sm px-3 py-2 font-medium text-green-500 bg-green-50 hover:bg-green-100 rounded cursor-pointer"
                                    onClick={() => {
                                        setSelectedListSlug(undefined);
                                        setSelectOpen(false);
                                        setCreateDialogOpen(true);
                                    }}
                                >
                                    <RiAddFill className='ml-0 mr-2 h-5 w-5 m-0 text-green-500' />
                                    Nieuwe lijst
                                </button>
                            </div>
                        </SelectContent>
                    </Select>
                </div>
                {selectedCount > 0 && (
                    <p className='text-sm ml-5'>
                    {selectedCount} {Object.keys(rowSelection).length > 1 ? 'geselecteerde bedrijven' : 'geselecteerd bedrijf'}
                    </p>
                )}
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
        </div>
    );
}

export default BatchButton;