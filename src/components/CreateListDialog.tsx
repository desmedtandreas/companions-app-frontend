import * as Dialog from '@radix-ui/react-dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCreate: () => void;
};

export default function CreateListDialog({
  open,
  onOpenChange,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onCreate,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 fixed inset-0 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg space-y-4">
          <Dialog.Title className="text-lg font-semibold">Nieuwe lijst aanmaken</Dialog.Title>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Naam</label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Naam van lijst"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Beschrijving</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Optionele beschrijving"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">Annuleren</button>
            </Dialog.Close>
            <button
              onClick={onCreate}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Aanmaken
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}