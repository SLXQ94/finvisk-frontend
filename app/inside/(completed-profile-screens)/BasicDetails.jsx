import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";
import { GUARDIANRELATION, OCCUPATION } from "../../../constants/parameters";
import { useAuthStore } from "../../../store/authStore";
import { useProfileStore } from "../../../store/profileStore";

export default function BasicDetails() {
  const router = useRouter();
  const {token} = useAuthStore();
  const {isMinor} = useProfileStore();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/profile/basic-details`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to fetch Basic Details");
        }

        const data = await res.json();
        setDetails(data);
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
        <Text style={styles.loadingText}>Fetching your Basic Details...</Text>
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
        <Text style={styles.title}>Basic Details</Text>

        <View style={styles.item}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>
            {details.first_name} {details.middle_name} {details.last_name}
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Occupation</Text>
          <Text style={styles.value}>{OCCUPATION[details.occ_code] || details.occ_code}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{details.gender}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Marital Status</Text>
          <Text style={styles.value}>{Boolean(details.marital_status) ? "You are married" : "You are unmarried"}</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{details.phone}</Text>
        </View>

        {isMinor && (
          <>
            <View style={styles.item}>
              <Text style={styles.label}>Guardian</Text>
              <Text style={styles.value}>
                {details.guardian_first_name} {details.guardian_middle_name} {details.guardian_last_name}
              </Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>Guardian Relationship</Text>
              <Text style={styles.value}>{GUARDIANRELATION[details.guardian_relationship] || details.guardian_relationship}</Text>
            </View>
          </>
        )}
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
  },
});
