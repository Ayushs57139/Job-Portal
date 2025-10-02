import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const MyJobsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs/employer/my-jobs');
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const handleStatusFilter = async (status) => {
    setSelectedStatus(status);
    try {
      const response = await api.get('/jobs/employer/my-jobs', {
        params: { status: status === 'all' ? '' : status }
      });
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error filtering jobs:', error);
    }
  };

  const handleDeleteJob = (jobId) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => confirmDelete(jobId), style: 'destructive' },
      ]
    );
  };

  const confirmDelete = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(job => job._id !== jobId));
      Alert.alert('Success', 'Job deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete job');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#4CAF50',
      paused: '#FF9800',
      closed: '#F44336',
    };
    return colors[status] || '#666';
  };

  const renderStatusFilter = () => {
    const statuses = [
      { key: 'all', label: 'All' },
      { key: 'active', label: 'Active' },
      { key: 'paused', label: 'Paused' },
      { key: 'closed', label: 'Closed' },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.filterButton,
                selectedStatus === status.key && styles.activeFilterButton,
              ]}
              onPress={() => handleStatusFilter(status.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedStatus === status.key && styles.activeFilterButtonText,
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetails', { jobId: item._id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.company.name}
          </Text>
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={14} color="#666" />
            <Text style={styles.location} numberOfLines={1}>
              {item.location.isRemote 
                ? 'Remote' 
                : `${item.location.city}, ${item.location.state}`
              }
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => showJobOptions(item)}
          >
            <Icon name="more-vert" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.salaryContainer}>
          <Icon name="attach-money" size={16} color="#4CAF50" />
          <Text style={styles.salary}>
            {item.salary.currency} {item.salary.min.toLocaleString()} - {item.salary.max.toLocaleString()}
          </Text>
        </View>

        <View style={styles.jobTypeContainer}>
          <View style={styles.jobTypeTag}>
            <Text style={styles.jobTypeText}>
              {item.jobType.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.workModeTag}>
            <Text style={styles.workModeText}>
              {item.workMode.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="visibility" size={14} color="#666" />
            <Text style={styles.statText}>{item.views} views</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="people" size={14} color="#666" />
            <Text style={styles.statText}>{item.applicationsCount} applications</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={14} color="#666" />
            <Text style={styles.statText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const showJobOptions = (job) => {
    Alert.alert(
      'Job Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Applications', onPress: () => viewApplications(job) },
        { text: 'Edit Job', onPress: () => editJob(job) },
        { text: 'Delete Job', onPress: () => handleDeleteJob(job._id), style: 'destructive' },
      ]
    );
  };

  const viewApplications = (job) => {
    // Navigate to applications screen for this job
    navigation.navigate('JobDetails', { jobId: job._id });
  };

  const editJob = (job) => {
    // Navigate to edit job screen
    navigation.navigate('PostJob', { jobId: job._id, editMode: true });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="work-off" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Jobs Posted</Text>
      <Text style={styles.emptyStateText}>
        You haven't posted any jobs yet. Start by creating your first job posting!
      </Text>
      <TouchableOpacity
        style={styles.postJobButton}
        onPress={() => navigation.navigate('PostJob')}
      >
        <Text style={styles.postJobButtonText}>Post Your First Job</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading || jobs.length === 0) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading more jobs...</Text>
      </View>
    );
  };

  if (loading && jobs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading your jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStatusFilter()}
      
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
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#1E88E5',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
    marginRight: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  moreButton: {
    padding: 5,
  },
  cardContent: {
    marginBottom: 12,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  jobTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  jobTypeTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  jobTypeText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '600',
  },
  workModeTag: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  workModeText: {
    fontSize: 10,
    color: '#7B1FA2',
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
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
    marginBottom: 20,
  },
  postJobButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  postJobButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});

export default MyJobsScreen;
