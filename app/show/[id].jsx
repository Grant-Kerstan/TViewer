import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { addToWatched, addToWatchlist, getShowRating, isInWatched, isInWatchlist, removeFromWatched, removeFromWatchlist, setShowRating } from "../../services/storage";
import { getShowCredits, getShowDetails, getShowEpisodes } from "../../services/tmdb";

/**
 * ShowDetail screen
 */
export default function ShowDetail() {
	const { id } = useLocalSearchParams();
	const router = useRouter();

	// local UI state
	const [show, setShow] = useState(null);
	const [cast, setCast] = useState([]);
	const [episodes, setEpisodes] = useState({});
	const [loading, setLoading] = useState(true);
	const [isWatched, setIsWatched] = useState(false);
	const [inWatchlist, setInWatchlist] = useState(false);
	const [personalRating, setPersonalRating] = useState(null);
	const [ratingModalVisible, setRatingModalVisible] = useState(false);

	useEffect(() => {
		let mounted = true;

		async function load() {
			try {
				const [details, credits] = await Promise.all([
					getShowDetails(id),
					getShowCredits(id),
				]);

				if (mounted) {
					setShow(details);
					setCast((credits && credits.cast) || []);
				}

				// Fetch episodes for each season
				if (mounted && details && details.number_of_seasons > 0) {
					const episodesBySeason = {};
					for (let season = 1; season <= details.number_of_seasons; season++) {
						try {
							const seasonEpisodes = await getShowEpisodes(id, season);
							if (mounted && seasonEpisodes && seasonEpisodes.episodes) {
								episodesBySeason[season] = seasonEpisodes.episodes;
							}
						} catch (err) {
							console.error(`Error fetching season ${season}:`, err);
						}
					}
					if (mounted) {
						setEpisodes(episodesBySeason);
					}
				}

				// Check watched and watchlist status
				if (mounted) {
					const watched = await isInWatched(id);
					const inWatchlist = await isInWatchlist(id);
					const rating = await getShowRating(id);
					setIsWatched(watched);
					setInWatchlist(inWatchlist);
					setPersonalRating(rating);
				}
			} catch (error) {
				console.error(error);
			} finally {
				if (mounted) setLoading(false);
			}
		}

		if (id) load();

		return () => {
			mounted = false;
		};
	}, [id]);

	// Refresh status when screen comes into focus
	useFocusEffect(
		useCallback(() => {
			async function checkStatus() {
				const watched = await isInWatched(id);
				const inWatchlist = await isInWatchlist(id);
				const rating = await getShowRating(id);
				setIsWatched(watched);
				setInWatchlist(inWatchlist);
				setPersonalRating(rating);
			}
			checkStatus();
		}, [id])
	);

	// Loading state: show a centered activity indicator
	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	// If no show data is available show a simple message
	if (!show) {
		return (
			<View style={styles.center}>
				<Text>Show not found.</Text>
			</View>
		);
	}

	// Build poster URL from TMDB poster_path (null if not available)
	const poster = show.poster_path
		? `https://image.tmdb.org/t/p/w500${show.poster_path}`
		: null;

	// Toggle watched status
	const handleToggleWatched = async () => {
		if (isWatched) {
			await removeFromWatched(id);
		} else {
			await addToWatched(show);
		}
		setIsWatched(!isWatched);
	};

	// Toggle watchlist status
	const handleToggleWatchlist = async () => {
		if (inWatchlist) {
			await removeFromWatchlist(id);
		} else {
			await addToWatchlist(show);
		}
		setInWatchlist(!inWatchlist);
	};

	const handleSetRating = async (rating) => {
		await setShowRating(id, rating);
		setPersonalRating(rating);
		setRatingModalVisible(false);
		
		// If rating a show that's not in watched, add it
		if (rating && !isWatched) {
			await addToWatched(show);
			setIsWatched(true);
		}
	};

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			{/* Poster image (if available) */}
			{poster && <Image source={{ uri: poster }} style={styles.image} />}

			<View style={styles.info}>
				{/* Title, rating and air date */}
				<Text style={styles.title}>{show.name}</Text>
				<Text style={styles.meta}>⭐ {show.vote_average?.toFixed(1)} • {show.first_air_date}</Text>
				{/* Show total episodes and approx total runtime in hours */}
				{typeof show.number_of_episodes !== 'undefined' && (
					(() => {
						const episodes = show.number_of_episodes || 0;
						// episode_run_time is an array (minutes) — take average if present
						const runtimes = Array.isArray(show.episode_run_time) ? show.episode_run_time : [];
						let avgRuntime = 0;
						if (runtimes.length > 0) {
							avgRuntime = runtimes.reduce((s, v) => s + (v || 0), 0) / runtimes.length;
						}
						// fallback: if average runtime is 0, try `episode_run_time` numeric field
						if (!avgRuntime && typeof show.episode_run_time === 'number') {
							avgRuntime = show.episode_run_time;
						}

						const totalMinutes = Math.round(avgRuntime * episodes);
						const totalHours = Math.round((totalMinutes / 60));
                        const extraMinutes = (avgRuntime * episodes % 60);
                        if (totalHours > 0 && totalMinutes > 0) {
					        return (
							    <Text style={styles.meta}>{episodes} ep{episodes === 1 ? '' : 's'} • {totalHours} hrs {extraMinutes} mins</Text>
                            );
                        } else {
                            return (
                            <Text style={styles.meta}>{episodes} ep{episodes === 1 ? '' : 's'} </Text>
                                );
                            }

					})()
				)}

				{/* Overview/summary */}
				<Text style={styles.overview}>{show.overview}</Text>

				{/* Rating section */}
				<View style={styles.ratingSection}>
					<Text style={styles.ratingLabel}>Your Rating</Text>
					<TouchableOpacity
						style={styles.ratingButton}
						onPress={() => setRatingModalVisible(true)}
					>
						<Text style={styles.ratingButtonText}>
							{personalRating ? `${personalRating}/10 ⭐` : 'Rate This Show'}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Action buttons */}
				<View style={styles.buttonRow}>
					<TouchableOpacity
						style={[styles.button, isWatched && styles.buttonActive]}
						onPress={handleToggleWatched}
					>
						<Text style={[styles.buttonText, isWatched && styles.buttonTextActive]}>
							{isWatched ? '✓ Watched' : '+ Watched'}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, inWatchlist && styles.buttonActive]}
						onPress={handleToggleWatchlist}
					>
						<Text style={[styles.buttonText, inWatchlist && styles.buttonTextActive]}>
							{inWatchlist ? '✓ Watchlist' : '+ Watchlist'}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Horizontal cast list (up to 20 members) */}
				{cast.length > 0 && (
					<View style={styles.castSection}>
						<Text style={styles.sectionTitle}>Cast</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							{cast.slice(0, 20).map((member) => (
								<View key={member.id} style={styles.castItem}>
									{member.profile_path ? (
										<Image
											source={{ uri: `https://image.tmdb.org/t/p/w185${member.profile_path}` }}
											style={styles.castImage}
										/>
									) : (
										<View style={[styles.castImage, styles.castPlaceholder]} />
									)}
									<Text style={styles.castName} numberOfLines={1}>{member.name}</Text>
									<Text style={styles.castChar} numberOfLines={1}>{member.character}</Text>
								</View>
							))}
						</ScrollView>
					</View>
				)}
			</View>

			{/* Episodes grid by season */}
			{Object.keys(episodes).length > 0 && (
				<View style={styles.episodesSection}>
					<Text style={styles.sectionTitle}>Episodes</Text>
					{Object.entries(episodes)
						.sort(([seasonA], [seasonB]) => parseInt(seasonA) - parseInt(seasonB))
						.map(([season, seasonEpisodes]) => (
							<View key={season}>
								<Text style={styles.seasonTitle}>Season {season}</Text>
								<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.episodeRow}>
									{seasonEpisodes.map((episode) => (
										<TouchableOpacity
											key={episode.id}
											style={styles.episodeBox}
											onPress={() =>
												router.push({
													pathname: "/show/episode",
													params: {
														showId: id,
														seasonNumber: season,
														episodeNumber: episode.episode_number,
													},
												})
											}
										>
											<Text style={styles.episodeName} numberOfLines={2}>
												{episode.episode_number}. {episode.name}
											</Text>
											<Text style={styles.episodeRating}>
												⭐ {episode.vote_average?.toFixed(1) || "N/A"}
											</Text>
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						))}
				</View>
			)}

			{/* Rating Modal */}
			<Modal
				visible={ratingModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setRatingModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Rate This Show</Text>
						<View style={styles.ratingGrid}>
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
								<TouchableOpacity
									key={rating}
									style={[
										styles.ratingOption,
										personalRating === rating && styles.ratingOptionSelected,
									]}
									onPress={() => handleSetRating(rating)}
								>
									<Text
										style={[
											styles.ratingOptionText,
											personalRating === rating && styles.ratingOptionTextSelected,
										]}
									>
										{rating}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						{personalRating && (
							<TouchableOpacity
								style={styles.clearRatingButton}
								onPress={() => handleSetRating(null)}
							>
								<Text style={styles.clearRatingText}>Clear Rating</Text>
							</TouchableOpacity>
						)}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => setRatingModalVisible(false)}
						>
							<Text style={styles.closeButtonText}>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}

// Styles for the show detail screen 
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	content: {
		paddingBottom: 140,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	image: {
		width: "100%",
		height: 450,
		resizeMode: "cover",
	},
	info: {
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		color: "white",
		marginBottom: 8,
	},
	meta: {
		color: "#aaa",
		marginBottom: 12,
	},
	overview: {
		color: "#ddd",
		lineHeight: 20,
		marginBottom: 16,
	},
	ratingSection: {
		marginBottom: 16,
	},
	ratingLabel: {
		color: "#aaa",
		fontSize: 12,
		marginBottom: 8,
		fontWeight: "600",
	},
	ratingButton: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#1a1a1a",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#333",
		alignItems: "center",
	},
	ratingButtonText: {
		color: "#0099ff",
		fontWeight: "600",
		fontSize: 14,
	},
	buttonRow: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 16,
	},
	button: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		backgroundColor: "#1a1a1a",
		borderWidth: 1,
		borderColor: "#333",
		alignItems: "center",
	},
	buttonActive: {
		backgroundColor: "#0099ff",
		borderColor: "#0099ff",
	},
	buttonText: {
		color: "#aaa",
		fontWeight: "600",
		fontSize: 14,
	},
	buttonTextActive: {
		color: "white",
	},
	castSection: {
		paddingVertical: 16,
	},
	sectionTitle: {
		color: "white",
		fontSize: 18,
		fontWeight: "700",
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	castItem: {
		width: 100,
		marginHorizontal: 8,
		alignItems: "center",
	},
	castImage: {
		width: 100,
		height: 140,
		borderRadius: 8,
		backgroundColor: "#222",
	},
	castPlaceholder: {
		justifyContent: "center",
		alignItems: "center",
	},
	castName: {
		marginTop: 6,
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
	},
	castChar: {
		color: "#aaa",
		fontSize: 11,
	},
	episodesSection: {
		paddingVertical: 16,
	},
	seasonTitle: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		paddingHorizontal: 16,
		marginTop: 12,
		marginBottom: 8,
	},
	episodeRow: {
		paddingHorizontal: 16,
		marginBottom: 16,
	},
	episodeBox: {
		width: 140,
		backgroundColor: "#1a1a1a",
		borderRadius: 8,
		padding: 10,
		marginRight: 8,
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#333",
	},
	episodeName: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
		marginBottom: 8,
		lineHeight: 16,
	},
	episodeRating: {
		color: "#aaa",
		fontSize: 11,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.8)",
	},
	modalContent: {
		backgroundColor: "#1a1a1a",
		borderRadius: 12,
		padding: 20,
		width: "80%",
		borderWidth: 1,
		borderColor: "#333",
	},
	modalTitle: {
		color: "white",
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 16,
		textAlign: "center",
	},
	ratingGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-around",
		marginBottom: 16,
	},
	ratingOption: {
		width: "22%",
		aspectRatio: 1,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
		backgroundColor: "#0b0b0b",
		borderWidth: 1,
		borderColor: "#333",
		marginBottom: 8,
	},
	ratingOptionSelected: {
		backgroundColor: "#0099ff",
		borderColor: "#0099ff",
	},
	ratingOptionText: {
		color: "#aaa",
		fontWeight: "700",
		fontSize: 14,
	},
	ratingOptionTextSelected: {
		color: "white",
	},
	clearRatingButton: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#330000",
		borderRadius: 8,
		marginBottom: 8,
		alignItems: "center",
	},
	clearRatingText: {
		color: "#ff6b6b",
		fontWeight: "600",
	},
	closeButton: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#333",
		borderRadius: 8,
		alignItems: "center",
	},
	closeButtonText: {
		color: "white",
		fontWeight: "600",
	},
});
