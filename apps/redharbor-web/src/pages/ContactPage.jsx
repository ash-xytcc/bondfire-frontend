import { useState } from 'react';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [message, setMessage] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setMessage('Demo only. Wire this to /api/public/intake/contact in your real backend.');
  }

  return (
    <section className="card stack">
      <h2>Contact</h2>
      <p>Starter form for branch outreach. The real build should post into the private intake queue.</p>
      <form className="stack" onSubmit={submitForm}>
        <input name="name" placeholder="Name" value={form.name} onChange={updateField} />
        <input name="email" placeholder="Email" value={form.email} onChange={updateField} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={updateField} />
        <textarea name="notes" placeholder="How can we help?" rows="6" value={form.notes} onChange={updateField} />
        <button className="button" type="submit">Send</button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
    </section>
  );
}
