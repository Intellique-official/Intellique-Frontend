const InputField = ({ type, placeholder, name, value, onChange, error}) => {
  return (
    <div className="flex flex-col gap-1">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-white px-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 outline-none border ${
          error
            ? "border-red-500 focus:ring-1 focus:ring-red-400"
            : "border-transparent focus:ring-1 focus:ring-black"
        } transition-all duration-200`}
      />
      {error && (
        <p className="font-bold text-sm mt-1 animate-fadeIn text-red-600">{error}</p>
      )}
    </div>
  );
};

export default InputField;
