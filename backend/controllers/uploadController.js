const cloudinary = require('../utils/cloudinary');
const { Readable } = require('stream');

exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Fallback if Cloudinary credentials are not configured or are placeholders
  const hasCreds = process.env.CLOUDINARY_CLOUD_NAME &&
                   !process.env.CLOUDINARY_CLOUD_NAME.includes('your_cloud_name');

  if (!hasCreds) {
    // Generate a high-fidelity Unsplash digital art image for demo purposes
    const mockImages = [
      'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1000&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80',
      'https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=1000&q=80',
      'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1000&q=80',
    ];
    const randomUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
    return res.json({
      success: true,
      url: randomUrl,
      public_id: 'mock_cloudinary_id_' + Date.now(),
    });
  }

  // Production upload stream to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'klaahub_artworks' },
    (error, result) => {
      if (error) {
        return res.status(500).json({ message: 'Cloudinary upload failed', error });
      }
      res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  );

  const readable = new Readable();
  readable.push(req.file.buffer);
  readable.push(null);
  readable.pipe(uploadStream);
};

