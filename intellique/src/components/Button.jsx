const Button = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-green-500 hover:text-black transition-colors duration-200"
    >
      {text}
    </button>
  );
};

export default Button;
