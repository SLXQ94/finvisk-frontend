import { Alert, FlatList, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import styles from "../../../assets/styles/home.styles";
import ImprovedDivision from "../../../components/Portfolio";
import QuestionCard from "../../../components/QuestionCard";

import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Text } from "react-native";
import { API_URL } from "../../../constants/api";
import { useAuthStore } from "../../../store/authStore";
import { useProfileStore } from "../../../store/profileStore";

const calculators = [
  { name: "SIP", route: "/inside/sip", icon: require("../../../assets/icons/check-mark.png"), color: "#2d7aa9" },
  { name: "Lumpsum", route: "/inside/lumpsum", icon: require("../../../assets/icons/coins.png"), color: "#b89b2e" },
  // { name: "SWP", route: "/swp", icon: require("../../../assets/icons/money.png"), color: "#7c1faa" },
  // { name: "NPS", route: "/nps", icon: require("../../../assets/icons/money.png"), color: "#1d8c82" },
  // { name: "EPF", route: "/epf", icon: require("../../../assets/icons/money.png"), color: "#41608a" },
  { name: "FD", route: "/inside/fd", icon: require("../../../assets/icons/padlock.png"), color: "#2864a2" },
  { name: "Home Loan", route: "/inside/personal-loan", icon: require("../../../assets/icons/home.png"), color: "#562b90" },
  { name: "Personal Loan", route: "/inside/personal-loan", icon: require("../../../assets/icons/user.png"), color: "#9b491b" },
  { name: "Car Loan", route: "/inside/personal-loan", icon: require("../../../assets/icons/car.png"), color: "#3b7923" },
];

