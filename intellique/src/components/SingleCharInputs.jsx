import { useRef, useState } from "react"

export default function SingleCharInputs({ length = 6 , setOTP, error, setError}) {
  const inputs = useRef([]);

  


  const handleChange = (e, index) => {
    setError("")
    const value = e.target.value;

    // Keep only the first character
    e.target.value = value.slice(0, 1);

    // Move to next input if character entered
    if (value && index < length - 1) {
      inputs.current[index + 1].focus();
    }
    setOTP(() => getCode())
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputs.current[index - 1].focus();
    }
  };


  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").slice(0, length);
    pasted.split("").forEach((char, i) => {
        inputs.current[i].value = char;
    });
    inputs.current[Math.min(pasted.length, length - 1)].focus();
   };
  
   const getCode =() =>{
     return inputs.current.map(input => input.value).join("")
    }

  return (
    <div className="flex gap-0.5 flex-col mb-4">
      <div className="flex gap-1 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength="1"
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={(e) => handlePaste(e)}
          className={`size-10 text-2xl text-center font-bold bg-white p-1 rounded-lg text-gray-800 placeholder-gray-400 outline-none border ${
            error
                ? "border-red-500 focus:ring-1 focus:ring-red-400"
                : "border-transparent focus:ring-1 focus:ring-black"
            } transition-all duration-200`}
        />
        
      ))
      }
      </div>
      {error && (
            <p className="font-bold text-sm mt-0.5 animate-fadeIn text-center text-red-600">{error}</p>
        )}
    </div>
  );
}
