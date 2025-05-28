import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { API_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';

const OnboardingScreen = () => {
    const {token, setDivisionIndex} = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/question/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      console.log({json});

      if (response.ok) {
        setQuestions(json.questions);
      } else {
        Alert.alert('Error', json.message || 'Failed to fetch questions');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    const responses = questions.map(q => ({
      questionId: q._id,
      answer: answers[q._id],
    }));

    // Check if all questions are answered
    if (responses.some(r => !r.answer)) {
      Alert.alert('Error', 'Please answer all questions before submitting.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/question/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });

      const json = await res.json();

      if (res.ok) {
        await setDivisionIndex(1);
        Alert.alert('Success', json.message);

      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {questions.map(question => (
        <View key={question._id} style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
            {question.question}
          </Text>
          <Picker
            selectedValue={answers[question._id] || ''}
            onValueChange={value => handleAnswerChange(question._id, value)}
          >
            <Picker.Item label="Select an answer..." value="" />
            {question.options.map((opt, idx) => (
              <Picker.Item key={idx} label={opt} value={opt} />
            ))}
          </Picker>
        </View>
      ))}

      <Button title="Submit Answers" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default OnboardingScreen;