function CalculatorGrid() {
  const router = useRouter();

  return (
    <View style={styles.gridContainer}>
      <Text style={styles.sectionTitle}>Calculators</Text>
      <View style={styles.grid}>
        {calculators.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.iconWrapper, { backgroundColor: item.color }]}
            onPress={() => router.push(item.route)}
          >
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.iconLabel}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function Index() {
  const router = useRouter();
  const {token} = useAuthStore();
  const {NomineeDetails, NomineeAuthenticated, fetchProfileStatus} = useProfileStore();
  const [twoFALink, setTwoFALink] = useState(null);
  const [subscriptionLink, setSubscriptionLink] = useState(null);
  const [paymentHTML, setPaymentHTML] = useState(null);
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef(null);

  const startPolling = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      check2FA();
      checkPaymentHTML();
    }, 60 * 1000);
    setPolling(true);
  };

  const stopPolling = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setPolling(false);
  };

  const togglePolling = () => {
    if (polling) stopPolling();
    else {
      setPaymentHTML(null);
      setSubscriptionLink(null);
      startPolling()
    };
  };

  const check2FA = async () => {
    if (subscriptionLink) return;
    try {
      const res = await fetch(`${API_URL}/v1/provider/subscription-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        // body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch 2FA: ${res.status} ${text}`);
      }

      const data = await res.json();

      console.log('Payment Authentication response:', data);

      if (data.link) {
        setSubscriptionLink(data.link);
        Alert.alert('Subscription link received');
      }
    } catch (err) {
      console.error('2FA API error:', err);
    }
  };

  const checkPaymentHTML = async () => {
    if (paymentHTML) return;
    try {
      const res = await fetch(`${API_URL}/v1/provider/make-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        // body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch payment HTML: ${res.status} ${text}`);
      }

      const data = await res.json();

      console.log('Payment link response: ', data);
      
      if (data.link) {
        setPaymentHTML(data.link);
        Alert.alert('Payment interface is ready');
      }
    } catch (err) {
      console.error('Payment API error:', err);
    }
  };

  // const openPaymentInBrowser = (paymentHTML) => {
  //   // Create a Blob from the HTML string
  //   const blob = new Blob([paymentHTML], { type: 'text/html' });

  //   // Create a URL for the blob
  //   const url = URL.createObjectURL(blob);

  //   // Open in external browser
  //   Linking.openURL(url);

  //   // Cleanup: revoke the URL after a delay
  //   setTimeout(() => URL.revokeObjectURL(url), 1000);
  // };

  // const openPaymentInBrowser = async (paymentHTML) => {
  //   try {
  //     // Path to a temporary HTML file
  //     const fileUri = FileSystem.cacheDirectory + "payment.html";

  //     // Write HTML to the file
  //     await FileSystem.writeAsStringAsync(fileUri, paymentHTML, {
  //       encoding: FileSystem.EncodingType.UTF8,
  //     });

  //     // Open in browser
  //     // await Linking.openURL(fileUri);
  //     await WebBrowser.openBrowserAsync(fileUri);
  //   } catch (error) {
  //     console.error("Failed to open payment page:", error);
  //   }
  // };

  // Automatically stop polling when both are ready
  useEffect(() => {
    if (subscriptionLink && paymentHTML && polling) {
      stopPolling();
    }
  }, [subscriptionLink, paymentHTML]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  useEffect(() => {
    const checkNominee2FA = async () => {
      if (!NomineeDetails || NomineeAuthenticated) return;

      try {
        const res = await fetch(`${API_URL}/v1/provider/nominee-2fa`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          if (data.message?.toLowerCase().includes("already authenticated")) {
            await fetchProfileStatus();
          } else if (data.message?.toLowerCase().includes("2fa link generated")) {
            setTwoFALink(data.returnUrl);
          }
        } else {
          console.warn("Nominee 2FA API failed:", data);
        }
      } catch (err) {
        console.error("Error calling 2FA API:", err);
      }
    };

    checkNominee2FA();
  }, [NomineeDetails, NomineeAuthenticated]);

    return (
        <View style={styles.container}>
          <FlatList
                data={[]}
                renderItem={() => null}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                      <QuestionCard/>

                      {/* Only show this button when a 2FA link is available */}
                      {twoFALink && (
                        <TouchableOpacity
                          style={[button_styles.button, button_styles.enabled]}
                          activeOpacity={0.8}
                          onPress={() => Linking.openURL(twoFALink)}
                        >
                          <Text style={button_styles.buttonText}>Complete Nominee 2FA</Text>
                        </TouchableOpacity>
                      )}

                      {NomineeAuthenticated && (
                        <>
                        {/* Subscription Button */}
                      <TouchableOpacity
                        style={[button_styles.button, subscriptionLink ? button_styles.enabled : button_styles.disabled]}
                        disabled={!subscriptionLink}
                        onPress={() => Linking.openURL(subscriptionLink)}
                      >
                        <Text style={button_styles.buttonText}>
                          Authenticate Payment
                        </Text>
                      </TouchableOpacity>

                      {/* Payment Button */}
                      <TouchableOpacity
                        style={[button_styles.button, paymentHTML ? button_styles.enabled : button_styles.disabled]}
                        disabled={!paymentHTML}
                        onPress={() => {
                          if (paymentHTML) {
                            // openPaymentInBrowser(paymentHTML);
                            Linking.openURL(paymentHTML);
                          }
                        }}
                      >
                        <Text style={button_styles.buttonText}>
                          Open Payment Page
                        </Text>
                      </TouchableOpacity>

                      {/* Toggle Polling */}
                      <TouchableOpacity
                        style={[button_styles.button, button_styles.toggle]}
                        onPress={togglePolling}
                      >
                        <Text style={button_styles.buttonText}>
                          {polling ? 'Abort Payment' : 'Initiate Payment'}
                        </Text>
                      </TouchableOpacity>
                      </>
                      )}

                      <ImprovedDivision/>
                      <CalculatorGrid/>
                    </View>
                }
            />
        </View>
    );
}

const button_styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#f0f0f0'
  },
  title: {
    fontSize: 22,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  button: {
    padding: 12,
    marginVertical: 10,
    marginHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center'
  },
  enabled: {
    backgroundColor: '#4CAF50',
  },
  disabled: {
    backgroundColor: '#cccccc',
  },
  toggle: {
    // backgroundColor: '#2196F3',
    backgroundColor: '#121212'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16
  }
});