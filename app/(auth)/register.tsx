import { Link, useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Text, useThemeColor } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { auth } from "@/firebaseConfig";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#121212" },
    "background"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const tintColor = useThemeColor(
    { light: Colors.light.tint, dark: Colors.dark.tint },
    "tint"
  );

  const handleRegister = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      alert("Fail: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Start your "Journey"</Text>
        <Text style={styles.subtitle}>We both know where this ends.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: "#333" }]}
            placeholder="optimist@example.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password (Make it hard)</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: "#333" }]}
            placeholder="********"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          style={[
            styles.button,
            { backgroundColor: tintColor, opacity: loading ? 0.7 : 1 },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating disappointment..." : "Create Account"}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={[styles.linkText, { color: tintColor }]}>
              Already have failures? Log in.
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.6,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  button: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
