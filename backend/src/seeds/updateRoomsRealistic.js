import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Room from '../models/Room.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') }); // load backend/.env
// fallback if env path is wrong
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const templates = {
  4: {
    price: 500000,
    roomType: 'VIP',
    description: 'Phòng VIP 4 người, không gian rộng rãi, trang bị đầy đủ tiện nghi cao cấp.',
    amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt chung', 'Bình nóng lạnh', 'Tủ đồ cá nhân', 'Bàn học riêng', 'Wifi tốc độ cao'],
    detailed_description: `<p><strong>Thông số phòng:</strong></p>
<ul>
<li>Diện tích sử dụng: <strong>35m²</strong></li>
<li>Sức chứa tối đa: <strong>4 sinh viên</strong></li>
<li>Cửa sổ: Lớn, ban công đón gió tự nhiên</li>
</ul>
<p><strong>Nội thất và Thiết bị:</strong></p>
<ul>
<li><strong>2 giường tầng</strong> cao cấp, kích thước 1m x 2m, nệm lò xo dày 15cm.</li>
<li><strong>4 tủ quần áo cá nhân</strong> (rộng 0.8m x cao 2m) có khóa an toàn.</li>
<li><strong>4 bộ bàn ghế học tập riêng biệt</strong> được trang bị đèn chống cận.</li>
<li>01 Điều hòa Inverter <strong>12.000 BTU</strong> tiết kiệm điện.</li>
<li>01 Quạt trần Panasonic 5 cánh.</li>
<li>Nhà vệ sinh khép kín rộng <strong>4.5m²</strong>, có 01 bình nóng lạnh Ariston <strong>30L</strong>, vòi sen tăng áp.</li>
</ul>
<p><strong>Dịch vụ đi kèm:</strong></p>
<p>Mạng Wifi tốc độ cao (cam kết băng thông 150Mbps), dịch vụ dọn vệ sinh hành lang 3 lần/tuần.</p>`
  },
  6: {
    price: 300000,
    roomType: 'Service',
    description: 'Phòng dịch vụ 6 người, không gian thoải mái, tiện nghi cơ bản đầy đủ.',
    amenities: ['Quạt trần', 'Bình nóng lạnh', 'Tủ đồ cá nhân', 'Bàn học chung', 'Wifi'],
    detailed_description: `<p><strong>Thông số phòng:</strong></p>
<ul>
<li>Diện tích sử dụng: <strong>40m²</strong></li>
<li>Sức chứa tối đa: <strong>6 sinh viên</strong></li>
<li>Cửa sổ: 2 cửa sổ thoáng khí</li>
</ul>
<p><strong>Nội thất và Thiết bị:</strong></p>
<ul>
<li><strong>3 giường tầng</strong> tiêu chuẩn, kích thước 0.9m x 2m.</li>
<li><strong>6 ngăn tủ quần áo cá nhân</strong> tích hợp khóa.</li>
<li><strong>1 bàn học lớn dùng chung</strong> (dài 2.5m, rộng 0.8m) kèm 6 ghế tựa.</li>
<li>02 Quạt trần loại lớn đảm bảo không khí lưu thông tốt.</li>
<li>Nhà vệ sinh và nhà tắm khép kín (chia làm 2 buồng riêng biệt), có 01 bình nóng lạnh <strong>20L</strong>.</li>
</ul>
<p><strong>Dịch vụ đi kèm:</strong></p>
<p>Sử dụng mạng Wifi chung của tòa nhà (tốc độ 100Mbps), dọn vệ sinh hành lang 2 lần/tuần.</p>`
  },
  8: {
    price: 200000,
    roomType: 'Standard',
    description: 'Phòng tiêu chuẩn 8 người, giải pháp tiết kiệm chi phí cho sinh viên.',
    amenities: ['Quạt trần', 'Tủ đồ cá nhân', 'Bàn học chung', 'Wifi'],
    detailed_description: `<p><strong>Thông số phòng:</strong></p>
<ul>
<li>Diện tích sử dụng: <strong>45m²</strong></li>
<li>Sức chứa tối đa: <strong>8 sinh viên</strong></li>
</ul>
<p><strong>Nội thất và Thiết bị:</strong></p>
<ul>
<li><strong>4 giường tầng</strong> tiêu chuẩn quân đội, sắt sơn tĩnh điện, kích thước 0.9m x 2m.</li>
<li><strong>8 tủ đồ cá nhân âm tường</strong> (kích thước nhỏ) có sẵn móc khóa.</li>
<li><strong>2 bàn học dùng chung</strong> (mỗi bàn dài 2m) kèm 8 ghế nhựa đúc.</li>
<li>02 Quạt trần cỡ lớn + 02 quạt thông gió.</li>
<li>Khu vực vệ sinh khép kín gồm 2 bồn cầu và 2 vòi tắm sen (không có bình nóng lạnh).</li>
</ul>
<p><strong>Dịch vụ đi kèm:</strong></p>
<p>Mạng Wifi sinh viên phủ sóng toàn khu, hỗ trợ khu vực tự học dưới sảnh tầng 1.</p>`
  }
};

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ktx_db';
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const updateRooms = async () => {
  await connectDB();
  try {
    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms to update.`);

    const capacities = [4, 6, 8];
    let updatedCount = 0;

    for (const room of rooms) {
      // Pick random capacity or cycle through
      const cap = capacities[Math.floor(Math.random() * capacities.length)];
      const template = templates[cap];

      room.capacity = cap;
      room.price = template.price;
      room.roomType = template.roomType;
      room.description = template.description;
      room.detailed_description = template.detailed_description;
      room.amenities = template.amenities;
      
      // Keep old fields like room_code, building, floor, current_people, images, status

      await room.save();
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} rooms with realistic KTX data.`);
    process.exit();
  } catch (error) {
    console.error('Error updating rooms:', error);
    process.exit(1);
  }
};

updateRooms();
