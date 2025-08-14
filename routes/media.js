const express = require('express');
const auth = require('../middleware/auth');
const MediaAsset = require('../models/mediaasset');
const MediaViewLog = require('../models/mediaviewlog');
const { createStreamToken, verifyStreamToken } = require('../utils/signUrl');

const router = express.Router();
const BASE_URL = process.env.BASE_URL;

router.post('/', auth, async (req, res) => {
  const { title, type, file_url } = req.body;
  if (!title || !type || !file_url) return res.status(400).json({ error: 'title, type, file_url required' });
  if (!['video', 'audio'].includes(type)) return res.status(400).json({ error: 'type must be video or audio' });
  try {
    const m = await MediaAsset.create({ title, type, file_url });
    res.status(201).json(m);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id/stream-url', async (req, res) => {
  const media = await MediaAsset.findById(req.params.id);
  if (!media) return res.status(404).json({ error: 'media not found' });
  const token = createStreamToken(media._id, 600);
  const url = `${BASE_URL}/media/stream?token=${token}`;
  res.json({ url, expires_in_seconds: 600 });
});



module.exports = router;