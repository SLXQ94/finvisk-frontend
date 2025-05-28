import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

import { API_URL } from "../constants/api";
import { useAuthStore } from "../store/authStore";

const Section = ({ title, items }) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 12 }}>
        {title}
      </Text>
      {items.map((item, index) => (
        <View key={index}>
          <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 8, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Image
              source={{ uri: item.imageLink }}
              style={{ width: 48, height: 48, borderRadius: 12, marginRight: 12, resizeMode: "cover" }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>{item.fundName}</Text>
              <Text style={{ color: "#6b7280" }}>{item.allocation} %</Text>
            </View>
          </View>
          {index < items.length - 1 && (
            <Text style={{ textAlign: "center", color: "#6b7280", fontWeight: "500" }}>
              {item.allocation === items[index + 1].allocation ? "or" : "and"}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const ImprovedDivision = () => {
  const {token} = useAuthStore();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBonus, setShowBonus] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`${API_URL}/question/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch portfolio");

    //   console.log("Fetched portfolio:", data);
      setPortfolio(data);
    } catch (error) {
      console.log("Error fetching portfolio:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading Portfolio...</Text>
      </View>
    );
  }

  if (!portfolio) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "red" }}>Unable to load portfolio.</Text>
      </View>
    );
  }

//   const filteredOptions = showBonus
//     ? Object.fromEntries(
//         Array.from(portfolio.options).map(([key, values]) => [
//           key,
//           values.filter((item) => item.taxSaver),
//         ])
//       )
//     : portfolio.options;

//     console.log({filteredOptions});

    const taxSaverFunds = [];
    Object.values(portfolio.options).forEach(category => {
        category.filter(item => item.taxSaver).forEach(bonusItem => {
        taxSaverFunds.push(bonusItem);
        });
    });

  return (
    
      
    <View style={{ padding: 16 }}>
      {/* {Object.entries(filteredOptions).map(([key, value]) => (
        <Section key={key} title={key} items={value} />
      ))}

      {showBonus && <Section title="Tax Saver" items={portfolio.taxSaverOption} />} */}

      {/* Show regular sections */}
      {!showBonus && Object.entries(portfolio.options).map(([key, value]) => (
        <Section key={key} title={key} items={value} />
      ))}

      {/* Show bonus mode: category bonus questions + bonus section */}
      {showBonus && (
        <>
          {/* Show categories with only bonus questions */}
          {Object.entries(portfolio.options).map(([key, value]) => {
            const bonusItems = value.filter(item => item.taxSaver);
            return bonusItems.length > 0 ? (
              <Section key={key} title={key} items={bonusItems} />
            ) : null;
          })}

          {/* Show combined bonus section */}
          {portfolio.taxSaverOption && portfolio.taxSaverOption.length > 0 && (
            <Section 
              title="Tax Saver Funds" 
              items={[...portfolio.taxSaverOption]} 
            />
          )}
        </>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: "#6366f1",
          padding: 12,
          borderRadius: 999,
          marginTop: 16
        }}
        onPress={() => setShowBonus(!showBonus)}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
          {showBonus ? "Show All" : "Make it tax efficient"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ImprovedDivision;