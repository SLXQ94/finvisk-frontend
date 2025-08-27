import { Stack } from 'expo-router';

const CalculatorsLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="sip" />
    <Stack.Screen name="lumpsum" />
    <Stack.Screen name="personal-loan" />
    <Stack.Screen name="fd" />
    <Stack.Screen name="PaymentScreen" />
  </Stack>
);

export default CalculatorsLayout;