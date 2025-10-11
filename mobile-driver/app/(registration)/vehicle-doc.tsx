import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Animated, Alert,TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '@/components/ui/Icon';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useDriverStore } from '../../lib/stores/driver.store';
import { useAuthStore } from '../../lib/stores/auth.store';
import { registerVehicleApi, uploadVehicleDocumentsApi } from '../../lib/api/vehicle.api';
import { completeDriverRegistrationApi, uploadIdDocumentsApi } from '../../lib/api/profile.api';

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

  // Add local state for NIC and gender
  const [nic, setNic] = useState('');
  const [gender, setGender] = useState('');
  const { accessToken, setProfileComplete, setRegistrationStatus } = useAuthStore();

  const [revenueLicense, setRevenueLicense] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(vehicleDocuments.revenueLicense);
  const [vehicleInsurance, setVehicleInsurance] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(vehicleDocuments.vehicleInsurance);
  const [registrationDoc, setRegistrationDoc] = useState<DocumentPicker.DocumentPickerSuccessResult | null>(vehicleDocuments.registrationDoc);
  const [licenseFront, setLicenseFront] = useState<ImagePicker.ImagePickerAsset | null>(vehicleDocuments.licenseFront);
  const [licenseBack, setLicenseBack] = useState<ImagePicker.ImagePickerAsset | null>(vehicleDocuments.licenseBack);

  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update store when documents change
  useEffect(() => {
    updateVehicleDocuments({
      revenueLicense,
      vehicleInsurance,
      registrationDoc,
      licenseFront,
      licenseBack,
    });
  }, [revenueLicense, vehicleInsurance, registrationDoc, licenseFront, licenseBack, updateVehicleDocuments]);

  // Sync local state with store data
  useEffect(() => {
    setRevenueLicense(vehicleDocuments.revenueLicense);
    setVehicleInsurance(vehicleDocuments.vehicleInsurance);
    setRegistrationDoc(vehicleDocuments.registrationDoc);
    setLicenseFront(vehicleDocuments.licenseFront);
    setLicenseBack(vehicleDocuments.licenseBack);
  }, [vehicleDocuments]);

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
    if (
      !revenueLicense ||
      !vehicleInsurance ||
      !registrationDoc ||
      !licenseFront ||
      !licenseBack ||
      !nic.trim() ||
      !gender.trim()
    ) {
      Alert.alert('Error', 'Please complete all required fields before submitting.');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'Authentication token not found. Please login again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Complete driver registration
      const driverData = {
        driverId: 0,
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        email: personalInfo.email,
        address: personalInfo.city,
        profileImage: personalInfo.profileImage?.uri,
        emergencyContact: personalInfo.secondaryPhone,
        NIC: nic,
        dateOfBirth: personalInfo.dateOfBirth,
        gender: gender,
        secondPhone: personalInfo.secondaryPhone,
      };

      const driverResult = await completeDriverRegistrationApi(accessToken, driverData);

      // Step 2: Upload ID documents
      if (idVerification.frontImage && idVerification.backImage) {
        await uploadIdDocumentsApi(accessToken, {
          frontImage: idVerification.frontImage,
          backImage: idVerification.backImage,
        });
      }

      // Step 3: Register vehicle
      const vehicleFormData = new FormData();
      vehicleFormData.append('vehicleType', vehicleInfo.vehicleType);
      vehicleFormData.append('vehicleBrand', vehicleInfo.vehicleBrand);
      vehicleFormData.append('vehicleModel', vehicleInfo.vehicleModel);
      vehicleFormData.append('yearOfManufacture', vehicleInfo.yearOfManufacture);
      vehicleFormData.append('vehicleColor', vehicleInfo.vehicleColor);
      vehicleFormData.append('licensePlate', vehicleInfo.licensePlate);
      vehicleFormData.append('seats', vehicleInfo.seats.toString());
      vehicleFormData.append('femaleAssistant', String(vehicleInfo.femaleAssistant));

      // Add vehicle images
      const imageFields = [
        { key: 'vehicleFrontView', value: vehicleInfo.frontView, name: 'vehicleFront.jpg' },
        { key: 'vehicleSideView', value: vehicleInfo.sideView, name: 'vehicleSide.jpg' },
        { key: 'vehicleRearView', value: vehicleInfo.rearView, name: 'vehicleRear.jpg' },
        { key: 'vehicleInteriorView', value: vehicleInfo.interiorView, name: 'vehicleInterior.jpg' },
      ];
      imageFields.forEach(({ key, value, name }) => {
        if (value) {
          vehicleFormData.append(key, {
            uri: value.uri,
            name,
            type: 'image/jpeg',
          } as any);
        }
      });

      await registerVehicleApi(accessToken, vehicleFormData);

      // Step 4: Upload vehicle documents
      const documentsFormData = new FormData();
      const docFields = [
        { key: 'revenueLicense', value: vehicleDocuments.revenueLicense },
        { key: 'vehicleInsurance', value: vehicleDocuments.vehicleInsurance },
        { key: 'registrationDoc', value: vehicleDocuments.registrationDoc },
      ];
      docFields.forEach(({ key, value }) => {
        if (value && value.assets && value.assets[0]) {
          documentsFormData.append(key, {
            uri: value.assets[0].uri,
            name: value.assets[0].name,
            type: value.assets[0].mimeType,
          } as any);
        }
      });
      if (vehicleDocuments.licenseFront) {
        documentsFormData.append('licenseFront', {
          uri: vehicleDocuments.licenseFront.uri,
          name: 'licenseFront.jpg',
          type: 'image/jpeg',
        } as any);
      }
      if (vehicleDocuments.licenseBack) {
        documentsFormData.append('licenseBack', {
          uri: vehicleDocuments.licenseBack.uri,
          name: 'licenseBack.jpg',
          type: 'image/jpeg',
        } as any);
      }

      await uploadVehicleDocumentsApi(accessToken, documentsFormData);

      // Step 5: Update registration status and complete profile
      setRegistrationStatus('ACCOUNT_CREATED');
      setProfileComplete(true);

      // Navigate to success screen
      router.replace('/(registration)/success');

    } catch (error) {
      let errorMsg = 'Failed to complete registration. Please try again.';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', errorMsg);
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
          {/* NIC Field */}
          <View>
            <Text className="text-base font-semibold mb-1">NIC *</Text>
            <Text className="text-xs text-gray-500 mb-2">Enter your National Identity Card number.</Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              value={nic}
              onChangeText={setNic}
              placeholder="NIC Number"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          {/* Gender Field */}
          <View>
            <Text className="text-base font-semibold mb-1">Gender *</Text>
            <Text className="text-xs text-gray-500 mb-2">Select your gender.</Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              value={gender}
              onChangeText={setGender}
              placeholder="Gender (e.g., Male, Female, Other)"
              placeholderTextColor="#A0A0A0"
            />
          </View>
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