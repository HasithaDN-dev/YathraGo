import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth.store';
import { useProfileStore } from '../../lib/stores/profile.store';
import { 
  ArrowLeftIcon,
  CreditCardIcon,
  PhoneIcon,
  HeadsetIcon,
  InfoIcon,
  SignOutIcon,
  GearIcon
} from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';

export default function MenuScreen() {
  const { logout, user } = useAuthStore();
  const { activeProfile } = useProfileStore();
  const router = useRouter();


    const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      id: '1',
      title: 'Payment Method',
      icon: CreditCardIcon,
      action: () => router.push('/(menu)/payment_method'),
    },
    {
      id: '2',
      title: 'Complaints and Inquiries',
      icon: PhoneIcon,
      action: () => router.push('/(menu)/complaint_Inquiries'),
    },
    {
      id: '3',
      title: 'Default Profile Settings',
      icon: GearIcon,
      action: () => router.push('/(menu)/default-profile-settings'),
    },
    {
      id: '4',
      title: 'Help and Support',
      icon: HeadsetIcon,
      action: () => router.push('/(menu)/help_and_support'),
    },
    {
      id: '5',
      title: 'About us',
      icon: InfoIcon,
      action: () => router.push('/(menu)/about_us'),
    },
    {
      id: '6',
      title: 'Logout',
      icon: SignOutIcon,
      action: () => {handleLogout()},
      isLogout: true,
    }
  ];

  return (
    <SafeAreaView edges={['left','right','bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 space-y-6 mt-3">
        {/* User Profile Card */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(menu)/profile')}>
          <Card className="mb-3 py-6">
            <View className="flex-row items-center min-h-[96px]">
             {/* Profile Image */}
             <View className="mr-4">
               <Image
                 source={
                   activeProfile?.profileImageUrl || activeProfile?.childImageUrl
                     ? { uri: activeProfile.profileImageUrl || activeProfile.childImageUrl }
                     : require('../../assets/images/profile_Picture.png')
                 }
                 style={{ width: 64, height: 64, borderRadius: 32, resizeMode: 'cover' }}
               />
             </View>
             
             {/* Profile Info */}
             <View className="flex-1">
               <Typography variant="subhead" weight="semibold" className="text-black mb-2">
                 {user?.phone || '078 - 456 7891'}
               </Typography>
               <Typography variant="footnote" className="text-brand-neutralGray">
                 {activeProfile ? (
                   activeProfile.type === 'child' 
                     ? `${activeProfile.firstName || ''} ${activeProfile.lastName || ''}`.trim() || 'Child'
                     : `${activeProfile.firstName || ''} ${activeProfile.lastName || ''}`.trim() || 'Staff Passenger'
                 ) : 'Customer Profile'}
               </Typography>
             </View>
             
            {/* Profile Link (visual only) */}
            <View className="flex-row items-center">
              <Typography variant="subhead" weight="medium" className="text-black mr-1">
                profile
              </Typography>
              <ArrowLeftIcon size={16} color="#000000" weight="regular" style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
            </View>
          </Card>
        </TouchableOpacity>
        
        {/* Menu Items */}
        <Card className="p-6">
          <View className="space-y-5">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center justify-between py-5 px-3 bg-white rounded-xl shadow-sm min-h-[64px]"
                onPress={item.action}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1">
                  <item.icon 
                    size={24} 
                    color={item.isLogout ? "#ef4444" : "#000000"} 
                    weight="regular" 
                  />
                  <Typography 
                    variant="subhead" 
                    weight="medium" 
                    className={`ml-4 ${item.isLogout ? 'text-red-500' : 'text-black'}`}
                  >
                    {item.title}
                  </Typography>
                </View>
                <ArrowLeftIcon 
                  size={18} 
                  color={item.isLogout ? "#ef4444" : "#000000"} 
                  weight="regular" 
                  style={{ transform: [{ rotate: '180deg' }] }} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}