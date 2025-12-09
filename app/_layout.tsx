import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { auth } from "@/firebaseConfig";
import { useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useState } from "react";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Handle user state changes
  function onAuthStateChangedHandler(user: User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Redirect to the login page if not signed in
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Redirect to the home page if signed in
      router.replace("/(tabs)");
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return null; // Or a Loading Spinner
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="vision/[id]"
          options={{ presentation: "card", title: "Delusion Detail" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
