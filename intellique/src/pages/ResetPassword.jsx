// src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Notification from "../components/Notification";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import { Link } from "react-router-dom" 

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check token validity on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setNotification({
          message: "Invalid or missing reset token.",
          type: "error",
        });
        return;
      }

      try {
        // Mock token validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test different scenarios
        const testCase = "valid"; // Change to "expired", "used", "invalid"
        
        switch(testCase) {
          case "valid":
            setTokenValid(true);
            break;
          case "expired":
            setTokenValid(false);
            setNotification({
              message: "This reset link has expired. Please request a new one.",
              type: "error",
            });
            break;
          case "used":
            setTokenValid(false);
            setNotification({
              message: "This reset link has already been used.",
              type: "error",
            });
            break;
          case "invalid":
            setTokenValid(false);
            setNotification({
              message: "Invalid reset link. Please request a new password reset.",
              type: "error",
            });
            break;
          default:
            setTokenValid(false);
        }
        
      } catch (error) {
        setTokenValid(false);
        setNotification({
          message: "Unable to validate reset token.",
          type: "error",
        });
      }
    };

    validateToken();
  }, [token]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25; // Bonus for special chars
    
    return Math.min(strength, 100);
  };

  // Validate password
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Include at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Include at least one lowercase letter";
    }
    if (!/\d/.test(password)) {
      return "Include at least one number";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Calculate password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Mock API function
  const mockResetPassword = async (token, password) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      ok: true,
      json: async () => ({
        message: "Password reset successful. You can now sign in with your new password.",
        requiresLogin: true // Security: Force fresh login
      })
    };
  };

  // Real API call (when ready)
  const realAPICall = async (token, password) => {
    return fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    setNotification({ message: "", type: "" });
    
    // Validate
    const newErrors = {};
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check password strength
    if (passwordStrength < 75) {
      setNotification({
        message: "Please choose a stronger password for better security.",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Use mock for now
      const response = await mockResetPassword(token, formData.password);
      // const response = await realAPICall(token, formData.password);
      
      const data = await response.json();

      if (response.ok) {
        setNotification({
          message: data.message || "Password reset successful!",
          type: "success",
        });
        
        // Security: Clear form data
        setFormData({ password: "", confirmPassword: "" });
        
        // Security: Clear any stored auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        
        // Redirect to sign in with success message
        setTimeout(() => {
          navigate("/signin", { 
            state: { 
              message: "Password reset successful. Please sign in with your new password.",
              messageType: "success"
            }
          });
        }, 2000);
        
      } else {
        handleErrorResponse(data, response.status);
      }
      
    } catch (error) {
      console.error("Reset password error:", error);
      setNotification({
        message: "Unable to reset password. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleErrorResponse = (errorData, status) => {
    switch(status) {
      case 400:
        if (errorData.errors?.password) {
          setErrors({ password: errorData.errors.password[0] });
        } else {
          setNotification({
            message: errorData.message || "Invalid password format.",
            type: "error",
          });
        }
        break;
        
      case 410: // Gone (token expired/used)
        setTokenValid(false);
        setNotification({
          message: errorData.message || "This reset link is no longer valid.",
          type: "error",
        });
        break;
        
      case 422: // Unprocessable (weak password)
        setErrors({ password: errorData.message || "Password is too weak." });
        break;
        
      default:
        setNotification({
          message: errorData.message || "Unable to reset password.",
          type: "error",
        });
    }
  };

  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between bg-white">
        <header className="w-full bg-black text-white text-center py-4 rounded-b-2xl">
          <h1 className="text-2xl font-bold">IntelliQue.</h1>
        </header>

        <div className="w-11/12 max-w-md mt-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Reset Link
            </h2>
            
            <p className="text-gray-700 mb-6">
              {notification.message || "This password reset link is invalid or has expired."}
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/forgot-password")}
                text="Request New Reset Link"
                fullWidth
              />
              
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/signin"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
            
            {/* Security Warning */}
            <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Reset links expire after 1 hour for security. Never share reset links with anyone.
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Valid token - show reset form
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
        <form
          onSubmit={handleSubmit}
          className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Set New Password
          </h2>
          
          <p className="text-gray-600 mb-6">
            Create a new strong password for your IntelliQue account.
          </p>
          
          <div className="space-y-6">
            {/* Password */}
            <div>
              <InputField
                type="password"
                placeholder="New password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={loading}
                autoComplete="new-password"
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <PasswordStrengthIndicator strength={passwordStrength} />
                  <div className="text-xs text-gray-500 mt-1">
                    Include uppercase, lowercase, numbers, and special characters
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <InputField
                type="password"
                placeholder="Confirm new password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>
          
          {/* Security Requirements */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Requirements
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                At least 8 characters
              </li>
              <li className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                One uppercase letter
              </li>
              <li className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                One lowercase letter
              </li>
              <li className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                One number
              </li>
            </ul>
          </div>
          
          {/* Important Security Note */}
          <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              🔒 For security: After reset, you'll be signed out of all devices and need to sign in again.
            </p>
          </div>
          
          <div className="mt-6 space-y-4">
            <Button
              type="submit"
              disabled={loading || passwordStrength < 50}
              text={loading ? "Resetting..." : "Reset Password"}
              fullWidth
            />
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                disabled={loading}
              >
                Cancel and return to Sign In
              </button>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;