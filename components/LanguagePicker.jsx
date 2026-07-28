'use client';
import { useState } from 'react';

export default function LanguagePicker({ current = 'pt' }) {
  const [value, setValue] = useState(current);
  function change(e) {
    const next = e.target.value;
    setValue(next);
    document.cookie = `oud_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }
  return (
    <label className="lang-picker">
      <span aria-hidden="true">◎</span>
      <select value={value} onChange={change} aria-label="Idioma">
        <option value="pt">PT</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </label>
  );
}
