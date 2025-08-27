import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Menu, Provider as PaperProvider, TouchableRipple } from 'react-native-paper';
import * as yup from 'yup';
import { API_URL } from "../../../constants/api";
import { GENDER, GUARDIANRELATION, OCCUPATION } from '../../../constants/parameters';
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';

const schema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  middle_name: yup.string(),
  last_name: yup.string(),
  occ_code: yup.string().required('Occupation is required'),
  gender: yup.string().oneOf(GENDER, 'Invalid gender').required('Gender is required'),
  marital_status: yup.boolean(),
  phone: yup.string().matches(/^[6-9]\d{9}$/, 'Invalid phone number'),
  guardian_first_name: yup.string().when('isMinor', {
    is: true,
    then: (schema) => schema.required('Guardian first name required'),
  }),
  guardian_middle_name: yup.string(),
  guardian_last_name: yup.string(),
  guardian_relationship: yup.string().when('isMinor', {
    is: true,
    then: (schema) => schema.required('Guardian relationship is required'),
  }),
});

export default function BasicDetailsForm() {
  const {token} = useAuthStore();
  const {isMinor, fetchProfileStatus} = useProfileStore();
  const navigation = useNavigation();

  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [occMenuVisible, setOccMenuVisible] = useState(false);
  const [guardianMenuVisible, setGuardianMenuVisible] = useState(false);

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
      first_name: '',
      middle_name: '',
      last_name: '',
      occ_code: '',
      gender: '',
      marital_status: false,
      phone: '',
      guardian_first_name: '',
      guardian_middle_name: '',
      guardian_last_name: '',
      guardian_relationship: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_URL}/v1/profile/basic-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Submission failed');

      await fetchProfileStatus();
      
      Alert.alert('Success', 'Basic Details completed', [
        { text: 'Next', onPress: () => navigation.navigate('AddressDetailsForm') }
      ]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Basic Details</Text>

          {/* Name Fields */}
          {['first_name', 'middle_name', 'last_name'].map((name, idx) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder={name.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              )}
            />
          ))}
          {errors.first_name && <Text style={styles.error}>{errors.first_name.message}</Text>}

          {/* Occupation Dropdown */}
          <Text style={styles.label}>Occupation</Text>
          <Controller
            control={control}
            name="occ_code"
            render={({ field: { value, onChange } }) => (
              <Menu
                visible={occMenuVisible}
                onDismiss={() => setOccMenuVisible(false)}
                anchor={
                  <TouchableRipple
                    onPress={() => setOccMenuVisible(true)}
                    style={styles.dropdown}
                  >
                    <Text style={{ color: value ? '#fff' : '#999' }}>
                      {value ? OCCUPATION[value] : 'Select Occupation'}
                    </Text>
                  </TouchableRipple>
                }
              >
                {Object.entries(OCCUPATION).map(([code, label]) => (
                  <Menu.Item key={code} onPress={() => { onChange(code); setOccMenuVisible(false); }} title={label} />
                ))}
              </Menu>
            )}
          />
          {errors.occ_code && <Text style={styles.error}>{errors.occ_code.message}</Text>}

          {/* Gender Dropdown */}
          <Text style={styles.label}>Gender</Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { value, onChange } }) => (
              <Menu
                visible={genderMenuVisible}
                onDismiss={() => setGenderMenuVisible(false)}
                anchor={
                  <TouchableRipple
                    onPress={() => setGenderMenuVisible(true)}
                    style={styles.dropdown}
                  >
                    <Text style={{ color: value ? '#fff' : '#999' }}>
                      {value || 'Select Gender'}
                    </Text>
                  </TouchableRipple>
                }
              >
                {GENDER.map((g) => (
                  <Menu.Item key={g} onPress={() => { onChange(g); setGenderMenuVisible(false); }} title={g} />
                ))}
              </Menu>
            )}
          />
          {errors.gender && <Text style={styles.error}>{errors.gender.message}</Text>}

          {/* Phone */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Phone"
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                maxLength={10}
                style={styles.input}
                placeholderTextColor="#999"
              />
            )}
          />
          {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

          {/* Guardian fields (if minor) */}
          {isMinor && (
            <>
              <Text style={styles.label}>Guardian Name</Text>
              {['guardian_first_name', 'guardian_middle_name', 'guardian_last_name'].map((name) => (
                <Controller
                  key={name}
                  control={control}
                  name={name}
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      placeholder={`${name.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}`}
                      // placeholder={name.replace('guardian_', '').replace('_', ' ')}
                      value={value}
                      onChangeText={onChange}
                      style={styles.input}
                      placeholderTextColor="#999"
                    />
                  )}
                />
              ))}
              <Text style={styles.label}>Guardian Relationship</Text>
              <Controller
                control={control}
                name="guardian_relationship"
                render={({ field: { value, onChange } }) => (
                  <Menu
                    visible={guardianMenuVisible}
                    onDismiss={() => setGuardianMenuVisible(false)}
                    anchor={
                      <TouchableRipple
                        onPress={() => setGuardianMenuVisible(true)}
                        style={styles.dropdown}
                      >
                        <Text style={{ color: value ? '#fff' : '#999' }}>
                          {value ? GUARDIANRELATION[value] : 'Select Relationship'}
                        </Text>
                      </TouchableRipple>
                    }
                  >
                    {Object.entries(GUARDIANRELATION).map(([code, label]) => (
                      <Menu.Item key={code} onPress={() => { onChange(code); setGuardianMenuVisible(false); }} title={label} />
                    ))}
                  </Menu>
                )}
              />
              {errors.guardian_relationship && (
                <Text style={styles.error}>{errors.guardian_relationship.message}</Text>
              )}
            </>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.nextButton, { opacity: isValid ? 1 : 0.5 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#000',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  dropdown: {
    backgroundColor: '#1c1c1e',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  error: {
    color: 'tomato',
    marginBottom: 10,
  },
  label: {
    color: '#ccc',
    marginBottom: 4,
    marginTop: 12,
  },
  nextButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});