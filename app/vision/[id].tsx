import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Sparkles,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { Text, useThemeColor } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { generateMilestones, Milestone } from "@/services/ai";
import { useVisionStore } from "@/store/visionStore";

const { width } = Dimensions.get("window");
const IMG_HEIGHT = 400;

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const item = useVisionStore((state) => state.items.find((i) => i.id === id));
  const deleteItem = useVisionStore((state) => state.deleteItem);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const tintColor = useThemeColor(
    { light: Colors.light.tint, dark: Colors.dark.tint },
    "tint"
  );
  const errorColor = Colors.dark.error;
  const secondaryText = useThemeColor({ light: "#666", dark: "#ccc" }, "icon");

  // Dynamic Styles
  const gradientColors = isDark
    ? (["transparent", "rgba(0,0,0,0.6)", backgroundColor] as const)
    : (["transparent", "rgba(255,255,255,0.6)", backgroundColor] as const);

  const blurTint = isDark ? "dark" : "light";
  const cardBg = isDark ? "rgba(30,30,30,0.6)" : "rgba(255,255,255,0.6)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

  if (!item) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <Text>Delusion not found.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    deleteItem(item.id);
    router.back();
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await generateMilestones(item.text);
      setMilestones(result);
    } catch (e) {
      console.error(e);
      // fallback or toast could go here
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Immersive Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: item.imageUri }} // Ensure this is a valid URI
            style={styles.heroImage}
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={gradientColors}
            locations={[0, 0.6, 1]}
            style={styles.gradientOverlay}
          />

          <View style={styles.heroContent}>
            <Animated.View entering={FadeInDown.delay(100).duration(800)}>
              <Text style={[styles.heroTitle, { color: textColor }]}>
                {item.text}
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(300).duration(800)}
              style={styles.dateContainer}
            >
              <Calendar size={14} color={secondaryText} />
              <Text style={[styles.heroDate, { color: secondaryText }]}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Animated.View>
          </View>

          {/* Back Button */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <BlurView
              intensity={30}
              tint={blurTint}
              style={styles.backButtonBlur}
            >
              <ArrowLeft color={textColor} size={24} />
            </BlurView>
          </Pressable>
        </View>

        <View style={styles.body}>
          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.aiButton,
                { backgroundColor: tintColor, opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={handleGeneratePlan}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Sparkles color="#FFF" size={20} />
              )}
              <Text style={styles.aiButtonText}>
                {loading ? "Manifesting..." : "How do I achieve this?"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleDelete}
            >
              <Trash2 color={errorColor} size={24} />
            </Pressable>
          </View>

          {/* Milestones / Plan */}
          {milestones.length > 0 && (
            <Animated.View
              entering={FadeInUp.springify().damping(12)}
              style={styles.planContainer}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                The Roadmap
              </Text>

              <View style={styles.timeline}>
                {milestones.map((m, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(index * 150).springify()}
                    style={styles.timelineItem}
                  >
                    {/* Timeline Line & Dot */}
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: tintColor,
                            borderColor: textColor,
                          },
                        ]}
                      />
                      {index !== milestones.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: isDark ? "#333" : "#e0e0e0" },
                          ]}
                        />
                      )}
                    </View>

                    {/* Content Card */}
                    <View
                      style={[
                        styles.timelineContent,
                        { backgroundColor: cardBg, borderColor: cardBorder },
                      ]}
                    >
                      <BlurView
                        intensity={Platform.OS === "ios" ? 20 : 0}
                        tint={blurTint}
                        style={styles.cardBlur}
                      >
                        <View style={styles.cardHeader}>
                          <Text
                            style={[styles.monthBadge, { color: tintColor }]}
                          >
                            {m.month}
                          </Text>
                        </View>

                        <Text style={[styles.targetText, { color: textColor }]}>
                          {m.target}
                        </Text>

                        <View style={styles.snarkRow}>
                          <AlertCircle size={14} color={secondaryText} />
                          <Text
                            style={[styles.snarkText, { color: secondaryText }]}
                          >
                            {m.snark}
                          </Text>
                        </View>
                      </BlurView>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Hero
  heroContainer: {
    height: IMG_HEIGHT,
    width: width,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  heroContent: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.1)", // Reduced shadow
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  backButtonBlur: {
    padding: 10,
    borderRadius: 20,
  },
  // Body
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  aiButton: {
    flex: 1,
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
  },
  // Timeline
  planContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  timeline: {
    marginLeft: 10,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 30,
  },
  timelineLeft: {
    width: 20,
    alignItems: "center",
    marginRight: 20,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 2,
    borderWidth: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -32, // Connect to next item
    opacity: 0.5,
  },
  timelineContent: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden", // for BlurView
    borderWidth: 1,
  },
  cardBlur: {
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  monthBadge: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  targetText: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 8,
  },
  snarkRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    opacity: 0.8,
  },
  snarkText: {
    fontSize: 14,
    fontStyle: "italic",
    flex: 1,
  },
});
