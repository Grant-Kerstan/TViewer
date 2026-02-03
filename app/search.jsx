import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ShowCard from "../components/ShowCard";
import { getPopularShows, searchShows } from "../services/tmdb";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPopular() {
      try {
        const data = await getPopularShows();
        setShows(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadPopular();
  }, []);

  // Find shows based on search query
  async function handleSearch() {
    setLoading(true);
    try {
      if (!query || query.trim() === "") {
        const data = await getPopularShows();
        setShows(data.results || []);
      } else {
        const data = await searchShows(query.trim());
        setShows(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Display search data
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search shows"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={shows}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ShowCard show={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

// style search bar
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
