import { Text, View, useThemeColor } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { Theme } from "@/constants/Theme";
import { auth } from "@/firebaseConfig";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // Theme colors
  const backgroundColor = useThemeColor(
    { light: "#F5F5F7", dark: "#000" },
    "background"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const tintColor = useThemeColor(
    { light: Colors.light.tint, dark: Colors.dark.tint },
    "tint"
  );
  const secondaryText = useThemeColor({ light: "#666", dark: "#999" }, "icon");
  const cardBg = useThemeColor(
    { light: "rgba(255,255,255,0.8)", dark: "rgba(30,30,30,0.6)" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "rgba(0,0,0,0.1)", dark: "rgba(255,255,255,0.1)" },
    "icon"
  );

  // Settings
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + Theme.Spacing.m },
      ]}
    >
      {/* Header with Gradient */}
      <View style={styles.header}>
        <LinearGradient
          colors={isDark ? ["#1a1a2e", "#16213e"] : [tintColor, "#667eea"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.placeholderAvatar,
                { backgroundColor: tintColor },
              ]}
            >
              <FontAwesome name="user" size={40} color="#fff" />
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
            <FontAwesome name="pencil" size={12} color="#fff" />
          </View>
        </View>

        <Text style={[styles.name, { color: "#fff" }]}>
          {user?.displayName || "Anonymous Dreamer"}
        </Text>
        <Text style={[styles.email, { color: "rgba(255,255,255,0.7)" }]}>
          {user?.email || "No email provided"}
        </Text>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>
          PREFERENCES
        </Text>

        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: "#FF9500" }]}>
              <FontAwesome name="bell" size={16} color="#fff" />
            </View>
            <Text style={[styles.rowText, { color: textColor }]}>
              Notifications
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: tintColor }}
            />
          </View>

          <View style={[styles.separator, { backgroundColor: borderColor }]} />

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: "#5856D6" }]}>
              <FontAwesome name="moon-o" size={16} color="#fff" />
            </View>
            <Text style={[styles.rowText, { color: textColor }]}>
              Dark Mode
            </Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: tintColor }}
            />
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>
          ACCOUNT
        </Text>

        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Pressable style={styles.row} onPress={() => {}}>
            <View style={[styles.rowIcon, { backgroundColor: "#8E8E93" }]}>
              <FontAwesome name="cog" size={16} color="#fff" />
            </View>
            <Text style={[styles.rowText, { color: textColor }]}>Settings</Text>
            <FontAwesome name="chevron-right" size={14} color={secondaryText} />
          </Pressable>

          <View style={[styles.separator, { backgroundColor: borderColor }]} />

          <Pressable style={styles.row} onPress={() => {}}>
            <View style={[styles.rowIcon, { backgroundColor: "#34C759" }]}>
              <FontAwesome name="info-circle" size={16} color="#fff" />
            </View>
            <Text style={[styles.rowText, { color: textColor }]}>About</Text>
            <FontAwesome name="chevron-right" size={14} color={secondaryText} />
          </Pressable>
        </View>
      </View>

      {/* Logout */}
      <Pressable
        style={[
          styles.logoutButton,
          {
            backgroundColor: isDark
              ? "rgba(255,59,48,0.15)"
              : "rgba(255,59,48,0.1)",
          },
        ]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      <Text style={[styles.version, { color: secondaryText }]}>
        Version 1.0.0 (Delusional Edition)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Theme.Spacing.m,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: Theme.Spacing.xl,
    paddingVertical: Theme.Spacing.xl,
    borderRadius: Theme.Radius.xl,
    overflow: "hidden",
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Theme.Spacing.m,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  placeholderAvatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    padding: 8,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: Theme.Spacing.xs,
  },
  email: {
    fontSize: 14,
  },
  section: {
    marginBottom: Theme.Spacing.l,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Theme.Spacing.s,
    marginLeft: Theme.Spacing.s,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: Theme.Radius.l,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.Spacing.m,
    paddingHorizontal: Theme.Spacing.m,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    fontSize: 16,
    flex: 1,
    marginLeft: Theme.Spacing.m,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  logoutButton: {
    marginTop: Theme.Spacing.m,
    padding: Theme.Spacing.m,
    borderRadius: Theme.Radius.m,
    alignItems: "center",
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: Theme.Spacing.xl,
    opacity: 0.5,
  },
});
