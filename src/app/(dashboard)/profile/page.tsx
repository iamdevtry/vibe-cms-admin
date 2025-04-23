'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { validateUserProfile } from '@/lib/utils/validation';

type ProfileFormData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  avatar?: File | null;
};

type FormErrors = {
  [key: string]: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    bio: '',
    avatar: null,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Load user data when session is available
  useEffect(() => {
    if (session?.user) {
      // API call to get user details
      const fetchUserProfile = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/users/profile');
          
          if (response.ok) {
            const userData = await response.json();
            setFormData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              username: userData.username || '',
              email: userData.email || '',
              bio: userData.bio || '',
              avatar: null,
            });
            
            if (userData.avatar) {
              setAvatarPreview(userData.avatar);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setMessage({
            type: 'error',
            text: 'Failed to load profile information. Please try again later.'
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserProfile();
    }
  }, [session]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  };
  

  
  // Validate form before submission
  const validateForm = (): boolean => {
    // Use the centralized validation logic
    const validation = validateUserProfile({
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio
    });
    
    if (!validation.success && validation.errors) {
      setErrors(validation.errors as FormErrors);
      return false;
    }
    
    return true;
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
      // Create FormData object for file upload
      const profileFormData = new FormData();
      profileFormData.append('firstName', formData.firstName);
      profileFormData.append('lastName', formData.lastName);
      profileFormData.append('username', formData.username);
      profileFormData.append('email', formData.email);
      profileFormData.append('bio', formData.bio);
      
      if (formData.avatar) {
        profileFormData.append('avatar', formData.avatar);
      }
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: profileFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      
      // Update session with new user data
      updateSession({
        ...session,
        user: {
          ...session?.user,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim() || updatedUser.username,
          image: updatedUser.avatar || session?.user?.image,
        },
      });
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred while updating your profile'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
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
          {/* Avatar Section */}
          <div className="flex items-start space-x-6">
            <AvatarUpload 
              currentAvatarUrl={avatarPreview || session?.user?.image || undefined}
              username={formData.username || session?.user?.name || undefined}
              onChange={(file) => setFormData(prev => ({ ...prev, avatar: file }))}
              error={errors.avatar}
              size="lg"
            />
            
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Profile Information</h3>
              <p className="text-sm text-gray-500">
                Update your personal information and how others see you on the platform.
              </p>
            </div>
          </div>
          
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username*
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Tell us a little about yourself"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
