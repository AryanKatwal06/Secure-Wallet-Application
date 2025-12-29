import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle } from "lucide-react-native";
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found", headerShown: false }} />
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle size={64} color="#ef4444" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.subtitle}>
            This screen doesn&apos;t exist.
          </Text>
          <Link href="/dashboard" asChild>
            <View style={styles.button}>
              <Text style={styles.linkText}>Go to Dashboard</Text>
            </View>
          </Link>
        </View>
      </LinearGradient>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
  },
});