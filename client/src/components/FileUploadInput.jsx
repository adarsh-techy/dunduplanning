import { useRef, useState } from 'react';
import { FiPaperclip } from 'react-icons/fi';

// A small paperclip button that opens a file picker and immediately calls
// onUpload(file) with the chosen file.
export default function FileUploadInput({ onUpload, label = 'Attach' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 dark:text-brand-400 dark:hover:text-brand-300"
        title="Upload a receipt, certificate or photo"
      >
        <FiPaperclip /> {busy ? 'Uploading…' : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
}
