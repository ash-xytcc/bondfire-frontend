const projects = []

export function getProjects() {
  return projects
}

export function listProjects() {
  return projects
}

export function getProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug) || null
}

export default projects
