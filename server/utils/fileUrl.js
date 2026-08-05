/**
 * Builds a full URL for a locally stored file.
 * @param {object} req - express request
 * @param {string} filePath - relative path like 'uploads/images/abc.jpg'
 * @returns {string} full URL
 */
const fileUrl = (req, filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  return `${req.protocol}://${req.get('host')}/${filePath}`;
};

module.exports = fileUrl;
