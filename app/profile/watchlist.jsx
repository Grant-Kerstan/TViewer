import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import ShowCard from "../../components/ShowCard";
import { getWatchlistShows } from "../../services/storage";

export default function WatchlistScreen() {
	const [shows, setShows] = useState([]);
	const [loading, setLoading] = useState(true);

	useFocusEffect(
		useCallback(() => {
			async function loadWatchlist() {
				try {
					const data = await getWatchlistShows();
					setShows(data);
				} catch (error) {
					console.error(error);
				} finally {
					setLoading(false);
				}
			}

			setLoading(true);
			loadWatchlist();
		}, [])
	);

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}
    // If no shows in watchlist
	if (shows.length === 0) {
		return (
			<View style={styles.center}>
				<Text style={styles.emptyText}>No shows in your watchlist</Text>
			</View>
		);
	}

    // Display watchlist shows
	return (
		<FlatList
			data={shows}
			keyExtractor={(item) => item.id.toString()}
			renderItem={({ item }) => <ShowCard show={item} />}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.content}
			style={styles.container}
		/>
	);
}

// Style watchlist screen
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	content: {
		padding: 10,
		paddingBottom: 120,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000",
	},
	emptyText: {
		color: "#aaa",
		fontSize: 16,
	},
});
