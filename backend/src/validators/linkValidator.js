const { z } = require('zod');

const createLinkSchema = z.object({
  original_url: z
    .string({ required_error: 'URL is required.' })
    .url('Please provide a valid URL including http:// or https://')
    .max(2048, 'URL is too long.'),
  custom_alias: z
    .string()
    .min(3, 'Alias must be at least 3 characters.')
    .max(30, 'Alias must be at most 30 characters.')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Alias can only contain letters, numbers, hyphens, and underscores.'
    )
    .optional()
    .nullable(),
  expires_at: z.string().datetime({ offset: true }).optional().nullable(),
});

module.exports = { createLinkSchema };
