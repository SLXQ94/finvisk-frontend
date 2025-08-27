import Slider from "@react-native-community/slider";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function PersonalLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTenure, setLoanTenure] = useState(5);

  const { monthlyEMI, totalInterest, totalAmount } = useMemo(() => {
    const r = interestRate / 100 / 12; // Monthly interest rate
    const n = loanTenure * 12; // Loan tenure in months
    
    // EMI calculation formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    const total = emi * n;
    const interest = total - loanAmount;
    
    return {
      monthlyEMI: emi,
      totalInterest: interest,
      totalAmount: total
    };
  }, [loanAmount, interestRate, loanTenure]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Personal Loan Calculator</Text>

      <SliderControl
        label="Loan amount"
        value={loanAmount}
        setValue={setLoanAmount}
        minimum={100000}
        maximum={10000000}
        step={10000}
        format={(val) => `₹ ${val.toLocaleString()}`}
      />

      <SliderControl
        label="Rate of interest (p.a)"
        value={interestRate}
        setValue={setInterestRate}
        minimum={1}
        maximum={30}
        step={0.1}
        format={(val) => `${val.toFixed(1)} %`}
      />

      <SliderControl
        label="Loan tenure"
        value={loanTenure}
        setValue={setLoanTenure}
        minimum={1}
        maximum={30}
        format={(val) => `${val} Yr`}
      />

      <View style={styles.resultsBox}>
        <Text style={styles.resultRow}>
          <Text style={styles.label}>Principal amount: </Text>
          <Text style={styles.invested}>₹ {loanAmount.toLocaleString()}</Text>
        </Text>

        <Text style={styles.resultRow}>
          <Text style={styles.label}>Total interest: </Text>
          <Text style={styles.returns}>₹ {totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </Text>

        <Text style={styles.resultRow}>
          <Text style={styles.label}>Total amount: </Text>
          <Text style={styles.total}>₹ {totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </Text>

        <Text style={[styles.resultRow, styles.emiRow]}>
          <Text style={styles.label}>Monthly EMI: </Text>
          <Text style={styles.emi}>₹ {monthlyEMI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

function SliderControl({ label, value, setValue, minimum, maximum, step = 1, format }) {
  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sliderValue}>{format(value)}</Text>
      <Slider
        minimumValue={minimum}
        maximumValue={maximum}
        value={value}
        onSlidingComplete={(val) => setValue(step === 1 ? Math.round(val) : parseFloat(val.toFixed(1)))}
        step={step}
        minimumTrackTintColor="#4faaff"
        maximumTrackTintColor="#999"
        thumbTintColor="#4faaff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
  },
  sliderValue: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  resultsBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#111",
    borderRadius: 12,
  },
  resultRow: {
    fontSize: 16,
    marginBottom: 12,
  },
  emiRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  invested: {
    color: "#4faaff",
  },
  returns: {
    color: "#ff6b6b",
  },
  total: {
    color: "#fff",
    fontWeight: "bold",
  },
  emi: {
    color: "#5be27c",
    fontWeight: "bold",
    fontSize: 18,
  },
});