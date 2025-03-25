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
      <div style={{ display: 'flex', gap: '5px' }}>
        <input
          type="text"
          value={vatValue}
          onChange={(e) => setVatValue(e.target.value)}
          placeholder="VAT number"
          style={{ padding: '5px', fontSize: '0.9rem', width: '120px' }}
        />
        <button onClick={handleSubmit}>✔</button>
        <button onClick={() => setEditing(false)}>✖</button>
      </div>
    );
  }

  return (
    <button className="add-vat-btn" onClick={() => setEditing(true)}>
      +
    </button>
  );
}