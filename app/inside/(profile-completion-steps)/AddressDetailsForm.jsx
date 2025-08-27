import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Checkbox, Menu, Provider as PaperProvider, TouchableRipple } from 'react-native-paper';
import * as yup from 'yup';
import { API_URL } from "../../../constants/api";
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';

const STATE = {
  'AN': "Andaman & Nicobar", 'AR': "Arunachal Pradesh", 'AP': "Andhra Pradesh", 'AS': "Assam", 'BH': "Bihar",
  'CH': "Chandigarh", 'CG': "Chhattisgarh", 'GO': "GOA", 'GU': "Gujarat", 'HA': "Haryana",
  'HP': "Himachal Pradesh", 'JM': "Jammu & Kashmir", 'JK': "Jharkhand", 'KA': "Karnataka", 'KE': "Kerala",
  'MP': "Madhya Pradesh", 'MA': "Maharashtra", 'MN': "Manipur", 'ME': "Meghalaya", 'MI': "Mizoram",
  'NA': "Nagaland", 'ND': "New Delhi", 'OR': "Orissa", 'PO': "Pondicherry", 'PU': "Punjab",
  'RA': "Rajasthan", 'SI': "Sikkim", 'TG': "Telengana", 'TN': "Tamil Nadu", 'TR': "Tripura",
  'UP': "Uttar Pradesh", 'UC': "Uttaranchal", 'WB': "West Bengal", 'DN': "Dadra and Nagar Haveli",
  'DD': "Daman and Diu", 'LD': "Lakshadweep", 'OH': "Others"
};

const normalize = str => str.toLowerCase().replace(/\band\b|&|\s+/g, '').trim();

const schema = yup.object().shape({
  perm_landmark: yup.string().required(),
  perm_city: yup.string().required(),
  perm_state: yup.string().required(),
  perm_pincode: yup.string().required().length(6),
  curr_landmark: yup.string().required(),
  curr_city: yup.string().required(),
  curr_state: yup.string().required(),
  curr_pincode: yup.string().required().length(6),
});

