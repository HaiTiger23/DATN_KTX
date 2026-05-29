import { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { formatDate } from '../api';

const ContractPrintTemplate = forwardRef(({ contract, settings }, ref) => {
  if (!contract) return null;

  const { student_id, room_id, start_date, end_date } = contract;
  
  // Settings fallbacks
  const bqlName = settings?.contractBqlName || 'BAN QUẢN LÝ KÝ TÚC XÁ';
  const repName = settings?.contractRepName || '................................................................';
  const repRole = settings?.contractRepRole || 'Giám đốc/Trưởng ban quản lý Ký túc xá';
  const repPhone = settings?.contractRepPhone || '................................................................';
  const termsHtml = settings?.contractTerms || '';

  const content = (
    <div ref={ref} className="print-only contract-print-template" style={{ display: 'none', padding: '40px', fontFamily: 'Times New Roman, serif', color: '#000' }}>
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 20mm; }
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; display: block !important; background: white; }
        `}
      </style>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
        <h4 style={{ margin: 0, textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</h4>
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>HỢP ĐỒNG THUÊ CHỖ Ở KÝ TÚC XÁ</h2>

      <p style={{ fontStyle: 'italic' }}>
        - Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015 của Quốc hội nước CHXHCN Việt Nam;<br/>
        - Căn cứ Luật Nhà ở số 65/2014/QH13 ngày 25/11/2014 của Quốc hội nước CHXHCN Việt Nam;<br/>
        - Căn cứ Quy chế quản lý Ký túc xá sinh viên hiện hành;
      </p>

      <p>Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}, tại Ban Quản lý Ký túc xá, chúng tôi gồm:</p>

      <h4 style={{ marginBottom: 5 }}>BÊN CHO THUÊ CHỖ Ở (BÊN A): {bqlName.toUpperCase()}</h4>
      <p style={{ margin: '3px 0' }}>Đại diện: <strong>Ông/Bà {repName}</strong></p>
      <p style={{ margin: '3px 0' }}>Chức vụ: {repRole}</p>
      <p style={{ margin: '3px 0' }}>Số điện thoại liên hệ: {repPhone}</p>

      <h4 style={{ marginTop: 15, marginBottom: 5 }}>BÊN THUÊ CHỖ Ở (BÊN B): SINH VIÊN</h4>
      <p style={{ margin: '3px 0' }}>Họ và tên: <strong>{student_id?.fullname}</strong></p>
      <p style={{ margin: '3px 0' }}>Mã số sinh viên: {student_id?.mssv || '...........................................'}</p>
      <p style={{ margin: '3px 0' }}>Số CCCD/CMND: {student_id?.cccd || '...........................................'} &nbsp;&nbsp;&nbsp;&nbsp; Ngày cấp: {student_id?.cccd_date ? new Date(student_id.cccd_date).toLocaleDateString('vi-VN') : '....../....../..........'} &nbsp;&nbsp;&nbsp;&nbsp; Nơi cấp: {student_id?.cccd_place || '...........................................'}</p>
      <p style={{ margin: '3px 0' }}>Số điện thoại: {student_id?.phone || '...........................................'}</p>
      <p style={{ margin: '3px 0' }}>Email: {student_id?.email}</p>
      <p style={{ margin: '3px 0' }}>Địa chỉ thường trú: {student_id?.address || '......................................................................................'}</p>

      <h4 style={{ marginTop: 20 }}>HAI BÊN THỐNG NHẤT KÝ KẾT HỢP ĐỒNG VỚI CÁC ĐIỀU KHOẢN SAU:</h4>
      
      {termsHtml ? (
        <div className="contract-terms-rich-text" dangerouslySetInnerHTML={{ __html: termsHtml }} />
      ) : (
        <>
          <p style={{ margin: '5px 0' }}><strong>Điều 1: Đối tượng hợp đồng</strong></p>
          <p style={{ margin: '3px 0' }}>Bên A đồng ý bố trí cho Bên B thuê 01 chỗ ở nội trú tại phòng <strong>{room_id?.room_code}</strong>, tòa nhà <strong>{room_id?.building}</strong> thuộc Ký túc xá.</p>
          
          <p style={{ margin: '15px 0 5px 0' }}><strong>Điều 2: Thời hạn thuê và giá cả</strong></p>
          <p style={{ margin: '3px 0' }}>1. Thời gian lưu trú: Từ ngày <strong>{formatDate(start_date)}</strong> đến ngày <strong>{formatDate(end_date)}</strong>.</p>
          <p style={{ margin: '3px 0' }}>2. Đơn giá thuê: <strong>{room_id?.price ? room_id.price.toLocaleString() : '..........'} VNĐ/tháng</strong> (Giá này chưa bao gồm tiền điện, nước và các dịch vụ khác nếu có).</p>
          <p style={{ margin: '3px 0' }}>3. Phương thức thanh toán: Thanh toán bằng chuyển khoản hoặc tiền mặt vào đầu mỗi kỳ thu (theo thông báo của Ban quản lý).</p>

          <p style={{ margin: '15px 0 5px 0' }}><strong>Điều 3: Quyền và nghĩa vụ của Bên A</strong></p>
          <p style={{ margin: '3px 0' }}>- Bàn giao chỗ ở và tài sản kèm theo cho Bên B theo đúng biên bản bàn giao.</p>
          <p style={{ margin: '3px 0' }}>- Đảm bảo cung cấp đầy đủ các dịch vụ thiết yếu (điện, nước, an ninh) phục vụ sinh hoạt, học tập.</p>
          <p style={{ margin: '3px 0' }}>- Có quyền kiểm tra định kỳ hoặc đột xuất việc chấp hành Nội quy Ký túc xá của Bên B. Đơn phương chấm dứt hợp đồng nếu Bên B vi phạm nghiêm trọng nội quy hoặc chậm đóng phí quá hạn quy định.</p>

          <p style={{ margin: '15px 0 5px 0' }}><strong>Điều 4: Quyền và nghĩa vụ của Bên B</strong></p>
          <p style={{ margin: '3px 0' }}>- Nhận và sử dụng chỗ ở, tài sản đúng mục đích. Giữ gìn vệ sinh chung, an ninh trật tự, phòng cháy chữa cháy.</p>
          <p style={{ margin: '3px 0' }}>- Đóng đầy đủ và đúng hạn phí lưu trú và các khoản dịch vụ phát sinh hàng tháng.</p>
          <p style={{ margin: '3px 0' }}>- Bồi thường 100% giá trị tài sản nếu làm mất mát, hư hỏng tài sản chung của Ký túc xá do lỗi cố ý hoặc vô ý.</p>
          <p style={{ margin: '3px 0' }}>- Không được tự ý nhượng lại chỗ ở cho người khác dưới bất kỳ hình thức nào.</p>

          <p style={{ margin: '15px 0 5px 0' }}><strong>Điều 5: Cam kết chung</strong></p>
          <p style={{ margin: '3px 0' }}>Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản trong hợp đồng. Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng. Nếu không thống nhất được sẽ xử lý theo quy định pháp luật.</p>
          <p style={{ margin: '3px 0' }}>Hợp đồng có hiệu lực kể từ ngày ký và được lập thành 02 (hai) bản có giá trị pháp lý như nhau, Bên A giữ 01 bản, Bên B giữ 01 bản.</p>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
        <div style={{ textAlign: 'center', width: '40%' }}>
          <strong>ĐẠI DIỆN BÊN THUÊ (BÊN B)</strong>
          <p style={{ fontStyle: 'italic', fontSize: '12px' }}>(Ký và ghi rõ họ tên)</p>
          <br /><br /><br /><br /><br />
          <p><strong>{student_id?.fullname}</strong></p>
        </div>
        <div style={{ textAlign: 'center', width: '40%' }}>
          <strong>ĐẠI DIỆN BÊN CHO THUÊ (BÊN A)</strong>
          <p style={{ fontStyle: 'italic', fontSize: '12px' }}>(Ký, ghi rõ họ tên & đóng dấu)</p>
          <br /><br /><br /><br /><br />
          <p>......................................................</p>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
});

export default ContractPrintTemplate;
