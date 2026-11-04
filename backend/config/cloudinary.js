const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<{ url: string, public_id: string }>}
 */
const uploadToCloudinary = (fileBuffer, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary is not configured.'));
    }

    const isPdf = mimeType === 'application/pdf';
    const uploadOptions = {
      folder: 'smart_study_materials',
      resource_type: isPdf ? 'raw' : 'image',
      public_id: `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')}`,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
};
