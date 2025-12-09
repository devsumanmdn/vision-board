import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useVisionStore, VisionItem } from "@/store/visionStore";
import { Plus } from "lucide-react-native";

const VisionCard = ({ item, index }: { item: VisionItem; index: number }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Random height for masonry effect (mocking aspect ratio if no image size)
  const height = useMemo(() => 150 + Math.random() * 100, []);

  return (
    <Link href={`/vision/${item.id}`} asChild>
      <Pressable
        style={[
          styles.card,
          { backgroundColor: colors.surface, height, marginBottom: 12 },
        ]}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardText} numberOfLines={2}>
            {item.text}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

export default function TabOneScreen() {
  const { items, subscribe, isLoading, isRefreshing, refresh } =
    useVisionStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const unsubscribe = subscribe();
    return () => unsubscribe();
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
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>The Wall of False Hope</Text>
      </View>

      <FlatList
        data={items}
        numColumns={2}
        renderItem={({ item, index }) => (
          <VisionCard item={item} index={index} />
        )}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
        refreshing={isRefreshing}
        onRefresh={refresh}
      />

      {items.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Empty... just like your resolve.
          </Text>
        </View>
      )}

      {/* FAB */}
      <Link href="/add" asChild>
        <Pressable
          style={[
            styles.fab,
            { backgroundColor: colors.primary, bottom: insets.bottom + 20 },
          ]}
        >
          <Plus color="#FFF" size={32} />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    fontStyle: "italic",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 6,
    justifyContent: "flex-end",
  },
  cardOverlay: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "100%",
  },
  cardText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  emptyStateText: {
    fontSize: 18,
    opacity: 0.5,
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 999,
  },
});
