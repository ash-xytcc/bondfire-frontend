import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { SimpleOpsPage } from './pages/SimpleOpsPage';

const links = [
  ['overview', 'Overview'],
  ['people', 'People'],
  ['intake', 'Intake'],
  ['meetings', 'Meetings'],
  ['announcements', 'Announcements'],
  ['drive', 'Drive'],
  ['comms', 'Comms'],
  ['settings', 'Settings']
];

export default function App() {
  return (
    <div className="ops-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="eyebrow">Private ops</div>
          <h1>IWW Red Harbor</h1>
        </div>
        <nav className="sidebar-nav">
          {links.map(([slug, label]) => (
            <NavLink key={slug} to={`/${slug}`} className={({ isActive }) => isActive ? 'active' : ''}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="ops-main">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<SimpleOpsPage title="Overview" body="Dashboard cards go here: new contacts, upcoming meetings, recent announcements, recent uploads." />} />
          <Route path="/people" element={<SimpleOpsPage title="People" body="Admin-only member/contact records module." />} />
          <Route path="/intake" element={<SimpleOpsPage title="Intake" body="Public join, contact, and newsletter submissions land here." />} />
          <Route path="/meetings" element={<SimpleOpsPage title="Meetings" body="Public and internal events coordination." />} />
          <Route path="/announcements" element={<SimpleOpsPage title="Announcements" body="Internal announcements plus newsletter drafting and sends." />} />
          <Route path="/drive" element={<SimpleOpsPage title="Drive" body="Docs, uploads, folders, and shared branch resources." />} />
          <Route path="/comms" element={<SimpleOpsPage title="Comms" body="Signal links and communication norms. No native chat here, because that way lies bullshit." />} />
          <Route path="/settings" element={<SimpleOpsPage title="Settings" body="Users, roles, org config, public site config, and security settings." />} />
        </Routes>
      </main>
    </div>
  );
}
