import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { addToWatched, getEpisodeRating, isInWatched, setEpisodeRating } from "../../services/storage";
import { getEpisodeDetails, getShowDetails as getTMDBShowDetails } from "../../services/tmdb";

/**
 * Episode detail screen
 * - Displays full episode information including description, rating, and air date
 */
export default function EpisodeDetail() {
	const { showId, seasonNumber, episodeNumber } = useLocalSearchParams();
	const router = useRouter();
	const [episode, setEpisode] = useState(null);
	const [loading, setLoading] = useState(true);
	const [personalRating, setPersonalRating] = useState(null);
	const [ratingModalVisible, setRatingModalVisible] = useState(false);
	const [isWatched, setIsWatched] = useState(false);

	useEffect(() => {
		let mounted = true;

		async function load() {
			try {
				const data = await getEpisodeDetails(showId, seasonNumber, episodeNumber);
				const rating = await getEpisodeRating(showId, seasonNumber, episodeNumber);
				const watched = await isInWatched(showId);
				if (mounted) {
					setEpisode(data);
					setPersonalRating(rating);
					setIsWatched(watched);
				}
			} catch (error) {
				console.error(error);
			} finally {
				if (mounted) setLoading(false);
			}
		}

		if (showId && seasonNumber && episodeNumber) load();

		return () => {
			mounted = false;
		};
	}, [showId, seasonNumber, episodeNumber]);

	const handleSetRating = async (rating) => {
		await setEpisodeRating(showId, seasonNumber, episodeNumber, rating);
		setPersonalRating(rating);
		setRatingModalVisible(false);
		
		// If rating an episode whose show is not in watched, add the show
		if (rating && !isWatched) {
			const showDetails = await getTMDBShowDetails(showId);
			await addToWatched(showDetails);
			setIsWatched(true);
		}
	};

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!episode) {
		return (
			<View style={styles.center}>
				<Text style={styles.notFound}>Episode not found.</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
				<Text style={styles.backText}>← Back</Text>
			</TouchableOpacity>

			<Text style={styles.title}>
				S{seasonNumber}E{episodeNumber}: {episode.name}
			</Text>

			<Text style={styles.meta}>
				⭐ {episode.vote_average?.toFixed(1) || "N/A"} • {episode.air_date || "TBA"}
			</Text>

			{/* Rating section */}
			<View style={styles.ratingSection}>
				<Text style={styles.ratingLabel}>Your Rating</Text>
				<TouchableOpacity
					style={styles.ratingButton}
					onPress={() => setRatingModalVisible(true)}
				>
					<Text style={styles.ratingButtonText}>
						{personalRating ? `${personalRating}/10 ⭐` : 'Rate This Episode'}
					</Text>
				</TouchableOpacity>
			</View>

			<Text style={styles.overview}>{episode.overview}</Text>

			{/* Rating Modal */}
			<Modal
				visible={ratingModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setRatingModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Rate This Episode</Text>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	content: {
		padding: 16,
		paddingBottom: 140,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	backButton: {
		marginBottom: 16,
	},
	backText: {
		color: "#0099ff",
		fontSize: 16,
		fontWeight: "600",
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		color: "white",
		marginBottom: 8,
	},
	meta: {
		color: "#aaa",
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
	overview: {
		color: "#ddd",
		lineHeight: 22,
		fontSize: 14,
	},
	notFound: {
		color: "#aaa",
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
