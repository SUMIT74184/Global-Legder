import type { CollectionConfig } from 'payload'

import { adminOrSelf, isAdminField, isStaff } from '../access'
import { TOPIC_OPTIONS } from '../taxonomy'

// Admins, editors and readers share one collection. Anyone can sign up (as a reader); only
// admins can change roles; only admins and editors can open the admin panel.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax' },
    // TODO: set verify: true once an email adapter (e.g. Resend) is configured.
  },
  access: {
    admin: isStaff,
    create: () => true,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOrSelf,
  },
  hooks: {
    beforeChange: [
      // The account made on the admin's "create first user" screen becomes the admin. Payload
      // only accepts that route while no users exist, so a public signup can never claim it.
      ({ data, operation, req }) => {
        if (operation === 'create' && req.pathname?.endsWith('/first-register')) data.role = 'admin'
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'reader',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Reader', value: 'reader' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'saved',
      label: 'Saved pieces',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
    },
    {
      name: 'newsletterTopics',
      type: 'select',
      hasMany: true,
      options: TOPIC_OPTIONS,
    },
  ],
}
