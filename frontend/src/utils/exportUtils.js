import * as XLSX from 'xlsx';

/**
 * Xuất dữ liệu ra file Excel (.xlsx)
 * @param {Array<Object>} data - Mảng các object chứa dữ liệu cần xuất
 * @param {string} fileName - Tên file (không cần đuôi .xlsx)
 * @param {string} sheetName - Tên sheet trong file Excel
 */
export const exportToExcel = (data, fileName = 'bao_cao', sheetName = 'ThongKe') => {
  if (!data || data.length === 0) {
    console.warn('Không có dữ liệu để xuất Excel');
    return;
  }

  // Tạo worksheet từ JSON data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Căn chỉnh độ rộng cột tự động dựa trên độ dài nội dung (đơn giản hóa)
  const cols = Object.keys(data[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => (row[key] ? row[key].toString().length : 0))
    ) + 2,
  }));
  worksheet['!cols'] = cols;

  // Tạo workbook và gắn worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Xuất file và tải về
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
