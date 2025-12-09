import { Text, View } from "@/components/Themed";
import { Theme } from "@/constants/Theme";
import { auth } from "@/firebaseConfig";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Switch } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  // Mock data/settings
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // This would actually toggle theme context

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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <FontAwesome name="user" size={40} color="#fff" />
            </View>
          )}
          <View style={styles.editBadge}>
            <FontAwesome name="pencil" size={12} color="#fff" />
          </View>
        </View>
        <Text style={styles.name}>
          {user?.displayName || "Anonymous Dreamer"}
        </Text>
        <Text style={styles.email}>{user?.email || "No email provided"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <FontAwesome name="bell" size={20} color="#666" />
          </View>
          <Text style={styles.rowText}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <FontAwesome name="moon-o" size={20} color="#666" />
          </View>
          <Text style={styles.rowText}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Pressable
          style={styles.row}
          onPress={() => {
            /* Navigate to detailed settings */
          }}
        >
          <View style={styles.rowIcon}>
            <FontAwesome name="cog" size={20} color="#666" />
          </View>
          <Text style={styles.rowText}>Detailed Settings</Text>
          <FontAwesome name="chevron-right" size={16} color="#666" />
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>Version 1.0.0 (Delusional Edition)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.Spacing.m,
    paddingTop: Theme.Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Theme.Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Theme.Spacing.m,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
  },
  name: {
    ...Theme.Typography.h2,
    marginBottom: Theme.Spacing.xs,
  },
  email: {
    ...Theme.Typography.caption,
    fontSize: 16,
  },
  section: {
    marginBottom: Theme.Spacing.xl,
    paddingHorizontal: Theme.Spacing.s,
  },
  sectionTitle: {
    ...Theme.Typography.h3,
    marginBottom: Theme.Spacing.m,
    opacity: 0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.Spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  rowIcon: {
    width: 40,
    alignItems: "center",
  },
  rowText: {
    ...Theme.Typography.body,
    flex: 1,
    marginLeft: Theme.Spacing.s,
  },
  logoutButton: {
    marginTop: Theme.Spacing.l,
    padding: Theme.Spacing.m,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: Theme.Radius.m,
    alignItems: "center",
  },
  logoutText: {
    color: "#FF3B30", // Red
    fontWeight: "bold",
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    opacity: 0.3,
    marginTop: Theme.Spacing.xl,
  },
});
