import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useJobs } from '../context/JobContext';

const ApplicationsScreen = ({ navigation }) => {
  const { applications, loading, fetchMyApplications } = useJobs();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    await fetchMyApplications();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const handleStatusFilter = async (status) => {
    setSelectedStatus(status);
    await fetchMyApplications({ status: status === 'all' ? '' : status });
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: '#2196F3',
      viewed: '#FF9800',
      shortlisted: '#4CAF50',
      rejected: '#F44336',
      interviewed: '#9C27B0',
      hired: '#4CAF50',
    };
    return colors[status] || '#666';
  };

  const renderStatusFilter = () => {
    const statuses = [
      { key: 'all', label: 'All' },
      { key: 'applied', label: 'Applied' },
      { key: 'viewed', label: 'Viewed' },
      { key: 'shortlisted', label: 'Shortlisted' },
      { key: 'rejected', label: 'Rejected' },
      { key: 'interviewed', label: 'Interviewed' },
      { key: 'hired', label: 'Hired' },
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

  const renderApplicationCard = ({ item }) => (
    <TouchableOpacity
      style={styles.applicationCard}
      onPress={() => navigation.navigate('JobDetails', { jobId: item.job._id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.job.title}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.job.company.name}
          </Text>
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={14} color="#666" />
            <Text style={styles.location} numberOfLines={1}>
              {item.job.location.isRemote 
                ? 'Remote' 
                : `${item.job.location.city}, ${item.job.location.state}`
              }
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.salaryContainer}>
          <Icon name="attach-money" size={16} color="#4CAF50" />
          <Text style={styles.salary}>
            {item.job.salary.currency} {item.job.salary.min.toLocaleString()} - {item.job.salary.max.toLocaleString()}
          </Text>
        </View>

        <View style={styles.jobTypeContainer}>
          <View style={styles.jobTypeTag}>
            <Text style={styles.jobTypeText}>
              {item.job.jobType.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.workModeTag}>
            <Text style={styles.workModeText}>
              {item.job.workMode.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <Icon name="schedule" size={14} color="#666" />
          <Text style={styles.appliedDate}>
            Applied {new Date(item.appliedAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Job</Text>
          </TouchableOpacity>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      {item.interviewScheduled && (
        <View style={styles.interviewContainer}>
          <Icon name="event" size={16} color="#9C27B0" />
          <Text style={styles.interviewText}>
            Interview scheduled for {new Date(item.interviewScheduled).toLocaleDateString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="work-off" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Applications Found</Text>
      <Text style={styles.emptyStateText}>
        {selectedStatus === 'all' 
          ? "You haven't applied to any jobs yet. Start exploring opportunities!"
          : `No applications found with status: ${selectedStatus}`
        }
      </Text>
      {selectedStatus === 'all' && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.exploreButtonText}>Explore Jobs</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading || applications.length === 0) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading more applications...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStatusFilter()}
      
      <FlatList
        data={applications}
        renderItem={renderApplicationCard}
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
  applicationCard: {
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#1E88E5',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#333',
  },
  interviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
  },
  interviewText: {
    fontSize: 12,
    color: '#7B1FA2',
    marginLeft: 8,
    fontWeight: '500',
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
  exploreButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
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
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
});

export default ApplicationsScreen;
