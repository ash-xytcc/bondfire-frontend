import React from 'react'

export function PublicEditProvider({ children }) {
  return <>{children}</>
}

export function usePublicEdit() {
  return {
    isEditing: false,
    setIsEditing: () => {},
  }
}
