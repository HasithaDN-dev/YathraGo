
import { useEffect, useState } from 'react';
// Student type for API data
interface Student {
    id: string | number;
    name: string;
    profilePic?: string;
    pickupLocation: string;
    distance: string;
    contactNumber: string;
}
import { API_BASE_URL } from '../../config/api';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Typography } from '@/components/Typography';
import { StudentCard } from '@/components/StudentCard';
import { ArrowLeft, Users, Calendar, MagnifyingGlass } from 'phosphor-react-native';
import { useRouter } from 'expo-router';


export default function CurrentStudentsScreen() {
    const router = useRouter();
        const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchStudents() {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/driver/child-ride-requests`);
                const data = await res.json();
                // Transform API data to StudentCard format
                        const mapped: Student[] = data.map((req: any) => ({
                            id: req.child.child_id,
                            name: `${req.child.childFirstName} ${req.child.childLastName}`,
                            profilePic: undefined, // Add if available
                            pickupLocation: req.child.nearbyCity || '',
                            distance: '', // Optionally calculate or leave blank
                            contactNumber: '', // Optionally add if available
                        }));
                setStudents(mapped);
            } catch (err) {
                setStudents([]);
            } finally {
                setLoading(false);
            }
        }
        fetchStudents();
    }, []);

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
                {loading ? (
                    <View className="items-center justify-center py-12">
                        <Typography variant="headline" weight="semibold" className="text-brand-neutralGray mt-4 mb-2">
                            Loading students...
                        </Typography>
                    </View>
                ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                        <StudentCard
                            key={student.id}
                            name={student.name}
                            profilePic={student.profilePic}
                            pickupLocation={student.pickupLocation}
                            distance={student.distance}
                            contactNumber={student.contactNumber}
                              onPress={() => handleStudentPress(String(student.id))}
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