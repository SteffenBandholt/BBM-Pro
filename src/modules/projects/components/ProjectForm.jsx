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
  const [status, setStatus] = useState(initialValues.status ?? 'geplant');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [startDate, setStartDate] = useState(initialValues.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValues.endDate ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialValues.name ?? '');
    setNumber(initialValues.number ?? '');
    setCity(initialValues.city ?? '');
    setStatus(initialValues.status ?? 'geplant');
    setDescription(initialValues.description ?? '');
    setStartDate(initialValues.startDate ?? '');
    setEndDate(initialValues.endDate ?? '');
    setError('');
  }, [
    initialValues.name,
    initialValues.number,
    initialValues.city,
    initialValues.status,
    initialValues.description,
    initialValues.startDate,
    initialValues.endDate,
  ]);

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
      status,
      description: description.trim(),
      startDate,
      endDate,
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
      <label className="field">
        <span>Status</span>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="geplant">Geplant</option>
          <option value="laufend">Laufend</option>
          <option value="abgeschlossen">Abgeschlossen</option>
        </select>
      </label>
      <label className="field">
        <span>Beschreibung</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
        />
      </label>
      <label className="field">
        <span>Startdatum</span>
        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      </label>
      <label className="field">
        <span>Enddatum</span>
        <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
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
