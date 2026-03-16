export function useSlug() {
  function generateSlug(title: string, dateTime?: string): string {
    const titlePart = slugify(title)

    if (!dateTime) return titlePart

    const date = new Date(dateTime)
    const day = date.getDate()
    const month = MONTHS[date.getMonth()]

    return `${titlePart}-${day}-${month}`
  }

  return { generateSlug }
}

const MONTHS = [
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
]

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}
