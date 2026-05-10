import DOMPurify from 'dompurify';
import { Typography } from 'antd';

/**
 * Hiển thị nội dung phản hồi: HTML (Quill) đã sanitize hoặc văn bản thuần (dữ liệu cũ).
 *
 * @param {{ content?: string | null; className?: string }} props
 */
export default function FeedbackRichBody({ content, className }) {
  if (content == null || String(content).trim() === '') return null;
  const raw = String(content);
  if (!raw.includes('<')) {
    return (
      <Typography.Paragraph className={['ktx-tab-pre-wrap', className].filter(Boolean).join(' ')}>
        {raw}
      </Typography.Paragraph>
    );
  }
  const safe = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  return (
    <div
      className={['ktx-feedback-html-body', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
