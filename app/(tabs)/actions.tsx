import { Text, View } from "@/components/Themed";
import { Theme } from "@/constants/Theme";
import { useColorScheme } from "@/context/ThemeContext";
import { useVisionStore } from "@/store/visionStore";
import Checkbox from "expo-checkbox";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

export default function ActionsScreen() {
  const { items } = useVisionStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Theme-aware colors
  const backgroundColor = isDark ? "#0a0a0a" : "#F8F8FA";
  const textColor = isDark ? "#FFFFFF" : "#1a1a1a";
  const secondaryText = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const taskBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";
  const checkboxBorder = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)";

  const [tasks, setTasks] = useState([
    { id: "1", text: "Pretend to understand the codebase", completed: false },
    { id: "2", text: "Drink water (you look dehydrated)", completed: false },
    {
      id: "3",
      text: "Close at least 3 of your 50 browser tabs",
      completed: false,
    },
    { id: "4", text: "Don't cry during standup", completed: true },
    {
      id: "5",
      text: "Actually commit code, not just 'wip' updates",
      completed: false,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: "transparent" }]}>
        <Text style={[styles.title, { color: textColor }]}>
          Today's Burdens
        </Text>
        <Text style={[styles.subtitle, { color: secondaryText }]}>
          Execute or make excuses.
        </Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggleTask(item.id)}
            style={[styles.taskItem, { backgroundColor: taskBg }]}
          >
            <Checkbox
              value={item.completed}
              onValueChange={() => toggleTask(item.id)}
              color={item.completed ? "#4CAF50" : checkboxBorder}
              style={styles.checkbox}
            />
            <View
              style={[styles.textContainer, { backgroundColor: "transparent" }]}
            >
              <Text
                style={[
                  styles.taskText,
                  { color: textColor },
                  item.completed && styles.completedText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.Spacing.m,
  },
  header: {
    marginTop: Theme.Spacing.xl,
    marginBottom: Theme.Spacing.l,
  },
  title: {
    ...Theme.Typography.h1,
    marginBottom: Theme.Spacing.xs,
  },
  subtitle: {
    ...Theme.Typography.body,
    opacity: 0.6,
  },
  list: {
    gap: Theme.Spacing.m,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.Spacing.m,
    borderRadius: Theme.Radius.m,
    gap: Theme.Spacing.m,
  },
  checkbox: {
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  taskText: {
    ...Theme.Typography.body,
    fontWeight: "500",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
});
