import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access'

// The researcher profile shown at /profile/ on the site. Text fields have English and Hindi versions.
export const Profile: GlobalConfig = {
  slug: 'profile',
  label: 'Researcher profile',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true, localized: true },
      ],
    },
    { name: 'location', type: 'text', localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      admin: { description: 'Blank lines start a new paragraph.' },
    },
    { name: 'interests', type: 'text', hasMany: true, localized: true },
    {
      name: 'links',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', label: 'URL', type: 'text', required: true },
          ],
        },
      ],
    },
    { name: 'email', label: 'Public contact email', type: 'email' },
    {
      name: 'timeline',
      label: 'Background',
      type: 'array',
      admin: { description: 'Newest first: education, roles, publications, talks.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'when', type: 'text', required: true },
            { name: 'what', type: 'text', required: true, localized: true },
          ],
        },
        { name: 'detail', type: 'text', localized: true },
      ],
    },
  ],
}
