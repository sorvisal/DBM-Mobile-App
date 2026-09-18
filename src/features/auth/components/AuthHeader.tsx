import { View, Text, Image, StyleSheet } from "react-native";
import { APP_LOGO } from "../../../constants/appAssets";

export function AuthHeader() {
  return (
    <View style={styles.headerContainer}>
      {/* Logo Card ដូច SCENE 2 */}
      <View style={styles.logoCard}>
        <Image
          source={APP_LOGO}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* App Name */}
      <Text style={styles.title} numberOfLines={1}>
        DB Management
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle} numberOfLines={2}>
        ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្មបែបឌីជីថល
      </Text>

      {/* Welcome / Tagline ដូច SCENE 2 */}
      <Text style={styles.welcome} numberOfLines={1}>
        Digital Business Management
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 20,
    width: "100%",
  },

  // Logo Card តាមបែប SCENE 2
  logoCard: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginTop:18,
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },

  // Typography ដូច SCENE 2 បេះបិទ
  title: {
    fontSize: 26,
    color: "#0F172A",
    fontFamily: "KantumruyPro-Bold",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    fontFamily: "KantumruyPro-Medium",
    textAlign: "center",
  },
  welcome: {
    marginTop: 6,
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: "KantumruyPro-Medium",
    letterSpacing: 2.5,
    textAlign: "center",
  },
});