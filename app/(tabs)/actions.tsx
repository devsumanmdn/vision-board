import { Text, View } from "@/components/Themed";
import { Theme } from "@/constants/Theme";
import { useColorScheme } from "@/context/ThemeContext";
import { useTaskCompletionStore } from "@/store/taskCompletionStore";
import { ScheduleItem, useVisionStore } from "@/store/visionStore";
import Checkbox from "expo-checkbox";
import { useEffect, useMemo } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

interface TodayTask {
  id: string;
  taskId: string;
  visionId: string;
  visionText: string;
  task: string;
  time: string;
  type: ScheduleItem["type"];
}

export default function ActionsScreen() {
  const { items } = useVisionStore();
  const { completions, loadTodayCompletions, toggleTaskCompletion } =
    useTaskCompletionStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Theme-aware colors
  const backgroundColor = isDark ? "#0a0a0a" : "#F8F8FA";
  const textColor = isDark ? "#FFFFFF" : "#1a1a1a";
  const secondaryText = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const taskBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";
  const checkboxBorder = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)";
  const tintColor = isDark ? "#8B5CF6" : "#7C3AED";

  // Load completions on mount
  useEffect(() => {
    loadTodayCompletions();
  }, []);

  // Get today's day of week (0 = Sunday, 6 = Saturday)
  const todayDayIndex = new Date().getDay();

  // Calculate today's tasks from active plans
  const todayTasks = useMemo(() => {
    const tasks: TodayTask[] = [];

    items.forEach((item) => {
      // Only include active plans (has startedAt)
      if (!item.startedAt || !item.schedule || item.schedule.length === 0) {
        return;
      }

      // Filter schedule items that are active today
      item.schedule.forEach((scheduleItem) => {
        if (scheduleItem.activeDays.includes(todayDayIndex)) {
          tasks.push({
            id: `${item.id}_${scheduleItem.id}`,
            taskId: scheduleItem.id,
            visionId: item.id,
            visionText: item.text,
            task: scheduleItem.task,
            time: scheduleItem.time,
            type: scheduleItem.type,
          });
        }
      });
    });

    // Sort by time
    return tasks.sort((a, b) => a.time.localeCompare(b.time));
  }, [items, todayDayIndex]);

  const toggleTask = (taskId: string) => {
    toggleTaskCompletion(taskId);
  };

  const hasNoActivePlans = items.every((item) => !item.startedAt);
  const hasActivePlansButNoTasksToday =
    !hasNoActivePlans && todayTasks.length === 0;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: "transparent" }]}>
        <Text style={[styles.title, { color: textColor }]}>
          Today's Burdens
        </Text>
        <Text style={[styles.subtitle, { color: secondaryText }]}>
          {todayTasks.length > 0
            ? `${todayTasks.length} task${
                todayTasks.length === 1 ? "" : "s"
              } scheduled`
            : "Execute or make excuses."}
        </Text>
      </View>

      {hasNoActivePlans ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: textColor }]}>
            No Active Plans
          </Text>
          <Text style={[styles.emptyStateText, { color: secondaryText }]}>
            Start a plan from a vision to see your daily tasks here.
          </Text>
        </View>
      ) : hasActivePlansButNoTasksToday ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: textColor }]}>
            Rest Day
          </Text>
          <Text style={[styles.emptyStateText, { color: secondaryText }]}>
            No tasks scheduled for today. Enjoy the break!
          </Text>
        </View>
      ) : (
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isCompleted = completions[item.id] || false;
            return (
              <Pressable
                onPress={() => toggleTask(item.id)}
                style={[styles.taskItem, { backgroundColor: taskBg }]}
              >
                <Checkbox
                  value={isCompleted}
                  onValueChange={() => toggleTask(item.id)}
                  color={isCompleted ? "#4CAF50" : checkboxBorder}
                  style={styles.checkbox}
                />
                <View
                  style={[
                    styles.textContainer,
                    { backgroundColor: "transparent" },
                  ]}
                >
                  <View style={styles.taskHeader}>
                    <Text style={[styles.taskTime, { color: tintColor }]}>
                      {item.time}
                    </Text>
                    <Text style={[styles.taskType, { color: secondaryText }]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.taskText,
                      { color: textColor },
                      isCompleted && styles.completedText,
                    ]}
                  >
                    {item.task}
                  </Text>
                  <Text
                    style={[styles.visionLabel, { color: secondaryText }]}
                    numberOfLines={1}
                  >
                    {item.visionText}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
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
    alignItems: "flex-start",
    padding: Theme.Spacing.m,
    borderRadius: Theme.Radius.m,
    gap: Theme.Spacing.m,
  },
  checkbox: {
    borderRadius: 4,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskTime: {
    fontSize: 12,
    fontWeight: "bold",
  },
  taskType: {
    fontSize: 10,
    opacity: 0.7,
  },
  taskText: {
    ...Theme.Typography.body,
    fontWeight: "500",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  visionLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.Spacing.xl,
  },
  emptyStateTitle: {
    ...Theme.Typography.h2,
    marginBottom: Theme.Spacing.s,
    textAlign: "center",
  },
  emptyStateText: {
    ...Theme.Typography.body,
    textAlign: "center",
    opacity: 0.7,
  },
});
