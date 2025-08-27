import Slider from "@react-native-community/slider";
import { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(34388);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(0);
  const [timePeriod, setTimePeriod] = useState(10);

  const investedAmount = useMemo(
    () => monthlyInvestment * 12 * timePeriod,
    [monthlyInvestment, timePeriod]
  );

  const estimatedReturns = useMemo(() => {
    const r = expectedReturnRate / 100 / 12;
    const n = timePeriod * 12;
    const maturityAmount =
      monthlyInvestment * ((Math.pow(1 + r, n) - 1) * (1 + r)) / r;
    return maturityAmount - investedAmount;
  }, [monthlyInvestment, expectedReturnRate, timePeriod, investedAmount]);

  const totalValue = investedAmount + estimatedReturns;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>SIP Calculator</Text>

      <SliderControl
        label="Monthly investment"
        value={monthlyInvestment}
        setValue={setMonthlyInvestment}
        minimum={5000}
        maximum={1000000}
        format={(val) => `₹ ${val.toLocaleString()}`}
      />

      <SliderControl
        label="Expected return rate (p.a)"
        value={expectedReturnRate}
        setValue={setExpectedReturnRate}
        minimum={1}
        maximum={30}
        format={(val) => `${val.toFixed(2)} %`}
      />

      <SliderControl
        label="Estimated inflation rate (p.a)"
        value={inflationRate}
        setValue={setInflationRate}
        minimum={0}
        maximum={10}
        format={(val) => `${val.toFixed(2)} %`}
      />

      <SliderControl
        label="Time period"
        value={timePeriod}
        setValue={setTimePeriod}
        minimum={1}
        maximum={30}
        format={(val) => `${val} Yr`}
      />

      <View style={styles.resultsBox}>
        <Text style={styles.resultRow}>
          <Text style={styles.label}>Invested amount: </Text>
          <Text style={styles.invested}>₹ {investedAmount.toLocaleString()}</Text>
        </Text>

        <Text style={styles.resultRow}>
          <Text style={styles.label}>Estimated returns: </Text>
          <Text style={styles.returns}>₹ {estimatedReturns.toLocaleString()}</Text>
        </Text>

        <Text style={styles.resultRow}>
          <Text style={styles.label}>Total value: </Text>
          <Text style={styles.total}>₹ {totalValue.toLocaleString()}</Text>
        </Text>

        <View style={styles.pieChartWrapper}>
        <PieChart
          data={[
            {
              name: "Invested amount",
              population: investedAmount,
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
          // absolute
        />
        </View>

      </View>
    </ScrollView>
  );
}

function SliderControl({ label, value, setValue, minimum, maximum, format }) {
  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sliderValue}>{format(value)}</Text>
      <Slider
        minimumValue={minimum}
        maximumValue={maximum}
        value={value}
        // onValueChange={(val) => setValue(Math.round(val))}
        onSlidingComplete={(val) => setValue(Math.round(val))}
        step={1}
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
  pieChartWrapper: {
    alignItems: "center",
    marginTop: 16,
  },
  resultRow: {
    fontSize: 16,
    marginBottom: 8,
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