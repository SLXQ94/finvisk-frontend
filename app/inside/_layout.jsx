import { Stack } from 'expo-router'

const Layout = () => {
  return (
    <Stack>
        <Stack.Screen name='(tabs)' options={{headerShown: false}}/>
        <Stack.Screen name='(calculators)' options={{headerShown: false}}/>
        <Stack.Screen name='(info-screens)' options={{headerShown: false}}/>
        <Stack.Screen name='(profile-completion-steps)' options={{headerShown: false}}/>
        <Stack.Screen name='(completed-profile-screens)' options={{headerShown: false}}/>
        <Stack.Screen name='modals' options={{headerShown: false, presentation: 'modal'}}/>

    </Stack>
  )
}

export default Layout