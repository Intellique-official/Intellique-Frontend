import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Notification from "../components/Notification";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Basic frontend validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // === MOCK API FUNCTION (Replace with real fetch later) ===
  const mockSignInAPI = async (formData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test cases - Change these to test different scenarios
    const testCase = "invalid_credentials"; // Change to test different responses
    
    switch(testCase) {
      case "success":
        return {
          ok: true,
          json: async () => ({
            token: "mock-jwt-token-12345",
            user: {
              id: 1,
              email: formData.email,
              name: "Test User"
            }
          })
        };
        
      case "invalid_credentials":
        return {
          ok: false,
          status: 401,
          json: async () => ({
            message: "Invalid credentials",
            code: "AUTH_001"
          })
        };
        
      case "account_not_verified":
        return {
          ok: false,
          status: 403,
          json: async () => ({
            message: "Please verify your email address",
            code: "AUTH_002",
            requiresVerification: true
          })
        };
        
      case "account_locked":
        return {
          ok: false,
          status: 423,
          json: async () => ({
            message: "Account temporarily locked. Try again later.",
            code: "AUTH_003"
          })
        };
        
      case "server_error":
        return {
          ok: false,
          status: 500,
          json: async () => ({
            message: "Internal server error",
            code: "SERVER_001"
          })
        };
        
      case "validation_error":
        return {
          ok: false,
          status: 400,
          json: async () => ({
            message: "Validation failed",
            errors: {
              email: ["Invalid email format"],
              password: ["Password is required"]
            }
          })
        };
        
      default:
        return {
          ok: true,
          json: async () => ({
            token: "mock-jwt-token-default",
            user: { id: 1, email: formData.email }
          })
        };
    }
  };

  // === REAL API CALL (Replace mock with this when ready) ===
  const realAPICall = async (formData) => {
    return fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors and notifications
    setErrors({});
    setNotification({ message: "", type: "" });
    
    // Basic validation
    if (!validateForm()) {
      setNotification({
        message: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      
      // === USE MOCK FOR NOW, REPLACE WITH realAPICall LATER ===
      const response = await mockSignInAPI(formData);
      // const response = await realAPICall(formData); // <-- Switch to this when backend is ready
      
      const data = await response.json();

      if (response.ok) {
        // Success - store token, redirect to dashboard, etc.
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setNotification({
          message: "Successfully signed in! Redirecting...",
          type: "success",
        });
        
        // Redirect to dashboard or home page
        setTimeout(() => navigate("/dashboard"), 1500);
        
      } else {
        // Handle backend errors
        handleBackendErrors(data, response.status);
      }
      
    } catch (error) {
      // Network or unexpected errors
      setNotification({
        message: "Unable to connect. Please check your connection.",
        type: "error",
      });
      console.error("SignIn error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle backend response errors
  const handleBackendErrors = (errorData, statusCode) => {
    // Generic error message for security
    const genericError = "Invalid credentials. Please try again.";
    
    // Handle different error types based on status code
    switch(statusCode) {
      case 400:
        // Validation errors from backend
        if (errorData.errors) {
          const backendErrors = {};
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            if (field === "email" || field === "password") {
              backendErrors[field] = Array.isArray(messages) 
                ? messages[0] 
                : messages;
            }
          });
          if (Object.keys(backendErrors).length > 0) {
            setErrors(backendErrors);
            return;
          }
        }
        break;
        
      case 401:
        // Unauthorized - wrong credentials
        setErrors({
          password: genericError,
          email: genericError
        });
        return;
        
      case 403:
        // Forbidden - email not verified
        setNotification({
          message: errorData.message || "Please verify your email address to continue.",
          type: "warning",
        });
        // Optionally navigate to verification page
        if (errorData.requiresVerification) {
          setTimeout(() => navigate("/verify-email?email=" + encodeURIComponent(formData.email)), 2000);
        }
        return;
        
      case 423:
        // Account locked
        setNotification({
          message: errorData.message || "Account temporarily locked. Please try again later.",
          type: "error",
        });
        return;
        
      case 429:
        // Too many requests
        setNotification({
          message: "Too many attempts. Please wait a moment before trying again.",
          type: "error",
        });
        return;
    }
    
    // Default error handling
    if (errorData.message?.toLowerCase().includes("credentials") || 
        errorData.message?.toLowerCase().includes("invalid") ||
        errorData.message?.toLowerCase().includes("incorrect")) {
      setErrors({
        password: genericError,
        email: genericError
      });
    } else {
      setNotification({
        message: errorData.message || genericError,
        type: "error",
      });
    }
  };

  // Forgot password handler
  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      setNotification({
        message: "Please enter your email to reset password",
        type: "info",
      });
      return;
    }
    // Navigate to forgot password with email pre-filled
    navigate(`/forgot-password?email=${encodeURIComponent(formData.email)}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white text-gray-900">
      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      {/* Header */}
      <header className="w-full bg-black text-white text-center py-4 rounded-b-2xl">
        <h1 className="text-2xl font-bold">Intellique.</h1>
      </header>

      {/* Sign In Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-green-400 dark:bg-green-600 p-6 rounded-2xl shadow-md w-11/12 max-w-md mt-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">
          Sign In
        </h2>

        <div className="flex flex-col gap-4">
          <InputField
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
          />
          
          <InputField
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={loading}
          />
          
          {/* Forgot password link */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-black hover:text-white transition underline disabled:opacity-50"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-sm mt-4 text-black">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="underline text-black hover:text-white transition"
          >
            Sign up
          </Link>
        </p>

        {/* Submit button */}
        <div className="mt-6">
          <Button 
            type="submit"
            disabled={loading}
            text={loading ? "Signing In..." : "Sign In"}
          />
        </div>
      </form>

      <Footer />
    </div>
  );
};

export default SignIn;