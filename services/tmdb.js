// TMDB API configuration
// NOTE: the API key is currently hard-coded for convenience in development.
// Move this to environment variables before shipping to production.
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Fetch a page of popular TV shows from TMDB.
 * @param {number} page - TMDB page number (defaults to 1)
 * @returns {Promise<Object>} - TMDB JSON response (contains `results` array)
 */
export async function getPopularShows(page = 1) {
  const response = await fetch(
    `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  return response.json();
}

/**
 * Get trending TV shows (day/week).
 * Uses TMDB `/trending/tv/{time_window}` endpoint.
 */
export async function getTrendingShows(time_window = "week", page = 1) {
  // TMDB trending endpoint supports paging via the `page` query parameter.
  const response = await fetch(
    `${BASE_URL}/trending/tv/${time_window}?api_key=${API_KEY}&page=${page}`
  );
  return response.json();
}

/**
 * Discover TV shows with optional query params (used for Featured and custom discover queries).
 * Example: `/discover/tv?sort_by=first_air_date.desc` for newest ordering.
 */
export async function discoverShows(query = "", page = 1) {
  const q = query ? `&${query}` : "";
  const response = await fetch(
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}${q}`
  );
  return response.json();
}

/**
 * Get newest shows using discover sorted by first air date (descending).
 */
export async function getNewestShows(page = 1) {
  const today = new Date().toISOString().split("T")[0];
  const sixtyDaysAgo = new Date(
    Date.now() - 60 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  return discoverShows(
    `${BASE_URL}/discover/tv?api_key=${API_KEY}` +
      `&sort_by=last_air_date.desc` +
      `&last_air_date.gte=${sixtyDaysAgo}` +
      `&last_air_date.lte=${today}` +
      `&include_null_first_air_dates=false` +
      `&with_type=Scripted` +
      `&vote_count.gte=10`,
    page
  );
}

/**
 * Get top rated TV shows from TMDB.
 */
export async function getTopRatedShows(page = 1) {
  const response = await fetch(
    `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  return response.json();
}

/**
 * Fetch a generic discover/featured page. Returns the server results directly.
 */
export async function getFeaturedShows(page = 1) {
  return discoverShows("", page);
}

/**
 * Search TV shows by query string.
 * @param {string} query - Search term
 * @returns {Promise<Object>} - TMDB JSON response with `results`
 */
export async function searchShows(query) {
  const response = await fetch(
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}`
  );
  return response.json();
}

/**
 * Get detailed information for a single show by TMDB id.
 * @param {number|string} id - TMDB tv id
 * @returns {Promise<Object>} - Show details JSON
 */
export async function getShowDetails(id) {
  const response = await fetch(
    `${BASE_URL}/tv/${id}?api_key=${API_KEY}`
  );
  return response.json();
}

/**
 * Get credits (cast & crew) for a show.
 * The `cast` array is used by the UI to show actors and characters.
 * @param {number|string} id - TMDB tv id
 * @returns {Promise<Object>} - Credits JSON (contains `cast`)
 */
export async function getShowCredits(id) {
  const response = await fetch(
    `${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}`
  );
  return response.json();
}

/**
 * Get episodes for a specific season of a show.
 * @param {number|string} id - TMDB tv id
 * @param {number|string} seasonNumber - Season number
 * @returns {Promise<Object>} - Season details JSON (contains `episodes` array)
 */
export async function getShowEpisodes(id, seasonNumber) {
	const response = await fetch(
		`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`
	);
	return response.json();
}

/**
 * Get details for a specific episode.
 * @param {number|string} id - TMDB tv id
 * @param {number|string} seasonNumber - Season number
 * @param {number|string} episodeNumber - Episode number
 * @returns {Promise<Object>} - Episode details JSON
 */
export async function getEpisodeDetails(id, seasonNumber, episodeNumber) {
	const response = await fetch(
		`${BASE_URL}/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${API_KEY}`
	);
	return response.json();
}
