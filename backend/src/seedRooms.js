import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedRooms = async () => {
  try {
    const buildings = ['A1', 'A2', 'A3'];
    const floors = [1, 2, 3, 4];
    const roomsPerFloor = 5;
    
    const roomsToInsert = [];

    for (const building of buildings) {
      for (const floor of floors) {
        for (let i = 1; i <= roomsPerFloor; i++) {
          const roomNumber = `${floor}0${i}`; // e.g. 101, 205
          const room_code = `${building}-${roomNumber}`;
          
          roomsToInsert.push({
            room_code,
            building,
            floor,
            capacity: 4,
            price: 1200000,
            status: 'Available',
            description: 'Phòng sinh viên tiêu chuẩn, không gian thoáng mát, ánh sáng tự nhiên tốt.',
            amenities: ['Điều hòa', 'Nóng lạnh', 'Giường tầng', 'Tủ đồ cá nhân'],
            roomType: 'Standard',
            images: [
              'https://thietkenoithatatz.com/wp-content/uploads/2021/08/thiet-ke-phong-ngu-ktx-sinh-vien-1.jpg',
            ]
          });
        }
      }
    }

    // You can choose to clear existing rooms or just insert non-existing ones.
    // Let's insert only if room_code doesn't exist to avoid duplicate key errors.
    let addedCount = 0;
    for (const roomData of roomsToInsert) {
      const exists = await Room.findOne({ room_code: roomData.room_code });
      if (!exists) {
        await Room.create(roomData);
        addedCount++;
      }
    }

    console.log(`Seeded ${addedCount} new rooms successfully!`);
    process.exit();
  } catch (error) {
    console.error(`Error seeding rooms: ${error.message}`);
    process.exit(1);
  }
};

seedRooms();
