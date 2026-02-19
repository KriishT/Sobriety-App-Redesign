import { Stack } from 'expo-router';

export default function GamesLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Stroop Naming Game */}
      <Stack.Screen 
        name="StroopNaming/StroopNaming" 
        options={{
          title: 'Stroop Naming',
        }}
      />
    </Stack>
  );
}