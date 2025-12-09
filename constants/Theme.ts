import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const Theme = {
  Screen: {
    width,
    height,
  },
  Spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  Radius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    round: 9999,
  },
  Typography: {
    h1: {
      fontSize: 32,
      fontWeight: "800" as const,
      letterSpacing: -1,
    },
    h2: {
      fontSize: 24,
      fontWeight: "700" as const,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 20,
      fontWeight: "600" as const,
      letterSpacing: -0.5,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: "400" as const,
      opacity: 0.6,
    },
  },
  Shadows: {
    small: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      },
    }),
    medium: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
      },
    }),
    large: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
      },
    }),
  },
};
