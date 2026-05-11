const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary კონფიგურაცია (მონაცემები აიღე .env-დან)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
   
    let folderName = 'social_network/others';

    if (file.fieldname === 'profile') {
      folderName = 'social_network/profiles';
    } else if (file.fieldname === 'cover') {
      folderName = 'social_network/covers';
    } else if (file.fieldname === 'postImage') {
      folderName = 'social_network/posts';
    } else if (file.fieldname === 'messageImage') {
      folderName = 'social_network/messages';
    }

    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: file.fieldname + '-' + Date.now(),
    };
  },
});


const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 
  }
});

module.exports = upload;