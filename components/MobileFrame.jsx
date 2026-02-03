import React from "react";
import { Platform, View } from "react-native";

export default function MobileFrame({ children }) {
  // On iOS/Android, render normally
  if (Platform.OS !== "web") return children;

  // On web, wrap the app in a phone-like frame
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 390,          // iPhone width
          height: 844,         // iPhone height
          borderRadius: 32,
          overflow: "hidden",
          backgroundColor: "#000",
          borderWidth: 1,
          borderColor: "#333",
        }}
      >
        {children}
      </View>
    </View>
  );
}
