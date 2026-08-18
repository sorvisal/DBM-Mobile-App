import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";

const DESKTOP_BREAKPOINT = 768;

export function useResponsive() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const update = () => {
      const width = Dimensions.get("window").width;
      setWindowWidth(width);
      setIsDesktop(width >= DESKTOP_BREAKPOINT && Platform.OS === "web");
    };

    update();
    const subscription = Dimensions.addEventListener("change", update);
    return () => subscription?.remove();
  }, []);

  return {
    isDesktop,
    isMobile: !isDesktop,
    windowWidth,
  };
}
