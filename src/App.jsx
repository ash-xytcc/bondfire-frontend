import { Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './components/HomePage'
import { ProjectsIndexPage } from './components/ProjectsIndexPage'
import { ProjectPage } from './components/ProjectPage'
import { PiecePage } from './components/PiecePage'
import { SearchPage } from './components/SearchPage'
import { AboutPage } from './components/AboutPage'
import { ContactPage } from './components/ContactPage'
import { AdminPage } from './components/AdminPage'
import { PublicEditProvider } from './components/PublicEditContext'
import { NativeUpdatesPage } from './components/NativeUpdatesPage'
import { NativeUpdateDetailPage } from './components/NativeUpdateDetailPage'
import { PublicSearchPage } from './components/PublicSearchPage'

export default function App() {
  return (
    <PublicEditProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsIndexPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/pieces/:slug" element={<PiecePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/updates" element={<NativeUpdatesPage />} />
        <Route path="/updates/:slug" element={<NativeUpdateDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />

        <Route path="/site/:siteSlug" element={<HomePage />} />
        <Route path="/site/:siteSlug/projects" element={<ProjectsIndexPage />} />
        <Route path="/site/:siteSlug/projects/:slug" element={<ProjectPage />} />
        <Route path="/site/:siteSlug/pieces/:slug" element={<PiecePage />} />
        <Route path="/site/:siteSlug/search" element={<PublicSearchPage />} />
        <Route path="/site/:siteSlug/updates" element={<NativeUpdatesPage />} />
        <Route path="/site/:siteSlug/updates/:slug" element={<NativeUpdateDetailPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PublicEditProvider>
  )
}
