const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Faili lazima liwe picha (jpg, png, webp, n.k.).'));
    }
    cb(null, true);
  },
});

module.exports = upload;
