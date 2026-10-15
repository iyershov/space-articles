export function getSearchKeywords(searchTerm: string | null): string[] {
  const normalized = searchTerm?.trim().toLowerCase();
  return normalized ? [...new Set(normalized.split(/\s+/))] : [];
}
