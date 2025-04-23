'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { validateFile, DEFAULT_VALIDATION_OPTIONS } from '@/lib/utils/file-upload';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  username?: string;
  onChange: (file: File | null) => void;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A reusable avatar upload component
 * This component handles avatar preview, file selection, and validation
 */
export default function AvatarUpload({
  currentAvatarUrl,
  username,
  onChange,
  error,
  size = 'md',
  className = '',
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get dimension based on size prop
  const getDimension = () => {
    switch (size) {
      case 'sm': return 'w-16 h-16';
      case 'lg': return 'w-32 h-32';
      case 'md':
      default: return 'w-24 h-24';
    }
  };
  
  // Get initials from username
  const getInitials = () => {
    if (!username) return '?';
    
    const nameParts = username.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return username.substring(0, 2).toUpperCase();
  };
  
  // Set initial preview from currentAvatarUrl
  useEffect(() => {
    if (currentAvatarUrl) {
      setPreview(currentAvatarUrl);
    }
  }, [currentAvatarUrl]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      onChange(null);
      return;
    }
    
    // Validate file
    const validation = validateFile(file, DEFAULT_VALIDATION_OPTIONS.image);
    
    if (!validation.valid) {
      // If invalid, clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(file);
    
    // Clean up preview URL on unmount
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Remove current avatar
  const removeAvatar = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <div
          className={`${getDimension()} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer`}
          onClick={triggerFileInput}
        >
          {preview ? (
            <img 
              src={preview} 
              alt="Avatar preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-green-600 text-white flex items-center justify-center">
              <span className="text-2xl font-bold">{getInitials()}</span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
            <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
              Change
            </span>
          </div>
        </div>
        
        {/* Remove button - only shows when there's a preview */}
        {preview && (
          <button
            type="button"
            onClick={removeAvatar}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            aria-label="Remove avatar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      
      <button
        type="button"
        onClick={triggerFileInput}
        className="mt-2 text-sm text-green-600 hover:text-green-800"
      >
        Upload Avatar
      </button>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        Recommended: Square JPG, PNG or GIF (max 2MB)
      </p>
    </div>
  );
}
