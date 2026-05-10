import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'list',
  'bullet',
  'indent',
  'blockquote',
  'code-block',
  'link',
];

/**
 * Editor HTML (Quill). `value` / `onChange` là chuỗi HTML.
 */
export default function RichTextEditor({ value, onChange, placeholder, className }) {
  return (
    <div className={['ktx-rich-text-wrap', className].filter(Boolean).join(' ')}>
      <ReactQuill
        theme="snow"
        value={value ?? ''}
        onChange={onChange}
        modules={MODULES}
        formats={FORMATS}
        placeholder={placeholder}
      />
    </div>
  );
}
