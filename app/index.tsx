import { router } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.c}>
      <Text style={styles.t}>Welcome</Text>
      <Button title="Sign In" onPress={() => router.push('/login')} />
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex:1, justifyContent:'center', alignItems:'center', gap:16, padding:24 },
  t: { fontSize:24, fontWeight:'600' }
});
