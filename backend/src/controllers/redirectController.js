const { Link, Click } = require('../models');
const { getCachedUrl, setCachedUrl } = require('../services/cacheService');

/**
 * GET /r/:shortCode  — redirect to original URL
 * Redis-first lookup, MySQL fallback, async click recording
 */
const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // 1. Cache hit
    let originalUrl = await getCachedUrl(shortCode);

    if (!originalUrl) {
      // 2. Cache miss — query MySQL
      const link = await Link.findOne({ where: { short_code: shortCode } });

      if (!link) {
        return res.status(404).json({ success: false, message: 'Short link not found.' });
      }

      // Check expiry
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return res.status(410).json({ success: false, message: 'This link has expired.' });
      }

      originalUrl = link.original_url;

      // Warm cache for future requests
      await setCachedUrl(shortCode, originalUrl);

      // Fire-and-forget: increment click counter + record click
      setImmediate(async () => {
        try {
          await Promise.all([
            link.increment('click_count'),
            Click.create({
              link_id: link.id,
              ip_address: req.ip || req.headers['x-forwarded-for'],
              user_agent: req.headers['user-agent']?.substring(0, 512),
              referrer: req.headers['referer']?.substring(0, 512),
            }),
          ]);
        } catch (e) {
          console.error('[Redirect] Click recording failed:', e.message);
        }
      });
    } else {
      // Cache hit — still record the click asynchronously
      setImmediate(async () => {
        try {
          const link = await Link.findOne({ where: { short_code: shortCode } });
          if (link) {
            await Promise.all([
              link.increment('click_count'),
              Click.create({
                link_id: link.id,
                ip_address: req.ip || req.headers['x-forwarded-for'],
                user_agent: req.headers['user-agent']?.substring(0, 512),
                referrer: req.headers['referer']?.substring(0, 512),
              }),
            ]);
          }
        } catch (e) {
          console.error('[Redirect] Click recording (cache path) failed:', e.message);
        }
      });
    }

    return res.redirect(301, originalUrl);
  } catch (err) {
    next(err);
  }
};

module.exports = { redirect };
