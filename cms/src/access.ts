import type { Access, FieldAccess, PayloadRequest } from 'payload'

// Roles: admin (everything), editor (write and publish pieces), reader (own account only).
export type Role = 'admin' | 'editor' | 'reader'

const roleOf = (req: PayloadRequest): Role | undefined => (req.user as { role?: Role } | null)?.role

export const isAdmin = ({ req }: { req: PayloadRequest }) => roleOf(req) === 'admin'

export const isStaff = ({ req }: { req: PayloadRequest }) => {
  const role = roleOf(req)
  return role === 'admin' || role === 'editor'
}

export const isAdminField: FieldAccess = ({ req }) => roleOf(req) === 'admin'

export const adminOrSelf: Access = ({ req }) => {
  if (roleOf(req) === 'admin') return true
  if (req.user) return { id: { equals: req.user.id } }
  return false
}

// Everyone reads published pieces; staff also see drafts.
export const publishedOrStaff: Access = ({ req }) =>
  isStaff({ req }) ? true : { _status: { equals: 'published' } }
