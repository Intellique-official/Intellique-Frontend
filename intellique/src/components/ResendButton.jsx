
const ResendButton = ({
  onResend,
  isActive,
  isComplete,
  formattedTime,
  isLoading = false,
  maxRetries = 5,
  retryCount = 0,
  buttonText = "Resend Code",
  resendingText = "Sending...",
  disabledButtonClassName = "bg-gray-300 text-gray-500 cursor-not-allowed",
  activeButtonClassName = "bg-blue-600 text-white hover:bg-blue-700",
  expiredButtonClassName = "bg-red-600 text-white hover:bg-red-700",
  loadingButtonClassName = "bg-gray-400 text-white cursor-wait",
  className = "",
  style = {}
}) => {
  const getButtonState = () => {
    if (isLoading) return 'loading';
    if (isActive && !isComplete) return 'active';
    if (isComplete) return 'expired';
    return 'ready';
  };

  const buttonState = getButtonState();

  const getButtonClassName = () => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    switch (buttonState) {
      case 'loading':
        return `${baseClasses} ${loadingButtonClassName}`;
      case 'active':
        return `${baseClasses} ${disabledButtonClassName}`;
      case 'expired':
        return `${baseClasses} ${expiredButtonClassName} focus:ring-red-500`;
      case 'ready':
        return `${baseClasses} ${activeButtonClassName} focus:ring-blue-500`;
      default:
        return baseClasses;
    }
  };

  const renderButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {resendingText}
        </>
      );
    }

    if (isActive && !isComplete) {
      return `Resend in ${formattedTime.display}`;
    }

    if (isComplete && maxRetries && retryCount >= maxRetries) {
      return "Max attempts reached";
    }

    return buttonText;
  };

  const isDisabled = buttonState === 'active' || buttonState === 'loading' || 
                    (maxRetries && retryCount >= maxRetries);

  return (
    <button
      type="button"
      onClick={onResend}
      disabled={isDisabled}
      className={`${getButtonClassName()} ${className}`}
      style={style}
    >
      {renderButtonContent()}
      {maxRetries && retryCount > 0 && !isActive && (
        <span className="ml-2 text-xs opacity-75">
          ({retryCount}/{maxRetries})
        </span>
      )}
    </button>
  );
};

export default ResendButton;