const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary using process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Multer Storage Engine specifically for GovTech portal
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'govtech_grievance_media',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'mp4'],
    resource_type: 'auto' // Supports files beyond just basic images (like PDF videos)
  }
});

const upload = multer({ storage });

module.exports = upload;
