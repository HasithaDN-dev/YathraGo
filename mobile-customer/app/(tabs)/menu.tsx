import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeftIcon,
  CreditCardIcon,
  PhoneIcon,
  MapPinIcon,
  HeadsetIcon,
  InfoIcon,
  SignOutIcon
} from 'phosphor-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';

export default function MenuScreen() {
  const { logout } = useAuth();
  const router = useRouter();


    const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      id: '1',
      title: 'Payment Method',
      icon: CreditCardIcon,
      action: () => console.log('Payment Method pressed')
    },
    {
      id: '2',
      title: 'Complaints and Inquiries',
      icon: PhoneIcon,
      action: () => console.log('Complaints and Inquiries pressed')
    },
    {
      id: '3',
      title: 'Saved Locations',
      icon: MapPinIcon,
      action: () => console.log('Saved Locations pressed')
    },
    {
      id: '4',
      title: 'Help and Support',
      icon: HeadsetIcon,
      action: () => console.log('Help and Support pressed')
    },
    {
      id: '5',
      title: 'About us',
      icon: InfoIcon,
      action: () => console.log('About us pressed')
    },
    {
      id: '6',
      title: 'Logout',
      icon: SignOutIcon,
      action: () => {handleLogout()},
      isLogout: true
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 space-y-6">
        {/* User Profile Card */}
        <Card className="mb-3 py-6">
          <View className="flex-row items-center min-h-[96px]">
            {/* Profile Image */}
            <View className="mr-4">
              <Image
                source={require('../../assets/images/profile_Picture.png')}
                style={{ width: 64, height: 64, borderRadius: 32, resizeMode: 'cover' }}
              />
            </View>
            
            {/* Profile InfoIcon */}
            <View className="flex-1">
              <Typography variant="subhead" weight="semibold" className="text-black mb-2">
                078 - 456 7891
              </Typography>
              <Typography variant="footnote" className="text-brand-neutralGray">
                Kasun Fernando
              </Typography>
            </View>
            
            {/* Profile Link */}
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => router.push('/(menu)/profile')}
              activeOpacity={0.8}
            >
              <Typography variant="subhead" weight="medium" className="text-black mr-1">
                profile
              </Typography>
              <ArrowLeftIcon size={16} color="#000000" weight="regular" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>
        </Card>
        
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