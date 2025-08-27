import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import moment from 'moment';
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
  TouchableOpacity,
  View
} from 'react-native';
import { Menu, Provider as PaperProvider, TouchableRipple } from 'react-native-paper';
import * as yup from 'yup';
import { API_URL } from "../../../constants/api";
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';

const nomineeSchema = yup.object().shape({
  nom_name: yup.string().required('Name is required').max(40),
  nom_relationship: yup.string().required('Relationship is required'),
  nom_dob: yup.string().required('Date of birth is required'),
  nom_IdType: yup.string().oneOf(['1', '2', '3']).required('Required'),

    nom_IdNo: yup.lazy((value, context) => {
    const idType = context.parent.nom_IdType;
    switch (idType) {
      case '1': // PAN
        return yup.string()
          .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter valid PAN')
          .required('PAN is required');
      case '2': // Aadhaar
        return yup.string()
          .matches(/^\d{4}$/, 'Enter valid Aadhaar (last 4 digits)')
          .required('Aadhaar is required');
      case '3': // Driving License
        return yup.string()
          .matches(/^[A-Z0-9]{6,20}$/, 'Enter valid DL number')
          .required('DL is required');
      default:
        return yup.string().required('ID number is required');
    }
  }),
  nom_mobile: yup.string().required('Required').matches(/^\d{10}$/, 'Enter valid mobile number'),
  nom_email: yup.string().required('Required').email('Invalid email'),
  nom_city: yup.string().required('Required').max(35),
  nom_pincode: yup.string().required().matches(/^\d{6}$/, 'Enter valid pincode'),
  nom_landmark: yup.string().required('Landmark is required'),
  nom_building: yup.string(),
  nom_street: yup.string(),
  nom_guardian: yup.string().when('nom_dob', (dob, schema) => {
    return dob ? 
      (moment().diff(moment(dob), 'years') < 18 
        ? schema.required('Guardian name is required').max(35, 'Max 35 characters')
        : schema) 
      : schema;
  }),
  nom_guardianPAN: yup.string().when('nom_dob', (dob, schema) => {
    return dob ? 
      (moment().diff(moment(dob), 'years') < 18 
        ? schema
            .required('Guardian PAN is required')
            .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter valid PAN')
        : schema) 
      : schema;
  }),
});

const NOMINEE_RELATION = {
  '01': 'AUNT', '02': 'BROTHER-IN-LAW', '03': 'BROTHER', '04': 'DAUGHTER', '05': 'DAUGHTER-IN-LAW',
  '06': 'FATHER', '07': 'FATHER-IN-LAW', '08': 'GRAND DAUGHTER', '09': 'GRAND FATHER', '10': 'GRAND MOTHER',
  '11': 'GRAND SON', '12': 'MOTHER-IN-LAW', '13': 'MOTHER', '14': 'NEPHEW', '15': 'NIECE',
  '16': 'SISTER', '17': 'SISTER-IN-LAW', '18': 'SON', '19': 'SON-IN-LAW', '20': 'SPOUSE',
  '21': 'UNCLE', '22': 'OTHERS'
};

