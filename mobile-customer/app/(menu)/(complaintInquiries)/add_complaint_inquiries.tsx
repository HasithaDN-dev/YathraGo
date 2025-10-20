// ...existing code...
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import CustomButton from '@/components/ui/CustomButton';
import { CaretDown, Check } from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { createComplaintInquiry } from '@/lib/api/complaints-inquiries.api';

type CategoryType = 'SYSTEM' | 'DRIVER' | 'PAYMENT' | 'OTHER';

const categories: { value: CategoryType; label: string }[] = [
  { value: 'SYSTEM', label: 'System' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'OTHER', label: 'Other' },
];

export default function AddComplaintInquiriesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { accessToken } = useAuthStore();
  const initialTab = params.type === 'Complaints' ? 'Complaints' : params.type === 'Inquiries' ? 'Inquiries' : 'Inquiries';
  const [activeTab, setActiveTab] = useState<'Complaints' | 'Inquiries'>(initialTab);

  // If the param changes while the screen is mounted, update the tab
  useEffect(() => {
    if (params.type === 'Complaints' || params.type === 'Inquiries') {
      setActiveTab(params.type as 'Complaints' | 'Inquiries');
    }
  }, [params.type]);
  
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    let valid = true;
    
    // Validate category
    if (!category) {
      setCategoryError('Please select a category');
      valid = false;
    } else {
      setCategoryError('');
    }
    
    // Validate description
    if (!description.trim()) {
      setDescriptionError('Description is required');
      valid = false;
    } else {
      setDescriptionError('');
    }
    
    if (!valid) return;

    // Check for active profile and token
    if (!activeProfile || !accessToken) {
      Alert.alert('Error', 'No active profile or authentication token');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Map profile type to backend UserType ('child' -> 'CHILD', 'staff' -> 'STAFF')
      const senderUserType = activeProfile.type === 'child' ? 'CHILD' : 'STAFF';
      const senderId = parseInt(activeProfile.id.split('-')[1]);
      const type = activeTab === 'Complaints' ? 'COMPLAINT' : 'INQUIRY';

      const response = await createComplaintInquiry(
        {
          senderId,
          senderUserType,
          type,
          description: description.trim(),
          category: category as CategoryType,
        },
        accessToken
      );

      if (response.success) {
        Alert.alert(
          'Success',
          response.message || `${activeTab === 'Complaints' ? 'Complaint' : 'Inquiry'} submitted successfully`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setCategory(null);
                setDescription('');
                // Navigate back
                router.back();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="Complaint and Inquiries" showBackButton />

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200 mb-6 mt-3 mx-4">
          <TouchableOpacity
            className={`flex-1 items-center pb-2 ${activeTab === 'Complaints' ? 'border-b-4 border-yellow-400' : ''}`}
            onPress={() => setActiveTab('Complaints')}
          >
            <Typography variant="subhead" className="text-black">
              Complaints
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center pb-2 ${activeTab === 'Inquiries' ? 'border-b-4 border-yellow-400' : ''}`}
            onPress={() => setActiveTab('Inquiries')}
          >
            <Typography variant="subhead" className="text-black">
              Inquiries
            </Typography>
          </TouchableOpacity>
        </View>

        {/* New Inquiry Form */}
        <Card className="mx-4 mb-8 bg-gray-100 p-6 rounded-2xl shadow-md">
          {/* Title */}
          <Typography variant="headline" className="text-black text-center mb-6">
            {activeTab === 'Complaints' ? 'New Complaint' : 'New Inquiry'}
          </Typography>

          {/* Category Dropdown Field */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Typography variant="subhead" className="text-black">
                Category :
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="bg-white rounded-xl shadow-sm border border-gray-300 px-4 py-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <Typography 
                variant="body" 
                className={category ? "text-black" : "text-gray-400"}
              >
                {category ? categories.find(c => c.value === category)?.label : "Select category"}
              </Typography>
              <CaretDown size={20} color="#666" weight="regular" />
            </TouchableOpacity>
            {categoryError ? (
              <Typography variant="footnote" className="text-red-500 mt-1">
                {categoryError}
              </Typography>
            ) : null}
          </View>

          {/* Category Selection Modal */}
          <Modal
            visible={showCategoryModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <TouchableOpacity 
              className="flex-1 bg-black/50 justify-center items-center"
              activeOpacity={1}
              onPress={() => setShowCategoryModal(false)}
            >
              <View className="bg-white rounded-2xl w-4/5 max-w-md" onStartShouldSetResponder={() => true}>
                <View className="p-4 border-b border-gray-200">
                  <Typography variant="headline" className="text-black text-center">
                    Select Category
                  </Typography>
                </View>
                <ScrollView className="max-h-80">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100"
                      onPress={() => {
                        setCategory(cat.value);
                        setCategoryError('');
                        setShowCategoryModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Typography 
                        variant="body" 
                        className={category === cat.value ? "text-brand-primary font-semibold" : "text-black"}
                      >
                        {cat.label}
                      </Typography>
                      {category === cat.value && (
                        <Check size={20} color="#F59E0B" weight="bold" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View className="p-4">
                  <TouchableOpacity
                    className="bg-gray-200 rounded-xl py-3"
                    onPress={() => setShowCategoryModal(false)}
                    activeOpacity={0.7}
                  >
                    <Typography variant="subhead" className="text-black text-center">
                      Cancel
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Description Field */}
          <View className="mb-8">
            <View className="flex-row items-center mb-2">
              <Typography variant="subhead" className="text-black">
                Description :
              </Typography>
            </View>
            <View className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 min-h-[320px]">
              <TextInput
                value={description}
                onChangeText={text => {
                  setDescription(text);
                  if (descriptionError && text.trim()) setDescriptionError('');
                }}
                placeholder="Describe your problem very cleary..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                className="text-black text-base"
                style={{ fontFamily: 'Figtree-Regular' }}
              />
            </View>
            {descriptionError ? (
              <Typography variant="footnote" className="text-red-500 mt-1">
                {descriptionError}
              </Typography>
            ) : null}
          </View>

          {/* Submit Button */}
          <View className="relative">
            <CustomButton
              title={activeTab === 'Complaints' ? "Submit Complaint" : "Submit Inquiry"}
              onPress={handleSubmit}
              bgVariant="primary"
              className="self-center w-full max-w-xs"
              disabled={isSubmitting}
            />
            {isSubmitting && (
              <View className="absolute inset-0 flex items-center justify-center">
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
} 