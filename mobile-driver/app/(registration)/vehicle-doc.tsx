import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '@/components/ui/Icon';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useDriverStore } from '../../lib/stores/driver.store';
import { useAuthStore } from '../../lib/stores/auth.store';
import { API_BASE_URL } from '../../config/api';

interface FileUploadItemProps {
  file: DocumentPicker.DocumentPickerSuccessResult | null;
  progress: number;
  onRemove: () => void;
}

const FileUploadItem: React.FC<FileUploadItemProps> = ({ file, progress, onRemove }) => {
  if (!file) return null;
  const asset = file.assets[0];

  return (
    <View className="flex-row items-center bg-gray-100 p-2 rounded-lg mt-2">
      <Icon name="Receipt" size={24} color="gray" />
      <View className="flex-1 ml-2">
        <Text className="text-sm">{asset.name}</Text>
        <View className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
          <Animated.View className="bg-brand-goldenYellow h-1.5 rounded-full" style={{ width: `${progress}%` }} />
        </View>
      </View>
      <Text className="text-xs text-gray-500 ml-2">{asset.size ? Math.round(asset.size / 1024) : 0} KB</Text>
      <TouchableOpacity onPress={onRemove} className="ml-2">
        <Icon name="X" size={16} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

interface LicenseUploadBoxProps {
  image: ImagePicker.ImagePickerAsset | null;
  onUpload: () => void;
  side: 'Front' | 'Back';
}

const LicenseUploadBox: React.FC<LicenseUploadBoxProps> = ({ image, onUpload, side }) => (
  <View className="mb-4">
    <Text className="text-sm font-medium text-black mb-2">{side}</Text>
    <View className="w-full h-48 bg-brand-lightGray rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
      {image ? (
        <Image source={{ uri: image.uri }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="items-center justify-center flex-1">
          <Icon name="User" size={48} color="#A0A0A0" />
        </View>
      )}
      <TouchableOpacity onPress={onUpload} className="absolute bottom-2 right-2 bg-brand-goldenYellow p-2 rounded-full">
        <Icon name="Camera" size={24} color="white" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function VehicleDocScreen() {
  const router = useRouter();
  const { vehicleDocuments, updateVehicleDocuments, isRegistrationComplete, personalInfo, idVerification, vehicleInfo } = useDriverStore();
  const { accessToken, setProfileComplete, setRegistrationStatus } = useAuthStore();

  const [revenueLicense, setRevenueLicense] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(vehicleDocuments.revenueLicense);
  const [vehicleInsurance, setVehicleInsurance] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(vehicleDocuments.vehicleInsurance);
  const [registrationDoc, setRegistrationDoc] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(vehicleDocuments.registrationDoc);
  const [licenseFront, setLicenseFront] = useState<ImagePicker.ImagePickerAsset | null>(vehicleDocuments.licenseFront);
  const [licenseBack, setLicenseBack] = useState<ImagePicker.ImagePickerAsset | null>(vehicleDocuments.licenseBack);

  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync local state with store data on mount
  // Documents are saved when user clicks "Complete Registration"

  const startProgress = (key: string) => {
    setProgress(prev => ({ ...prev, [key]: 0 }));
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev[key] >= 100) {
          clearInterval(interval);
          return { ...prev, [key]: 100 };
        }
        return { ...prev, [key]: (prev[key] || 0) + 10 };
      });
    }, 100);
  };

  const handleFileUpload = async (setFile: React.Dispatch<React.SetStateAction<DocumentPicker.DocumentPickerSuccessResult | null>>, key: string) => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setFile(result);
      startProgress(key);
    }
  };

  const handleImageUpload = async (setImage: React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerAsset | null>>) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleVerify = async () => {
    // Save documents to store first before validation
    updateVehicleDocuments({
      revenueLicense,
      vehicleInsurance,
      registrationDoc,
      licenseFront,
      licenseBack,
    });

    // Give the store a moment to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // ====== DEBUG: Print EVERYTHING in the store ======
    console.log('========== REGISTRATION DATA DEBUG ==========');
    console.log('1. PERSONAL INFO:', JSON.stringify({
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      dateOfBirth: personalInfo.dateOfBirth,
      email: personalInfo.email,
      secondaryPhone: personalInfo.secondaryPhone,
      city: personalInfo.city,
      nic: personalInfo.nic,
      gender: personalInfo.gender,
      hasProfileImage: !!personalInfo.profileImage,
    }, null, 2));
    
    console.log('2. ID VERIFICATION:', JSON.stringify({
      hasFrontImage: !!idVerification.frontImage,
      hasBackImage: !!idVerification.backImage,
    }, null, 2));
    
    console.log('3. VEHICLE INFO:', JSON.stringify({
      vehicleType: vehicleInfo.vehicleType,
      vehicleBrand: vehicleInfo.vehicleBrand,
      vehicleModel: vehicleInfo.vehicleModel,
      yearOfManufacture: vehicleInfo.yearOfManufacture,
      vehicleColor: vehicleInfo.vehicleColor,
      licensePlate: vehicleInfo.licensePlate,
      seats: vehicleInfo.seats,
      hasFrontView: !!vehicleInfo.frontView,
      hasSideView: !!vehicleInfo.sideView,
      hasRearView: !!vehicleInfo.rearView,
      hasInteriorView: !!vehicleInfo.interiorView,
    }, null, 2));
    
    console.log('4. VEHICLE DOCUMENTS:', JSON.stringify({
      hasRevenueLicense: !!vehicleDocuments.revenueLicense,
      hasVehicleInsurance: !!vehicleDocuments.vehicleInsurance,
      hasRegistrationDoc: !!vehicleDocuments.registrationDoc,
      hasLicenseFront: !!vehicleDocuments.licenseFront,
      hasLicenseBack: !!vehicleDocuments.licenseBack,
    }, null, 2));
    
    const isComplete = isRegistrationComplete();
    console.log('5. VALIDATION RESULT:', isComplete);
    console.log('============================================');

    if (!isComplete) {
      Alert.alert('Error', 'Please complete all required fields before submitting. Check console for details.');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'Authentication token not found. Please login again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // ========== SINGLE API CALL WITH ALL DATA ==========
      // The backend expects ONE FormData request with ALL files and data
      const completeFormData = new FormData();
      
      // 1. Add Personal Information as form fields
      completeFormData.append('firstName', personalInfo.firstName);
      completeFormData.append('lastName', personalInfo.lastName);
      completeFormData.append('dateOfBirth', personalInfo.dateOfBirth);
      completeFormData.append('email', personalInfo.email || '');
      completeFormData.append('secondaryPhone', personalInfo.secondaryPhone);
      completeFormData.append('city', personalInfo.city);
      completeFormData.append('NIC', personalInfo.nic || '');
      completeFormData.append('gender', personalInfo.gender || '');
      
      // 2. Add Profile Image
      if (personalInfo.profileImage) {
        completeFormData.append('profileImage', {
          uri: personalInfo.profileImage.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }
      
      // 3. Add ID Verification Images
      if (idVerification.frontImage) {
        completeFormData.append('idFrontImage', {
          uri: idVerification.frontImage.uri,
          name: 'idFront.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (idVerification.backImage) {
        completeFormData.append('idBackImage', {
          uri: idVerification.backImage.uri,
          name: 'idBack.jpg',
          type: 'image/jpeg',
        } as any);
      }
      
      // 4. Add Vehicle Information as form fields
      completeFormData.append('vehicleType', vehicleInfo.vehicleType);
      completeFormData.append('vehicleBrand', vehicleInfo.vehicleBrand);
      completeFormData.append('vehicleModel', vehicleInfo.vehicleModel);
      completeFormData.append('yearOfManufacture', vehicleInfo.yearOfManufacture);
      completeFormData.append('vehicleColor', vehicleInfo.vehicleColor);
      completeFormData.append('licensePlate', vehicleInfo.licensePlate);
      completeFormData.append('seats', vehicleInfo.seats.toString());
      completeFormData.append('femaleAssistant', String(vehicleInfo.femaleAssistant));
      
      // 5. Add Vehicle Images
      if (vehicleInfo.frontView) {
        completeFormData.append('vehicleFrontView', {
          uri: vehicleInfo.frontView.uri,
          name: 'vehicleFront.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleInfo.sideView) {
        completeFormData.append('vehicleSideView', {
          uri: vehicleInfo.sideView.uri,
          name: 'vehicleSide.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleInfo.rearView) {
        completeFormData.append('vehicleRearView', {
          uri: vehicleInfo.rearView.uri,
          name: 'vehicleRear.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleInfo.interiorView) {
        completeFormData.append('vehicleInteriorView', {
          uri: vehicleInfo.interiorView.uri,
          name: 'vehicleInterior.jpg',
          type: 'image/jpeg',
        } as any);
      }
      
      // 6. Add Vehicle Documents
      if (vehicleDocuments.revenueLicense) {
        completeFormData.append('revenueLicense', {
          uri: vehicleDocuments.revenueLicense.assets[0].uri,
          name: vehicleDocuments.revenueLicense.assets[0].name,
          type: vehicleDocuments.revenueLicense.assets[0].mimeType,
        } as any);
      }
      if (vehicleDocuments.vehicleInsurance) {
        completeFormData.append('vehicleInsurance', {
          uri: vehicleDocuments.vehicleInsurance.assets[0].uri,
          name: vehicleDocuments.vehicleInsurance.assets[0].name,
          type: vehicleDocuments.vehicleInsurance.assets[0].mimeType,
        } as any);
      }
      if (vehicleDocuments.registrationDoc) {
        completeFormData.append('registrationDoc', {
          uri: vehicleDocuments.registrationDoc.assets[0].uri,
          name: vehicleDocuments.registrationDoc.assets[0].name,
          type: vehicleDocuments.registrationDoc.assets[0].mimeType,
        } as any);
      }
      if (vehicleDocuments.licenseFront) {
        completeFormData.append('licenseFront', {
          uri: vehicleDocuments.licenseFront.uri,
          name: 'licenseFront.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleDocuments.licenseBack) {
        completeFormData.append('licenseBack', {
          uri: vehicleDocuments.licenseBack.uri,
          name: 'licenseBack.jpg',
          type: 'image/jpeg',
        } as any);
      }

      console.log('========== SENDING COMPLETE REGISTRATION ==========');
      console.log('FormData prepared with all files and data');
      
      // ========== SINGLE API CALL ==========
      const response = await fetch(`${API_BASE_URL}/driver/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // DON'T set Content-Type - let fetch set it with boundary for FormData
        },
        body: completeFormData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(error.message || 'Failed to complete registration');
      }

      const result = await response.json();
      console.log('Registration successful:', result);

      // Update registration status
      setRegistrationStatus('ACCOUNT_CREATED');
      setProfileComplete(true);

      // Navigate to success screen
      router.replace('/(registration)/success');

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Failed to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="px-4 py-5 bg-brand-goldenYellow">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 top-5 z-10">
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white text-center">Registration Documents</Text>
        <Text className="text-sm text-white text-center">Drop your vehicle's legit docs here so we can verify it's all yours</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <Text className="text-sm text-brand-neutralGray mb-6">To ensure smooth verification and compliance with transport regulations, please upload valid registration documents for your vehicle. Make sure the document is clear, up-to-date, and matches your vehicle details.</Text>

        <View className="space-y-6">
          <View>
            <Text className="text-base font-semibold mb-1">Revenue License *</Text>
            <Text className="text-xs text-gray-500 mb-2">Upload the official vehicle registration certificate (RC) issued by the government.</Text>
            <TouchableOpacity className="bg-brand-deepNavy py-3 rounded-lg items-center" onPress={() => handleFileUpload(setRevenueLicense, 'revenue')}>
              <Text className="text-white font-bold">Upload File</Text>
            </TouchableOpacity>
            <FileUploadItem file={revenueLicense} progress={progress.revenue || 0} onRemove={() => setRevenueLicense(null)} />
          </View>

          <View>
            <Text className="text-base font-semibold mb-1">Vehicle Insurance *</Text>
            <Text className="text-xs text-gray-500 mb-2">Upload the official vehicle insurance photo issued by the relevant authority.</Text>
            <TouchableOpacity className="bg-brand-deepNavy py-3 rounded-lg items-center" onPress={() => handleFileUpload(setVehicleInsurance, 'insurance')}>
              <Text className="text-white font-bold">Upload File</Text>
            </TouchableOpacity>
            <FileUploadItem file={vehicleInsurance} progress={progress.insurance || 0} onRemove={() => setVehicleInsurance(null)} />
          </View>

          <View>
            <Text className="text-base font-semibold mb-1">Driving License *</Text>
            <Text className="text-xs text-gray-500 mb-4">Upload the official driving license photo issued by the government.</Text>
            <LicenseUploadBox side="Front" image={licenseFront} onUpload={() => handleImageUpload(setLicenseFront)} />
            <LicenseUploadBox side="Back" image={licenseBack} onUpload={() => handleImageUpload(setLicenseBack)} />
          </View>

          <View>
            <Text className="text-base font-semibold mb-1">Vehicle Registration Document *</Text>
            <Text className="text-xs text-gray-500 mb-2">Upload the official vehicle registration certificate (RC) issued by the government.</Text>
            <TouchableOpacity className="bg-brand-deepNavy py-3 rounded-lg items-center" onPress={() => handleFileUpload(setRegistrationDoc, 'registration')}>
              <Text className="text-white font-bold">Upload File</Text>
            </TouchableOpacity>
            <FileUploadItem file={registrationDoc} progress={progress.registration || 0} onRemove={() => setRegistrationDoc(null)} />
          </View>
        </View>
      </ScrollView>

      <View className="p-6">
        <TouchableOpacity
          className={`py-4 rounded-lg items-center ${isSubmitting ? 'bg-gray-400' : 'bg-brand-goldenYellow'}`}
          onPress={handleVerify}
          disabled={isSubmitting}
        >
          <Text className="text-white text-lg font-bold">
            {isSubmitting ? 'Submitting...' : 'Complete Registration'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}