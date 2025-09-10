import { signOut } from 'firebase/auth';
import React from 'react';
import { Button, Text, View } from 'react-native';
import { auth } from '../../lib/firebase';

export default function Home() {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:16 }}>
      <Text>You are logged in ✅</Text>
      <Button title="Sign Out" onPress={() => signOut(auth)} />
    </View>
  );
}
