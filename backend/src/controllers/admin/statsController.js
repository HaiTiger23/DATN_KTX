import Room from '../../models/Room.js';

export const getBuildingStats = async (req, res) => {
  try {
    const stats = await Room.aggregate([
      {
        $group: {
          _id: { building: "$building", floor: "$floor" },
          totalRooms: { $sum: 1 },
          availableRooms: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $ne: ["$status", "Maintenance"] },
                    { $lt: ["$current_people", "$capacity"] }
                  ] 
                }, 
                1, 
                0
              ] 
            }
          },
          fullRooms: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $ne: ["$status", "Maintenance"] },
                    { $gte: ["$current_people", "$capacity"] }
                  ] 
                }, 
                1, 
                0
              ] 
            }
          },
          maintenanceRooms: {
            $sum: { $cond: [{ $eq: ["$status", "Maintenance"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id.floor": 1 }
      },
      {
        $group: {
          _id: "$_id.building",
          totalRooms: { $sum: "$totalRooms" },
          availableRooms: { $sum: "$availableRooms" },
          fullRooms: { $sum: "$fullRooms" },
          maintenanceRooms: { $sum: "$maintenanceRooms" },
          floors: {
            $push: {
              floor: "$_id.floor",
              totalRooms: "$totalRooms",
              availableRooms: "$availableRooms",
              fullRooms: "$fullRooms",
              maintenanceRooms: "$maintenanceRooms"
            }
          }
        }
      },
      {
        $sort: { _id: 1 } // Sort by building name A-Z
      }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error when fetching stats' });
  }
};
