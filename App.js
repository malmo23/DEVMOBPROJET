import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { LanguageProvider } from './src/i18n/LanguageContext';

export default function App() {
    return (
        <LanguageProvider>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </LanguageProvider>
    );
}