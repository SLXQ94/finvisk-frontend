import { Stack } from 'expo-router';

const CalculatorsLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CKYC" />
    <Stack.Screen name="BasicDetails" />
    <Stack.Screen name="Address" />
    <Stack.Screen name="AccountDetails" />
    <Stack.Screen name="NomineeDetails" />
  </Stack>
);

export default CalculatorsLayout;