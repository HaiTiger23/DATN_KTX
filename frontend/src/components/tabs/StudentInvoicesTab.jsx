import { useRef, useState } from 'react';
import { Button, Card, Col, Row, Tag, Typography, Upload, Image, Alert, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { formatMoney } from '../../api';

function statusColor(s) {
  if (s === 'Paid') return 'success';
  if (s === 'Waiting_Approval') return 'warning';
  return 'default';
}
function statusLabel(s) {
  if (s === 'Paid') return 'Đã thanh toán';
  if (s === 'Waiting_Approval') return 'Chờ Admin duyệt';
  return 'Chưa đóng';
}

export default function StudentInvoicesTab({ room, invoices, pagination, onPay }) {
  const [fileMap, setFileMap] = useState({}); // { invoiceId: File }
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (invId, file) => {
    setFileMap((prev) => ({ ...prev, [invId]: file }));
    return false; // prevent antd auto-upload
  };

  const handlePay = async (invId) => {
    const file = fileMap[invId];
    if (!file) {
      alert('Vui lòng chọn ảnh biên lai chuyển khoản trước!');
      return;
    }
    await onPay(invId, file);
  };

  if (!room) {
    return (
      <Alert
        type="info"
        message="Bạn chưa có hợp đồng thuê phòng đang hoạt động nên không có hóa đơn."
        showIcon
      />
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Alert
        type="info"
        message={`Phòng ${room.room_code} chưa có hóa đơn nào.`}
        showIcon
      />
    );
  }

  return (
    <>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Hóa đơn của phòng: <strong>{room.room_code} – {room.building}</strong>
      </Typography.Text>

      <Row gutter={[16, 16]}>
        {invoices.map((inv) => {
          const isLockedByOther =
            inv.status === 'Waiting_Approval' && inv.paid_by?.fullname;

          return (
            <Col xs={24} sm={12} lg={8} key={inv._id}>
              <Card
                size="small"
                title={
                  <Space>
                    <span>Tháng {inv.month}</span>
                    <Tag color={statusColor(inv.status)}>{statusLabel(inv.status)}</Tag>
                  </Space>
                }
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Tiền điện:</span>
                  <strong>{formatMoney(inv.electricity_cost)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Tiền nước:</span>
                  <strong>{formatMoney(inv.water_cost)}</strong>
                </div>
                {inv.additional_cost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Phụ phí:</span>
                    <strong>{formatMoney(inv.additional_cost)}</strong>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px dashed #d9d9d9',
                    paddingTop: 8,
                    marginTop: 8,
                  }}
                >
                  <span>Tổng cộng:</span>
                  <strong style={{ color: '#cf1322', fontSize: 16 }}>
                    {formatMoney(inv.total_amount)}
                  </strong>
                </div>

                {/* === Action area === */}
                {inv.status === 'Pending' && (
                  <div style={{ marginTop: 12 }}>
                    <Upload
                      beforeUpload={(file) => handleFileChange(inv._id, file)}
                      showUploadList={fileMap[inv._id] ? { showRemoveIcon: false } : false}
                      maxCount={1}
                      accept="image/*"
                      fileList={
                        fileMap[inv._id]
                          ? [{ uid: '-1', name: fileMap[inv._id].name, status: 'done' }]
                          : []
                      }
                    >
                      <Button icon={<UploadOutlined />} size="small" style={{ width: '100%', marginBottom: 8 }}>
                        Chọn ảnh biên lai
                      </Button>
                    </Upload>
                    <Button
                      type="primary"
                      size="small"
                      style={{ width: '100%' }}
                      onClick={() => handlePay(inv._id)}
                      disabled={!fileMap[inv._id]}
                    >
                      Xác nhận đã chuyển khoản
                    </Button>
                  </div>
                )}

                {inv.status === 'Waiting_Approval' && isLockedByOther && (
                  <Alert
                    style={{ marginTop: 10 }}
                    type="warning"
                    showIcon
                    message={`Đang được thanh toán bởi: ${inv.paid_by.fullname}`}
                  />
                )}

                {inv.status === 'Waiting_Approval' && !isLockedByOther && (
                  <Alert
                    style={{ marginTop: 10 }}
                    type="info"
                    showIcon
                    message="Biên lai đã gửi, đang chờ Admin duyệt..."
                  />
                )}

                {inv.status === 'Paid' && (
                  <Alert
                    style={{ marginTop: 10 }}
                    type="success"
                    showIcon
                    message="✅ Hóa đơn đã được thanh toán"
                  />
                )}

                {inv.payment_proof_url && (
                  <Button
                    size="small"
                    type="link"
                    style={{ marginTop: 4, padding: 0 }}
                    onClick={() => setPreviewUrl(inv.payment_proof_url)}
                  >
                    Xem biên lai đã gửi
                  </Button>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Image preview modal */}
      <Image
        style={{ display: 'none' }}
        src={previewUrl || undefined}
        preview={{
          visible: !!previewUrl,
          src: previewUrl,
          onVisibleChange: (v) => { if (!v) setPreviewUrl(null); },
        }}
      />
    </>
  );
}
