import { FlatList, View } from "react-native";
import styles from "../../assets/styles/home.styles";
import ImprovedDivision from "../../components/Portfolio";
import QuestionCard from "../../components/QuestionCard";

export default function Index() {

    return (
        <View style={styles.container}>
          <FlatList
                data={[]}
                renderItem={() => null}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                      <QuestionCard/>
                      <ImprovedDivision/>
                    </View>
                }
            />
        </View>
    );
}