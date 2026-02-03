import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
	const router = useRouter();

    // Display profile navigation options
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Profile</Text>

			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={styles.navButton}
					onPress={() => router.push("/profile/watched")}
				>
					<Text style={styles.buttonText}>Watched Shows</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.navButton}
					onPress={() => router.push("/profile/watchedEp")}
				>
					<Text style={styles.buttonText}>Watched Episodes</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.navButton}
					onPress={() => router.push("/profile/watchlist")}
				>
					<Text style={styles.buttonText}>Watchlist</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

// Style profile screen
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		paddingBottom: 120,
		backgroundColor: "#000",
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		color: "white",
		marginBottom: 24,
	},
	buttonContainer: {
		gap: 12,
	},
	navButton: {
		paddingVertical: 16,
		paddingHorizontal: 16,
		backgroundColor: "#1a1a1a",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#333",
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
