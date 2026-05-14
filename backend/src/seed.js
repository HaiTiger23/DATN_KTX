import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Room from './models/Room.js';
import Contract from './models/Contract.js';
import Request from './models/Request.js';
import Invoice from './models/Invoice.js';
import Feedback from './models/Feedback.js';
import Knowledge from './models/Knowledge.js';
import Setting from './models/Setting.js';
import Notification from './models/Notification.js';
import connectDB from './config/db.js';

dotenv.config();

// DANH SÁCH SINH VIÊN THẬT
const realisticStudents = [
  { fullname: 'Nguyễn Minh Anh', email: 'minhanh.nguyen@gmail.com' },
  { fullname: 'Trần Hoàng Nam', email: 'nam.tranhoang@gmail.com' },
  { fullname: 'Lê Thị Mai', email: 'maile.thi@gmail.com' },
  { fullname: 'Phạm Đức Duy', email: 'duypham.duc@gmail.com' },
  { fullname: 'Vũ Thanh Hằng', email: 'hangvu.thanh@gmail.com' },
  { fullname: 'Đặng Quốc Bảo', email: 'bao.dangquoc@gmail.com' },
  { fullname: 'Bùi Gia Huy', email: 'huybui.gia@gmail.com' },
  { fullname: 'Đỗ Thùy Linh', email: 'linhdo.thuy@gmail.com' },
  { fullname: 'Ngô Quang Khải', email: 'khai.ngoquang@gmail.com' },
  { fullname: 'Hồ Phương Thảo', email: 'thaoho.phuong@gmail.com' },
  { fullname: 'Lý Tuấn Kiệt', email: 'kietly.tuan@gmail.com' },
  { fullname: 'Phan Bảo Ngọc', email: 'ngocphan.bao@gmail.com' },
  { fullname: 'Trương Công Vinh', email: 'vinh.truongcong@gmail.com' },
  { fullname: 'Nguyễn Khánh Huyền', email: 'huyen.nguyenkhanh@gmail.com' },
  { fullname: 'Trần Văn Mạnh', email: 'manh.tranvan@gmail.com' },
  { fullname: 'Lê Hồng Nhung', email: 'nhung.lehong@gmail.com' },
  { fullname: 'Phạm Thế Hiển', email: 'hien.phamthe@gmail.com' },
  { fullname: 'Hoàng Minh Châu', email: 'chau.hoangminh@gmail.com' },
  { fullname: 'Võ Thành Tâm', email: 'tam.vothanh@gmail.com' },
  { fullname: 'Nguyễn Bích Diệp', email: 'diep.nguyenbich@gmail.com' }
];

const requestDescriptions = [
  'Em muốn đăng ký phòng có điều hòa ạ.',
  'Xin phép BQL cho em đăng ký chung phòng với bạn cùng khóa.',
  'Em muốn đăng ký phòng ở tầng thấp vì lý do sức khỏe.',
  'Đăng ký ở lại ký túc xá dịp hè.',
  'Cho em đăng ký phòng tiêu chuẩn 4 người ạ.'
];

const feedbackContents = [
  'Wifi dạo này buổi tối (khoảng 8h - 10h) khá chập chờn, load tài liệu học rất chậm.',
  'Ban quản lý và các bác bảo vệ rất nhiệt tình, phòng ốc sạch sẽ thoáng mát.',
  'Nên có thêm máy giặt ở khu vực tầng 2 để sinh viên đỡ phải mang đồ xuống tầng 1.',
  'Đèn ở khu vực cầu thang thỉnh thoảng bị nhấp nháy, buổi tối đi lại hơi nguy hiểm.',
  'Rất hài lòng với dịch vụ hiện tại của ký túc xá. Không gian học tập tốt.',
  'Thủ tục đăng ký và nhận phòng diễn ra rất nhanh gọn, em cảm ơn.',
  'Nước sinh hoạt thỉnh thoảng bị đục vào buổi sáng, mong ban quản lý kiểm tra lại bể chứa.',
  'Có một số bạn ở phòng bên cạnh hay ồn ào sau 11h đêm, mong BQL nhắc nhở chung.',
  'Khu vực nhà xe đôi khi sắp xếp hơi lộn xộn khó lấy xe.',
  'Hệ thống app quản lý rất tiện lợi, dễ dàng theo dõi hóa đơn và gửi yêu cầu.'
];

