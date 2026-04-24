const pieces = []

export function getPieces() {
  return pieces
}

export function listPieces() {
  return pieces
}

export function getPieceBySlug(slug) {
  return pieces.find((piece) => piece.slug === slug) || null
}

export default pieces
