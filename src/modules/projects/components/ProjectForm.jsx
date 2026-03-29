import { useState } from 'react';

export default function ProjectForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Name darf nicht leer sein.');
      return;
    }

    setError('');
    onSubmit({
      name: name.trim(),
      number: number.trim(),
      city: city.trim(),
    });
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>Projektnummer</span>
        <input value={number} onChange={(event) => setNumber(event.target.value)} />
      </label>
      <label className="field">
        <span>Ort</span>
        <input value={city} onChange={(event) => setCity(event.target.value)} />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="submit" className="button">
          Speichern
        </button>
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
