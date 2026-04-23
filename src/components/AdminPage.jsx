import { useMemo, useState } from 'react'
import { AdminPublicConfigCard } from './AdminPublicConfigCard'
import { PublicDomainCard } from './PublicDomainCard'

const TABS = [
  { id: 'content', label: 'public content' },
  { id: 'domains', label: 'domains' },
]

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('content')
  const active = useMemo(() => TABS.find((tab) => tab.id === activeTab) || TABS[0], [activeTab])

  return (
    <main className="page admin-page">
      <section className="admin-shell">
        <header className="admin-shell__header">
          <div>
            <h1>Admin</h1>
            <p>Public site content and domain plumbing only. No private-system nonsense in here.</p>
          </div>
          <nav className="admin-shell__tabs" aria-label="Admin sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={tab.id === active.id ? 'is-active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="admin-shell__body">
          {active.id === 'content' ? <AdminPublicConfigCard /> : null}
          {active.id === 'domains' ? <PublicDomainCard /> : null}
        </div>
      </section>
    </main>
  )
}
