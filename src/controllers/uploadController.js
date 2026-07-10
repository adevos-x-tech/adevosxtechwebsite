const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/admin/upload  (multipart/form-data, field name: "image")
// Table 5: "Picha Halisi — input type=file -> multipart/form-data -> Cloudinary
// API -> Backend inarudisha URL." The Admin panel calls this instead of
// asking for a pasted image URL, then uses the returned url in any
// Slide/Bot/TouchCard/Service create-or-edit form.
const uploadImage = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res.status(500).json({
      error: 'Cloudinary haijawekwa kwenye .env (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET).',
    });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Hakuna faili lililotumwa. Tumia field jina "image".' });
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'adevos-x', resource_type: 'image' },
      (err, uploaded) => (err ? reject(err) : resolve(uploaded))
    );
    stream.end(req.file.buffer);
  });

  res.status(201).json({ url: result.secure_url, publicId: result.public_id });
});

module.exports = { uploadImage };
