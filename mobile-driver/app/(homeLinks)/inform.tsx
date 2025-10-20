import React, { useEffect, useState } from 'react';
import usePassengerStore from '@/lib/stores/passenger.store';
import { API_BASE_URL } from '@/config/api';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Typography } from '@/components/Typography';
import { ArrowLeft, Megaphone, PaperPlaneTilt, X } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

// Predefined messages for quick selection
const predefinedMessages = [
    "Unable to drive tomorrow",
    "Vehicle maintenance issue",
    "Medical emergency",
    "Family emergency",
    "Weather conditions",
    "Personal appointment"
];

export default function InformScreen() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePredefinedMessage = (predefinedMessage: string) => {
        setMessage(predefinedMessage);
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter a message before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get all child IDs from passenger store
            const passengers = usePassengerStore.getState().byId;
            const childIds = Object.values(passengers).map((p: any) => p.child.child_id);
            console.log('Sending notifications to child IDs:', childIds);

            // Send notification to each child
            await Promise.all(childIds.map(async (childId) => {
                console.log('Sending notification to childId:', childId);
                try {
                    const response = await fetch(`${API_BASE_URL}/notifications/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sender: 'Driver',
                            message: message,
                            type: 'Alert',
                            receiver: 'CHILD',
                            receiverId: childId
                        })
                    });
                    const result = await response.json();
                    console.log('Notification response for childId', childId, ':', result);
                } catch (err) {
                    console.error('Error sending notification to childId', childId, err);
                }
            }));

            Alert.alert(
                'Success',
                'Your message has been sent to all passengers.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (message.trim()) {
            Alert.alert(
                'Discard Changes',
                'Are you sure you want to discard your message?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => router.back()
                    }
                ]
            );
        } else {
            router.back();
        }
    };

    // Log child IDs on mount for debugging
    useEffect(() => {
        try {
            const passengers = usePassengerStore.getState().byId;
            const childIds = Object.values(passengers).map((p: any) => p.child?.child_id).filter(Boolean);
            console.log('[Inform] passenger store child IDs on mount:', childIds);
        } catch (err) {
            console.error('[Inform] error reading passenger store on mount', err);
        }
    }, []);

    return (
        <View className="flex-1 bg-gray-50">
            {/* Blue Header with rounded bottom corners */}
            <View className="bg-brand-deepNavy px-6 pt-20 pb-8 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={handleClose}
                        className="flex-row items-center"
                    >
                        <ArrowLeft size={24} color="#ffffff" weight="regular" />
                        <Typography variant="headline" weight="semibold" className="text-white ml-2">
                            Back
                        </Typography>
                    </TouchableOpacity>

                    <View className="flex-col items-end">
                        <View className="flex-row items-center">
                            <Megaphone size={24} color="#ffffff" weight="regular" />
                            <Typography variant="headline" weight="semibold" className="text-white ml-2">
                                Inform
                            </Typography>
                        </View>
                        {/* <View>
                            <Typography variant="caption-1" className="text-white opacity-80">
                                Inform about your unavailability or any issues
                            </Typography>
                        </View> */}
                    </View>
                </View>

                {/* Header Info */}
                <View className=" bg-opacity-10 rounded-xl p-4 items-center" >
                    {/* <Typography variant="body" weight="medium" className="text-white mb-2">
                        Send Notification
                    </Typography> */}
                    <Typography variant="subhead" className="text-white opacity-80">
                        Inform about your unavailability or any issues
                    </Typography>
                </View>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {/* Message Input */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
                    <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-3">
                        Your Message
                    </Typography>

                    <TextInput
                        className="bg-brand-lightGray rounded-xl p-4 text-body font-figtree-regular text-brand-deepNavy min-h-[120]"
                        placeholder="Enter your message here... (e.g., Can't come tomorrow because of...)"
                        placeholderTextColor="#6b7280"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        textAlignVertical="top"
                        maxLength={500}
                    />

                    <View className="flex-row justify-between items-center mt-2">
                        <Typography variant="caption-2" className="text-brand-neutralGray">
                            {message.length}/500 characters
                        </Typography>
                        {message.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setMessage('')}
                                className="p-1"
                            >
                                <X size={16} color="#6b7280" weight="regular" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Predefined Messages */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
                    <Typography variant="headline" weight="semibold" className="text-brand-deepNavy mb-3">
                        Quick Messages
                    </Typography>
                    <Typography variant="body" className="text-brand-neutralGray mb-4">
                        Tap to use a predefined message
                    </Typography>

                    <View className="space-y-2">
                        {predefinedMessages.map((predefinedMessage, index) => (
                            <TouchableOpacity
                                key={index}
                                className={`p-3 rounded-lg border ${message === predefinedMessage
                                        ? 'bg-brand-brightOrange border-brand-brightOrange'
                                        : 'bg-brand-lightGray border-transparent'
                                    }`}
                                onPress={() => handlePredefinedMessage(predefinedMessage)}
                                activeOpacity={0.7}
                            >
                                <Typography
                                    variant="body"
                                    weight="medium"
                                    className={
                                        message === predefinedMessage
                                            ? 'text-white'
                                            : 'text-brand-deepNavy'
                                    }
                                >
                                    {predefinedMessage}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Submit Button */}
                <View className="mb-6">
                    <TouchableOpacity
                        className={`flex-row items-center justify-center p-4 rounded-xl ${isSubmitting || !message.trim()
                                ? 'bg-brand-neutralGray'
                                : 'bg-brand-brightOrange'
                            }`}
                        onPress={handleSubmit}
                        disabled={isSubmitting || !message.trim()}
                        activeOpacity={0.8}
                    >
                        <PaperPlaneTilt
                            size={20}
                            color="#ffffff"
                            weight="regular"
                        />
                        <Typography
                            variant="body"
                            weight="semibold"
                            className="text-white ml-2"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Typography>
                    </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View className="h-6" />
            </ScrollView>
        </View>
    );
} 