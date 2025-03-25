import React, { useState } from 'react';

export default function AddVatButton({ placeId, onSubmit }) {
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
      <div className='vat-wrapper'>
        <input
          type="text"
          value={vatValue}
          onChange={(e) => setVatValue(e.target.value)}
          placeholder="VAT number"
          className='input-vat'
        />
        <button className='input-vat-confirm' onClick={handleSubmit}>✔</button>
        <button className='input-vat-cancel' onClick={() => setEditing(false)}>✖</button>
      </div>
    );
  }

  return (
    <button className="add-vat-btn" onClick={() => setEditing(true)}>
      +
    </button>
  );
}