import Notification from '../../models/Notification.js';

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Notification.countDocuments({});

    res.json({
      data: notifications,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a notification
// @route   POST /api/admin/notifications
// @access  Private/Admin
export const createNotification = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const notification = new Notification({
            title,
            content
        });

        const createdNotification = await notification.save();
        res.status(201).json(createdNotification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            await notification.deleteOne();
            res.json({ message: 'Notification removed' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
