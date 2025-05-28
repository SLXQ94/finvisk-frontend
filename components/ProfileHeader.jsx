import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import styles from '../assets/styles/profile.styles';
import { useAuthStore } from '../store/authStore';

export default function ProfileHeader() {
    const {user} = useAuthStore();

    if (!user) return null;

  return (
    <View style={styles.profileHeader}>
      <Image source={{uri: user.profileImage}} style={styles.profileImage}/>

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
    </View>
  )
}