const seedData = async () => {
  try {
    await connectDB();

    const students = await User.find({ role: 'Student' });





    console.log('Seeding 10 Feedbacks (Đa dạng nội dung và đánh giá)...');
    for (let i = 0; i < 10; i++) {
      const content = feedbackContents[i];
      // Generate a short title based on the content
      const title = content.split(',')[0].substring(0, 30) + '...';

      await Feedback.create({
        student_id: students[i]._id,
        title: title,
        description: content,
        status: i % 3 === 0 ? 'Answered' : 'Pending',
        reply_content: i % 3 === 0 ? 'Ban quản lý đã ghi nhận và sẽ xử lý sớm.' : ''
      });
    }

    console.log('Seeding Knowledge (Câu hỏi và trả lời chi tiết)...');
    const kCount = await Knowledge.countDocuments();
    if (kCount < 10) {
      await Knowledge.create([
        { question: 'Thủ tục đăng ký tạm trú, tạm vắng như thế nào?', answer: 'Sinh viên cần nộp bản sao Căn cước công dân và điền form đăng ký tại Phòng Hành chính tầng 1. Hạn chót là 7 ngày sau khi nhận phòng.' },
        { question: 'Quy định về việc sử dụng thiết bị điện trong phòng?', answer: 'Nghiêm cấm sử dụng các thiết bị tỏa nhiệt lớn như bếp điện, bếp từ, nồi lẩu điện trong phòng ở. Chỉ được phép sử dụng nồi cơm điện và quạt máy.' },
        { question: 'Quy trình báo cáo sửa chữa cơ sở vật chất?', answer: 'Sinh viên vui lòng tạo yêu cầu "Bảo trì/Sửa chữa" trên ứng dụng, mô tả rõ tình trạng hỏng hóc. Bộ phận kỹ thuật sẽ xử lý trong vòng 24-48 giờ làm việc.' },
        { question: 'Tiền điện nước được tính như thế nào?', answer: 'Điện nước được tính theo chỉ số đồng hồ thực tế mỗi phòng. Chốt số vào ngày 25 hàng tháng. Đơn giá: Điện 3.500đ/kWh, Nước 15.000đ/m3.' },
        { question: 'Giờ đóng mở cửa ký túc xá?', answer: 'Ký túc xá mở cửa từ 5h00 sáng và đóng cửa vào 23h00 đêm. Sinh viên về muộn cần có giấy xin phép trước.' }
      ]);
    }

    console.log('Seeding Notifications (Nội dung thực tế)...');
    await Notification.create([
      { title: 'Thông báo nộp phí sinh hoạt tháng 5/2026', content: 'Kính gửi các bạn sinh viên, Ban quản lý đã cập nhật hóa đơn điện nước và tiền phòng tháng 5. Đề nghị các phòng thanh toán qua ứng dụng trước ngày 15/05.', recipient_id: null },
      { title: 'Lịch phun thuốc diệt muỗi định kỳ', content: 'Vào sáng thứ 7 tuần này (16/05), BQL sẽ tiến hành phun thuốc diệt muỗi toàn khu vực. Yêu cầu sinh viên dọn dẹp vệ sinh và khóa cửa phòng.', recipient_id: null },
      { title: 'Nhắc nhở: Hợp đồng sắp hết hạn', content: 'Hợp đồng nội trú của bạn sẽ hết hạn vào cuối tháng tới. Nếu có nhu cầu gia hạn, vui lòng làm thủ tục sớm trên hệ thống.', recipient_id: students[16]._id },
      { title: 'Kiểm tra phòng đột xuất', content: 'Tối nay BQL sẽ tiến hành kiểm tra đột xuất việc sử dụng các thiết bị điện sai quy định tại các tòa nhà.', recipient_id: null }
    ]);

    console.log('Hoàn tất seeding dữ liệu một cách tự nhiên nhất!');
    process.exit();
  } catch (error) {
    console.error('Lỗi seeding:', error);
    process.exit(1);
  }
};

seedData();
