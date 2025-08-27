import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";
import { useAuthStore } from "../../../store/authStore";

export default function NomineeDetails() {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const router = useRouter();
  const {token} = useAuthStore();

  useEffect(() => {
    const fetchNominees = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/profile/nominees`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        
        if (res.ok) {
          setDetails(data);
        } else {
          console.error("Error fetching nominee details:", data.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNominees();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Failed to load nominee details</Text>
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
        <View style={styles.card}>
          {details.nominationOpt === "N" ? (
            <Text style={styles.value}>You have opted out of Nomination...</Text>
          ) : (
            details.nominees.map((nom, idx) => (
              <View key={idx} style={styles.nomineeBox}>
                <Text style={styles.label}>Nominee {idx + 1}</Text>
                <Text style={styles.value}>{nom.nom_name} ({nom.nom_relationship})</Text>
                <Text style={styles.subValue}>Allocation: {nom.app_percent}%</Text>
                {nom.nom_minorflag === "Y" && (
                  <Text style={styles.subValue}>
                    Minor (DOB: {nom.nom_dob}) | Guardian: {nom.nom_guardian} ({nom.nom_guardianPAN})
                  </Text>
                )}
                <Text style={styles.subValue}>Email: {nom.nom_email}</Text>
                <Text style={styles.subValue}>Mobile: {nom.nom_mobile}</Text>
                <Text style={styles.subValue}>
                  Address: {nom.nom_add1}, {nom.nom_add2}, {nom.nom_add3}, {nom.nom_city} - {nom.nom_pincode}
                </Text>
                <Text style={styles.subValue}>ID: {nom.nom_IdType} - {nom.nom_IdNo}</Text>
              </View>
            ))
          )}
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
  },
  nomineeBox: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  label: { color: "#aaa", fontSize: 14, marginBottom: 4 },
  value: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  subValue: { color: "#ccc", fontSize: 13, marginTop: 2 },
  text: { color: "#fff", textAlign: "center", marginTop: 20 },
});