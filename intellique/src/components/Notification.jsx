import { useEffect } from "react";

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // disappears after 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-400 text-black",
    info: "bg-yellow-600 text-black",
  };

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg font-semibold ${colors[type]}`}
    >
      {message}
    </div>
  );
};

export default Notification;
