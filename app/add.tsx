import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

import { Text, useThemeColor } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { useVisionStore } from "@/store/visionStore";
import { ImagePlus } from "lucide-react-native";

export default function ModalScreen() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  const addItem = useVisionStore((state) => state.addItem);

  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#121212" },
    "background"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const tintColor = useThemeColor(
    { light: Colors.light.tint, dark: Colors.dark.tint },
    "tint"
  );

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!text || !image) return; // Add validation UI later (sarcastic toast)

    addItem({
      text,
      imageUri: image,
    });

    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />

      <View style={styles.content}>
        <Pressable
          onPress={pickImage}
          style={[styles.imagePlaceholder, { borderColor: tintColor }]}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderContent}>
              <ImagePlus size={48} color={textColor} />
              <Text style={styles.placeholderText}>Pick a delusion image</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>What's the lie?</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: "#333" }]}
            placeholder="e.g., 'Financial Freedom'"
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
          />
        </View>

        <Pressable
          style={[
            styles.saveButton,
            { backgroundColor: tintColor, opacity: !text || !image ? 0.5 : 1 },
          ]}
          onPress={handleSave}
          disabled={!text || !image}
        >
          <Text style={styles.saveButtonText}>Add to The Wall</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    gap: 32,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContent: {
    alignItems: "center",
    gap: 12,
  },
  placeholderText: {
    opacity: 0.6,
  },
  inputContainer: {
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
