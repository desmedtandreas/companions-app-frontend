import React, { useState } from 'react';
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
} from '@remixicon/react'

type AddVatButtonProps = {
  placeId: string;
  onSubmit: (placeId: string, vatValue: string) => void;
};

export default function AddVatButton({ placeId, onSubmit }: AddVatButtonProps) {
  const [editing, setEditing] = useState(false);
  const [vatValue, setVatValue] = useState('');

  const handleSubmit = () => {
    if (vatValue.trim()) {
      onSubmit(placeId, vatValue);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex justify-start space-x-2">
        <input
          type="text"
          value={vatValue}
          onClick={(e) => e.stopPropagation()} // ✨
          onChange={(e) => setVatValue(e.target.value)}
          placeholder="VAT number"
          className="w-[105px] px-2 py-1 -ml-2 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          className=""
          onClick={(e) => {
            e.stopPropagation(); // ✨
            handleSubmit();
          }}
        >
          <RiCheckLine className='w-5 text-green-500' />
        </button>
        <button
          className=""
          onClick={(e) => {
            e.stopPropagation(); // ✨
            setEditing(false);
          }}
        >
          <RiCloseLine className='w-5 -ml-2 text-red-500' />
        </button>
      </div>
    );
  }

  return (
    <button
      className="flex items-center justify-center w-[85px] h-5 rounded bg-green-400 hover:bg-green-500 text-white text-sm"
      onClick={(e) => {
        e.stopPropagation(); // ✨ prevent row selection click
        setEditing(true);
      }}
    >
      <RiAddLine className='w-5 h-5' />
    </button>
  );
}