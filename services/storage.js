import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHED_KEY = 'watched_shows';
const WATCHLIST_KEY = 'watchlist_shows';
const RATINGS_KEY = 'show_ratings';
const EPISODE_RATINGS_KEY = 'episode_ratings';

/**
 * Get all watched shows
 * @returns {Promise<Array>} Array of show objects
 */
export async function getWatchedShows() {
	try {
		const data = await AsyncStorage.getItem(WATCHED_KEY);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error('Error reading watched shows:', error);
		return [];
	}
}

/**
 * Add a show to watched list
 * @param {Object} show - Show object from TMDB
 * @returns {Promise<void>}
 */
export async function addToWatched(show) {
	try {
		const watched = await getWatchedShows();
		const showId = Number(show.id);
		// Avoid duplicates
		if (!watched.find(s => Number(s.id) === showId)) {
			const normalized = { ...show, id: showId };
			watched.push(normalized);
			await AsyncStorage.setItem(WATCHED_KEY, JSON.stringify(watched));
		}
	} catch (error) {
		console.error('Error adding to watched:', error);
	}
}

/**
 * Remove a show from watched list
 * @param {number} showId - TMDB show ID
 * @returns {Promise<void>}
 */
export async function removeFromWatched(showId) {
	try {
		const id = Number(showId);
		const watched = await getWatchedShows();
		const filtered = watched.filter(s => Number(s.id) !== id);
		await AsyncStorage.setItem(WATCHED_KEY, JSON.stringify(filtered));
	} catch (error) {
		console.error('Error removing from watched:', error);
	}
}

/**
 * Check if a show is in watched list
 * @param {number} showId - TMDB show ID
 * @returns {Promise<boolean>}
 */
export async function isInWatched(showId) {
	try {
		const id = Number(showId);
		const watched = await getWatchedShows();
		return watched.some(s => Number(s.id) === id);
	} catch (error) {
		console.error('Error checking watched:', error);
		return false;
	}
}

/**
 * Get all watchlist shows
 * @returns {Promise<Array>} Array of show objects
 */
export async function getWatchlistShows() {
	try {
		const data = await AsyncStorage.getItem(WATCHLIST_KEY);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error('Error reading watchlist:', error);
		return [];
	}
}

/**
 * Add a show to watchlist
 * @param {Object} show - Show object from TMDB
 * @returns {Promise<void>}
 */
export async function addToWatchlist(show) {
	try {
		const watchlist = await getWatchlistShows();
		const showId = Number(show.id);
		// Avoid duplicates
		if (!watchlist.find(s => Number(s.id) === showId)) {
			const normalized = { ...show, id: showId };
			watchlist.push(normalized);
			await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
		}
	} catch (error) {
		console.error('Error adding to watchlist:', error);
	}
}

/**
 * Remove a show from watchlist
 * @param {number} showId - TMDB show ID
 * @returns {Promise<void>}
 */
export async function removeFromWatchlist(showId) {
	try {
		const id = Number(showId);
		const watchlist = await getWatchlistShows();
		const filtered = watchlist.filter(s => Number(s.id) !== id);
		await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
	} catch (error) {
		console.error('Error removing from watchlist:', error);
	}
}

/**
 * Check if a show is in watchlist
 * @param {number} showId - TMDB show ID
 * @returns {Promise<boolean>}
 */
export async function isInWatchlist(showId) {
	try {
		const id = Number(showId);
		const watchlist = await getWatchlistShows();
		return watchlist.some(s => Number(s.id) === id);
	} catch (error) {
		console.error('Error checking watchlist:', error);
		return false;
	}
}

/**
 * Get personal rating for a show
 * @param {number} showId - TMDB show ID
 * @returns {Promise<number|null>} - Rating (1-10) or null if not rated
 */
export async function getShowRating(showId) {
	try {
		const data = await AsyncStorage.getItem(RATINGS_KEY);
		const ratings = data ? JSON.parse(data) : {};
		return ratings[String(showId)] ?? null;
	} catch (error) {
		console.error('Error getting show rating:', error);
		return null;
	}
}

/**
 * Set personal rating for a show
 * @param {number} showId - TMDB show ID
 * @param {number} rating - Rating 1-10
 * @returns {Promise<void>}
 */
export async function setShowRating(showId, rating) {
	try {
		const data = await AsyncStorage.getItem(RATINGS_KEY);
		const ratings = data ? JSON.parse(data) : {};
		const key = String(showId);
		if (rating === null || rating === 0) {
			delete ratings[key];
		} else {
			ratings[key] = Math.min(10, Math.max(1, rating));
		}
		await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
	} catch (error) {
		console.error('Error setting show rating:', error);
	}
}

/**
 * Get personal rating for an episode
 * @param {number} showId - TMDB show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 * @returns {Promise<number|null>} - Rating (1-10) or null if not rated
 */
export async function getEpisodeRating(showId, seasonNumber, episodeNumber) {
	try {
		const data = await AsyncStorage.getItem(EPISODE_RATINGS_KEY);
		const ratings = data ? JSON.parse(data) : {};
		const key = `${String(showId)}_${seasonNumber}_${episodeNumber}`;
		return ratings[key] ?? null;
	} catch (error) {
		console.error('Error getting episode rating:', error);
		return null;
	}
}

/**
 * Set personal rating for an episode
 * @param {number} showId - TMDB show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 * @param {number} rating - Rating 1-10
 * @returns {Promise<void>}
 */
export async function setEpisodeRating(showId, seasonNumber, episodeNumber, rating) {
	try {
		const data = await AsyncStorage.getItem(EPISODE_RATINGS_KEY);
		const ratings = data ? JSON.parse(data) : {};
		const key = `${String(showId)}_${seasonNumber}_${episodeNumber}`;
		if (rating === null || rating === 0) {
			delete ratings[key];
		} else {
			ratings[key] = Math.min(10, Math.max(1, rating));
		}
		await AsyncStorage.setItem(EPISODE_RATINGS_KEY, JSON.stringify(ratings));
	} catch (error) {
		console.error('Error setting episode rating:', error);
	}
}

/**
 * Get all episode ratings for a show
 * @param {number} showId - TMDB show ID
 * @returns {Promise<Object>} - Object with keys like "1_1_1" (season_episode) and rating values
 */
export async function getShowEpisodeRatings(showId) {
	try {
		const data = await AsyncStorage.getItem(EPISODE_RATINGS_KEY);
		const allRatings = data ? JSON.parse(data) : {};
		const showRatings = {};
		const prefix = `${String(showId)}_`;
		Object.entries(allRatings).forEach(([key, rating]) => {
			if (key.startsWith(prefix)) {
				showRatings[key] = rating;
			}
		});
		return showRatings;
	} catch (error) {
		console.error('Error getting show episode ratings:', error);
		return {};
	}
}
