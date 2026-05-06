const express = require('express');
const router = express.Router();
const { createLink, getLinks, deleteLink, getLinkStats } = require('../controllers/linkController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { shortenLimiter } = require('../middleware/rateLimiter');
const { createLinkSchema } = require('../validators/linkValidator');

router.use(authenticate); // all link routes require auth

router.post('/', shortenLimiter, validate(createLinkSchema), createLink);
router.get('/', getLinks);
router.delete('/:id', deleteLink);
router.get('/:id/stats', getLinkStats);

module.exports = router;
