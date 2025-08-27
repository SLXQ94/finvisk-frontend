import { Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import styles from "../../../assets/styles/profile.styles";
import IconGrid from '../../../components/IconGrid';
import LogoutButton from '../../../components/LogoutButton';
import ProfileHeader from '../../../components/ProfileHeader';
import { useProfileStore } from '../../../store/profileStore';

export default function Profile() {
  const router = useRouter();
  const {CKYC, BasicDetails, Address, AccountDetails, NomineeDetails} = useProfileStore();

  const status = {
    CKYC: CKYC || false,
    BasicDetails: BasicDetails || false,
    Address: Address || false,
    AccountDetails: AccountDetails || false,
    NomineeDetails: NomineeDetails || false,
  };

  const steps = [
    { name: 'CKYC', icon: <Ionicons name="person-circle-outline" size={24} color="white" />, key: 'CKYC', screen: 'CKYCForm' },
    { name: 'Basic details', icon: <Ionicons name="person-outline" size={24} color="white" />, key: 'BasicDetails', screen: 'BasicDetailsForm' },
    { name: 'Address', icon: <MaterialCommunityIcons name="map-marker-outline" size={24} color="white" />, key: 'Address', screen: 'AddressDetailsForm' },
    { name: 'Bank details', icon: <FontAwesome5 name="university" size={20} color="white" />, key: 'AccountDetails', screen: 'AccountDetailsForm' },
    { name: 'Nominee details', icon: <Ionicons name="person-add-outline" size={24} color="white" />, key: 'NomineeDetails', screen: 'NomineeDetailsForm' },
  ];

  const icons = [
    {
      label: "eNach",
      route: "inside/mandate-details",
      icon: "document-text-outline"
    },
    {
      label: "Transactions",
      route: "inside/order-status",
      icon: "swap-horizontal-outline"
    },
  ];

  const getCompletionPercent = () => {
    if (!status) return 0;
    const total = steps.length;
    const completed = steps.filter(step => status[step.key]).length;
    return completed / total;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 30}}>
      <ProfileHeader />
      <LogoutButton />

      <IconGrid icons={icons}/>



      <View style={{ marginTop: 20, marginHorizontal: 16, padding: 16, backgroundColor: '#1c1c1e', borderRadius: 10 }}>
        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 10 }}>Profile completion</Text>

        {/* {loading ? (
          <ActivityIndicator color="#4CD964" />
        ) : (
          <> */}
            <Progress.Bar
              progress={getCompletionPercent()}
              color="#4CD964"
              width={null}
              height={10}
              borderRadius={8}
              unfilledColor="#333333"
              borderWidth={0}
            />

            <View style={{
              backgroundColor: '#333333',
              alignSelf: 'flex-start',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              marginTop: 6
            }}>
              <Text style={{ 
                color: '#4CD964', 
                fontSize: 10,          
                fontWeight: '500'      
              }}>
                {(getCompletionPercent() * 100).toFixed(0)}% completed
              </Text>
            </View>
          {/* </>
        )} */}
      </View>

      <View style={{ marginTop: 20, marginHorizontal: 16, backgroundColor: '#1c1c1e', borderRadius: 10 }}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: index !== steps.length - 1 ? 1 : 0,
              borderColor: '#333'
            }}
            onPress={() => router.push(`/inside/${status?.[step.key] ? step.key : step.screen}`)}
          >
            <View style={{ width: 30 }}>{step.icon}</View>
            <Text style={{ color: '#fff', flex: 1, marginLeft: 10 }}>{step.name}</Text>
            {status?.[step.key] && <Ionicons name="checkmark-circle" size={20} color="#4CD964" />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 30, marginHorizontal: 16, backgroundColor: '#1c1c1e', borderRadius: 10 }}>
        <Text style={{ color: '#ccc', fontSize: 14, padding: 16 }}>Help & Support</Text>
        <TouchableOpacity
          style={helpItemStyle}
          onPress={() => router.push('/AppDetails')}
        >
          <MaterialIcons name="info-outline" size={22} color="white" />
          <Text style={helpTextStyle}>App details</Text>
          <Entypo name="chevron-right" size={20} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity
          style={helpItemStyle}
          onPress={() => Linking.openURL('tel:+918178507328')}
        >
          <Ionicons name="headset-outline" size={22} color="white" />
          <Text style={helpTextStyle}>Contact & support</Text>
          <Entypo name="chevron-right" size={20} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity
          style={helpItemStyle}
          onPress={() => router.push('/FAQs')}
        >
          <Ionicons name="help-circle-outline" size={22} color="white" />
          <Text style={helpTextStyle}>FAQs</Text>
          <Entypo name="chevron-right" size={20} color="#aaa" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const helpItemStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderTopWidth: 1,
  borderColor: '#333'
};

const helpTextStyle = {
  color: '#fff',
  flex: 1,
  marginLeft: 10,
  fontSize: 15
};