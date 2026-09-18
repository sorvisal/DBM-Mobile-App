import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { APP_LOGO } from "../constants/appAssets";

const { width } = Dimensions.get("window");

type SplashScreenProps = {
  onFinish: () => void | Promise<void>;
  duration?: number;
};

export function SplashScreen({
  onFinish,
  duration = 5000, // Logo App និង Dots បង្ហាញនៅស្ងៀម ៥ វិនាទី មុននឹងចាកចេញ
}: SplashScreenProps) {
  const lottieRef = useRef<LottieView>(null);

  // Scene 1: Warehouse / Delivery Scene
  const scene1Opacity = useRef(new Animated.Value(1)).current;
  const scene1Scale = useRef(new Animated.Value(1)).current;

  // Scene 2: Logo Reveal
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;

  // Text Animation
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;

  // 3 Loading Dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Exit transition
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // ចលនា Loading Dots លោតចុះឡើងរង្វិលជុំ
    const createBounce = (val: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: -9,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(260),
        ])
      );
    };

    const dotsAnim = Animated.parallel([
      createBounce(dot1, 0),
      createBounce(dot2, 160),
      createBounce(dot3, 320),
    ]);

    // លំដាប់ដំណើរការ Storyboard (Flow):
    const mainTimeline = Animated.sequence([
      // វគ្គទី ១៖ រក្សាល្បឿន Lottie Scene ដដែល (២.២ វិនាទី) មិនប៉ះពាល់ឡើយ
      Animated.delay(2200),

      // Transition ប្តូរពី Scene 1 ទៅ Scene 2
      Animated.parallel([
        Animated.timing(scene1Opacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scene1Scale, {
          toValue: 0.9,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),

      // វគ្គទី ២៖ Logo DBM បង្ហាញចេញមកចំកណ្តាល
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // អក្សរឈ្មោះ និង Tagline រំកិលឡើងមក
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // -------------------------------------------------------------
      // បង្កើនរយៈពេលឱ្យ Logo App (Scene 2) បង្ហាញនៅនឹងអេក្រង់បានយូរ
      // -------------------------------------------------------------
      Animated.delay(duration),

      // ចាកចេញទៅ Main App មួយៗយ៉ាងរលូន (Smooth Fade Out)
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenScale, {
          toValue: 1.05,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]);

    dotsAnim.start();
    mainTimeline.start(({ finished }) => {
      if (finished) {
        dotsAnim.stop();
        onFinish();
      }
    });

    return () => {
      dotsAnim.stop();
      mainTimeline.stop();
    };
  }, [
    scene1Opacity,
    scene1Scale,
    logoOpacity,
    logoScale,
    logoTranslateY,
    textOpacity,
    textTranslateY,
    screenOpacity,
    screenScale,
    duration,
    onFinish,
  ]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenOpacity,
          transform: [{ scale: screenScale }],
        },
      ]}
    >
      <StatusBar style="dark" />

      {/* Decorative Circles ផ្ទៃខាងក្រោយ */}
      <View style={[styles.blueCircle, { width: 190, height: 190, top: -100, right: -70 }]} />
      <View style={[styles.lightBlueCircle, { width: 100, height: 100, top: 60, right: -40 }]} />
      <View style={[styles.blueCircle, { width: 170, height: 170, bottom: -110, left: -70 }]} />
      <View style={[styles.lightBlueCircle, { width: 85, height: 85, bottom: -30, left: 60 }]} />

      {/* ================= SCENE 1: Delivery / Warehouse Animation ================= */}
      <Animated.View
        style={[
          styles.scene1Container,
          {
            opacity: scene1Opacity,
            transform: [{ scale: scene1Scale }],
          },
        ]}
        pointerEvents="none"
      >
        <LottieView
          ref={lottieRef}
          source={require("../assets/delivery.json")}
          autoPlay
          loop={true}
          speed={0.9}
          resizeMode="contain"
          style={styles.lottie}
        />
      </Animated.View>

      {/* ================= SCENE 2: Logo Reveal & Brand Info ================= */}
      <Animated.View
        style={[
          styles.scene2Container,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { translateY: logoTranslateY },
            ],
          },
        ]}
      >
        {/* Logo Card */}
        <View style={styles.logoCard}>
          <Image source={APP_LOGO} resizeMode="contain" style={styles.logo} />
        </View>

        {/* Brand Text */}
        <Animated.View
          style={{
            opacity: textOpacity,
            alignItems: "center",
            transform: [{ translateY: textTranslateY }],
          }}
        >
          <Text style={styles.title}>DB Management</Text>
          <Text style={styles.subtitle}>ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្មបែបឌីជីថល</Text>
          <Text style={styles.welcome}>Digital Business Management</Text>

          {/* 3 Bouncing Loading Dots ដូចក្នុងវីដេអូ To Go */}
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Decorative Background Circles
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

  // SCENE 1
  scene1Container: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: width * 0.9,
    height: 280,
  },

  // SCENE 2
  scene2Container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  logoCard: {
    width: 105,
    height: 105,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },

  // Typography
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

  // Loading Dots
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
});