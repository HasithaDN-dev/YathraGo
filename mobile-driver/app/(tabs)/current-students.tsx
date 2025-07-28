import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Typography } from '@/components/Typography';
import { StudentCard } from '@/components/StudentCard';
import { ArrowLeft, Users, Calendar, MapPin, MagnifyingGlass } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

// Mock data for demonstration
const mockStudents = [
    {
        id: '1',
        name: 'Aisha Perera',
        profilePic: undefined,
        pickupLocation: 'Maharagama Junction, Colombo',
        distance: '2.3 km',
        contactNumber: '+94 71 234 5678'
    },
    {
        id: '2',
        name: 'Rahul Silva',
        profilePic: undefined,
        pickupLocation: 'Dehiwala Junction, Colombo',
        distance: '1.8 km',
        contactNumber: '+94 77 345 6789'
    },
    {
        id: '3',
        name: 'Priya Fernando',
        profilePic: undefined,
        pickupLocation: 'Mount Lavinia, Colombo',
        distance: '3.1 km',
        contactNumber: '+94 76 456 7890'
    },
    {
        id: '4',
        name: 'Kavindu Rajapaksa',
        profilePic: undefined,
        pickupLocation: 'Moratuwa Junction, Colombo',
        distance: '4.2 km',
        contactNumber: '+94 75 567 8901'
    },
    {
        id: '5',
        name: 'Nethmi Bandara',
        profilePic: undefined,
        pickupLocation: 'Panadura Junction, Colombo',
        distance: '5.7 km',
        contactNumber: '+94 74 678 9012'
    },
    {
        id: '6',
        name: 'Dilshan Mendis',
        profilePic: undefined,
        pickupLocation: 'Kalutara Junction, Colombo',
        distance: '6.8 km',
        contactNumber: '+94 73 789 0123'
    },
    {
        id: '7',
        name: 'Sachini Gunasekara',
        profilePic: undefined,
        pickupLocation: 'Wadduwa Junction, Colombo',
        distance: '7.2 km',
        contactNumber: '+94 72 890 1234'
    },
    {
        id: '8',
        name: 'Tharindu Weerasinghe',
        profilePic: undefined,
        pickupLocation: 'Bandaragama Junction, Colombo',
        distance: '8.1 km',
        contactNumber: '+94 71 901 2345'
    }
];

export default function CurrentStudentsScreen() {
  const router = useRouter();
  const [students] = useState(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

    const handleStudentPress = (studentId: string) => {
        console.log('Student pressed:', studentId);
        // Navigate to student details or handle student selection
    };

    const handleCallStudent = (contactNumber: string) => {
        console.log('Calling:', contactNumber);
        // Implement phone call functionality
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Blue Header with rounded bottom corners */}
            <View className="bg-brand-deepNavy px-6 pt-20 pb-8 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center"
                    >
                        <ArrowLeft size={24} color="#ffffff" weight="regular" />
                        <Typography variant="headline" weight="semibold" className="text-white ml-2">
                            Back
                        </Typography>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                        <Users size={24} color="#ffffff" weight="regular" />
                        <Typography variant="headline" weight="semibold" className="text-white ml-2">
                            Assigned Students
                        </Typography>
                    </View>
                </View>

                {/* Summary Stats */}
                <View className=" bg-brand-goldenYellow bg-opacity-10 rounded-xl p-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center ">
                            <Calendar size={20} color="#143373" weight="regular" />
                            <Typography variant="body" weight="medium" className="text-brand-deepNavy ml-2">
                                Today's Schedule
                            </Typography>
                        </View>
                        <Typography variant="title-2" weight="bold" className="text-brand-deepNavy">
                            {students.length} Students
                        </Typography>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View>
                            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy opacity-80">
                                Date
                            </Typography>
                            <Typography variant="body" className="text-brand-deepNavy opacity-90">
                                October 15, 2025
                            </Typography>
                        </View>
                        <View className="items-end">
                            <Typography variant="caption-1" weight="medium" className="text-brand-deepNavy opacity-80">
                                Total Distance
                            </Typography>
                            <Typography variant="body" className="text-brand-deepNavy opacity-90">
                                12.5 km
                            </Typography>
                        </View>
                    </View>
                </View>
            </View>

                    {/* Search Bar */}
        <View className="px-6 pt-6">
          <View className="bg-white rounded-xl p-3 flex-row items-center shadow-sm border border-gray-100">
            <MagnifyingGlass size={20} color="#6b7280" weight="regular" />
            <TextInput
              className="flex-1 ml-3 text-body font-figtree-regular text-brand-deepNavy"
              placeholder="Search students or locations..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Students List */}
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-2">
              Pickup Locations
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray">
              {filteredStudents.length} students found
            </Typography>
          </View>

                                {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <StudentCard
              key={student.id}
              name={student.name}
              profilePic={student.profilePic}
              pickupLocation={student.pickupLocation}
              distance={student.distance}
              contactNumber={student.contactNumber}
              onPress={() => handleStudentPress(student.id)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <Users size={48} color="#6b7280" weight="regular" />
            <Typography variant="headline" weight="semibold" className="text-brand-neutralGray mt-4 mb-2">
              No students found
            </Typography>
            <Typography variant="body" className="text-brand-neutralGray text-center">
              Try adjusting your search criteria
            </Typography>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-6" />
            </ScrollView>
        </View>
    );
} 