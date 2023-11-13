export function contacts(orgId: string) {
  return `organizations/${orgId}/contacts`;
}

export function contactsSummary(orgId: string, contactId: string) {
  return `${contacts(orgId)}/${contactId}/summary`;
}
