import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiLink, RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';
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

export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatTime(isoDate: string | undefined): string {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}


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
        'size-4 appearance-none rounded border border-gray-400',
        'bg-white checked:bg-blue-600 checked:border-blue-600',
        'indeterminate:bg-blue-600 indeterminate:border-blue-600',
        'focus:outline-none focus:ring-0',
        className
      )}
      {...rest}
    />
  );
}

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

type Props = {
  items: Item[];
  rowSelection: Record<string, boolean>;
  setRowSelection: OnChangeFn<RowSelectionState>;
};

export default function ListCompanyTable({ items, rowSelection, setRowSelection }: Props) {
  const columnHelper = createColumnHelper<Item>();
  const navigate = useNavigate();

  const caseInsensitiveSort: SortingFn<any> = (rowA, rowB, columnId) => {
    const a = rowA.getValue(columnId);
    const b = rowB.getValue(columnId);
  
    const strA = typeof a === 'string' ? a.toLowerCase() : '';
    const strB = typeof b === 'string' ? b.toLowerCase() : '';
  
    return strA.localeCompare(strB);
  };

  const columns = React.useMemo<ColumnDef<Item, any>[]>(
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
          width: 'w-[35px] pr-5 overflow-hidden text-clip',
        },
      },
      columnHelper.accessor((row) => row.company.name, {
        id: 'name',
        header: () => 'Bedrijf',
        cell: (info) => (
          <div>
            <div className="flex items-center">
                <h3>
                  <a 
                      href={`/company/${info.row.original.company.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline text-gray-700 font-medium w-full hover:underline focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                  >
                      {info.row.original.company.name}     
                  </a>
                </h3>
                <a
                    href={info.row.original.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <RiLink className='ml-2 w-4 h-4 text-gray-400 hover:text-gray-500' />
                </a>
            </div>
            
            <p className='text-gray-500 font-normal text-xs mt-1 line-clamp-1'>
                {info.row.original.company.address}
            </p>
            <p className='text-gray-500 font-normal text-xs mt-1'>
                BE{info.row.original.company.number}
            </p>
          </div>
        ),
        enableSorting: true,
        sortingFn: caseInsensitiveSort,
        meta: {
          align: 'text-left',
          width: 'w-1/4',
        },
      }),
      columnHelper.accessor((row) => row.company.keyfigures?.ebitda, {
        id: 'ebitda',
        header: () => 'EBITDA',
        cell: (info) =>
          info.getValue() != null
            ? `€ ${(info.getValue() as number).toLocaleString('nl-BE')}`
            : <span className="text-gray-400 italic">Geen data</span>,
        enableSorting: true,
        meta: {
          align: 'text-left',
          width: 'font-medium'
        }, 
      }),
      columnHelper.accessor((row) => row.company.keyfigures?.profit, {
        id: 'profit',
        header: () => 'Winst/Verlies',
        cell: (info) =>
          info.getValue() != null
            ? `€ ${(info.getValue() as number).toLocaleString('nl-BE')}`
            : <span className="text-gray-400 italic">Geen data</span>,
        enableSorting: true,
      }),
      columnHelper.accessor((row) => row.company.keyfigures?.equity, {
        id: 'equity',
        header: () => 'Eigen Verm.',
        cell: (info) =>
          info.getValue() != null
            ? `€ ${(info.getValue() as number).toLocaleString('nl-BE')}`
            : <span className="text-gray-400 italic">Geen data</span>,
        enableSorting: true,
        meta: {
          align: 'text-left',
          width: 'font-medium',
        },
      }),
      columnHelper.accessor((row) => row.company.keyfigures?.margin, {
        id: 'margin',
        header: () => 'Brutomarge',
        cell: (info) =>
          info.getValue() != null
            ? `€ ${(info.getValue() as number).toLocaleString('nl-BE')}`
            : <span className="text-gray-400 italic">Geen data</span>,
        enableSorting: true,
        meta: {
          align: 'text-left',
          width: 'font-medium',
        },
      }),
      columnHelper.accessor((row) => row.created_at, {
        id: 'created_at',
        header: () => 'Toegevoegd',
        cell: (info) => (
          <span>
            {formatDate(info.getValue())}
            <br />
            {formatTime(info.getValue())}
          </span>
        ),
        enableSorting: true,
        meta: {
          align: 'text-left',
          width: 'hidden xl:table-cell',
        },
      }),
      // columnHelper.display({
      //   id: 'actions',
      //   cell: (info) => (
      //     <RiDeleteBin6Fill
      //       className="w-4 h-4 text-red-400 cursor-pointer hover:text-red-500"
      //       onClick={() => setSelectedCompany(info.row.original.company)}
      //     />
      //   ),
      // }),
    ],
    []
  );

  const table = useReactTable({
    data: items,
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
    <TableRoot className="rounded-md shadow border-gray-100">
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