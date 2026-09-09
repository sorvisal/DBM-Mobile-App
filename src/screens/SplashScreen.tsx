import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { APP_LOGO } from "../constants/appAssets";

type SplashScreenProps = {
  onFinish: () => void | Promise<void>;
  duration?: number;
};
export function SplashScreen({
  onFinish,
}: SplashScreenProps) {
  // =========================================================
  // Animation values
  // =========================================================

  const logoOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.55)
  ).current;

  const logoTranslateY = useRef(
    new Animated.Value(15)
  ).current;

  const ringScale = useRef(
    new Animated.Value(0.65)
  ).current;

  const ringOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const titleOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const titleTranslateY = useRef(
    new Animated.Value(14)
  ).current;

  const subtitleOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const subtitleTranslateY = useRef(
    new Animated.Value(10)
  ).current;

  const underlineScale = useRef(
    new Animated.Value(0)
  ).current;

  const contentOpacity = useRef(
    new Animated.Value(1)
  ).current;

  const contentScale = useRef(
    new Animated.Value(1)
  ).current;

  // =========================================================
  // Animation
  // =========================================================

  useEffect(() => {
    const animation = Animated.sequence([
      // -------------------------------------------------------
      // 1. Logo appears
      // -------------------------------------------------------
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),

        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // -------------------------------------------------------
      // 2. Ring expands
      // -------------------------------------------------------
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.spring(ringScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),

      // -------------------------------------------------------
      // 3. Title appears
      // -------------------------------------------------------
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // -------------------------------------------------------
      // 4. Subtitle appears
      // -------------------------------------------------------
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // -------------------------------------------------------
      // 5. Underline
      // -------------------------------------------------------
      Animated.timing(underlineScale, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      // -------------------------------------------------------
      // 6. Hold
      // -------------------------------------------------------
      Animated.delay(500),

      // -------------------------------------------------------
      // 7. Exit
      // -------------------------------------------------------
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(contentScale, {
          toValue: 1.04,
          duration: 300,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onFinish();
      }
    });

    return () => {
      animation.stop();
    };
  }, [
    logoOpacity,
    logoScale,
    logoTranslateY,
    ringScale,
    ringOpacity,
    titleOpacity,
    titleTranslateY,
    subtitleOpacity,
    subtitleTranslateY,
    underlineScale,
    contentOpacity,
    contentScale,
    onFinish,
  ]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: contentOpacity,
          transform: [
            {
              scale: contentScale,
            },
          ],
        },
      ]}
    >
      <StatusBar style="dark" />

      {/* =====================================================
          TOP-RIGHT DECORATION
          Same style as AuthHeader
      ===================================================== */}

      <View
        style={[
          styles.blueCircle,
          {
            width: 180,
            height: 180,
            top: -110,
            right: -75,
          },
        ]}
      />

      <View
        style={[
          styles.lightBlueCircle,
          {
            width: 90,
            height: 90,
            top: 70,
            right: -45,
          },
        ]}
      />

      {/* =====================================================
          BOTTOM-LEFT DECORATION
          Same style as AuthHeader
      ===================================================== */}

      <View
        style={[
          styles.blueCircle,
          {
            width: 165,
            height: 165,
            bottom: -115,
            left: -75,
          },
        ]}
      />

      <View
        style={[
          styles.lightBlueCircle,
          {
            width: 80,
            height: 80,
            bottom: -35,
            left: 65,
          },
        ]}
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <View style={styles.content}>
        {/* ===================================================
            Logo
        =================================================== */}

        <View style={styles.logoArea}>
          {/* Soft ring */}
          <Animated.View
            style={{
              position: "absolute",
              width: 155,
              height: 155,
              borderRadius: 78,
              borderWidth: 1.5,
              borderColor: "rgba(37,99,235,0.10)",
              opacity: ringOpacity,
              transform: [
                {
                  scale: ringScale,
                },
              ],
            }}
          />

          {/* Animated logo */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [
                {
                  scale: logoScale,
                },
                {
                  translateY: logoTranslateY,
                },
              ],
            }}
          >
            <View style={styles.logoContainer}>
              <Image
                source={APP_LOGO}
                resizeMode="contain"
                style={styles.logo}
              />
            </View>
          </Animated.View>
        </View>

        {/* ===================================================
            App Name
        =================================================== */}

        <Animated.Text
          style={{
            ...styles.title,
            opacity: titleOpacity,
            transform: [
              {
                translateY: titleTranslateY,
              },
            ],
          }}
          numberOfLines={1}
        >
          DB Management
        </Animated.Text>

        {/* ===================================================
            Subtitle
        =================================================== */}

        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [
              {
                translateY: subtitleTranslateY,
              },
            ],
          }}
        >
          <Text style={styles.subtitle} numberOfLines={2}>
            ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្មបែបឌីជីថល
          </Text>

          <Text style={styles.welcome}>
            WELCOME
          </Text>
        </Animated.View>

        {/* ===================================================
            Underline
        =================================================== */}

        <View style={styles.underlineContainer}>
          <Animated.View
            style={[
              styles.underline,
              {
                transform: [
                  {
                    scaleX: underlineScale,
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

// ===========================================================
// Styles
// ===========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  // ---------------------------------------------------------
  // Decorative circles
  // ---------------------------------------------------------

  blueCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  lightBlueCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },

  // ---------------------------------------------------------
  // Logo
  // ---------------------------------------------------------

  logoArea: {
    width: 175,
    height: 175,
    alignItems: "center",
    justifyContent: "center",
  },

  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  logo: {
    width: 92,
    height: 66,
  },

  // Text
  
  title: {
    marginTop: 8,
    color: "#111827",
    fontSize: 30,
    fontFamily: "KantumruyPro-Bold",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,
    paddingHorizontal: 24,
    color: "#9CA3AF",
    fontSize: 17,
    fontFamily: "KantumruyPro-Medium",
    textAlign: "center",
  },

  welcome: {
    marginTop: 7,
    color: "#9CA3AF",
    fontSize: 11,
    fontFamily: "KantumruyPro-Medium",
    letterSpacing: 3,
    textAlign: "center",
  },

  // ---------------------------------------------------------
  // Underline
  // ---------------------------------------------------------

  underlineContainer: {
    width: 70,
    height: 2,
    marginTop: 17,
    alignItems: "center",
  },

  underline: {
    width: 70,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
});