export default function AddressDetailsForm() {
  const { token } = useAuthStore();
  const {fetchProfileStatus } = useProfileStore();
  const navigation = useNavigation();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [permStateMenu, setPermStateMenu] = useState(false);
  const [currStateMenu, setCurrStateMenu] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      perm_building: '', perm_street: '', perm_landmark: '', perm_city: '', perm_state: '', perm_pincode: '',
      curr_building: '', curr_street: '', curr_landmark: '', curr_city: '', curr_state: '', curr_pincode: '',
    },
  });

  const fetchAddressFromPin = async (pin, prefix) => {
    if (pin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const json = await res.json();
        if (json[0]?.Status === 'Success') {
          const post = json[0].PostOffice[0];
          setValue(`${prefix}_city`, post.District);
          const normalizedState = normalize(post.State);
          const match = Object.entries(STATE).find(([code, name]) => normalize(name) === normalizedState);
          if (match) setValue(`${prefix}_state`, match[0]);
        }
      } catch (err) {
        console.log('PIN lookup failed');
      }
    }
  };

  useEffect(() => {
    if (sameAsPermanent) {
      const fields = ['building', 'street', 'landmark', 'city', 'state', 'pincode'];
      fields.forEach(f => setValue(`curr_${f}`, getValues(`perm_${f}`)));
    }
  }, [sameAsPermanent]);

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_URL}/v1/profile/address`, {
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
      
      Alert.alert('Success', 'Address Details completed', [
        { text: 'Next', 
          onPress: () => navigation.navigate('AccountDetailsForm') 
          // // onPress: () =>
          // //   navigation.reset({
          // //     index: 1,
          // //     routes: [
          // //       { name: 'Profile' }, // maps to /inside/profile
          // //       { name: 'AddressDetailsForm' }
          // //     ],
          // //   }),
          // onPress: () => {
          //   router.replace("/inside/profile"); // sets profile as current
          //   router.push("/inside/AccountDetailsForm"); // pushes address on top
          // }
        }
      ]);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderInput = (name, placeholder, flex = 1, styleOverride = {}) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextInput
          placeholder={placeholder}
          style={[styles.input, { flex }, styleOverride]}
          placeholderTextColor="#999"
          value={value}
          onChangeText={text => {
            onChange(text);
            if (name.endsWith('pincode')) {
              const prefix = name.startsWith('perm') ? 'perm' : 'curr';
              fetchAddressFromPin(text, prefix);
            }
          }}
          keyboardType={name.includes('pincode') ? 'number-pad' : 'default'}
        />
      )}
    />
  );

  const renderStateDropdown = (name, visible, setVisible, flex = 1) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <TouchableRipple onPress={() => setVisible(true)} style={[styles.dropdown, { flex }] }>
              <Text style={{ color: value ? '#fff' : '#999' }}>{value ? STATE[value] : 'Select State'}</Text>
            </TouchableRipple>
          }
        >
          {Object.entries(STATE).map(([code, label]) => (
            <Menu.Item key={code} onPress={() => { onChange(code); setVisible(false); }} title={label} />
          ))}
        </Menu>
      )}
    />
  );

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {step === 1 && (
            <>
              <Text style={styles.title}>Permanent Address</Text>
              <View style={styles.row}>{renderInput('perm_building', 'Building')}<View style={{ width: 10 }} />{renderInput('perm_street', 'Street')}</View>
              <View style={styles.row}>
                {renderInput('perm_landmark', 'Landmark')}
                </View>

                <View style={styles.row}>
                {renderInput('perm_pincode', 'Pincode')}
                </View>
              <View style={styles.row}>{renderInput('perm_city', 'City')}<View style={{ width: 10 }} />{renderStateDropdown('perm_state', permStateMenu, setPermStateMenu)}</View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={async () => {
                  const valid = await trigger([
                    'perm_building', 'perm_street', 'perm_landmark', 'perm_city', 'perm_state', 'perm_pincode',
                  ]);
                  if (valid) setStep(2);
                }}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>Current Address</Text>
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={sameAsPermanent ? 'checked' : 'unchecked'}
                  onPress={() => setSameAsPermanent(!sameAsPermanent)}
                  color="#1E90FF"
                />
                <Text style={styles.checkboxLabel}>Same as permanent address</Text>
              </View>
              <View style={styles.row}>{renderInput('curr_building', 'Building')}<View style={{ width: 10 }} />{renderInput('curr_street', 'Street')}</View>
              <View style={styles.row}>
                {renderInput('curr_landmark', 'Landmark')}
                </View>

                <View style={styles.row}>
                {renderInput('curr_pincode', 'Pincode')}
                </View>
              <View style={styles.row}>{renderInput('curr_city', 'City')}<View style={{ width: 10 }} />{renderStateDropdown('curr_state', currStateMenu, setCurrStateMenu)}</View>

              <TouchableOpacity
                style={[styles.nextButton, { opacity: isValid ? 1 : 0.5 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
              >
                <Text style={styles.nextButtonText}>Submit</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#000', flexGrow: 1 },
  title: { fontSize: 20, fontWeight: '600', color: '#fff', marginVertical: 12 },
  input: {
    backgroundColor: '#1c1c1e', color: '#fff', paddingVertical: 10, paddingHorizontal: 12,
    marginBottom: 10, borderRadius: 6,
  },
  dropdown: {
    backgroundColor: '#1c1c1e', padding: 12,
    borderRadius: 6, marginBottom: 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  checkboxRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  checkboxLabel: { color: '#ccc', marginLeft: 8, fontSize: 14 },
  nextButton: {
    backgroundColor: '#1E90FF', paddingVertical: 14,
    borderRadius: 25, alignItems: 'center', marginTop: 20,
  },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});