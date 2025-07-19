import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { useProfileStore } from '../../lib/stores/profile.store';

export default function HistoryScreen() {
  const { activeProfile } = useProfileStore();

  // Mock history data
  const mockHistoryItems = [
    {
      id: '1',
      date: '2024-01-15',
      from: 'Home',
      to: 'School',
      status: 'completed',
      cost: '$12.50'
    },
    {
      id: '2',
      date: '2024-01-14',
      from: 'School',
      to: 'Park',
      status: 'completed',
      cost: '$8.00'
    },
    {
      id: '3',
      date: '2024-01-13',
      from: 'Home',
      to: 'Library',
      status: 'cancelled',
      cost: '$0.00'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'cancelled':
        return 'text-danger';
      default:
        return 'text-brand-neutralGray';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProfileSwitcher />
      
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-2">
            <Typography variant="large-title" className="text-black">
              Trip History
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray">
              {activeProfile?.type === 'child' 
                ? `Your recent trips, ${activeProfile.name}`
                : `${activeProfile?.name}&apos;s travel history`
              }
            </Typography>
          </View>

          {/* Filter Options */}
          <View className="flex-row">
            <TouchableOpacity className="bg-brand-deepNavy px-4 py-2 rounded-full">
              <Typography variant="tappable" className="text-white">
                All Trips
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity className="ml-3 bg-brand-lightGray px-4 py-2 rounded-full">
              <Typography variant="tappable" className="text-brand-neutralGray">
                This Month
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity className="ml-3 bg-brand-lightGray px-4 py-2 rounded-full">
              <Typography variant="tappable" className="text-brand-neutralGray">
                Completed
              </Typography>
            </TouchableOpacity>
          </View>

          {/* History Items */}
          <View className="space-y-4">
            {mockHistoryItems.map((item) => (
              <TouchableOpacity 
                key={item.id}
                className="bg-white border border-brand-lightGray rounded-2xl p-4 space-y-3"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Typography variant="title-1" className="text-black">
                      {item.from} → {item.to}
                    </Typography>
                    <Typography variant="caption-1" className="text-brand-neutralGray">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </View>
                  <View className="items-end">
                    <Typography 
                      variant="tappable" 
                      className={getStatusColor(item.status)}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Typography>
                    <Typography variant="tappable" className="text-black">
                      {item.cost}
                    </Typography>
                  </View>
                </View>

                {/* Trip Details */}
                <View className="flex-row items-center pt-2 border-t border-brand-lightGray">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-brand-brightOrange rounded-full" />
                    <View className="ml-2">
                      <Typography variant="caption-1" className="text-brand-neutralGray">
                        Pick-up: 8:30 AM
                      </Typography>
                    </View>
                  </View>
                  <View className="ml-4 flex-row items-center">
                    <View className="w-2 h-2 bg-success rounded-full" />
                    <View className="ml-2">
                      <Typography variant="caption-1" className="text-brand-neutralGray">
                        Drop-off: 8:45 AM
                      </Typography>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State or Load More */}
          {mockHistoryItems.length === 0 ? (
            <View className="bg-brand-lightGray rounded-2xl p-8 items-center space-y-3">
              <Typography variant="subhead" className="text-brand-neutralGray">
                No trips yet
              </Typography>
              <Typography variant="body" className="text-brand-neutralGray text-center">
                {activeProfile?.type === 'child' 
                  ? "Your trip history will appear here once you start traveling"
                  : "Trip history will appear here once rides are booked"
                }
              </Typography>
            </View>
          ) : (
            <TouchableOpacity className="bg-brand-lightestBlue rounded-2xl p-4 items-center">
              <Typography variant="title-1" className="text-brand-deepNavy">
                Load More Trips
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
