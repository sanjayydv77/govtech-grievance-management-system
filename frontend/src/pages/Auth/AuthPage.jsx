import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'citizen',
    department: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Strict 10-digit number validation for phone field
    if (name === 'phone') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: onlyNums.slice(0, 10), // Limit to 10 digits
      }));
      // Reset OTP states if phone changes
      setOtpSent(false);
      setOtpVerified(false);
      setOtpInput('');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpInput('');
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'citizen',
      department: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    // Basic frontend validations
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.name || !formData.phone || !formData.role) {
        setError('All registration fields are required.');
        setLoading(false);
        return;
      }
      if (formData.phone.length !== 10) {
        setError('Please enter a valid 10-digit mobile number.');
        setLoading(false);
        return;
      }
      if (!otpVerified) {
        setError('Please verify your phone number with OTP before registering.');
        setLoading(false);
        return;
      }
      if (formData.role === 'officer' && !formData.department) {
        setError('Department is required for officer registration.');
        setLoading(false);
        return;
      }
    }

    try {
      const url = isLogin 
        ? 'http://localhost:5000/api/auth/login' 
        : 'http://localhost:5000/api/auth/register';

      // Setup payload based on login vs register
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: formData.role,
            ...(formData.role === 'officer' && { department: formData.department }),
          };

      const response = await axios.post(url, payload);
      const { user, token } = response.data;

      // Save to context
      login(user, token);

      setSuccessMsg(isLogin ? 'Login successful!' : 'Registration successful!');
      
      // Redirect based strictly on role
      setTimeout(() => {
        switch (user.role) {
          case 'citizen':
            navigate('/dashboard/public');
            break;
          case 'officer':
            navigate('/dashboard/officer');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'cm':
            navigate('/dashboard/cm');
            break;
          default:
            navigate('/');
        }
      }, 500);

    } catch (err) {
      console.error('Authentication Error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = () => {
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number before sending OTP.');
      return;
    }
    setError('');
    // Simulate sending OTP
    setOtpSent(true);
    setSuccessMsg(`OTP sent to ${formData.phone}`);
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleVerifyOtp = () => {
    if (otpInput.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }
    setError('');
    // Simulate verifying OTP (accepts anything >= 4 digits for now)
    setOtpVerified(true);
    setSuccessMsg('Phone number verified successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        
        {/* Branding header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Delhi CM Portal
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            GovTech Grievance Redressal & Monitoring System
          </p>
        </div>

        {/* Toggle buttons */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => isLogin || handleToggle()}
            className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 border-b-2 outline-none ${
              isLogin 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => !isLogin || handleToggle()}
            className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 border-b-2 outline-none ${
              !isLogin 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name field (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone field (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="flex gap-2">
                <input
                  name="phone"
                  type="text"
                  required
                  placeholder="10-digit number"
                  maxLength="10"
                  disabled={otpVerified}
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${otpVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="whitespace-nowrap px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
                {otpVerified && (
                  <div className="flex items-center px-3 bg-green-100 text-green-700 rounded-lg font-medium">
                    Verified
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OTP Input Field */}
          {!isLogin && otpSent && !otpVerified && (
            <div className="animate-fadeIn p-4 border border-blue-100 rounded-lg bg-blue-50/50">
              <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
              <div className="flex gap-2">
                <input
                  name="otp"
                  type="text"
                  placeholder="Enter OTP (e.g. 1234)"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="whitespace-nowrap px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* Role dropdown (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="citizen">Citizen</option>
                <option value="officer">Officer (Government Employee)</option>
                {/* Admin and CM accounts are created by system administrators only */}
              </select>
            </div>
          )}

          {/* Conditional Department field (Register + Officer role only) */}
          {!isLogin && formData.role === 'officer' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input
                name="department"
                type="text"
                required
                placeholder="e.g. PWD, Health"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Register')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AuthPage;
