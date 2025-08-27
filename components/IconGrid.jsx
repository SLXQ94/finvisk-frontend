import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useProfileStore } from "../store/profileStore";

export default function IconGrid({ icons }) {
  const router = useRouter();
  const {CKYC,
    BasicDetails,
    Address,
    AccountDetails,
    NomineeDetails,
    NomineeAuthenticated } = useProfileStore();

  return (
    <View style={styles.container}>
      {icons.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.iconBox}
          activeOpacity={0.8}
          onPress={() => {
            if (!CKYC) return router.push("/inside/CKYCForm");
            if (!BasicDetails) return router.push("/inside/BasicDetailsForm");
            if (!Address) return router.push("/inside/AddressDetailsForm");
            if (!AccountDetails) return router.push("/inside/AccountDetailsForm");
            if (!NomineeDetails) return router.push("/inside/NomineeDetailsForm");
            if (!NomineeAuthenticated) return router.push("/inside");

            router.push(item.route);
          }}
        >
          
          <Ionicons name={item.icon} size={40} color="white" style={{ marginBottom: 6 }} />

          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap", // makes wrapping happen
    justifyContent: "flex-start",
    padding: 10,
  },
  iconBox: {
    width: "30%", // ensures 3 per row 
    margin: "1.5%",
    aspectRatio: 1, // keeps square-like box
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
//   iconImage: {
//     width: 40,
//     height: 40,
//     marginBottom: 6,
//     color: "white"
//   },
  label: {
    fontSize: 12,
    color: "white",
    textAlign: "center",
  },
});