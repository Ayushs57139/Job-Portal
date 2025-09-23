import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const WebViewScreen = ({ navigation }) => {
  const [url, setUrl] = useState('https://www.naukri.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.naukri.com');
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const handleGoBack = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleNavigate = () => {
    if (url.trim()) {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      setCurrentUrl(finalUrl);
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
  };

  const handleWebViewLoadStart = () => {
    setLoading(true);
  };

  const handleWebViewLoadEnd = () => {
    setLoading(false);
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert('Error', 'Failed to load the webpage. Please check the URL and try again.');
    setLoading(false);
  };

  const quickLinks = [
    { title: 'Naukri.com', url: 'https://www.naukri.com' },
    { title: 'Google', url: 'https://www.google.com' },
    { title: 'LinkedIn', url: 'https://www.linkedin.com' },
    { title: 'GitHub', url: 'https://www.github.com' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1E88E5', '#1976D2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.urlContainer}>
            <TextInput
              style={styles.urlInput}
              value={url}
              onChangeText={setUrl}
              placeholder="Enter URL..."
              placeholderTextColor="#999"
              onSubmitEditing={handleNavigate}
              returnKeyType="go"
            />
            <TouchableOpacity
              style={styles.goButton}
              onPress={handleNavigate}
            >
              <Icon name="arrow-forward" size={20} color="#1E88E5" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Navigation Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, !canGoBack && styles.disabledButton]}
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <Icon name="arrow-back" size={20} color={canGoBack ? "#1E88E5" : "#ccc"} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, !canGoForward && styles.disabledButton]}
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <Icon name="arrow-forward" size={20} color={canGoForward ? "#1E88E5" : "#ccc"} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleRefresh}
        >
          <Icon name="refresh" size={20} color="#1E88E5" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setUrl('https://www.naukri.com')}
        >
          <Icon name="home" size={20} color="#1E88E5" />
        </TouchableOpacity>
      </View>

      {/* Quick Links */}
      <View style={styles.quickLinksContainer}>
        <Text style={styles.quickLinksTitle}>Quick Links:</Text>
        <View style={styles.quickLinks}>
          {quickLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickLinkButton}
              onPress={() => {
                setUrl(link.url);
                setCurrentUrl(link.url);
              }}
            >
              <Text style={styles.quickLinkText}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={(ref) => { webViewRef = ref; }}
        source={{ uri: currentUrl }}
        style={styles.webView}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onLoadStart={handleWebViewLoadStart}
        onLoadEnd={handleWebViewLoadEnd}
        onError={handleWebViewError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  urlContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 40,
  },
  urlInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  goButton: {
    padding: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  controlButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  disabledButton: {
    backgroundColor: '#f9f9f9',
  },
  quickLinksContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickLinksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickLinkButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  quickLinkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  webView: {
    flex: 1,
  },
});

export default WebViewScreen;
