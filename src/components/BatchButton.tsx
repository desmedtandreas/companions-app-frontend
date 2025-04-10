import { useState } from 'react';
import { RiMenuAddFill } from '@remixicon/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './Select';

type List = {
    id: string;
    name: string;
}

interface BatchButtonProps {
    rowSelection: Record<string, unknown>;
    text?: string;
    lists: List[];
    onAdd: (listId: string) => void;
}

function BatchButton({ rowSelection, text, lists, onAdd }: BatchButtonProps) {
    const [selectedListId, setSelectedListId] = useState<string | undefined>(undefined);
    const selectedCount = Object.keys(rowSelection).length;
    const isEnabled = selectedCount > 0;

    const buttonClass = isEnabled
        ? 'flex-shrink-0 flex items-center text-sm text-white bg-[#21284f] h-9 px-4 rounded-md shadow cursor-pointer'
        : 'flex-shrink-0 flex items-center text-sm text-gray-400 bg-gray-200 h-9 px-4 rounded-md shadow cursor-not-allowed';

    const handleAdd = () => {
        if (!selectedListId) return;
        onAdd(selectedListId); 
    };

    return (
        <div>
            <div className='flex items-center mt-10 mb-4'>
                <div className='flex items-center w-[450px] p-1 bg-gray-100 rounded-lg shadow border-gray-200 border space-x-1'>
                    <div 
                        className={buttonClass}
                        onClick={isEnabled ? handleAdd : undefined}
                    >
                        <RiMenuAddFill className='mr-3 h-4 w-4 m-0' />
                        {text || 'Voeg toe aan lijst'}
                    </div>
                    <Select value={selectedListId} onValueChange={setSelectedListId} disabled={!isEnabled}>
                        <SelectTrigger className='h-9'>
                            <SelectValue placeholder="Kies een lijst" />
                        </SelectTrigger>
                        <SelectContent>
                            {lists.map(list => (
                                <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {selectedCount > 0 && (
                    <p className='text-sm ml-5'>
                    {selectedCount} {Object.keys(rowSelection).length > 1 ? 'geselecteerde bedrijven' : 'geselecteerd bedrijf'}
                    </p>
                )}
            </div>
        </div>
    );
}

export default BatchButton;