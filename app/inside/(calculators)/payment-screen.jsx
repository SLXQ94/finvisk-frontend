// import { useLocalSearchParams } from 'expo-router';
// import { WebView } from 'react-native-webview';

import { useEffect } from "react";
// import WebView from "react-native-webview";
import { WebView } from "react-native-web-webview";
import usePaymentStore from "../../../store/paymentStore";

export default function PaymentWebViewScreen() {
//   const { html } = useLocalSearchParams();

//   return <WebView source={{ html }} />;
  const { paymentHTML } = usePaymentStore();

  useEffect(() => {
    return () => {
      usePaymentStore.getState().clearPaymentHTML(); // cleanup
    };
  }, []);

  if (!paymentHTML) {
    return <Text>Loading...</Text>;
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: paymentHTML }}
      style={{ flex: 1, width: '100%' }}
      domStorageEnabled={true}
      javaScriptEnabled={true}
    />
  );
}

