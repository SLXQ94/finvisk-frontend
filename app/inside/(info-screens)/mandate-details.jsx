import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";
import { useAuthStore } from "../../../store/authStore";

export default function MandateDetailScreen() {
    const { token } = useAuthStore();
  const [mandateDetails, setMandateDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [loadingMandate, setLoadingMandate] = useState(null); // stores MandateId currently processing

  useEffect(() => {
    const fetchMandateDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/provider/mandate-details`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        const data = await res.json();
        setMandateDetails(data);
      } catch (error) {
        console.error("❌ Failed to fetch mandate detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMandateDetail();
  }, []);

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading Mandate Detail...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {mandateDetails.length === 0 ? (
          <Text style={{ color: "black", textAlign: "center", marginTop: 20 }}>
            No mandate found
          </Text>
        ) : (
          mandateDetails.map((mandate, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => toggleExpand(index)}
            >
              {/* Show major fields */}
              <Text style={styles.title}>Mandate Id: {mandate.MandateId}</Text>
              <Text style={styles.sub}>Status: {mandate.Status}</Text>
              <Text style={styles.sub}>Amount: {mandate.Amount}</Text>

              {mandate.Status?.toLowerCase().includes("waiting for client authentication") && (
                <TouchableOpacity
                    style={{
                        backgroundColor: "#363428ff",
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        alignSelf: "flex-end",
                        marginTop: 4
                    }}
                    activeOpacity={0.7}
                    onPress={async () => {
                        setLoadingMandate(mandate.MandateId);
                        try {
                            const res = await fetch(`${API_URL}/v1/provider/mandate-auth`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ mandate_id: mandate.MandateId }),
                            });
                            
                            const data = await res.json();

                            if (data.url && data.url.startsWith("https://")) {
                                Linking.openURL(data.url);
                            } else {
                                alert("Failed to get authentication link");
                            }
                        } catch (err) {
                            console.error("❌ Error:", err);
                            alert("Something went wrong!");
                        } finally {
                            setLoadingMandate(null);
                        }
                    }}
                    disabled={loadingMandate === mandate.MandateId}
                >
                    <Text style={{ color: "#dee1e7ff", fontWeight: "600" }}>Complete Authentication</Text>
                </TouchableOpacity>
                )}

              {expanded[index] && (
                <View style={styles.expandedBox}>
                  {Object.entries(mandate).map(([key, value]) => (
                    <Text key={key} style={styles.detail}>
                      {key}: {String(value)}
                    </Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#121212", // blackish
    backgroundColor: COLORS.background
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  card: {
    // backgroundColor: "#1D4ED8", // bluish
    backgroundColor: "#121212",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: "#D1D5DB",
  },
  expandedBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 8,
  },
  detail: {
    fontSize: 13,
    color: "#E5E7EB",
    marginBottom: 2,
  },
});
