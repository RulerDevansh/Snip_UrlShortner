const { Link, Click } = require('../models');
const { generateCode } = require('../utils/generateCode');
const { setCachedUrl, invalidateCachedUrl } = require('../services/cacheService');

/**
 * POST /api/links  — create a shortened link
 */
const createLink = async (req, res, next) => {
  try {
    const { original_url, custom_alias, expires_at } = req.body;
    const userId = req.user.id;

    let shortCode = custom_alias || null;

    if (shortCode) {
      // Check alias uniqueness
      const taken = await Link.findOne({ where: { short_code: shortCode } });
      if (taken) {
        return res.status(409).json({ success: false, message: 'This alias is already taken. Please choose another.' });
      }
    } else {
      // Auto-generate a unique code
      let attempts = 0;
      do {
        shortCode = generateCode();
        const exists = await Link.findOne({ where: { short_code: shortCode } });
        if (!exists) break;
        attempts++;
      } while (attempts < 5);

      if (attempts >= 5) {
        return res.status(500).json({ success: false, message: 'Could not generate a unique code. Please try again.' });
      }
    }

    const link = await Link.create({
      user_id: userId,
      original_url,
      short_code: shortCode,
      expires_at: expires_at || null,
    });

    // Warm the cache immediately
    await setCachedUrl(shortCode, original_url);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return res.status(201).json({
      success: true,
      message: 'Short link created.',
      data: {
        link: {
          id: link.id,
          original_url: link.original_url,
          short_code: link.short_code,
          short_url: `${baseUrl}/r/${link.short_code}`,
          click_count: link.click_count,
          expires_at: link.expires_at,
          created_at: link.created_at,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/links  — list all links for the authenticated user
 */
const getLinks = async (req, res, next) => {
  try {
    const links = await Link.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'original_url', 'short_code', 'click_count', 'expires_at', 'created_at'],
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const formatted = links.map((l) => ({
      ...l.toJSON(),
      short_url: `${baseUrl}/r/${l.short_code}`,
    }));

    return res.json({ success: true, data: { links: formatted } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/links/:id  — delete a link owned by the user
 */
const deleteLink = async (req, res, next) => {
  try {
    const link = await Link.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    await invalidateCachedUrl(link.short_code);
    await link.destroy();

    return res.json({ success: true, message: 'Link deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/links/:id/stats  — click analytics for a link
 */
const getLinkStats = async (req, res, next) => {
  try {
    const link = await Link.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      attributes: ['id', 'original_url', 'short_code', 'click_count', 'expires_at', 'created_at'],
    });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    // Last 10 clicks for simple analytics
    const recentClicks = await Click.findAll({
      where: { link_id: link.id },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['ip_address', 'user_agent', 'referrer', 'created_at'],
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return res.json({
      success: true,
      data: {
        link: {
          ...link.toJSON(),
          short_url: `${baseUrl}/r/${link.short_code}`,
        },
        recent_clicks: recentClicks,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLink, getLinks, deleteLink, getLinkStats };
