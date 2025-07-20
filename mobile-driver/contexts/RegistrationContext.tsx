import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Personal Information
interface PersonalInfo {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    secondaryPhone: string;
    city: string;
    profileImage: ImagePicker.ImagePickerAsset | null;
}

// ID Verification
interface IdVerification {
    frontImage: ImagePicker.ImagePickerAsset | null;
    backImage: ImagePicker.ImagePickerAsset | null;
}

// Vehicle Information
interface VehicleInfo {
    vehicleType: string;
    vehicleBrand: string;
    vehicleModel: string;
    yearOfManufacture: string;
    vehicleColor: string;
    licensePlate: string;
    seats: number;
    femaleAssistant: boolean;
    frontView: ImagePicker.ImagePickerAsset | null;
    sideView: ImagePicker.ImagePickerAsset | null;
    rearView: ImagePicker.ImagePickerAsset | null;
    interiorView: ImagePicker.ImagePickerAsset | null;
}

// Vehicle Documents
interface VehicleDocuments {
    revenueLicense: DocumentPicker.DocumentPickerSuccessResult | null;
    vehicleInsurance: DocumentPicker.DocumentPickerSuccessResult | null;
    registrationDoc: DocumentPicker.DocumentPickerSuccessResult | null;
    licenseFront: ImagePicker.ImagePickerAsset | null;
    licenseBack: ImagePicker.ImagePickerAsset | null;
}

// Complete Registration Data
interface RegistrationData {
    personalInfo: PersonalInfo;
    idVerification: IdVerification;
    vehicleInfo: VehicleInfo;
    vehicleDocuments: VehicleDocuments;
}

interface RegistrationContextType {
    registrationData: RegistrationData;
    updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
    updateIdVerification: (data: Partial<IdVerification>) => void;
    updateVehicleInfo: (data: Partial<VehicleInfo>) => void;
    updateVehicleDocuments: (data: Partial<VehicleDocuments>) => void;
    clearRegistrationData: () => void;
    isRegistrationComplete: () => boolean;
}

const defaultRegistrationData: RegistrationData = {
    personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        secondaryPhone: '',
        city: '',
        profileImage: null,
    },
    idVerification: {
        frontImage: null,
        backImage: null,
    },
    vehicleInfo: {
        vehicleType: '',
        vehicleBrand: '',
        vehicleModel: '',
        yearOfManufacture: '',
        vehicleColor: '',
        licensePlate: '',
        seats: 10,
        femaleAssistant: false,
        frontView: null,
        sideView: null,
        rearView: null,
        interiorView: null,
    },
    vehicleDocuments: {
        revenueLicense: null,
        vehicleInsurance: null,
        registrationDoc: null,
        licenseFront: null,
        licenseBack: null,
    },
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider = ({ children }: { children: ReactNode }) => {
    const [registrationData, setRegistrationData] = useState<RegistrationData>(defaultRegistrationData);

    const updatePersonalInfo = useCallback((data: Partial<PersonalInfo>) => {
        setRegistrationData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, ...data }
        }));
    }, []);

    const updateIdVerification = useCallback((data: Partial<IdVerification>) => {
        setRegistrationData(prev => ({
            ...prev,
            idVerification: { ...prev.idVerification, ...data }
        }));
    }, []);

    const updateVehicleInfo = useCallback((data: Partial<VehicleInfo>) => {
        setRegistrationData(prev => ({
            ...prev,
            vehicleInfo: { ...prev.vehicleInfo, ...data }
        }));
    }, []);

    const updateVehicleDocuments = useCallback((data: Partial<VehicleDocuments>) => {
        setRegistrationData(prev => ({
            ...prev,
            vehicleDocuments: { ...prev.vehicleDocuments, ...data }
        }));
    }, []);

    const clearRegistrationData = useCallback(() => {
        setRegistrationData(defaultRegistrationData);
    }, []);

    const isRegistrationComplete = useCallback(() => {
        const { personalInfo, idVerification, vehicleInfo, vehicleDocuments } = registrationData;

        // Check personal info
        const personalComplete = personalInfo.firstName &&
            personalInfo.lastName &&
            personalInfo.dateOfBirth &&
            personalInfo.city &&
            personalInfo.profileImage;

        // Check ID verification
        const idComplete = idVerification.frontImage && idVerification.backImage;

        // Check vehicle info
        const vehicleComplete = vehicleInfo.vehicleType &&
            vehicleInfo.vehicleBrand &&
            vehicleInfo.vehicleModel &&
            vehicleInfo.yearOfManufacture &&
            vehicleInfo.vehicleColor &&
            vehicleInfo.licensePlate;

        // Check vehicle documents
        const documentsComplete = vehicleDocuments.revenueLicense &&
            vehicleDocuments.vehicleInsurance &&
            vehicleDocuments.registrationDoc &&
            vehicleDocuments.licenseFront &&
            vehicleDocuments.licenseBack;

        return personalComplete && idComplete && vehicleComplete && documentsComplete;
    }, [registrationData]);

    return (
        <RegistrationContext.Provider value={{
            registrationData,
            updatePersonalInfo,
            updateIdVerification,
            updateVehicleInfo,
            updateVehicleDocuments,
            clearRegistrationData,
            isRegistrationComplete,
        }}>
            {children}
        </RegistrationContext.Provider>
    );
};

export const useRegistration = () => {
    const context = useContext(RegistrationContext);
    if (context === undefined) {
        throw new Error('useRegistration must be used within a RegistrationProvider');
    }
    return context;
}; 