import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff } from '../access'

// Images for heroes and article bodies, and CSV files behind charts.
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt text / description',
      type: 'text',
      admin: { description: 'For images: what the image shows. For CSV files: what the data is.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'text/csv', 'application/vnd.ms-excel'],
    imageSizes: [{ name: 'card', width: 800 }],
  },
}
