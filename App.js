import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import RotateView from './views/RotateView';
import ScaleView from './views/ScaleView';
import TranslateView from './views/TranslateView';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Rotate" component={RotateView} />
        <Tab.Screen name="Scale" component={ScaleView} />
        <Tab.Screen name="Translate" component={TranslateView} /> 
      </Tab.Navigator>
    </NavigationContainer>
  );
}
