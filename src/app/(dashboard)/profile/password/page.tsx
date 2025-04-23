'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FormErrors = {
  [key: string]: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Password validation criteria
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Update password validation criteria
    if (name === 'newPassword' || name === 'confirmPassword') {
      const newPass = name === 'newPassword' ? value : formData.newPassword;
      const confirmPass = name === 'confirmPassword' ? value : formData.confirmPassword;
      
      setPasswordValidation({
        length: newPass.length >= 8,
        uppercase: /[A-Z]/.test(newPass),
        lowercase: /[a-z]/.test(newPass),
        number: /[0-9]/.test(newPass),
        match: newPass === confirmPass && newPass !== ''
      });
    }
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must include uppercase, lowercase, and numbers';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }
      
      // Reset form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setMessage({
        type: 'success',
        text: 'Password changed successfully!'
      });
      
      // Redirect to profile page after a delay
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred while changing your password'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show validation status indicator
  const ValidationIndicator = ({ isValid }: { isValid: boolean }) => (
    <span className={`inline-block w-4 h-4 rounded-full ml-2 ${isValid ? 'bg-green-500' : 'bg-gray-300'}`} />
  );
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Change Password</h1>
          <Link 
            href="/profile" 
            className="text-sm text-green-600 hover:text-green-800"
          >
            Back to Profile
          </Link>
        </div>
        
        {message && (
          <div 
            className={`mb-6 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
              'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
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
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50"
              disabled={isLoading || !Object.values(passwordValidation).every(Boolean)}
            >
              {isLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
