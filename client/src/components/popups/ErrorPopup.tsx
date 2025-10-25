import React, { useEffect, useState } from 'react';
import { CircleXIcon } from 'lucide-react';

const ErrorPopup: React.FC<any> = ({ message }) => {
  const [visible, setVisible] = useState(true);

  // auto close
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000); // 6 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="
        fixed bottom-5 right-5 z-50 
        w-[90%] sm:w-80 md:w-96 lg:max-w-xl 
        p-4 bg-red-800 border border-red-900 
        rounded-lg shadow-lg flex items-start gap-3 animate-slideIn
      "
    >
      {/* message */}
      <p className="flex-1 text-white text-sm sm:text-base cursor-default">{message}</p>

      {/* close button */}
      <button onClick={() => setVisible(false)} className="text-white transition cursor-pointer">
        <CircleXIcon size={20} />
      </button>
    </div>
  );
};

export default ErrorPopup;
