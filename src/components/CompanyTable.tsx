import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  createColumnHelper,
  OnChangeFn,
  RowSelectionState,
  SortingFn,
  ColumnMeta,
  Row,
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

type Address = {
    street: string;
    house_number: string;
    postal_code: string;
    city: string;
};

type Company = {
    number: string;
    name: string;
    start_date: string;
    addresses?: Address[];
};

type Props = {
  companies: Company[];
  rowSelection: Record<string, boolean>;
  setRowSelection: OnChangeFn<RowSelectionState>;
};

export default function CompanyTable({ companies, rowSelection, setRowSelection }: Props) {
  const columnHelper = createColumnHelper<Company>();
  const navigate = useNavigate();

  const caseInsensitiveSort: SortingFn<any> = (rowA, rowB, columnId) => {
    const a = rowA.getValue(columnId);
    const b = rowB.getValue(columnId);
  
    const strA = typeof a === 'string' ? a.toLowerCase() : '';
    const strB = typeof b === 'string' ? b.toLowerCase() : '';
  
    return strA.localeCompare(strB);
  };

  const columns = React.useMemo<ColumnDef<Company, any>[]>(
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
      columnHelper.accessor('name', {
        header: 'Naam',
        cell: (info) => {
          const row = info.row.original;
          return row.name ? (
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent row toggle
                navigate(`/company/${row.number}`);
              }}
              className="text-left font-semibold w-full hover:underline focus:outline-none"
            >
              {row.name}
            </button>
          ) : (
            '-'
          );
        },
        enableSorting: true,
        sortingFn: caseInsensitiveSort,
        meta: { 
            align: 'text-left',
            width: 'w-4/12',
        },
      }),
      columnHelper.accessor('addresses', {
        header: 'Adres',
        cell: (info) => {
            const row = info.row.original;
            return row.addresses && row.addresses.length > 0 ? (
                `${row.addresses[0].street} ${row.addresses[0].house_number}, ${row.addresses[0].postal_code} ${row.addresses[0].city}`
            ) : (
                '-'
            );
        },
        enableSorting: false,
        meta: { 
            align: 'text-left',
            width: 'w-3/12',
            
        },
      }),
      {
        id: 'number',
        header: 'BTW-Nummer',
        accessorFn: (row) => row.number,
        cell: (info) => {
          const value = info.row.original.number;
          return value
            ? 'BE' + value
            : '-';
        },
        enableSorting: false,
        meta: { 
          align: 'text-left',
          width: 'w-2/12'
        },
      },
      columnHelper.accessor('start_date', {
        header: 'Oprichting',
        cell: (info) => info.getValue() || '-',
        enableSorting: true,
        meta: { 
          align: 'text-left',
          width: 'w-2/12' 
        },
      }),
      {
        id: 'rating',
        header: 'Rating',
        cell: () => <div className="rating" />,
        enableSorting: false,
        meta: { 
          align: 'text-right',
          width: 'w-[60px] pl-0' 
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: companies,
    columns,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
        sorting: [
            {
                id: 'name', // specify the column to sort by
                desc: false, // specify the sort direction
            },
        ],
    },
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
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    header.column.columnDef.meta?.width ?? '',
                    header.column.columnDef.meta?.align ?? '',
                    header.column.getCanSort() 
                        ? 'cursor-pointer select-none' 
                        : '',
                    'py-3',
                  )}
                  tabIndex={header.column.getCanSort() ? 0 : -1}
                  aria-sort={
                    header.column.getIsSorted() === false
                      ? "none"
                      : header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : "descending"
                  }
                >
                <div
                    className={classNames(
                      header.column.columnDef.enableSorting === true
                        ? 'flex items-center justify-between gap-2 hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted'
                        : header.column.columnDef.meta?.align,
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getCanSort() ? (
                      <div className="-space-y-2">
                        <RiArrowUpSLine
                          className={classNames(
                            'size-4 text-tremor-content-strong dark:text-dark-tremor-content-strong',
                            header.column.getIsSorted() === 'desc'
                              ? 'opacity-30'
                              : '',
                          )}
                          aria-hidden={true}
                        />
                        <RiArrowDownSLine
                          className={classNames(
                            'size-4 text-tremor-content-strong dark:text-dark-tremor-content-strong',
                            header.column.getIsSorted() === 'asc'
                              ? 'opacity-30'
                              : '',
                          )}
                          aria-hidden={true}
                        />
                      </div>
                    ) : null}
                  </div>
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