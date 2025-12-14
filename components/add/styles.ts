import { StyleSheet } from "react-native";

export const addStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 100,
    padding: 8,
  },
  content: {
    gap: 24,
    flex: 1,
    marginTop: 40,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  // Setup Stage
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1.5,
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
    gap: 8,
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    textAlignVertical: "top",
  },
  btn: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  // Interview Stage - Chat
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBubble: {
    backgroundColor: "rgba(60, 60, 70, 0.95)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    marginLeft: 0,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
    marginRight: 0,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#fff",
  },
  inputBar: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 0,
  },
  textInputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  // Proposal Stage
  motivationBox: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  motivationRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  motivationText: {
    fontSize: 16,
    flex: 1,
    fontStyle: "italic",
  },
  scheduleBox: {
    gap: 12,
    marginTop: 20,
  },
  scheduleCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    backgroundColor: "rgba(127,127,127,0.05)",
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scheduleTime: {
    fontWeight: "bold",
    fontSize: 16,
  },
  scheduleType: {
    fontSize: 12,
    opacity: 0.7,
  },
  scheduleTask: {
    fontSize: 16,
  },
  daysRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 20,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
