const cloudinary = require('cloudinary').v2;

if (
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud'
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const uploadToCloud = async (filePath, folder = 'lms') => {
  try {
    // If running with mock configuration, simulate success
    if (process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud' || !process.env.CLOUDINARY_API_KEY) {
      const relativePath = filePath.replace(/\\/g, '/').split('/public').pop();
      return {
        secure_url: relativePath,
        public_id: `mock_${Date.now()}`
      };
    }

    const result = await cloudinary.uploader.upload(filePath, { folder });
    return result;
  } catch (err) {
    console.warn('Cloudinary upload failed, falling back to local file path:', err.message);
    const relativePath = filePath.replace(/\\/g, '/').split('/public').pop();
    return {
      secure_url: relativePath,
      public_id: `fallback_${Date.now()}`
    };
  }
};

module.exports = { uploadToCloud };
