import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';

const OnboardingScreen = () => {
  const { token, setDivisionIndex } = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
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
        // Alert.alert('Success', json.message);
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No questions available</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswerSelected = !!answers[currentQuestion._id];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image 
        source={require('../../assets/images/finvisk-half-logo.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />
      
      {/* Question progress */}
      <Text style={styles.progressText}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Text>
      
      {/* Question */}
      <Text style={styles.questionText}>
        {currentQuestion.question}
      </Text>
      
      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              answers[currentQuestion._id] === option && styles.selectedOption
            ]}
            onPress={() => handleAnswerSelect(currentQuestion._id, option)}
          >
            <Text style={[
              styles.optionText,
              answers[currentQuestion._id] === option && styles.selectedOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Continue/Finish Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          !isAnswerSelected && styles.disabledButton
        ]}
        onPress={isLastQuestion ? handleSubmit : handleNext}
        disabled={!isAnswerSelected}
      >
        <Text style={styles.actionButtonText}>
          {isLastQuestion ? 'Finish' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  progressText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
  },
  selectedOption: {
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 72,
    left: 24,
    right: 24,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;