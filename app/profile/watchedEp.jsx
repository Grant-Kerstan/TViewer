import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getEpisodeRating, getWatchedShows } from "../../services/storage";
import { getShowEpisodes } from "../../services/tmdb";

// Define sorting options
const SORT_OPTIONS = [
	{ key: 'dateAdded', label: 'Date Added' },
	{ key: 'personalRatingHigh', label: 'My Rating: High to Low' },
	{ key: 'personalRatingLow', label: 'My Rating: Low to High' },
	{ key: 'tmdbRatingHigh', label: 'TMDB Rating: High to Low' },
	{ key: 'tmdbRatingLow', label: 'TMDB Rating: Low to High' },
];

export default function WatchedEpisodesScreen() {
	const router = useRouter();
	const [episodes, setEpisodes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState('dateAdded');

    // Load watched episodes when screen is focused
	useFocusEffect(
		useCallback(() => {
			async function loadWatchedEpisodes() {
				try {
					const watchedShows = await getWatchedShows();
					const allEpisodes = [];

					for (const show of watchedShows) {
						for (let season = 1; season <= (show.number_of_seasons || 0); season++) {
							try {
								const seasonData = await getShowEpisodes(show.id, season);
								if (seasonData && seasonData.episodes) {
									for (const episode of seasonData.episodes) {
										const personalRating = await getEpisodeRating(show.id, season, episode.episode_number);
										allEpisodes.push({
											showId: show.id,
											showName: show.name,
											seasonNumber: season,
											...episode,
											personalRating,
										});
									}
								}
							} catch (err) {
								console.error(`Error fetching season ${season}:`, err);
							}
						}
					}

					setEpisodes(allEpisodes);
				} catch (error) {
					console.error(error);
				} finally {
					setLoading(false);
				}
			}

			setLoading(true);
			loadWatchedEpisodes();
		}, [])
	);

    // Sort episodes based on selected criteria
	const sortedEpisodes = [...episodes].sort((a, b) => {
		switch (sortBy) {
			case 'personalRatingHigh':
				return (b.personalRating || 0) - (a.personalRating || 0);
			case 'personalRatingLow':
				return (a.personalRating || 0) - (b.personalRating || 0);
			case 'tmdbRatingHigh':
				return (b.vote_average || 0) - (a.vote_average || 0);
			case 'tmdbRatingLow':
				return (a.vote_average || 0) - (b.vote_average || 0);
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

    // If no watched episodes
	if (episodes.length === 0) {
		return (
			<View style={styles.center}>
				<Text style={styles.emptyText}>No watched episodes yet</Text>
			</View>
		);
	}

    // Display watched episodes
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

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{sortedEpisodes.map((episode) => (
					<Pressable
						key={`${episode.showId}_${episode.seasonNumber}_${episode.episode_number}`}
						style={styles.episodeCard}
						onPress={() =>
							router.push({
								pathname: "/show/episode",
								params: {
									showId: episode.showId,
									seasonNumber: episode.seasonNumber,
									episodeNumber: episode.episode_number,
								},
							})
						}
					>
						<View style={styles.episodeHeader}>
							<Text style={styles.showName}>{episode.showName}</Text>
							<Text style={styles.episodeNumber}>
								S{episode.seasonNumber}E{episode.episode_number}
							</Text>
						</View>
						<Text style={styles.episodeName}>{episode.name}</Text>
						<View style={styles.ratingRow}>
							<Text style={styles.tmdbRating}>
								⭐ TMDB: {episode.vote_average?.toFixed(1) || 'N/A'}
							</Text>
							{episode.personalRating && (
								<Text style={styles.personalRating}>
									👤 You: {episode.personalRating}/10
								</Text>
							)}
						</View>
						{episode.overview && (
							<Text style={styles.overview} numberOfLines={2}>
								{episode.overview}
							</Text>
						)}
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}

// Style watched episodes screen
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	sortBar: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#222',
	},
	sortBarContent: {
		paddingHorizontal: 10,
		gap: 8,
		alignItems: 'center',
	},
	sortButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		minHeight: 36,
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
		lineHeight: 16,
	},
	content: {
		padding: 10,
		paddingBottom: 120,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: {
		color: "#aaa",
		fontSize: 16,
	},
	episodeCard: {
		backgroundColor: '#1a1a1a',
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#333',
	},
	episodeHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	showName: {
		color: '#0099ff',
		fontSize: 12,
		fontWeight: '600',
	},
	episodeNumber: {
		color: '#aaa',
		fontSize: 12,
		fontWeight: '600',
	},
	episodeName: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 8,
	},
	ratingRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 8,
	},
	tmdbRating: {
		color: '#aaa',
		fontSize: 12,
	},
	personalRating: {
		color: '#0099ff',
		fontSize: 12,
		fontWeight: '600',
	},
	overview: {
		color: '#999',
		fontSize: 11,
		lineHeight: 16,
	},
});
