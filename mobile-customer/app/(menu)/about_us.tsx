import React from 'react';
import { View, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ArrowRight } from 'phosphor-react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AboutUsScreen() {
  const handleDial = (number: string) => Linking.openURL(`tel:${number}`);
  const handleLink = (url: string) => Linking.openURL(url);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="About us" showBackButton />

        {/* Logo */}
        <View className="items-center mt-2">
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 130, height: 130, resizeMode: "contain" }}
          />
        </View>

        {/* Description over background image */}
        <View className="mx-4 mt-3 mb-6 overflow-hidden rounded-2xl">
          <Image
            source={require("../../assets/images/company.png")}
            style={{
              width: "100%",
              height: 150,
              resizeMode: "cover",
              borderRadius: 16,
            }}
          />
          <View className="absolute inset-0 bg-black/35 rounded-2xl px-2 py-4 items-center">
            <Typography variant="footnote" className="text-white text-center">
              YathraGo is your smart travel companion, designed to make ride
              booking in Sri Lanka simple, fast, and reliable. With just a few
              taps, you can request a ride, track your driver in real time, and
              enjoy secure payments. Whether you're commuting to work,
              heading to class, YathraGo connects you
              with trusted drivers and transparent pricing.
            </Typography>
          </View>
        </View>

        {/* Contact rows */}
        <Card className="mx-4 mb-0 p-0 bg-transparent shadow-none">
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2 bg-white rounded-full px-4 py-3 shadow">
              <Typography variant="footnote" className="text-black">
                Support-Passenger
              </Typography>
              <TouchableOpacity onPress={() => handleDial("0117894561")}>
                <Typography variant="subhead" className="text-brand-deepNavy">
                  011 - 7894561
                </Typography>
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-1 bg-white rounded-full px-4 py-3 shadow items-center">
              <Typography variant="footnote" className="text-black">
                Hotline
              </Typography>
              <TouchableOpacity onPress={() => handleDial("119")}>
                <Typography variant="subhead" className="text-brand-deepNavy">
                  011 - 1234567
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Website row */}
        <Card className="mx-4 mb-0 p-0 bg-transparent shadow-none">
          <View className="bg-white rounded-full px-4 py-3 shadow">
            <Typography variant="footnote" className="text-black">
              Website
            </Typography>
            <TouchableOpacity onPress={() => handleLink("https://yathrago.lk")}>
              <Typography variant="subhead" className="text-brand-deepNavy">
                https://yathrago.lk
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Legal and Privacy cards */}
        <Card className="mx-4 mb-5 p-5 bg-gray-100">
          {[
            { id: "legal", title: "Legal" },
            { id: "privacy", title: "Privacy Policy" },
          ].map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              className={`bg-white rounded-full px-4 py-4 flex-row items-center justify-between shadow ${idx === 0 ? "mb-4" : ""}`}
              activeOpacity={0.8}
              onPress={() => {
                if (item.id === "legal") {
                  router.push("/(menu)/(aboutUs)/legal");
                } else if (item.id === "privacy") {
                  router.push("/(menu)/(aboutUs)/privacy");
                }
              }}
            >
              <Typography variant="subhead" className="text-black">
                {item.title}
              </Typography>
              <ArrowRight size={18} color="#222" />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Social Icons */}
        <View className="flex-row justify-center gap-5 mb-10">
          {[
            { name: "logo-facebook" as const, color: "#1877F2" },
            { name: "logo-tiktok" as const, color: "#000000" },
            { name: "logo-instagram" as const, color: "#E4405F" },
            { name: "logo-whatsapp" as const, color: "#25D366" },
            { name: "logo-youtube" as const, color: "#FF0000" },
          ].map(({ name, color }) => (
            <TouchableOpacity
              key={name}
              onPress={() => handleLink("https://yathrago.lk")}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="link"
              accessibilityLabel={`${name} link`}
            >
              <Ionicons name={name} size={28} color={color} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}