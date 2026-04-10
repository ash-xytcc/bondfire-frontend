import { NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SimplePage } from './pages/SimplePage';
import { ContactPage } from './pages/ContactPage';

const links = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/get-involved', 'Get Involved'],
  ['/events', 'Events'],
  ['/resources', 'Resources'],
  ['/dues', 'Dues'],
  ['/contact', 'Contact']
];

export default function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div>
          <div className="eyebrow">Bondfire Platform</div>
          <h1>IWW Red Harbor</h1>
        </div>
        <nav className="site-nav">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<SimplePage title="About" body="Add branch overview, values, and local history here." />} />
          <Route path="/get-involved" element={<SimplePage title="Get Involved" body="Use this page for join paths, organizing support, volunteering, and newsletter signup." />} />
          <Route path="/events" element={<SimplePage title="Events" body="Public meetings, trainings, actions, and branch events live here." />} />
          <Route path="/resources" element={<SimplePage title="Resources" body="Organizing guides, rights info, branch materials, and printables." />} />
          <Route path="/dues" element={<SimplePage title="Dues" body="Link out to your external dues workflow here." />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
    </div>
  );
}
