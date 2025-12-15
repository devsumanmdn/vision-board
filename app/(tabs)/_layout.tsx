import { Tabs } from "expo-router";
import { LayoutGrid, ListTodo, UserCircle } from "lucide-react-native";
import React from "react";
import { Image } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import { Colors } from "@/constants/Colors";
import { auth } from "@/firebaseConfig";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Boards",
          tabBarIcon: ({ color }) => (
            <LayoutGrid size={24} color={color} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="actions"
        options={{
          title: "Actions",
          tabBarIcon: ({ color }) => (
            <ListTodo size={24} color={color} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <ProfileTabIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

function ProfileTabIcon({ color }: { color: string }) {
  const user = auth.currentUser;

  if (user?.photoURL) {
    return (
      <Image
        source={{ uri: user.photoURL }}
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          borderWidth: 1.5,
          borderColor: color,
        }}
      />
    );
  }

  return <UserCircle size={24} color={color} strokeWidth={2} />;
}
