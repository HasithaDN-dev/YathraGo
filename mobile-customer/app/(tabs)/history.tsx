import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';

// Profile data
const profiles = [
  {
    id: '1',
    name: 'My Elder Son',
    fullName: 'Supun Thilina',
    type: 'child' as const
  },
  {
    id: '2',
    name: 'Kevin',
    fullName: 'Kevin Silva',
    type: 'child' as const
  },
  {
    id: '3',
    name: 'My',
    fullName: 'My Account',
    type: 'parent' as const
  }
];

export default function HistoryScreen() {
  const [selectedProfile, setSelectedProfile] = useState(profiles[0]);
  const [selectedFilter, setSelectedFilter] = useState('All Trips');

  const handleProfileSelect = (profile: typeof profiles[0]) => {
    setSelectedProfile(profile);
    console.log('Profile selected:', profile.name);
  };

  const handleRefresh = () => {
    console.log('Refresh pressed');
  };

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
      to: 'Home',
      status: 'completed',
      cost: '$8.00'
    },
    {
      id: '3',
      date: '2024-01-13',
      from: 'Home',
      to: 'School',
      status: 'cancelled',
      cost: '$0.00'
    },
    {
      id: '4',
      date: '2024-01-16',
      from: 'School',
      to: 'Home',
      status: 'completed',
      cost: '$10.00'
    },
    {
      id: '5',
      date: '2024-01-17',
      from: 'Home',
      to: 'School',
      status: 'cancelled',
      cost: '$0.00'
    },
    {
      id: '6',
      date: '2024-01-18',
      from: 'School',
      to: 'Home',
      status: 'completed',
      cost: '$15.00'
    },
    {
      id: '7',
      date: '2024-01-19',
      from: 'Home',
      to: 'School',
      status: 'completed',
      cost: '$15.00'
    },
    {
      id: '8',
      date: '2024-01-20',
      from: 'School',
      to: 'Home',
      status: 'cancelled',
      cost: '$0.00'
    },
    {
      id: '9',
      date: '2024-01-21',
      from: 'Home',
      to: 'School',
      status: 'completed',
      cost: '$20.00'
    },
    {
      id: '10',
      date: '2024-01-22',
      from: 'School',
      to: 'Home',
      status: 'completed',
      cost: '$18.00'
    },
    {
      id: '11',
      date: '2024-01-23',
      from: 'Home',
      to: 'School',
      status: 'completed',
      cost: '$18.00'
    },
    {
      id: '12',
      date: '2024-01-24',
      from: 'School',
      to: 'Home',
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
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header Component */}
      <Header
        profiles={profiles}
        selectedProfile={selectedProfile}
        onProfileSelect={handleProfileSelect}
        onRefreshPress={handleRefresh}
      />
      
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-6">
          {/* Filter Options */}
          <Card className="p-4">
            <View className="flex-row">
              {['All Trips', 'Completed', 'Cancelled'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  className={`px-4 py-2 rounded-full${selectedFilter === filter ? ' bg-brand-deepNavy' : ' bg-brand-lightGray'}${filter !== 'All Trips' ? ' ml-3' : ''}`}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Typography
                    variant="subhead"
                    className={selectedFilter === filter ? 'text-white' : 'text-brand-neutralGray'}
                  >
                    {filter}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* History Items */}
          <View className="space-y-4">
            {mockHistoryItems
              .filter((item) => {
                if (selectedFilter === 'All Trips') return true;
                if (selectedFilter === 'Completed') return item.status === 'completed';
                if (selectedFilter === 'Cancelled') return item.status === 'cancelled';
                return true;
              })
              .map((item) => (
                <Card key={item.id + item.date + item.from + item.to} className="p-4 mt-3">
                  <View className="space-y-3">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Typography variant="subhead" className="text-black">
                          {item.from} → {item.to}
                        </Typography>
                        <Typography variant="footnote" className="text-brand-neutralGray">
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
                          variant="subhead" 
                          className={getStatusColor(item.status)}
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Typography>
                        <Typography variant="subhead" className="text-black">
                          {item.cost}
                        </Typography>
                      </View>
                    </View>

                    {/* Trip Details */}
                    <View className="flex-row items-center pt-2 border-t border-brand-lightGray">
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 bg-brand-brightOrange rounded-full" />
                        <View className="ml-2">
                          <Typography variant="footnote" className="text-brand-neutralGray">
                            Pick-up: 8:30 AM
                          </Typography>
                        </View>
                      </View>
                      <View className="ml-4 flex-row items-center">
                        <View className="w-2 h-2 bg-success rounded-full" />
                        <View className="ml-2">
                          <Typography variant="footnote" className="text-brand-neutralGray">
                            Drop-off: 8:45 AM
                          </Typography>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
