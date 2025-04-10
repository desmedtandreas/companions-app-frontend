import * as Dialog from '@radix-ui/react-dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onConfirm: () => void;
};

export default function DeleteCompanyDialog({
  open,
  onOpenChange,
  companyName,
  onConfirm,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 fixed inset-0 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[40vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg space-y-4">
          <Dialog.Title className="text-lg font-semibold text-red-600">
            Bedrijf verwijderen uit lijst
          </Dialog.Title>

          <p className="text-sm text-gray-700">
            Weet je zeker dat je het bedrijf{' '}
            <span className="font-semibold text-gray-900">"{companyName}"</span> wilt verwijderen uit de lijst?
            Deze actie kan niet ongedaan worden gemaakt.
          </p>

          <div className="flex justify-end space-x-2 mt-4">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
                Annuleren
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Verwijderen
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}