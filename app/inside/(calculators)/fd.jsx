import Slider from "@react-native-community/slider";
import { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function FDCalculator() {
  const [depositAmount, setDepositAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7);
  const [timePeriod, setTimePeriod] = useState(5);
  const [interestPayout, setInterestPayout] = useState("cumulative"); // 'cumulative' or 'annually'

  const { estimatedReturns, totalValue } = useMemo(() => {
    const r = interestRate / 100;
    const n = timePeriod;

    if (interestPayout === "cumulative") {
      // Compound interest formula for cumulative payout
      const maturityAmount = depositAmount * Math.pow(1 + r, n);
      return {
        estimatedReturns: maturityAmount - depositAmount,
        totalValue: maturityAmount
      };
    } else {
      // Simple interest for annual payout (interest withdrawn each year)
      return {
        estimatedReturns: depositAmount * r * n,
        totalValue: depositAmount + (depositAmount * r * n)
      };
    }
  }, [depositAmount, interestRate, timePeriod, interestPayout]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>FD Calculator</Text>

      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[styles.radioButton, interestPayout === "cumulative" && styles.radioButtonSelected]}
          onPress={() => setInterestPayout("cumulative")}
        >
          <Text style={[styles.radioLabel, interestPayout === "cumulative" && styles.radioLabelSelected]}>
            Cumulative
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.radioButton, interestPayout === "annually" && styles.radioButtonSelected]}
          onPress={() => setInterestPayout("annually")}
        >
          <Text style={[styles.radioLabel, interestPayout === "annually" && styles.radioLabelSelected]}>
            Annually
          </Text>
        </TouchableOpacity>
      </View>

      <SliderControl
        label="Total deposit"
        value={depositAmount}
        setValue={setDepositAmount}
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
        maximum={15}
        step={0.1}
        format={(val) => `${val.toFixed(1)} %`}
      />

      <SliderControl
        label="Time period"
        value={timePeriod}
        setValue={setTimePeriod}
        minimum={1}
        maximum={25}
        format={(val) => `${val} Yr`}
      />

      <View style={styles.resultsBox}>
        <Text style={styles.resultRow}>
          <Text style={styles.label}>Invested amount: </Text>
          <Text style={styles.invested}>₹ {depositAmount.toLocaleString()}</Text>
        </Text>

        <Text style={styles.resultRow}>
          <Text style={styles.label}>Estimated returns: </Text>
          <Text style={styles.returns}>₹ {estimatedReturns.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </Text>

        <Text style={styles.resultRow}>
          <Text style={styles.label}>Total value: </Text>
          <Text style={styles.total}>₹ {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </Text>

        <View style={styles.pieChartWrapper}>
          <PieChart
            data={[
              {
                name: "Invested amount",
                population: depositAmount,
                color: "#4faaff",
                legendFontColor: "#fff",
                legendFontSize: 12,
              },
              {
                name: "Estimated returns",
                population: estimatedReturns,
                color: "#5be27c",
                legendFontColor: "#fff",
                legendFontSize: 12,
              },
            ]}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#000",
              backgroundGradientFrom: "#000",
              backgroundGradientTo: "#000",
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
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
    textAlign: "center",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  radioButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4faaff",
  },
  radioButtonSelected: {
    backgroundColor: "#4faaff",
  },
  radioLabel: {
    color: "#4faaff",
  },
  radioLabelSelected: {
    color: "#000",
    fontWeight: "bold",
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
  pieChartWrapper: {
    alignItems: "center",
    marginTop: 16,
  },
  resultRow: {
    fontSize: 16,
    marginBottom: 12,
  },
  invested: {
    color: "#4faaff",
  },
  returns: {
    color: "#5be27c",
  },
  total: {
    color: "#fff",
    fontWeight: "bold",
  },
});