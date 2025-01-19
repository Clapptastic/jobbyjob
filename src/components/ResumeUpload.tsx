import React, { useRef } from 'react';
import { uploadResume } from '../lib/storage';

export default function ResumeUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadResume(file, 'test-user'); // In a real app, use actual user ID
    } catch (error) {
      // Error is handled by the uploadResume function
      console.error('Upload failed:', error);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        aria-label="choose file"
      />
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Upload Resume
      </button>
      <p className="text-sm text-gray-600">
        Accepted formats: PDF only. Maximum size: 5MB
      </p>
    </div>
  );
}