import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// import DateTimePickerModal from "react-native-modal-datetime-picker";
import { API_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';

const InvestmentModal = ({ visible, onClose, bseCode, schemePlanId }) => {
    const {token} = useAuthStore();
  const [selectedType, setSelectedType] = useState(null); // 'lumpsum' or 'sip'
  const [amount, setAmount] = useState('');
  const [sipStartDate, setSipStartDate] = useState(''); // DD/MM/YYYY
  const [sipNumInst, setSipNumInst] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // console.log('Inside investment modal: ', {bseCode});

  const handleLumpsumOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/v1/provider/lumpsum-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, bse_code: 'MOLFGP-GR' })
      });
      const data = await res.json();

      console.log('Lumpsum call response: ', data);
      if (!res.ok) throw new Error(data.message || 'Lumpsum failed');
      Alert.alert('Success', 'Lumpsum order initiated');
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSipOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/v1/provider/sip-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount,
          schemePlanId: '687dd290c7bfcb9c1d6bd5ee',
          sip_start_date: sipStartDate,
          sip_num_inst: sipNumInst
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'SIP failed');
      Alert.alert('Success', 'SIP order placed');
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSipOrderv2 = async () => {};

  const renderLumpsumInput = () => (
    <>
      <Text style={styles.label}>Enter Amount (₹)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
        placeholder="e.g. 1000"
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.submitBtn} onPress={handleLumpsumOrder}>
        <Text style={styles.submitBtnText}>Invest Now</Text>
      </TouchableOpacity>
    </>
  );

  const renderSipInput = () => (
    <>
      <Text style={styles.label}>Enter SIP Amount (₹)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
        placeholder="e.g. 500"
        placeholderTextColor="#888"
      />

      {/* <Text style={styles.label}>Date of Birth</Text>
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
              <Text style={{ color: watch('dob') ? '#fff' : '#999' }}>
                {watch('dob') || 'Select DOB'}
              </Text>
            </Pressable>
            {errors.dob && <Text style={styles.error}>{errors.dob.message}</Text>}
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={handleDateChange}
              />
            )} */}

      <Text style={styles.label}>Start Date</Text>
        <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
        <Text style={{ color: sipStartDate ? '#fff' : '#888' }}>
            {sipStartDate || 'Select start date'}
        </Text>
        </Pressable>

        {showDatePicker && (
        <DateTimePicker
            value={new Date()}
            minimumDate={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            // onChange={handleDateChange}
            onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
                const day = selectedDate.getDate().toString().padStart(2, '0');
                const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                const year = selectedDate.getFullYear();
                setSipStartDate(`${day}/${month}/${year}`);
            }
            }}
        />
        )}

      <Text style={styles.label}>No. of Installments</Text>
      <TextInput
        style={styles.input}
        value={sipNumInst}
        keyboardType="numeric"
        onChangeText={setSipNumInst}
        placeholder="e.g. 12"
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.submitBtn} onPress={handleSipOrder}>
        <Text style={styles.submitBtnText}>Start SIP</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Choose Investment Type</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                selectedType === 'lumpsum' && styles.radioButtonSelected
              ]}
              onPress={() => setSelectedType('lumpsum')}
            >
              <Text
                style={[
                  styles.radioLabel,
                  selectedType === 'lumpsum' && styles.radioLabelSelected
                ]}
              >
                Lumpsum
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                selectedType === 'sip' && styles.radioButtonSelected
              ]}
              onPress={() => setSelectedType('sip')}
            >
              <Text
                style={[
                  styles.radioLabel,
                  selectedType === 'sip' && styles.radioLabelSelected
                ]}
              >
                SIP
              </Text>
            </TouchableOpacity>
          </View>

          {selectedType === 'lumpsum' && renderLumpsumInput()}
          {selectedType === 'sip' && renderSipInput()}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: '#fff' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default InvestmentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20
  },
  title: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  radioButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4faaff'
  },
  radioButtonSelected: {
    backgroundColor: '#4faaff'
  },
  radioLabel: {
    color: '#4faaff'
  },
  radioLabelSelected: {
    color: '#000',
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333'
  },
  label: {
    color: '#4faaff',
    marginBottom: 5
  },
  submitBtn: {
    backgroundColor: '#4faaff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  submitBtnText: {
    color: '#000',
    fontWeight: 'bold'
  },
  closeBtn: {
    marginTop: 20,
    alignItems: 'center'
  },
  dateInput: {
    backgroundColor: '#1c1c1e',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
});