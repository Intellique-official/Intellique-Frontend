// src/pages/ForgotPassword.jsx (Updated)
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Notification from "../components/Notification";
import SingleCharInputs from "../components/SingleCharInputs";
import axios from "../api/axios";
import useCountdownTimer from "../hooks/useCountDownTimer";
import ResendButton from "../components/ResendButton";

const OTPVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [OTP, setOTP] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Initialize countdown timer
  const {
    seconds,
    isActive,
    isComplete,
    restart,
    formattedTime,
    reset
  } = useCountdownTimer(60, {
    autoStart: true,
    onComplete: () => {
      setNotification({
        message: "OTP has expired. Please request a new one.",
        type: "warning"
      });
    },
    persistKey: "otp-timer",
    format: 'mm:ss'
  });

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (isActive && !isComplete) return;
    if (MAX_RETRIES && retryCount >= MAX_RETRIES) {
      setNotification({
        message: `Maximum resend attempts (${MAX_RETRIES}) reached. Please try again later.`,
        type: "error"
      });
      return;
    }

    setResendLoading(true);
    setError("");
    
    try {
      // Call your API to resend OTP
      const response = await axios.post("/api/auth/resend-otp", { 
        email: email || searchParams.get("email") 
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Reset and restart timer
      restart(60);
      setRetryCount(prev => prev + 1);
      
      setNotification({
        message: response.data.message || "New OTP has been sent to your email.",
        type: "success",
      });
      
    } catch (error) {
      console.error("Resend OTP error:", error);
      setNotification({
        message: error.response?.data?.message || "Failed to resend OTP. Please try again.",
        type: "error",
      });
    } finally {
      setResendLoading(false);
    }
  };

  // Handle OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    setNotification({ message: "", type: "" });
    
    // Validate OTP
    if (!OTP || OTP.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    // Validate OTP hasn't expired
    if (isComplete) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post("/api/auth/verify-otp", 
        { 
          email: email || searchParams.get("email"),
          otp: OTP 
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setNotification({
        message: response.data.message || "Email verified successfully!",
        type: "success",
      });
      
      // Clear OTP input
      setOTP("");
      
      // Navigate to password reset page or dashboard
      setTimeout(() => {
        navigate("/reset-password", { state: { email: email || searchParams.get("email") } });
      }, 1500);
      
    } catch (error) {
      console.error("OTP verification error:", error);
      
      let errorMessage = "Unable to verify OTP. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid OTP. Please check and try again.";
      } else if (error.response?.status === 410) {
        errorMessage = "OTP has expired. Please request a new one.";
        restart(0); // Force timer to complete
      }
      
      setNotification({
        message: errorMessage,
        type: "error",
      });
      
      // Clear OTP on error (optional)
      // setOTP("");
    } finally {
      setLoading(false);
    }
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Initialize timer when component mounts
  useEffect(() => {
    // If email is in URL params, we assume OTP was already sent
    if (searchParams.get("email")) {
      setEmail(searchParams.get("email"));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white text-gray-900">
      {notification.message && 
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "" })}
        />
      }

      <header className="w-full bg-black text-white text-center py-4 rounded-b-2xl">
        <h1 className="text-2xl font-bold">Intellique.</h1>
      </header>

      <div className="w-11/12 max-w-md mt-8">
        <form
          onSubmit={handleSubmit}
          className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          
          {email && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                OTP sent to: <span className="font-medium">{email}</span>
              </p>
            </div>
          )}
          
          <p className="text-gray-600 mb-6">
            Enter the 6-digit code that was sent to your email address.
          </p>
          
          <SingleCharInputs 
            setOTP={setOTP}
            error={error}
            setError={setError}  />
          
          {/* Timer Display */}
          <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex-1">
              <p className="text-blue-800 font-medium">
                {isActive && !isComplete ? (
                  <>
                    OTP expires in:{" "}
                    <span className="font-mono text-lg">
                      {formattedTime.display}
                    </span>
                  </>
                ) : isComplete ? (
                  <span className="text-red-600">OTP has expired</span>
                ) : (
                  "Ready to request new OTP"
                )}
              </p>
              
              {MAX_RETRIES && retryCount > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Attempts: {retryCount}/{MAX_RETRIES}
                </p>
              )}
            </div>
            
            <div className="ml-4">
              <ResendButton
                onResend={handleResendOTP}
                isActive={isActive}
                isComplete={isComplete}
                formattedTime={formattedTime}
                isLoading={resendLoading}
                maxRetries={MAX_RETRIES}
                retryCount={retryCount}
                buttonText="Resend OTP"
                className="text-sm"
              />
            </div>
          </div>
          
          {/* Security Note */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800">
                  For security reasons, each OTP is valid for 1 minute and can be requested up to {MAX_RETRIES} times.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              type="submit"
              disabled={loading || !OTP || OTP.length !== 6 || isComplete}
              text={loading ? "Verifying..." : "Verify OTP"}
              fullWidth
            />
            
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Need to change email?
              </Link>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default OTPVerification;