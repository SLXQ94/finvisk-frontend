import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";
import { useAuthStore } from "../../../store/authStore";

export default function CKYC() {
  const router = useRouter();
  const {token} = useAuthStore();
  const [ckycData, setCkycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/profile/ckyc`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to fetch CKYC data");
        }

        const data = await res.json();
        setCkycData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Fetching your CKYC details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          {/* <Text style={styles.backButtonText}>← Back</Text> */}
          <Feather name="arrow-left" size={24} color={`${COLORS.background}`} />
        </TouchableOpacity>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        {/* <Text style={styles.backButtonText}>← Back</Text> */}
        <Feather name="arrow-left" size={24} color={`${COLORS.background}`} />
      </TouchableOpacity>

      {/* Grey Card */}
      <ScrollView contentContainerStyle={styles.card}>
        <Text style={styles.title}>CKYC Profile</Text>

        <View style={styles.item}>
          <Text style={styles.label}>PAN</Text>
          <Text style={styles.value}>{ckycData.pan}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{ckycData.dob}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Resident</Text>
          <Text style={styles.value}>{ckycData.indian_resident ? "Indian" : "NRI"}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Politically Exposed</Text>
          <Text style={styles.value}>{ckycData.politically_exposed ? "Yes" : "No"}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Related Politically Exposed</Text>
          <Text style={styles.value}>{ckycData.related_politically_exposed ? "Yes" : "No"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Black background
    padding: 16,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  card: {
    backgroundColor: "#1e1e1e", // Greyish card
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  item: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#aaa",
    fontSize: 16,
  }
});