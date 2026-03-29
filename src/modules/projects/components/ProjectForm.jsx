import { useEffect, useState } from 'react';

export default function ProjectForm({
  onSubmit,
  onCancel,
  initialValues = {},
  submitLabel = 'Speichern',
}) {
  const [name, setName] = useState(initialValues.name ?? '');
  const [number, setNumber] = useState(initialValues.number ?? '');
  const [city, setCity] = useState(initialValues.city ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialValues.name ?? '');
    setNumber(initialValues.number ?? '');
    setCity(initialValues.city ?? '');
    setError('');
  }, [initialValues.name, initialValues.number, initialValues.city]);

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
          {submitLabel}
        </button>
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
