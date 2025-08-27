import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";
import { useAuthStore } from "../../../store/authStore";

export default function AddressScreen() {
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(null);
  const router = useRouter();
  const {token} = useAuthStore();

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/profile/address`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setAddress(data.address);
        } else {
          console.error("Error fetching nominee details:", data.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (!address) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Failed to load address details</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color={`${COLORS.background}`} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Permanent Address */}
        <View style={styles.card}>
          <Text style={styles.heading}>🏠 Permanent Address</Text>
          <Text style={styles.value}>{address.permanent.address}</Text>
          <Text style={styles.subValue}>
            {address.permanent.city}, {address.permanent.state} - {address.permanent.pincode}
          </Text>
        </View>

        {/* Current Address */}
        <View style={styles.card}>
          <Text style={styles.heading}>📍 Current Address</Text>
          <Text style={styles.value}>{address.current.address}</Text>
          <Text style={styles.subValue}>
            {address.current.city}, {address.current.state} - {address.current.pincode}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  scroll: { paddingBottom: 40 },
  backButton: {
    padding: 12,
  },
  backText: { color: "#fff", fontSize: 16 },
  card: {
    backgroundColor: "#1a1a1a",
    borderColor: "#555",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  heading: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  value: { color: "#fff", fontSize: 15 },
  subValue: { color: "#ccc", fontSize: 13, marginTop: 4 },
  text: { color: "#fff", textAlign: "center", marginTop: 20 },
});