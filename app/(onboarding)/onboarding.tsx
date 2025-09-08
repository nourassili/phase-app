
import { router } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';


export default function OnboardingScreen() {
return (
    <View style={styles.container}>
        <Text style={styles.title}>Onboarding Flow</Text>
        <Text style={styles.subtitle}>TODO: build the steps you want here.</Text>
        <View style={{ height: 16 }} />
        <Button title="Continue to App" onPress={() => router.replace('/(protected)/home')} />
    </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666' },
});