import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

/**
 * `ShowCard` - small presentational card used in lists.
 * Props:
 * - `show`: object returned from TMDB (expects `id`, `name`, `poster_path`, `vote_average`, ...)
 *
 * Behavior:
 * - Tapping the card navigates to `/show/{id}` using `expo-router`.
 * - Images are loaded from TMDB's image CDN using the `poster_path`.
 */
export default function ShowCard({ show }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/show/${show.id}`)}
      style={styles.card}
    >
      <Image
        // TMDB image URL pattern: /t/p/w500 + poster_path
        source={{
          uri: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
        }}
        style={styles.image}
      />

      <View style={styles.info}>
        {/* show title */}
        <Text style={styles.title}>{show.name}</Text>
        {/* rating shown to one decimal place */}
        <Text style={styles.rating}>⭐ {show.vote_average.toFixed(1)}</Text>
      </View>
    </Pressable>
  );
}

// Styles for the card component — kept simple and consistent with the app's dark theme
const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 250,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  rating: {
    marginTop: 4,
    color: "#aaa",
  },
});
