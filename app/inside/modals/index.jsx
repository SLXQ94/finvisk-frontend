import { useLocalSearchParams, useRouter } from 'expo-router';
import InvestmentModal from '../../../components/InvestmentModal';

export default function InvestmentModalScreen() {
  const router = useRouter();
  const { bseCode, schemePlanId } = useLocalSearchParams();

  return (
    <InvestmentModal
      visible={true}
      onClose={() => router.back()}
      bseCode={bseCode}
      schemePlanId={schemePlanId}
    />
  );
}