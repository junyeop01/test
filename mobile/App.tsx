import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import WebView, { WebViewNavigation } from "react-native-webview";

const SERVER_URL =
  (Constants.expoConfig?.extra?.serverUrl as string | undefined) ||
  "https://your-internal-server.example.com";

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleAndroidBack = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", handleAndroidBack);
    return () => sub.remove();
  }, [handleAndroidBack]);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      {loadFailed ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>서버에 연결할 수 없습니다.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoadFailed(false);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: SERVER_URL }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onError={() => setLoadFailed(true)}
          onHttpError={(e) => {
            if (e.nativeEvent.statusCode >= 500) setLoadFailed(true);
          }}
          pullToRefreshEnabled
          startInLoadingState
          allowsBackForwardNavigationGestures
          domStorageEnabled
          javaScriptEnabled
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  errorBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#555",
  },
  retryButton: {
    backgroundColor: "#2f6fed",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
