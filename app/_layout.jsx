import { Stack, useRouter, useSegments } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  // activeSegment: first segment or 'index' for the home route
  const active = segments.length > 0 ? segments[0] : "index";

  return (
    // Assign Names to Screens and create tab bar
    <> 
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "TViewer" }} 
        />
        <Stack.Screen name="show/[id]" options={{ title: "Details" }} />
        <Stack.Screen name="search" options={{ title: "Search Shows" }} />
        <Stack.Screen name="profile/index" options={{ title: "Profile" }} />
        <Stack.Screen name="profile/watched" options={{ title: "Watched Shows" }} />
        <Stack.Screen name="profile/watchedEp" options={{ title: "Watched Episodes" }} />
        <Stack.Screen name="profile/watchlist" options={{ title: "Watchlist" }} />
      </Stack>

      
      <View style={styles.tabBar} pointerEvents="box-none">
        <Pressable
          style={styles.tabItem}
          onPress={() => {
            if (active !== "index") router.replace("/");
          }}
        >
          <Text style={styles.tabText}>Home</Text>
        </Pressable>
        <View style={styles.separator} />
        <Pressable
          style={styles.tabItem}
          onPress={() => {
            if (active !== "search") router.replace("/search");
          }}
        >
          <Text style={styles.tabText}>Search</Text>
        </Pressable>
        <View style={styles.separator} />
        <Pressable
          style={styles.tabItem}
          onPress={() => {
            if (active !== "profile") router.replace("/profile");
          }}
        >
          <Text style={styles.tabText}>Profile</Text>
        </Pressable>
      </View>
    </>
  );
}

// Style tab bar
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: '#0b0b0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabText: {
    color: 'white',
    fontWeight: '800',
  },
  separator: {
    width: 1,
    height: '60%',
    backgroundColor: '#fff',
    alignSelf: 'center',
    opacity: 0.6,
  },
});
