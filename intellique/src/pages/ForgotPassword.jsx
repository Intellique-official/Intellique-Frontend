// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Notification from "../components/Notification";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email"));
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestCount, setRequestCount] = useState(0); // Track requests for rate limiting UI
  
  
  // console.log("Token:", token);     
  console.log("Email");

  // Basic email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Mock API function (replace with real endpoint)
  const mockRequestReset = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate rate limiting after 3 requests
    if (requestCount >= 2) {
      return {
        ok: false,
        status: 429,
        json: async () => ({
          message: "Too many requests. Please try again in 15 minutes.",
          retryAfter: 900 // seconds
        })
      };
    }
    
    // Always return success for security (even if email doesn't exist)
    return {
      ok: true,
      json: async () => ({
        message: "If an account exists, reset instructions have been sent.",
        cooldown: 120 // seconds until next request allowed
      })
    };
  };

  // Real API call (when ready)
  const realAPICall = async (email) => {
    return fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    setNotification({ message: "", type: "" });
    
    // Validate email
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setRequestCount(prev => prev + 1);
      
      // Use mock for now
      const response = await mockRequestReset(email);
      // const response = await realAPICall(email); // Switch to this later
      
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setNotification({
          message: data.message || "If an account exists, you'll receive reset instructions shortly.",
          type: "success",
        });
        
        // Clear form after success
        setEmail("");
        
        // Auto-redirect to login after 5 seconds
        setTimeout(() => {
          navigate("/signin");
        }, 10000);
        
      } else {
        // Handle errors
        handleErrorResponse(data, response.status);
      }
      
    } catch (error) {
      console.error("Forgot password error:", error);
      setNotification({
        message: "Unable to process request. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleErrorResponse = (errorData, status) => {
    switch(status) {
      case 429: // Rate limited
        setNotification({
          message: errorData.message || "Too many attempts. Please wait before trying again.",
          type: "error",
        });
        break;
        
      case 400: // Bad request
        setError(errorData.errors?.email?.[0] || "Invalid email format");
        break;
        
      default:
        // Generic error - never reveal if email exists
        setNotification({
          message: "If an account exists, you'll receive reset instructions shortly.",
          type: "info", // Show as info, not error, for security
        });
        setSuccess(true); // Still show success UI for security
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white text-gray-900">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      <header className="w-full bg-black text-white text-center py-4 rounded-b-2xl">
        <h1 className="text-2xl font-bold">IntelliQue.</h1>
      </header>

      <div className="w-11/12 max-w-md mt-8">
        {success ? (
          // Success State
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            
            <p className="text-gray-700 mb-6">
              If an account exists with {email}, you'll receive password reset instructions shortly.
            </p>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-800">
                <p className="font-semibold mb-1">📧 Check your spam folder</p>
                <p>Sometimes emails end up there by mistake.</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Didn't receive an email?</p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setNotification({ message: "", type: "" });
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium mt-1"
                  disabled={loading}
                >
                  Try again in 2 minutes
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                to="/signin"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          // Request Form
          <form
            onSubmit={handleSubmit}
            className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h2>
            
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            <div className="mb-6">
              <InputField
                type="email"
                placeholder="Enter your email address"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800">
                    For security reasons, we don't reveal whether an email address is registered.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button
                type="submit"
                disabled={loading || requestCount >= 3}
                text={loading ? "Sending..." : "Send Reset Instructions"}
                fullWidth
              />
              
              <div className="text-center">
                <Link
                  to="/signin"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </div>
            
            {/* Rate limiting indicator */}
            {requestCount > 0 && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>Requests this session: {requestCount}/3</p>
              </div>
            )}
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;