import { Text } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { Theme } from "@/constants/Theme";
import { useColorScheme } from "@/context/ThemeContext";
import { auth } from "@/firebaseConfig";
import { useSettingsStore } from "@/store/settingsStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  Bell,
  ChevronRight,
  Info,
  Moon,
  Pencil,
  Settings,
  User,
} from "lucide-react-native";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // Theme colors - improved contrast
  const backgroundColor = isDark ? "#0a0a0a" : "#F8F8FA";
  const textColor = isDark ? "#FFFFFF" : "#1a1a1a";
  const tintColor = isDark ? Colors.dark.tint : Colors.light.tint;
  const secondaryText = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const separatorColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  // Settings from store
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore(
    (s) => s.setNotificationsEnabled
  );
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);

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
              <User size={40} color="#fff" strokeWidth={1.5} />
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
            <Pencil size={12} color="#fff" strokeWidth={2.5} />
          </View>
        </View>

        <Text style={[styles.name, { color: "#fff" }]}>
          {user?.displayName || "Anonymous Dreamer"}
        </Text>
        <Text style={[styles.email, { color: "rgba(255,255,255,0.7)" }]}>
          {user?.email || "No email provided"}
        </Text>
      </View>

      {/* Preferences Section - No box, just rows */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>
          PREFERENCES
        </Text>

        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: "#FF9500" }]}>
            <Bell size={16} color="#fff" strokeWidth={2} />
          </View>
          <Text style={[styles.rowText, { color: textColor }]}>
            Notifications
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#767577", true: tintColor }}
          />
        </View>

        <View style={[styles.separator, { backgroundColor: separatorColor }]} />

        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: "#5856D6" }]}>
            <Moon size={16} color="#fff" strokeWidth={2} />
          </View>
          <Text style={[styles.rowText, { color: textColor }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#767577", true: tintColor }}
          />
        </View>
      </View>

      <View
        style={[styles.fullSeparator, { backgroundColor: separatorColor }]}
      />

      {/* Account Section - No box, just rows */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: secondaryText }]}>
          ACCOUNT
        </Text>

        <Pressable style={styles.row} onPress={() => {}}>
          <View style={[styles.rowIcon, { backgroundColor: "#8E8E93" }]}>
            <Settings size={16} color="#fff" strokeWidth={2} />
          </View>
          <Text style={[styles.rowText, { color: textColor }]}>Settings</Text>
          <ChevronRight size={16} color={secondaryText} strokeWidth={2} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: separatorColor }]} />

        <Pressable style={styles.row} onPress={() => {}}>
          <View style={[styles.rowIcon, { backgroundColor: "#34C759" }]}>
            <Info size={16} color="#fff" strokeWidth={2} />
          </View>
          <Text style={[styles.rowText, { color: textColor }]}>About</Text>
          <ChevronRight size={16} color={secondaryText} strokeWidth={2} />
        </Pressable>
      </View>

      <View
        style={[styles.fullSeparator, { backgroundColor: separatorColor }]}
      />

      {/* Logout */}
      <Pressable style={styles.logoutRow} onPress={handleLogout}>
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
    marginBottom: Theme.Spacing.m,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Theme.Spacing.s,
    marginLeft: Theme.Spacing.s,
    letterSpacing: 0.5,
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
  fullSeparator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Theme.Spacing.s,
  },
  logoutRow: {
    paddingVertical: Theme.Spacing.m,
    paddingHorizontal: Theme.Spacing.m,
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
