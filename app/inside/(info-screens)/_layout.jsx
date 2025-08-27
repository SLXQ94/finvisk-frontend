import { Stack } from 'expo-router';

const InfoScreenLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="order-status" />
    <Stack.Screen name="mandate-details" />
  </Stack>
);

export default InfoScreenLayout;