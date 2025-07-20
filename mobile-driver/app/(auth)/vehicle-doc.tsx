import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '@/components/ui/Icon';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ApiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegistration } from '@/contexts/RegistrationContext';

interface FileUploadItemProps {
  file: DocumentPicker.DocumentPickerSuccessResult | null;
  progress: number;
}

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
      <Icon name="File" size={24} color="gray" />
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
  const { registrationData, updateVehicleDocuments, isRegistrationComplete } = useRegistration();

  const [revenueLicense, setRevenueLicense] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(registrationData.vehicleDocuments.revenueLicense);
  const [vehicleInsurance, setVehicleInsurance] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(registrationData.vehicleDocuments.vehicleInsurance);
  const [registrationDoc, setRegistrationDoc] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(registrationData.vehicleDocuments.registrationDoc);
  const [licenseFront, setLicenseFront] = useState<ImagePicker.ImagePickerAsset | null>(registrationData.vehicleDocuments.licenseFront);
  const [licenseBack, setLicenseBack] = useState<ImagePicker.ImagePickerAsset | null>(registrationData.vehicleDocuments.licenseBack);

  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update context when documents change
  useEffect(() => {
    updateVehicleDocuments({
      revenueLicense,
      vehicleInsurance,
      registrationDoc,
      licenseFront,
      licenseBack,
    });
  }, [revenueLicense, vehicleInsurance, registrationDoc, licenseFront, licenseBack]);

  // Sync local state with context data
  useEffect(() => {
    setRevenueLicense(registrationData.vehicleDocuments.revenueLicense);
    setVehicleInsurance(registrationData.vehicleDocuments.vehicleInsurance);
    setRegistrationDoc(registrationData.vehicleDocuments.registrationDoc);
    setLicenseFront(registrationData.vehicleDocuments.licenseFront);
    setLicenseBack(registrationData.vehicleDocuments.licenseBack);
  }, [registrationData.vehicleDocuments]);

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
    if (!isRegistrationComplete()) {
      Alert.alert('Error', 'Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const formData = new FormData();

      // Personal Information
      const { personalInfo } = registrationData;
      formData.append('firstName', personalInfo.firstName);
      formData.append('lastName', personalInfo.lastName);
      formData.append('dateOfBirth', personalInfo.dateOfBirth);
      formData.append('email', personalInfo.email);
      formData.append('secondaryPhone', personalInfo.secondaryPhone);
      formData.append('city', personalInfo.city);

      if (personalInfo.profileImage) {
        const uriParts = personalInfo.profileImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('profileImage', {
          uri: personalInfo.profileImage.uri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      // ID Verification
      const { idVerification } = registrationData;
      if (idVerification.frontImage) {
        formData.append('idFrontImage', {
          uri: idVerification.frontImage.uri,
          name: 'idFront.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (idVerification.backImage) {
        formData.append('idBackImage', {
          uri: idVerification.backImage.uri,
          name: 'idBack.jpg',
          type: 'image/jpeg',
        } as any);
      }

      // Vehicle Information
      const { vehicleInfo } = registrationData;
      formData.append('vehicleType', vehicleInfo.vehicleType);
      formData.append('vehicleBrand', vehicleInfo.vehicleBrand);
      formData.append('vehicleModel', vehicleInfo.vehicleModel);
      formData.append('yearOfManufacture', vehicleInfo.yearOfManufacture);
      formData.append('vehicleColor', vehicleInfo.vehicleColor);
      formData.append('licensePlate', vehicleInfo.licensePlate);
      formData.append('seats', vehicleInfo.seats.toString());
      formData.append('femaleAssistant', String(vehicleInfo.femaleAssistant));

      if (vehicleInfo.frontView) {
        formData.append('vehicleFrontView', {
          uri: vehicleInfo.frontView.uri,
          name: 'vehicleFront.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleInfo.sideView) {
        formData.append('vehicleSideView', {
          uri: vehicleInfo.sideView.uri,
          name: 'vehicleSide.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleInfo.rearView) {
        formData.append('vehicleRearView', {
          uri: vehicleInfo.rearView.uri,
          name: 'vehicleRear.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleInfo.interiorView) {
        formData.append('vehicleInteriorView', {
          uri: vehicleInfo.interiorView.uri,
          name: 'vehicleInterior.jpg',
          type: 'image/jpeg',
        } as any);
      }

      // Vehicle Documents
      const { vehicleDocuments } = registrationData;
      if (vehicleDocuments.revenueLicense) {
        formData.append('revenueLicense', {
          uri: vehicleDocuments.revenueLicense.assets[0].uri,
          name: vehicleDocuments.revenueLicense.assets[0].name,
          type: vehicleDocuments.revenueLicense.assets[0].mimeType,
        } as any);
      }
      if (vehicleDocuments.vehicleInsurance) {
        formData.append('vehicleInsurance', {
          uri: vehicleDocuments.vehicleInsurance.assets[0].uri,
          name: vehicleDocuments.vehicleInsurance.assets[0].name,
          type: vehicleDocuments.vehicleInsurance.assets[0].mimeType,
        } as any);
      }
      if (vehicleDocuments.registrationDoc) {
        formData.append('registrationDoc', {
          uri: vehicleDocuments.registrationDoc.assets[0].uri,
          name: vehicleDocuments.registrationDoc.assets[0].name,
          type: vehicleDocuments.registrationDoc.assets[0].mimeType,
        } as any);
      }
      if (vehicleDocuments.licenseFront) {
        formData.append('licenseFront', {
          uri: vehicleDocuments.licenseFront.uri,
          name: 'licenseFront.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleDocuments.licenseBack) {
        formData.append('licenseBack', {
          uri: vehicleDocuments.licenseBack.uri,
          name: 'licenseBack.jpg',
          type: 'image/jpeg',
        } as any);
      }

      await ApiService.completeDriverRegistration(token, formData);
      Alert.alert('Success', 'Registration completed successfully!');
      router.push('../success');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred.');
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