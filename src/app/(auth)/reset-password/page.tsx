'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type FormStatus = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });
  
  // Validate token on page load
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing or invalid reset token. Please request a new password reset link.');
      return;
    }
    
    const validateToken = async () => {
      setStatus('validating');
      try {
        const response = await fetch(`/api/reset-password/validate?token=${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired token');
        }
        
        setStatus('idle');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Invalid or expired token');
      }
    };
    
    validateToken();
  }, [token]);
  
  // Validate password as user types
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      match: password === confirmPassword && password !== ''
    });
  }, [password, confirmPassword]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check all validation criteria
    const isValid = Object.values(passwordValidation).every(Boolean);
    if (!isValid) {
      return;
    }
    
    setStatus('submitting');
    
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  // Show validation status indicator
  const ValidationIndicator = ({ isValid }: { isValid: boolean }) => (
    <span className={`inline-block w-4 h-4 rounded-full ml-2 ${isValid ? 'bg-green-500' : 'bg-gray-300'}`} />
  );
  
  // If there's an error with the token
  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Reset Password Failed</h1>
          </div>
          
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p>{errorMessage}</p>
          </div>
          
          <div className="flex justify-center">
            <Link 
              href="/forgot-password" 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // If token is being validated
  if (status === 'validating') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-4">Verifying your reset link...</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // If password was successfully reset
  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Password Reset Successful</h1>
            <p className="text-gray-600">Your password has been successfully reset.</p>
          </div>
          
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            <p>You can now sign in with your new password.</p>
          </div>
          
          <div className="flex justify-center">
            <Link 
              href="/login" 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Main form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            Please enter a new secure password
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              required
              disabled={status === 'submitting'}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              required
              disabled={status === 'submitting'}
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center">
                <span className={passwordValidation.length ? 'text-green-700' : 'text-gray-600'}>
                  At least 8 characters
                </span>
                <ValidationIndicator isValid={passwordValidation.length} />
              </li>
              <li className="flex items-center">
                <span className={passwordValidation.uppercase ? 'text-green-700' : 'text-gray-600'}>
                  At least one uppercase letter
                </span>
                <ValidationIndicator isValid={passwordValidation.uppercase} />
              </li>
              <li className="flex items-center">
                <span className={passwordValidation.lowercase ? 'text-green-700' : 'text-gray-600'}>
                  At least one lowercase letter
                </span>
                <ValidationIndicator isValid={passwordValidation.lowercase} />
              </li>
              <li className="flex items-center">
                <span className={passwordValidation.number ? 'text-green-700' : 'text-gray-600'}>
                  At least one number
                </span>
                <ValidationIndicator isValid={passwordValidation.number} />
              </li>
              <li className="flex items-center">
                <span className={passwordValidation.match ? 'text-green-700' : 'text-gray-600'}>
                  Passwords match
                </span>
                <ValidationIndicator isValid={passwordValidation.match} />
              </li>
            </ul>
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              status === 'submitting' || 
              !Object.values(passwordValidation).every(Boolean)
            }
          >
            {status === 'submitting' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
