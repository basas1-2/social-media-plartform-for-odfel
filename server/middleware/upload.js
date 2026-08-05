const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const dirs = ['uploads/images', 'uploads/videos', 'uploads/documents', 'uploads/avatars', 'uploads/covers'];
dirs.forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const mime = file.mimetype;
    if (mime.startsWith('video/')) {
      cb(null, 'uploads/videos');
    } else if (mime.startsWith('image/')) {
      // avatar / cover handle separately
      cb(null, 'uploads/images');
    } else {
      cb(null, 'uploads/documents');
    }
  },
  filename: function (req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  const isDoc =
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (isImage || isVideo || isDoc) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB for videos
};

const upload = multer({ storage, fileFilter, limits });

// Specific uploads
const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/avatars'),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `avatar-${unique}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadCover = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/covers'),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `cover-${unique}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { upload, uploadAvatar, uploadCover };
