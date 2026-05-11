import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * Upload multiple files to Cloudinary
 * @route POST /api/upload/multiple
 * @access Private/Admin
 */
export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất một ảnh' });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'ktx/rooms')
    );

    const urls = await Promise.all(uploadPromises);

    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Upload a single file to Cloudinary
 * @route POST /api/upload/single
 * @access Private
 */
export const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn một ảnh' });
    }

    const url = await uploadToCloudinary(req.file.buffer, 'ktx/general');
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
