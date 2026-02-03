import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ShowCard from "../components/ShowCard";
import {
  getFeaturedShows,
  getNewestShows,
  getPopularShows,
  getTopRatedShows,
  getTrendingShows,
} from "../services/tmdb";

export default function HomeScreen() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Default filter: set to 'trending' so Trending is active on first load
  const [filter, setFilter] = useState("trending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function loadShows() {
      try {
        // initial load depends on the default filter (trending)
        let data;
        if (filter === "trending") {
          data = await getTrendingShows("week", 1);
        } else if (filter === "newest") {
          data = await getNewestShows(1);
        } else if (filter === "highest") {
          data = await getTopRatedShows(1);
        } else if (filter === "featured") {
          data = await getFeaturedShows(1);
        } else {
          data = await getPopularShows(1);
        }

        setShows(data.results || []);
        setPage(data.page || 1);
        setTotalPages(data.total_pages || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadShows();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (

    // create filter bar
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {[
          { key: "trending", label: "Trending" },
          { key: "newest", label: "Newest" },
          { key: "highest", label: "Highest Rating" },
          { key: "featured", label: "Featured" },
        ].map((f) => (
          <Pressable
            key={f.key}
            onPress={async () => {
              if (filter === f.key) return;
              setFilter(f.key);
              setLoading(true);
              try {
                let data;
                if (f.key === "trending") {
                  data = await getTrendingShows("week", 1);
                } else if (f.key === "newest") {
                  data = await getNewestShows(1);
                } else if (f.key === "highest") {
                  data = await getTopRatedShows(1);
                } else if (f.key === "featured") {
                  data = await getFeaturedShows(1);
                } else {
                  data = await getPopularShows(1);
                }

                setShows(data.results || []);
                setPage(data.page || 1);
                setTotalPages(data.total_pages || null);
              } catch (err) {
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
            style={[styles.filterItem, filter === f.key && styles.filterItemActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={shows}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ShowCard show={item} />}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        contentContainerStyle={{ paddingBottom: 120 }}
        onRefresh={async () => {

          // If filter is 'newest' or 'highest', do not change results on pull-to-refresh
          if (filter === "newest" || filter === "highest") {
            setRefreshing(false);
            return;
          }

          // Refresh show data
          setRefreshing(true);
          try {
            if (filter === "trending") {
              const data = await getTrendingShows("week", 1);
              setShows(data.results || []);
              setPage(data.page || 1);
              setTotalPages(data.total_pages || null);
            } else if (filter === "featured") {
              // fetch a random discover page to vary featured results
              const p = Math.floor(Math.random() * 5) + 1;
              const data = await getFeaturedShows(p);
              setShows(data.results || []);
              setPage(data.page || p);
              setTotalPages(data.total_pages || null);
            } else {
              // fallback to popular
              const p = Math.floor(Math.random() * 5) + 1;
              const data = await getPopularShows(p);
              setShows(data.results || []);
              setPage(data.page || p);
              setTotalPages(data.total_pages || null);
            }
          } catch (err) {
            console.error(err);
          } finally {
            setRefreshing(false);
          }
        }}
        onEndReachedThreshold={0.5}
        onEndReached={async () => {
          // avoid duplicate loads
          if (loadingMore) return;

          // if we know totalPages, stop when reached
          if (totalPages && page >= totalPages) return;

          setLoadingMore(true);
          try {
            const next = page + 1;
            let data;
            if (filter === "trending") {
              data = await getTrendingShows("week", next);
            } else if (filter === "newest") {
              data = await getNewestShows(next);
            } else if (filter === "highest") {
              data = await getTopRatedShows(next);
            } else if (filter === "featured") {
              data = await getFeaturedShows(next);
            } else {
              data = await getPopularShows(next);
            }

            const more = data.results || [];
            if (more.length > 0) {
              setShows((prev) => {
                // Only add shows that aren't already in the list to prevent duplicates
                const existingIds = new Set(prev.map(s => s.id));
                const newShows = more.filter(s => !existingIds.has(s.id));
                return [...prev, ...newShows];
              });
              setPage(data.page || next);
              setTotalPages(data.total_pages || null);
            }
          } catch (err) {
            console.error(err);
          } finally {
            setLoadingMore(false);
          }
        }}
        ListFooterComponent={() =>
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

// style filter bar
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
  filterRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  filterItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginHorizontal: 3,
  },
  filterItemActive: {
    backgroundColor: "#06294b",
  },
  filterText: {
    color: "#a21e1e",
    fontWeight: "800",
  },
  filterTextActive: {
    color: "white",
  },
});

// retrieve and display show data based on filter
function applyFilter(list, filter) {
  if (!Array.isArray(list)) return list;

  const copy = [...list];
  if (filter === "newest") {
    return copy.sort((a, b) => {
      const da = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
      const db = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
      return db - da;
    });
  }

  if (filter === "highest") {
    return copy.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }

  if (filter === "featured") {
    const sorted = copy.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return sorted.slice(0, 12);
  }

  // default: most_popular - return as-is
  return copy;
}
