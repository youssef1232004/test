import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CopyButton = ({ textToCopy, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(`تم نسخ ${label}!`, {
      style: { background: '#333', color: '#fff', border: '1px solid #00f3ff' },
      iconTheme: { primary: '#00f3ff', secondary: '#000' }
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg transition-all duration-300 flex items-center justify-center group outline-none"
      title={`نسخ ${label}`}
    >
      {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="group-hover:scale-110" />}
    </button>
  );
};

export default CopyButton;