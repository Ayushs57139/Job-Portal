import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const App = () => {
  const openWebApp = () => {
    Linking.openURL('http://localhost:3000');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#1E88E5" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.logo}>JobWala</Text>
          <Text style={styles.tagline}>Find Your Dream Job</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Welcome to JobWala - Your Complete Job Portal
          </Text>
          
          <View style={styles.features}>
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>🔍 Job Search</Text>
              <Text style={styles.featureText}>
                Find thousands of jobs from top companies
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>📄 Resume Builder</Text>
              <Text style={styles.featureText}>
                Create professional resumes with AI assistance
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>🎯 Career Guidance</Text>
              <Text style={styles.featureText}>
                Get expert advice for your career growth
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>🎭 Interview Prep</Text>
              <Text style={styles.featureText}>
                Practice with mock interviews and get feedback
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.webButton} onPress={openWebApp}>
            <Text style={styles.webButtonText}>Open Web App</Text>
          </TouchableOpacity>
          
          <Text style={styles.note}>
            For the full experience, open the web app in your browser
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1E88E5',
    padding: 30,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  features: {
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  webButton: {
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  webButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default App;