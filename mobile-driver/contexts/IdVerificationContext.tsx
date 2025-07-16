import React, { createContext, useState, useContext, ReactNode } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface IdVerificationContextType {
  frontImage: ImagePicker.ImagePickerAsset | null;
  backImage: ImagePicker.ImagePickerAsset | null;
  setFrontImage: (image: ImagePicker.ImagePickerAsset | null) => void;
  setBackImage: (image: ImagePicker.ImagePickerAsset | null) => void;
  clearImages: () => void;
}

const IdVerificationContext = createContext<IdVerificationContextType | undefined>(undefined);

export const IdVerificationProvider = ({ children }: { children: ReactNode }) => {
  const [frontImage, setFrontImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [backImage, setBackImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const clearImages = () => {
    setFrontImage(null);
    setBackImage(null);
  };

  return (
    <IdVerificationContext.Provider value={{ frontImage, backImage, setFrontImage, setBackImage, clearImages }}>
      {children}
    </IdVerificationContext.Provider>
  );
};

export const useIdVerification = () => {
  const context = useContext(IdVerificationContext);
  if (context === undefined) {
    throw new Error('useIdVerification must be used within an IdVerificationProvider');
  }
  return context;
};