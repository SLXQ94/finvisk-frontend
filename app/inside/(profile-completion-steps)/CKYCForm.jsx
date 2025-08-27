import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import * as yup from 'yup';
import { API_URL } from "../../../constants/api";
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';

const schema = yup.object().shape({
  pan: yup.string()
  .required('PAN is required')
  .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN'),
  dob: yup.string()
    .required('DOB is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'DOB must be in DD/MM/YYYY format'),
  indian_resident: yup.boolean().oneOf([true], 'Must be a resident of India'),
  politically_exposed: yup.boolean().oneOf([false], 'Cannot be politically exposed'),
  related_politically_exposed: yup.boolean().oneOf([false], 'Cannot be related to politically exposed'),
});

export default function CKYCForm() {
  const { token } = useAuthStore();
  const {fetchProfileStatus } = useProfileStore();
  const navigation = useNavigation();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      pan: '',
      dob: '',
      indian_resident: false,
      politically_exposed: false,
      related_politically_exposed: false,
    },
  });

  const onSubmit = async (data) => {
    try {

      console.log({data})
      const res = await fetch(`${API_URL}/v1/profile/ckyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      console.log({result});

      if (!res.ok) throw new Error(result.message || 'Something went wrong');

      await fetchProfileStatus();

      Alert.alert('Success', 'CKYC completed', [
        { text: 'Next', onPress: () => navigation.navigate('BasicDetailsForm') }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
      setValue('dob', formattedDate, { shouldValidate: true });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CKYC Details</Text>

      <Controller
        control={control}
        name="pan"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter PAN"
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChange}
            autoCapitalize="characters"
          />
        )}
      />
      {errors.pan && <Text style={styles.error}>{errors.pan.message}</Text>}

      <Text style={styles.label}>Date of Birth</Text>
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
      )}

      <Controller
        control={control}
        name="indian_resident"
        render={({ field: { onChange, value } }) => (
            <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
            >
            <Checkbox
                status={value ? 'checked' : 'unchecked'}
                color="#1E90FF"
            />
            <Text style={styles.checkboxLabel}>I am a resident of India</Text>
            </TouchableOpacity>
        )}
        />

      {errors.indian_resident && <Text style={styles.error}>{errors.indian_resident.message}</Text>}

      <Controller
        control={control}
        name="politically_exposed"
        render={({ field: { onChange, value } }) => (
            <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
            >
            <Checkbox
                status={!value ? 'checked' : 'unchecked'}
                color="#1E90FF"
            />
            <Text style={styles.checkboxLabel}>I am not politically exposed</Text>
            </TouchableOpacity>
        )}
        />

      {errors.politically_exposed && <Text style={styles.error}>{errors.politically_exposed.message}</Text>}

      <Controller
        control={control}
        name="related_politically_exposed"
        render={({ field: { onChange, value } }) => (
            <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
            >
            <Checkbox
                status={!value ? 'checked' : 'unchecked'}
                color="#1E90FF"
            />
            <Text style={styles.checkboxLabel}>I am not related to a politically exposed person</Text>
            </TouchableOpacity>
        )}
        />

      {errors.related_politically_exposed && <Text style={styles.error}>{errors.related_politically_exposed.message}</Text>}

      <TouchableOpacity
        style={[styles.nextButton, { opacity: isValid ? 1 : 0.5 }]}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
        >
            <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#000',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  label: {
    color: '#ccc',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  dateInput: {
    backgroundColor: '#1c1c1e',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  error: {
    color: 'tomato',
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20
    },
    nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
    },
    checkboxRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},
checkboxLabel: {
  color: '#ccc',
  marginLeft: 8,
  fontSize: 14,
}

});