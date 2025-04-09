import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  createColumnHelper,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from './Table';

import AddVatButton from './AddVatButton';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

function IndeterminateCheckbox({
  indeterminate,
  className,
  ...rest
}: {
  indeterminate?: boolean;
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const ref = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (ref.current && typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={classNames(
        'size-4 rounded border-tremor-border text-tremor-brand shadow-tremor-input focus:ring-tremor-brand-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-brand dark:shadow-dark-tremor-input dark:focus:ring-dark-tremor-brand-muted',
        className
      )}
      {...rest}
    />
  );
}

type Place = {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  vat_number?: string;
  company_name?: string;
  company_id?: string;
};

type Props = {
  places: Place[];
  onVatSubmit: (placeId: string, vatValue: string, website?: string) => void;
  rowSelection: Record<string, boolean>;
  setRowSelection: OnChangeFn<RowSelectionState>;
};

export default function PlacesTable({ places, onVatSubmit, rowSelection, setRowSelection }: Props) {
  const columnHelper = createColumnHelper<Place>();
  const navigate = useNavigate();

  const columns = React.useMemo<ColumnDef<Place, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler() as (e: React.ChangeEvent<HTMLInputElement>) => void}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler() as (e: React.ChangeEvent<HTMLInputElement>) => void}
          />
        ),
        enableSorting: false,
        meta: {
          align: 'text-left',
          width: 'w-[15px] pr-5',
        },
      },
      columnHelper.accessor('company_name', {
        header: 'Naam',
        cell: (info) => {
          const row = info.row.original;
          return row.vat_number ? (
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent row toggle
                navigate(`/company/${row.vat_number}`);
              }}
              className="text-left font-medium w-full hover:underline focus:outline-none"
            >
              {row.company_name}
            </button>
          ) : (
            '-'
          );
        },
        meta: { align: 'text-left' },
      }),
      columnHelper.accessor('formatted_address', {
        header: 'Adres',
        cell: (info) => info.getValue(),
        meta: { align: 'text-left' },
      }),
      {
        id: 'vat_number',
        header: 'BTW-Nummer',
        accessorFn: (row) => row.vat_number,
        cell: (info) => {
          const value = info.row.original.vat_number;
          return value ? (
            value
          ) : (
            <AddVatButton placeId={info.row.original.place_id} onSubmit={onVatSubmit} />
          );
        },
        meta: { 
          align: 'text-left',
          width: 'w-[165px]' 
        },
      },
      columnHelper.accessor('website', {
        header: 'Website',
        cell: (info) => info.getValue() || '-',
        meta: { 
          align: 'text-left',
          width: 'w-[200px]' 
        },
      }),
      {
        id: 'rating',
        header: 'Rating',
        cell: () => <div className="rating" />,
        meta: { 
          align: 'text-right',
          width: 'w-[90px]' 
        },
      },
    ],
    [onVatSubmit]
  );

  const table = useReactTable({
    data: places,
    columns,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection,
    },
  });

  return (
    <TableRoot className="mt-10 rounded-md shadow border-gray-100">
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className='bg-gray-100' key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHeaderCell
                  key={header.id}
                  className={classNames(
                    header.column.columnDef.meta?.width ?? '',
                    header.column.columnDef.meta?.align ?? ''
                  )}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted"
              onClick={() => row.toggleSelected(!row.getIsSelected())}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={classNames(
                    row.getIsSelected() ? 'bg-gray-100' : '',
                    cell.column.columnDef.meta?.width ?? '',
                    cell.column.columnDef.meta?.align ?? ''
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableRoot>
  );
}