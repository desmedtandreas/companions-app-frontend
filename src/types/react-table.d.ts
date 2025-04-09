import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown> {
    align?: 'text-left' | 'text-right' | 'text-center';
    width?: string;
  }
}