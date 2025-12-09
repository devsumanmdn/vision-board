import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme as useNativeColorScheme,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Themed";
import { Colors } from "@/constants/Colors";
import { Theme } from "@/constants/Theme";
import { useVisionStore, VisionItem } from "@/store/visionStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VisionCard = ({ item, index }: { item: VisionItem; index: number }) => {
  const router = useRouter();
  const colorScheme = useNativeColorScheme();
  const theme = colorScheme ?? "light";

  // Use fixed height for Grid layout since we are reverting from Masonry
  const height = 200;

  const handlePress = () => {
    router.push(`/vision/${item.id}`);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={{
        flex: 1,
        margin: Theme.Spacing.s,
        height,
        ...Theme.Shadows.medium,
      }}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: Colors[theme].surface,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.cardGradient}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardText} numberOfLines={2}>
            {item.text}
          </Text>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function TabOneScreen() {
  const { items, subscribe, isLoading, isRefreshing, refresh } =
    useVisionStore();
  const colorScheme = useNativeColorScheme();
  const theme = colorScheme ?? "light";
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning delusion?";
    if (hour < 18) return "Afternoon fantasy?";
    return "Evening regrets?";
  }, []);

  if (isLoading && items.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Theme.Spacing.m,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View>
          <Text style={[Theme.Typography.h1, { color: colors.text }]}>
            The Wall
          </Text>
          <Text style={[Theme.Typography.caption, { color: colors.text }]}>
            {greeting}
          </Text>
        </View>

        <Link href="/add" asChild>
          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              backgroundColor: colors.surface,
              padding: 10,
              borderRadius: Theme.Radius.round,
            })}
          >
            <Plus color={colors.text} size={28} />
          </Pressable>
        </Link>
      </View>

      <FlashList
        data={items}
        numColumns={2}
        renderItem={({ item, index }: { item: VisionItem; index: number }) => (
          <VisionCard item={item} index={index} />
        )}
        estimatedItemSize={250}
        contentContainerStyle={{
          paddingHorizontal: Theme.Spacing.s,
          paddingBottom: 100,
        }}
        refreshing={isRefreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
      />

      {items.length === 0 && (
        <View style={styles.emptyState}>
          <Text
            style={[
              Theme.Typography.body,
              { opacity: 0.5, fontStyle: "italic" },
            ]}
          >
            Empty... just like your resolve.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Theme.Spacing.l,
    paddingBottom: Theme.Spacing.m,
  },
  card: {
    flex: 1,
    borderRadius: Theme.Radius.l,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  cardContent: {
    padding: Theme.Spacing.m,
  },
  cardText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
});
