import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../constants/api";
import { useAuthStore } from "../store/authStore";

const QuestionCard = () => {
  const {token} = useAuthStore();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [noMoreQuestions, setNoMoreQuestions] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/question/unanswered`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) setNoMoreQuestions(true);
        else Alert.alert("Error", data.message || "Failed to fetch question");
        return;
      }

      setQuestion(data?.question);
    } catch (err) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/question/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: question.id,
          answer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Submission failed");
        return;
      }

      fetchQuestion(); // Load next question
    } catch (err) {
      Alert.alert("Error", "Could not submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  if (noMoreQuestions) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Curious why I picked these mutual funds for you?</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question.question}</Text>

      {question.options.map((opt, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.option}
          onPress={() => submitAnswer(opt)}
          disabled={submitting}
        >
          <Text style={styles.optionText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1f2937",
  },
  option: {
    // backgroundColor: "#6366f1",
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  message: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
  },
});

export default QuestionCard;