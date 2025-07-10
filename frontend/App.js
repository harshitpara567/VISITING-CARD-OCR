import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { TailwindProvider } from 'tailwind-rn';
import utilities from './tailwind.json';
import Navigation from './src/navigation';
import Toast from 'react-native-toast-message';

export default function App() {
  useEffect(() => {
    debugger;
  }, [])
  
  return (
    <TailwindProvider utilities={utilities}>
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Navigation />
        </SafeAreaView>
        <Toast />
      </View>
    </TailwindProvider>
  );
}