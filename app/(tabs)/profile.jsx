import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import styles from "../../assets/styles/profile.styles";
import LogoutButton from '../../components/LogoutButton';
import ProfileHeader from '../../components/ProfileHeader';
import { useAuthStore } from "../../store/authStore";

export default function Profile() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);

  const {token} = useAuthStore();

  const router = useRouter();

  return (
    <View style={styles.container}>
      <ProfileHeader/>
      <LogoutButton/>

      <View style={styles.emptyContainer}>
        {/* <Ionicons name='call-outline' size={50} color={COLORS.textSecondary}/> */}
        <Text style={styles.emptyText}>Not Sure?</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => Linking.openURL("tel:+918178507328")}>
          {/* <Text style={styles.addButtonText}>Call</Text> */}
          <Ionicons name='call' size={50} color="#4A90E2"/>
        </TouchableOpacity>
      </View>

    </View>
  )
}