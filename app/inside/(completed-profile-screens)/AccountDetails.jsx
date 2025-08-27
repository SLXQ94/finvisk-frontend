import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";
import { INCOMESLAB, TAXSTATUS } from "../../../constants/parameters";
import { useAuthStore } from "../../../store/authStore";

export default function AccountDetails() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {token} = useAuthStore();

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/profile/account-details`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setDetails(data);
        } else {
          console.error("Error fetching account details:", data.message);
        }
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#fff" }}>No Account Details Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        {/* <Text style={styles.backText}>← Back</Text> */}
        <Feather name="arrow-left" size={24} color={`${COLORS.background}`} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.header}>Bank Account Details</Text>

          <View style={styles.item}>
            <Text style={styles.label}>Bank</Text>
            <Text style={styles.value}>{details.bank_name}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Branch</Text>
            <Text style={styles.value}>{details.branch_name}, {details.branch_city}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Branch Address</Text>
            <Text style={styles.value}>{details.branch_address}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{details.account_number}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Account Type</Text>
            <Text style={styles.value}>{details.account_type_bse}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>IFSC Code</Text>
            <Text style={styles.value}>{details.ifsc_code}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>MICR Code</Text>
            <Text style={styles.value}>{details.micr_code}</Text>
          </View>

          <Text style={styles.header}>KYC Details</Text>

          <View style={styles.item}>
            <Text style={styles.label}>Income Slab</Text>
            <Text style={styles.value}>{INCOMESLAB[details.income_slab] || details.income_slab}</Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Tax Status</Text>
            <Text style={styles.value}>{TAXSTATUS[details.tax_status] || details.tax_status}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scroll: {
    padding: 20,
  },
  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 12,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 6,
  },
  item: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 3,
  },
  value: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  backButton: {
    padding: 12,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
  },
});