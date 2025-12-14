import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Sparkles, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text, useThemeColor } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/context/ThemeContext";
import { generateMilestones, Milestone } from "@/services/ai";
import { useVisionStore } from "@/store/visionStore";

const { width, height } = Dimensions.get("window");
const IMG_HEIGHT = height * 0.6; // More immersive

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    ? (["transparent", "#000"] as const)
    : (["transparent", "#fff"] as const);

  const blurTint = isDark ? "dark" : "light";
  const glassBg = isDark ? "rgba(30,30,30,0.4)" : "rgba(255,255,255,0.4)";
  const glassBorder = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(255,255,255,0.4)";

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
      alert("Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Immersive Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: item.imageUri }}
            style={styles.heroImage}
            contentFit="cover"
            transition={800}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", ...gradientColors]}
            locations={[0, 0.3, 0.6, 1]}
            style={styles.gradientOverlay}
          />

          {/* Header Content */}
          <View style={[styles.heroContent, { paddingBottom: 40 }]}>
            <Animated.View entering={FadeInDown.delay(200).duration(800)}>
              <Text style={[styles.heroTitle, { color: textColor }]}>
                {item.text}
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(400).duration(800)}
              style={styles.dateContainer}
            >
              <BlurView intensity={20} tint={blurTint} style={styles.dateBadge}>
                <Calendar size={14} color={secondaryText} />
                <Text style={[styles.heroDate, { color: secondaryText }]}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </BlurView>
            </Animated.View>
          </View>

          {/* Back Button */}
          <Pressable
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <BlurView intensity={40} tint={blurTint} style={styles.iconBlur}>
              <ArrowLeft color={textColor} size={24} />
            </BlurView>
          </Pressable>

          {/* Actions Bar - Floating over image/content transition */}
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={styles.actionsFloating}
          >
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: glassBg, borderColor: glassBorder },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleDelete}
            >
              <Trash2 color={errorColor} size={22} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.generateBtn,
                { backgroundColor: tintColor },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleGeneratePlan}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Sparkles color="#FFF" size={20} />
              )}
              <Text style={styles.generateBtnText}>
                {loading ? "Manifesting..." : "Reveal the Path"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.body}>
          {/* Motivations Section */}
          {item.motivations && item.motivations.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(200)}
              style={styles.motivationContainer}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: textColor, fontSize: 20, marginBottom: 12 },
                ]}
              >
                The Why
              </Text>
              <View style={{ gap: 8 }}>
                {item.motivations.map((m, i) => (
                  <View key={i} style={styles.motivationRow}>
                    <View
                      style={[styles.bullet, { backgroundColor: tintColor }]}
                    />
                    <Text
                      style={[styles.motivationText, { color: secondaryText }]}
                    >
                      {m}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Schedule / Regimen Section */}
          {item.schedule && item.schedule.length > 0 ? (
            <Animated.View
              entering={FadeInUp.delay(400)}
              style={styles.scheduleContainer}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                The Regimen
              </Text>
              {item.schedule.map((task, i) => (
                <BlurView
                  key={task.id || i}
                  intensity={isDark ? 20 : 40}
                  tint={blurTint}
                  style={[styles.scheduleCard, { marginBottom: 16 }]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontWeight: "bold", color: tintColor }}>
                      {task.time}
                    </Text>
                    <Text style={{ fontSize: 12, color: secondaryText }}>
                      {task.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: textColor,
                      fontWeight: "600",
                    }}
                  >
                    {task.task}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, dIdx) => (
                      <Text
                        key={dIdx}
                        style={{
                          fontSize: 12,
                          color: task.activeDays.includes(dIdx)
                            ? textColor
                            : secondaryText,
                          fontWeight: task.activeDays.includes(dIdx)
                            ? "bold"
                            : "normal",
                          opacity: task.activeDays.includes(dIdx) ? 1 : 0.3,
                        }}
                      >
                        {day}
                      </Text>
                    ))}
                  </View>
                </BlurView>
              ))}
            </Animated.View>
          ) : (
            /* Fallback to Milestones if no schedule exists */
            milestones.length > 0 && (
              <Animated.View entering={FadeInUp.springify().damping(15)}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  The Roadmap
                </Text>
                {/* ... (Keep existing timeline code if you want, but likely better to hide if schedule exists for cleaner UI, or keep both. I'll keep logic simple: strict either/or for now to emphasize new feature) */}
                <View style={styles.timeline}>
                  {milestones.map((m, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeInDown.delay(index * 200 + 500).springify()}
                      style={styles.timelineItem}
                    >
                      <View style={[styles.timelineLineContainer]}>
                        <View
                          style={[
                            styles.timelineDot,
                            { backgroundColor: tintColor },
                          ]}
                        />
                        {index !== milestones.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              { backgroundColor: isDark ? "#333" : "#e5e5e5" },
                            ]}
                          />
                        )}
                      </View>

                      <BlurView
                        intensity={Platform.OS === "ios" ? 40 : 0}
                        tint={blurTint}
                        style={[
                          styles.card,
                          {
                            backgroundColor: glassBg,
                            borderColor: glassBorder,
                          },
                        ]}
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
                        {m.snark && (
                          <View style={styles.snarkContainer}>
                            <Text
                              style={[
                                styles.snarkText,
                                { color: secondaryText },
                              ]}
                            >
                              "{m.snark}"
                            </Text>
                          </View>
                        )}
                      </BlurView>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )
          )}

          {/* Action Buttons (Repositioned or kept at top? Kept at top in previous code, so body just has content) */}
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
  heroContainer: {
    height: IMG_HEIGHT,
    width: width,
    position: "relative",
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    paddingHorizontal: 24,
    width: "100%",
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "900", // Heavy aesthetic
    marginBottom: 12,
    lineHeight: 46,
    letterSpacing: -1,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  heroDate: {
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 20,
    borderRadius: 24,
    overflow: "hidden",
  },
  iconBlur: {
    padding: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsFloating: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: -28, // Float half out
    zIndex: 20,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  generateBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  generateBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  body: {
    paddingTop: 48, // Space for floating buttons
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  timeline: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 32,
  },
  timelineLineContainer: {
    width: 20,
    alignItems: "center",
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -38,
    borderRadius: 1,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    overflow: "hidden",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthBadge: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  targetText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
  },
  snarkContainer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.1)",
  },
  snarkText: {
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
  },
  motivationContainer: {
    marginBottom: 32,
  },
  motivationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  motivationText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  scheduleContainer: {
    marginBottom: 32,
  },
  scheduleCard: {
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
  },
});
