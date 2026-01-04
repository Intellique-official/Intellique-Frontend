// src/components/PasswordStrengthIndicator.jsx
const PasswordStrengthIndicator = ({ strength }) => {
  const getStrengthLabel = (strength) => {
    if (strength < 25) return "Very Weak";
    if (strength < 50) return "Weak";
    if (strength < 75) return "Fair";
    if (strength < 90) return "Good";
    return "Strong";
  };

  const getColor = (strength) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    if (strength < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">Password strength:</span>
        <span className={`font-medium ${getColor(strength).replace('bg-', 'text-')}`}>
          {getStrengthLabel(strength)}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(strength)} transition-all duration-300`}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;