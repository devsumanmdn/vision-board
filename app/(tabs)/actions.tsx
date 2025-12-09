import { Text, View } from "@/components/Themed";
import { Theme } from "@/constants/Theme";
import { useVisionStore } from "@/store/visionStore";
import Checkbox from "expo-checkbox";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

export default function ActionsScreen() {
  const { items } = useVisionStore();
  // Filter out some real items to mix in, or just use mocks for the "funny" vibe
  // For now, let's create a static list of "Daily Failures" to avoid

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Burdens</Text>
        <Text style={styles.subtitle}>Execute or make excuses.</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggleTask(item.id)}
            style={styles.taskItem}
          >
            <Checkbox
              value={item.completed}
              onValueChange={() => toggleTask(item.id)}
              color={item.completed ? "#4CAF50" : undefined}
              style={styles.checkbox}
            />
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.taskText,
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
    backgroundColor: "rgba(150, 150, 150, 0.1)", // Subtle background
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
