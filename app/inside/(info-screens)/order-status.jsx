import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";
import { useAuthStore } from "../../../store/authStore";

export default function OrdersScreen() {
    const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/provider/order-status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("❌ Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {orders.length === 0 ? (
          <Text style={{ color: "black", textAlign: "center", marginTop: 20 }}>
            No orders found.
          </Text>
        ) : (
          orders.map((order, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => toggleExpand(index)}
            >
              {/* Show major fields */}
              <Text style={styles.title}>Order No: {order.OrderNumber}</Text>
              <Text style={styles.sub}>Status: {order.OrderRemarks}</Text>
              <Text style={styles.sub}>Scheme: {order.SchemeName}</Text>

              {expanded[index] && (
                <View style={styles.expandedBox}>
                  {Object.entries(order).map(([key, value]) => (
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
