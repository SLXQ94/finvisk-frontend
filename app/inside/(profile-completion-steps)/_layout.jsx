import { Stack } from 'expo-router';

const CalculatorsLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CKYCForm" />
    <Stack.Screen name="BasicDetailsForm" />
    <Stack.Screen name="AddressDetailsForm" />
    <Stack.Screen name="AccountDetailsForm" />
    <Stack.Screen name="NomineeDetailsForm" />
  </Stack>
);

export default CalculatorsLayout;