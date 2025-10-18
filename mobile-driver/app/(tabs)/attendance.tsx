import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Typography } from '@/components/Typography';
import { User, CheckCircle, XCircle, Calendar, Users } from 'phosphor-react-native';
import CustomButton from '@/components/ui/CustomButton';
import { API_BASE_URL } from '@/config/api';
import { tokenService } from '@/lib/services/token.service';

interface Student {
  child_id: number;
  childFirstName: string;
  childLastName: string;
  childImageUrl: string | null;
  pickUpAddress: string;
  school: string;
  isAbsent: boolean;
}

export default function AttendanceScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchStudents();
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const authenticatedFetch = tokenService.createAuthenticatedFetch();

      // Fetch assigned students
      const studentsResponse = await authenticatedFetch(`${API_BASE_URL}/driver/child-ride-requests`);
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }

      const studentsData = await studentsResponse.json();

      // Check today's absences
      const today = new Date(selectedDate);
      today.setHours(0, 0, 0, 0);

      const absencesResponse = await authenticatedFetch(
        `${API_BASE_URL}/absence/check?date=${today.toISOString()}`
      );

      let absentChildIds = new Set<number>();
      if (absencesResponse.ok) {
        const absencesData = await absencesResponse.json();
        absentChildIds = new Set(absencesData.map((a: any) => a.childId));
      }

      // Map students with absence status
      const mappedStudents: Student[] = studentsData.map((req: any) => ({
        child_id: req.child.child_id,
        childFirstName: req.child.childFirstName,
        childLastName: req.child.childLastName,
        childImageUrl: req.child.childImageUrl,
        pickUpAddress: req.child.pickUpAddress,
        school: req.child.school,
        isAbsent: absentChildIds.has(req.child.child_id),
      }));

      setStudents(mappedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  const toggleStudentAttendance = (studentId: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.child_id === studentId
          ? { ...student, isAbsent: !student.isAbsent }
          : student
      )
    );
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const authenticatedFetch = tokenService.createAuthenticatedFetch();

      const today = new Date(selectedDate);
      today.setHours(0, 0, 0, 0);

      // Get list of absent students
      const absentStudents = students.filter((s) => s.isAbsent);

      // Save absences to backend
      const promises = absentStudents.map((student) =>
        authenticatedFetch(`${API_BASE_URL}/absence/mark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            childId: student.child_id,
            date: today.toISOString(),
            reason: 'Marked absent by driver',
          }),
        })
      );

      await Promise.all(promises);

      Alert.alert(
        'Success',
        'Attendance has been saved successfully. Your route will be optimized based on present students.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert.alert('Error', 'Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => !s.isAbsent).length;
  const absentCount = students.filter((s) => s.isAbsent).length;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-brand-deepNavy px-6 pt-16 pb-6 rounded-b-3xl">
        <Typography variant="title-2" weight="bold" className="text-white mb-2">
          Student Attendance
        </Typography>
        <Typography variant="body" className="text-white opacity-80">
          Mark students as present or absent for today
        </Typography>
      </View>

      <View className="px-6 py-6">
        {/* Date Selector */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Calendar size={24} color="#143373" weight="regular" />
              <Typography variant="headline" weight="semibold" className="text-brand-deepNavy ml-2">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy">
              Summary
            </Typography>
            <View className="flex-row items-center">
              <Users size={20} color="#143373" weight="regular" />
              <Typography variant="body" weight="semibold" className="text-brand-deepNavy ml-1">
                {students.length} Total
              </Typography>
            </View>
          </View>

          <View className="flex-row space-x-4">
            <View className="flex-1 bg-green-50 rounded-lg p-3">
              <View className="flex-row items-center justify-between">
                <Typography variant="caption-1" weight="medium" className="text-green-800">
                  Present
                </Typography>
                <CheckCircle size={16} color="#16a34a" weight="fill" />
              </View>
              <Typography variant="title-2" weight="bold" className="text-green-800 mt-1">
                {presentCount}
              </Typography>
            </View>

            <View className="flex-1 bg-red-50 rounded-lg p-3">
              <View className="flex-row items-center justify-between">
                <Typography variant="caption-1" weight="medium" className="text-red-800">
                  Absent
                </Typography>
                <XCircle size={16} color="#dc2626" weight="fill" />
              </View>
              <Typography variant="title-2" weight="bold" className="text-red-800 mt-1">
                {absentCount}
              </Typography>
            </View>
          </View>
        </View>

        {/* Students List */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <View className="bg-brand-lightGray px-4 py-3 border-b border-gray-200">
            <Typography variant="subhead" weight="semibold" className="text-brand-deepNavy">
              Assigned Students
            </Typography>
          </View>

          {loading ? (
            <View className="p-6 items-center">
              <Typography variant="body" className="text-brand-neutralGray">
                Loading students...
              </Typography>
            </View>
          ) : students.length === 0 ? (
            <View className="p-6 items-center">
              <Typography variant="body" className="text-brand-neutralGray">
                No students assigned
              </Typography>
            </View>
          ) : (
            students.map((student, index) => (
              <TouchableOpacity
                key={student.child_id}
                className={`flex-row items-center p-4 ${
                  index !== students.length - 1 ? 'border-b border-gray-100' : ''
                } ${student.isAbsent ? 'bg-red-50' : 'bg-white'}`}
                onPress={() => toggleStudentAttendance(student.child_id)}
                activeOpacity={0.7}
              >
                {/* Avatar */}
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                    student.isAbsent ? 'bg-red-200' : 'bg-brand-warmYellow'
                  }`}
                >
                  <User size={24} color={student.isAbsent ? '#991b1b' : '#143373'} weight="regular" />
                </View>

                {/* Student Info */}
                <View className="flex-1">
                  <Typography
                    variant="body"
                    weight="semibold"
                    className={student.isAbsent ? 'text-red-800' : 'text-brand-deepNavy'}
                  >
                    {student.childFirstName} {student.childLastName}
                  </Typography>
                  <Typography
                    variant="caption-1"
                    className={student.isAbsent ? 'text-red-600' : 'text-brand-neutralGray'}
                  >
                    {student.pickUpAddress}
                  </Typography>
                </View>

                {/* Status Icon */}
                <View>
                  {student.isAbsent ? (
                    <XCircle size={28} color="#dc2626" weight="fill" />
                  ) : (
                    <CheckCircle size={28} color="#16a34a" weight="fill" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Save Button */}
        <CustomButton
          title="Save Attendance"
          onPress={saveAttendance}
          size="large"
          bgVariant="success"
          fullWidth
          disabled={saving || loading}
        />

        <View className="mt-4 bg-blue-50 rounded-xl p-4">
          <Typography variant="caption-1" className="text-blue-900 text-center">
            💡 Your route will be automatically optimized based on students marked as present
          </Typography>
        </View>
      </View>
    </ScrollView>
  );
}

