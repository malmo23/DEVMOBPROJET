export default function Branding() {
  return (
    <View style="{{styles.container}}">
      <Text style="{{styles.logoText}}">FoodRisk App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff'
  }
});