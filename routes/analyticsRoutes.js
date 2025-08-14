// analyticsRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const MediaAsset = require('../models/mediaasset');
const MediaViewLog = require('../models/mediaviewlog');
const auth = require('../middleware/auth');




// POST /media/:id/view
router.post('/media/:id/view', auth, async (req, res) => {
  try {
    const mediaId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    const media = await MediaAsset.findById(mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    await MediaViewLog.create({
      media_id: media._id,
      viewed_by_ip: req.ip,
      timestamp: new Date()
    });

    res.json({ message: 'View logged' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /media/:id/analytics
router.get('/media/:id/analytics', auth, async (req, res) => {
  try {
    const mediaId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    const media = await MediaAsset.findById(mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const logs = await MediaViewLog.find({ media_id: media._id });

    const total_views = logs.length;
    const unique_ips = new Set(logs.map(log => log.viewed_by_ip)).size;

    const views_per_day = logs.reduce((acc, log) => {
      const day = log.timestamp.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total_views,
      unique_ips,
      views_per_day
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

/*
To integrate:
1. Place this file as analyticsRoutes.js in your routes folder.
2. Ensure models/MediaAsset.js and models/MediaViewLog.js match your MongoDB schema.
3. In server.js/app.js: `app.use('/', require('./routes/analyticsRoutes'));`
4. Protects both endpoints with JWT.
5. Handles invalid/missing media and tokens.
*/
