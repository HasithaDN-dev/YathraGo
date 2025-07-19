import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { useProfileStore } from '../../lib/stores/profile.store';

export default function HomeScreen() {
  const { activeProfile } = useProfileStore();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProfileSwitcher />
      
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-6">
          {/* Welcome Section */}
          <View className="space-y-2">
            <Typography variant="headline-large" className="text-black">
              Welcome back{activeProfile ? `, ${activeProfile.name}` : ''}!
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray">
              {activeProfile?.type === 'child' 
                ? "Let&apos;s plan your next trip safely"
                : "Manage your family&apos;s travel needs"
              }
            </Typography>
          </View>

          {/* Quick Actions */}
          <View className="bg-brand-lightestBlue rounded-2xl p-6 space-y-4">
            <Typography variant="subhead" className="text-black">
              Quick Actions
            </Typography>
            
            <View className="space-y-3">
              <View className="bg-white rounded-xl p-4 flex-row items-center justify-between">
                <View>
                  <Typography variant="title-1" className="text-black">
                    Book a Ride
                  </Typography>
                  <Typography variant="caption-1" className="text-brand-neutralGray">
                    {activeProfile?.type === 'child' 
                      ? "Request a safe trip"
                      : "Book for yourself or your child"
                    }
                  </Typography>
                </View>
                <View className="w-8 h-8 bg-brand-brightOrange rounded-full items-center justify-center">
                  <Typography variant="tappable" className="text-white">
                    🚗
                  </Typography>
                </View>
              </View>

              <View className="bg-white rounded-xl p-4 flex-row items-center justify-between">
                <View>
                  <Typography variant="title-1" className="text-black">
                    Track Ride
                  </Typography>
                  <Typography variant="caption-1" className="text-brand-neutralGray">
                    {activeProfile?.type === 'child' 
                      ? "See your current trip"
                      : "Monitor family trips"
                    }
                  </Typography>
                </View>
                <View className="w-8 h-8 bg-brand-deepNavy rounded-full items-center justify-center">
                  <Typography variant="tappable" className="text-white">
                    📍
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          {/* Profile-specific Content */}
          {activeProfile?.type === 'child' ? (
            <View className="bg-brand-softOrange rounded-2xl p-6 space-y-3">
              <Typography variant="subhead" className="text-black">
                Your School Routes
              </Typography>
              <Typography variant="body" className="text-brand-neutralGray">
                Quick access to your regular school routes and pickup locations.
              </Typography>
            </View>
          ) : (
            <View className="bg-brand-lightestBlue rounded-2xl p-6 space-y-3">
              <Typography variant="subhead" className="text-black">
                Family Overview
              </Typography>
              <Typography variant="body" className="text-brand-neutralGray">
                Monitor all family members&apos; trips and manage their travel preferences.
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
