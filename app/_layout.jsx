import { useFonts } from "expo-font";
import { Slot, SplashScreen, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { useAuthStore } from "../store/authStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const {checkAuth, user, token, divisionIndex, isCheckingAuth} = useAuthStore();

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf")
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
    };
    initializeAuth();
  }, []);

  // handle navigation based on the auth state
  useEffect(() => {
    if (isCheckingAuth) return;

    const currentSegment = segments[0];
    const isSignedIn = !!user && !!token;

    // User is not signed in - redirect to auth
    if (!isSignedIn && currentSegment !== "(auth)") {
      router.replace("/(auth)");
      return;
    }

    // User is signed in but hasn't completed onboarding
    if (isSignedIn && divisionIndex === -1 && currentSegment !== "(onboarding)") {
      router.replace("/(onboarding)");
      return;
    }

    // User is signed in and has completed onboarding
    if (isSignedIn && divisionIndex >= 0 && currentSegment !== "(tabs)") {
      router.replace("/(tabs)");
      return;
    }
    
  }, [user, token, segments, isCheckingAuth, divisionIndex]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        {/* <Stack screenOptions={{ headerShown: false}}>
          <Stack.Screen name="(tabs)"/>
          <Stack.Screen name="(auth)"/>
        </Stack> */}
        <Slot/>
      </SafeScreen>

      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
