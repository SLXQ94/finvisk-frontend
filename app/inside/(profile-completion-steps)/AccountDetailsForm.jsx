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
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';

const INCOMESLAB = {
  '31': 'Below 1 Lakh',
  '32': '> 1 <= 5 Lacs',
  '33': '> 5 <= 10 Lacs',
  '34': '> 10 <= 25 Lacs',
  '35': '> 25 Lacs <= 1 Crore',
  '36': 'Above 1 Crore',
};

const TAXSTATUS = {
  '01': 'Individual',
  '02': 'On behalf of minor',
  '03': 'HUF',
};

const ACCOUNTTYPES = {
  SB: 'Savings',
  CB: 'Current',
};

const schema = yup.object().shape({
  ifsc_code: yup.string().required().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  account_number: yup.string().required().min(9).max(18),
  account_type_bse: yup.string().oneOf(Object.keys(ACCOUNTTYPES)).required(),
  income_slab: yup.string().oneOf(Object.keys(INCOMESLAB)).required(),
  tax_status: yup.string().oneOf(Object.keys(TAXSTATUS)).required(),
});

export default function AccountDetailsForm() {
  const {token} = useAuthStore();
  const {fetchProfileStatus } = useProfileStore();
  const navigation = useNavigation();
  const [accTypeMenu, setAccTypeMenu] = useState(false);
  const [incomeMenu, setIncomeMenu] = useState(false);
  const [taxMenu, setTaxMenu] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      ifsc_code: '',
      account_number: '',
      account_type_bse: '',
      income_slab: '',
      tax_status: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_URL}/v1/profile/account-details`, {
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
      
      Alert.alert('Success', 'Account Details completed', [
        { text: 'Next', onPress: () => navigation.navigate('NomineeDetailsForm') }
      ]);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderInput = (name, placeholder, keyboardType = 'default') => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChange}
          autoCapitalize="characters"
          keyboardType={keyboardType}
        />
      )}
    />
  );

  const renderDropdown = (name, menuVisible, setMenuVisible, options, title) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableRipple onPress={() => setMenuVisible(true)} style={styles.dropdown}>
              <Text style={{ color: value ? '#fff' : '#999' }}>{options[value] || `Select ${title}`}</Text>
            </TouchableRipple>
          }
        >
          {Object.entries(options).map(([code, label]) => (
            <Menu.Item key={code} onPress={() => { onChange(code); setMenuVisible(false); }} title={label} />
          ))}
        </Menu>
      )}
    />
  );

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Account Details</Text>

          {renderInput('ifsc_code', 'IFSC Code')}
          {renderInput('account_number', 'Account Number', 'number-pad')}
          {renderDropdown('account_type_bse', accTypeMenu, setAccTypeMenu, ACCOUNTTYPES, 'Account Type')}
          {renderDropdown('income_slab', incomeMenu, setIncomeMenu, INCOMESLAB, 'Income Slab')}
          {renderDropdown('tax_status', taxMenu, setTaxMenu, TAXSTATUS, 'Tax Status')}

          <TouchableOpacity
            style={[styles.nextButton, { opacity: isValid ? 1 : 0.5 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
          >
            <Text style={styles.nextButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#000', flexGrow: 1 },
  title: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 16 },
  input: {
    backgroundColor: '#1c1c1e', color: '#fff', padding: 12,
    marginBottom: 10, borderRadius: 6,
  },
  dropdown: {
    backgroundColor: '#1c1c1e', padding: 12,
    borderRadius: 6, marginBottom: 10,
  },
  nextButton: {
    backgroundColor: '#1E90FF', paddingVertical: 14,
    borderRadius: 25, alignItems: 'center', marginTop: 20,
  },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});