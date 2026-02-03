import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ShowCard from "../../components/ShowCard";
import { getShowRating, getWatchedShows } from "../../services/storage";

// Define sorting options
const SORT_OPTIONS = [
	{ key: 'dateAdded', label: 'Date Added' },
	{ key: 'personalRatingHigh', label: 'My Rating: High to Low' },
	{ key: 'personalRatingLow', label: 'My Rating: Low to High' },
	{ key: 'tmdbRatingHigh', label: 'TMDB Rating: High to Low' },
	{ key: 'tmdbRatingLow', label: 'TMDB Rating: Low to High' },
	{ key: 'titleAZ', label: 'Title: A-Z' },
];

export default function WatchedScreen() {
	const [shows, setShows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState('dateAdded');

    // Load watched shows when screen is focused
	useFocusEffect(
		useCallback(() => {
			async function loadWatched() {
				try {
					const data = await getWatchedShows();
					// Fetch personal ratings for each show
					const showsWithRatings = await Promise.all(
						data.map(async (show) => ({
							...show,
							personalRating: await getShowRating(show.id),
						}))
					);
					setShows(showsWithRatings);
				} catch (error) {
					console.error(error);
				} finally {
					setLoading(false);
				}
			}

			setLoading(true);
			loadWatched();
		}, [])
	);

    // Sort shows based on selected criteria
	const sortedShows = [...shows].sort((a, b) => {
		switch (sortBy) {
			case 'personalRatingHigh':
				return (b.personalRating || 0) - (a.personalRating || 0);
			case 'personalRatingLow':
				return (a.personalRating || 0) - (b.personalRating || 0);
			case 'tmdbRatingHigh':
				return (b.vote_average || 0) - (a.vote_average || 0);
			case 'tmdbRatingLow':
				return (a.vote_average || 0) - (b.vote_average || 0);
			case 'titleAZ':
				return a.name.localeCompare(b.name);
			case 'dateAdded':
			default:
				return 0;
		}
	});

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (shows.length === 0) {
		return (
			<View style={styles.center}>
				<Text style={styles.emptyText}>No watched shows yet</Text>
			</View>
		);
	}

    // Display watched shows
	return (
		<View style={styles.container}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.sortBar}
				contentContainerStyle={styles.sortBarContent}
			>
				{SORT_OPTIONS.map((option) => (
					<Pressable
						key={option.key}
						style={[
							styles.sortButton,
							sortBy === option.key && styles.sortButtonActive,
						]}
						onPress={() => setSortBy(option.key)}
					>
						<Text
							style={[
								styles.sortButtonText,
								sortBy === option.key && styles.sortButtonTextActive,
							]}
						>
							{option.label}
						</Text>
					</Pressable>
				))}
			</ScrollView>

			<FlatList
				data={sortedShows}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<View>
						<ShowCard show={item} />
						{item.personalRating && (
							<View style={styles.ratingTag}>
								<Text style={styles.ratingTagText}>
									Your rating: {item.personalRating}/10 ⭐
								</Text>
							</View>
						)}
					</View>
				)}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.content}
			/>
		</View>
	);
}

// Style watched shows screen
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	sortBar: {
		paddingVertical: 12, // increased to give more vertical space
		borderBottomWidth: 1,
		borderBottomColor: '#222',
	},
	sortBarContent: {
		paddingHorizontal: 10,
		gap: 4,
		alignItems: 'center', // keep alignment on content container
	},
	sortButton: {
		paddingHorizontal: 12,
		paddingVertical: 8, // reduced so text fits comfortably
		minHeight: 36, // ensure minimum height so text isn't clipped
		borderRadius: 6,
		backgroundColor: '#1a1a1a',
		borderWidth: 1,
		borderColor: '#333',
		justifyContent: 'center',
	},
	sortButtonActive: {
		backgroundColor: '#0099ff',
		borderColor: '#0099ff',
	},
	sortButtonText: {
		color: '#aaa',
		fontSize: 12,
		fontWeight: '600',
		lineHeight: 16, // explicit lineHeight prevents bottom clipping
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
	ratingTag: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		marginHorizontal: 10,
		marginBottom: 20,
        marginTop: -20,
		backgroundColor: '#1a2a3a',
		borderRadius: 6,
		borderLeftWidth: 3,
		borderLeftColor: '#0099ff',
	},
	ratingTagText: {
		color: '#0099ff',
		fontSize: 12,
		fontWeight: '600',
	},
});
