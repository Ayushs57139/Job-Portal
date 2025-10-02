import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import FilterModal from '../components/FilterModal';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    jobs, 
    loading, 
    fetchJobs, 
    searchJobs, 
    updateFilters, 
    filters,
    pagination 
  } = useJobs();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    await fetchJobs();
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchJobs({ search: searchQuery.trim() });
    } else {
      await loadJobs();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (pagination.hasNextPage && !loading) {
      await fetchJobs({ page: pagination.currentPage + 1 });
    }
  };

  const handleJobPress = (job) => {
    navigation.navigate('JobDetails', { jobId: job._id });
  };

  const handleFilterApply = async (newFilters) => {
    updateFilters(newFilters);
    await searchJobs(newFilters);
    setShowFilters(false);
  };

  const renderJobCard = ({ item }) => (
    <JobCard 
      job={item} 
      onPress={() => handleJobPress(item)}
      showApplyButton={user?.userType === 'jobseeker'}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.welcomeText}>
        Welcome back, {user?.firstName || 'User'}!
      </Text>
      <Text style={styles.subtitle}>
        {user?.userType === 'employer' 
          ? 'Manage your job postings' 
          : 'Find your next opportunity'
        }
      </Text>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, companies, skills..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Icon name="search" size={20} color="#1E88E5" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="tune" size={20} color="#1E88E5" />
        </TouchableOpacity>
      </View>

      {user?.userType === 'employer' && (
        <TouchableOpacity 
          style={styles.postJobButton}
          onPress={() => navigation.navigate('PostJob')}
        >
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.postJobButtonText}>Post a Job</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="work-off" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Jobs Found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your search criteria or check back later
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || pagination.currentPage === 1) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more jobs...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E88E5', '#1976D2']}
        style={styles.gradientHeader}
      >
        {renderHeader()}
      </LinearGradient>

      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1E88E5']}
            tintColor="#1E88E5"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
        currentFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 5,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postJobButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  postJobButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
});

export default HomeScreen;