export default function NomineeDetailsForm() {
  const router = useRouter();
  const {fetchProfileStatus } = useProfileStore();
  const {token} = useAuthStore();
  const [nomOpt, setNomOpt] = useState(null);
  const [relationMenuVisible, setRelationMenuVisible] = useState(false);
  const [dob, setDob] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [idTypeMenuVisible, setIdTypeMenuVisible] = useState(false);

  const { control, handleSubmit, setValue, watch, trigger, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(nomineeSchema),
    defaultValues: {
      nom_name: '', nom_relationship: '', nom_dob: '',
      nom_guardian: '', nom_guardianPAN: '', nom_IdType: '1', nom_IdNo: '',
      nom_email: '', nom_mobile: '', nom_building: '', nom_street: '', nom_landmark: '',
      nom_city: '', nom_pincode: ''
    },
    mode: 'onChange'
  });

  const formDob = watch('nom_dob');
  const isMinor = formDob ? moment().diff(moment(formDob), 'years') < 18 : false;

  const handleNomOpt = async (opt) => {
    if (opt === 'N') {
      Alert.alert(
        'Confirmation',
        'Are you sure you want to opt out of nominee?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes', onPress: async () => {
                console.log("User opted out of nomination");
            try {
              const nomineeRes = await fetch(`${API_URL}/v1/profile/add-nominee`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nominationOpt: 'N' }),
              });

              if (!nomineeRes.ok) {
                const error = await nomineeRes.json();
                Alert.alert('Nominee Error', error?.error || 'Failed to add nominee');
                return;
              }

              const createUserRes = await fetch(`${API_URL}/v1/provider/create-user`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
              });

              const data = await createUserRes.json();

              if (!createUserRes.ok) {
                Alert.alert('Create User Error', data?.error || 'User creation failed');
                return;
              }

              await fetchProfileStatus();

              router.replace("/inside");

            } catch (err) {
              Alert.alert("Error", err.message);
            }
            }
          }
        ]
      );
    } else {
      setNomOpt('Y');
    }
  };

  const mergeAddress = (building, street, landmark) => {
    const merged = [building, street, landmark].filter(Boolean).join(', ');
            return [
                merged.slice(0, 40),
                merged.slice(40, 80),
                merged.slice(80, 120),
            ];
    };

  const onSubmit = async (data) => {
    const [add1, add2, add3] = mergeAddress(data.nom_building, data.nom_street, data.nom_landmark);

    const payload = {
      ...data,
      nominationOpt: 'Y',
      nom_dob: moment(dob).format('DD/MM/YYYY'),
      nom_minorflag: isMinor ? 'Y' : 'N',
      app_percent: 100,
      nom_add1: add1,
      nom_add2: add2,
      nom_add3: add3,
    };

    delete payload.nom_building;
    delete payload.nom_street;
    delete payload.nom_landmark;

    try {
      console.log({payload});
      const nomineeRes = await fetch(`${API_URL}/v1/profile/add-nominee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!nomineeRes.ok) {
        const error = await nomineeRes.json();
        Alert.alert('Nominee Error', error?.error || 'Failed to add nominee');
        return;
      }

      const createUserRes = await fetch(`${API_URL}/v1/provider/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });

      const data = await createUserRes.json();

      if (!createUserRes.ok) {
        Alert.alert('Create User Error', data?.error || 'User creation failed');
        return;
      }

      await fetchProfileStatus();

      router.replace("/inside");

    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const renderInput = (name, placeholder, keyboard = 'default') => (
    <>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor="#999"
          keyboardType={keyboard}
          value={value}
          onChangeText={onChange}
        />
      )}
    />
    {errors[name] && <Text style={styles.error}>{errors[name].message}</Text>}
    </>
  );

  // RESET ID NUMBER WHEN ID TYPE CHANGES
  const handleIdTypeChange = (type) => {
    setValue('nom_IdType', type);
    setValue('nom_IdNo', ''); // Reset ID number
    trigger('nom_IdNo'); // Trigger validation after reset
    setIdTypeMenuVisible(false);
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Do you want to add a nominee?</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.nomOpt} onPress={() => handleNomOpt('Y')}><Text style={styles.optText}>Yes, I want to add nominee</Text></TouchableOpacity>
            <TouchableOpacity style={styles.nomOpt} onPress={() => handleNomOpt('N')}><Text style={styles.optText}>No, I don’t want to add nominee</Text></TouchableOpacity>
          </View>

          {nomOpt === 'Y' && (
            <>
              {renderInput('nom_name', 'Nominee Name')}

              <View>
                <Menu visible={relationMenuVisible} onDismiss={() => setRelationMenuVisible(false)} anchor={
                    <TouchableRipple onPress={() => setRelationMenuVisible(true)} style={styles.dropdown}>
                        <Text style={{ color: '#fff' }}>{watch('nom_relationship') ? NOMINEE_RELATION[watch('nom_relationship')] : 'Select Relationship'}</Text>
                    </TouchableRipple>
                    }>
                  {Object.entries(NOMINEE_RELATION).map(([code, label]) => (
                    <Menu.Item key={code} onPress={() => { setValue('nom_relationship', code); setRelationMenuVisible(false); }} title={label} />
                  ))}
                </Menu>
                {errors.nom_relationship && (
                  <Text style={styles.error}>{errors.nom_relationship.message}</Text>
                )}
              </View>

              <TouchableOpacity onPress={() => setShowDobPicker(true)} style={styles.dropdown}>
                <Text style={{ color: '#fff' }}>{dob ? moment(dob).format('DD MMM YYYY') : 'Select DOB'}</Text>
              </TouchableOpacity>
              {errors.nom_dob && (
                <Text style={styles.error}>{errors.nom_dob.message}</Text>
              )}
              {showDobPicker && (
                <DateTimePicker value={dob || new Date()} mode="date" display="default" onChange={(e, selected) => {
                  setShowDobPicker(false);
                  if (selected) {
                    setDob(selected);
                    setValue('nom_dob', selected.toISOString(), {
                        shouldValidate: true 
                      });
                  }
                }} />
              )}

            <View>
                <Menu
                    visible={idTypeMenuVisible}
                    onDismiss={() => setIdTypeMenuVisible(false)}
                    anchor={
                    <TouchableRipple onPress={() => setIdTypeMenuVisible(true)} style={styles.dropdown}>
                        <Text style={{ color: '#fff' }}>
                            {watch('nom_IdType') === '1' && 'PAN'}
                            {watch('nom_IdType') === '2' && 'Aadhaar (last 4 digits)'}
                            {watch('nom_IdType') === '3' && 'Driving License'}
                            {!watch('nom_IdType') && 'Select ID Type'}
                        </Text>
                    </TouchableRipple>
                    }
                >
                    {/* <Menu.Item onPress={() => { setValue('nom_IdType', '1'); setIdTypeMenuVisible(false); }} title="PAN" />
                    <Menu.Item onPress={() => { setValue('nom_IdType', '2'); setIdTypeMenuVisible(false); }} title="Aadhaar (last 4 digits)" />
                    <Menu.Item onPress={() => { setValue('nom_IdType', '3'); setIdTypeMenuVisible(false); }} title="Driving License" /> */}
                    <Menu.Item onPress={() => handleIdTypeChange('1')} title="PAN" />
                    <Menu.Item onPress={() => handleIdTypeChange('2')} title="Aadhaar (last 4 digits)" />
                    <Menu.Item onPress={() => handleIdTypeChange('3')} title="Driving License" />
                </Menu>
                {errors.nom_IdType && (
                  <Text style={styles.error}>{errors.nom_IdType.message}</Text>
                )}
                </View>

            <Controller
                control={control}
                name="nom_IdNo"
                render={({ field: { onChange, value } }) => (
                    <>
                    <TextInput
                        placeholder={
                            watch('nom_IdType') === '1' ? 'Enter PAN' :
                            watch('nom_IdType') === '2' ? 'Enter Aadhaar (last 4 digits)' :
                            'Enter Driving License Number'
                        }
                        style={styles.input}
                        placeholderTextColor="#999"
                        value={value}
                        onChangeText={onChange}
                    />
                    {errors.nom_IdNo && (
                      <Text style={styles.error}>{errors.nom_IdNo.message}</Text>
                    )}
                    </>
                )}
            />

              {renderInput('nom_email', 'Email')}
              {renderInput('nom_mobile', 'Mobile', 'number-pad')}
              {renderInput('nom_building', 'Building (optional)')}
              {renderInput('nom_street', 'Street (optional)')}
              {renderInput('nom_landmark', 'Landmark')}
              {renderInput('nom_city', 'City')}
              {renderInput('nom_pincode', 'Pincode', 'number-pad')}

              {isMinor && (
                <>
                  {renderInput('nom_guardian', 'Guardian Name')}
                  {renderInput('nom_guardianPAN', 'Guardian PAN')}
                </>
              )}

              <TouchableOpacity
                style={[styles.submitButton, { opacity: isValid && dob ? 1 : 0.5 }]}
                disabled={!isValid || !dob}
                onPress={handleSubmit(onSubmit)}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
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
  title: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 20 },
  input: {
    backgroundColor: '#1c1c1e', color: '#fff', padding: 12,
    marginBottom: 10, borderRadius: 6,
  },
  dropdown: {
    backgroundColor: '#1c1c1e', padding: 12,
    borderRadius: 6, marginBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20 },
  nomOpt: { flex: 1, backgroundColor: '#1E90FF', padding: 12, borderRadius: 8 },
  optText: { color: '#fff', textAlign: 'center', fontSize: 13 },
  submitButton: {
    backgroundColor: '#1E90FF', paddingVertical: 14,
    borderRadius: 25, alignItems: 'center', marginTop: 20,
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  error: {
    color: 'tomato',
    marginBottom: 10,
  },
});