import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    statusCounts: {
      applied: 0,
      viewed: 0,
      shortlisted: 0,
      rejected: 0,
      interviewed: 0,
      hired: 0,
    },
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employers/dashboard');
      const { stats: dashboardStats, recentApplications: recent } = response.data;
      
      setStats(dashboardStats);
      setRecentApplications(recent);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderStatCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderApplicationCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.applicationCard}
      onPress={() => navigation.navigate('JobDetails', { jobId: item.job._id })}
    >
      <View style={styles.applicationHeader}>
        <View style={styles.applicantInfo}>
          <View style={styles.applicantAvatar}>
            <Text style={styles.applicantInitial}>
              {item.applicant.firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.applicantDetails}>
            <Text style={styles.applicantName}>
              {item.applicant.firstName} {item.applicant.lastName}
            </Text>
            <Text style={styles.jobTitle}>{item.job.title}</Text>
            <Text style={styles.companyName}>{item.job.company.name}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.applicationFooter}>
        <Text style={styles.appliedDate}>
          Applied {new Date(item.appliedAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="work-off" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
      <Text style={styles.emptyStateText}>
        Start by posting a job to see applications here
      </Text>
      <TouchableOpacity
        style={styles.postJobButton}
        onPress={() => navigation.navigate('PostJob')}
      >
        <Text style={styles.postJobButtonText}>Post a Job</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#1E88E5']}
          tintColor="#1E88E5"
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#1E88E5', '#1976D2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {user?.firstName}!
        </Text>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          {renderStatCard(
            'Total Jobs',
            stats.totalJobs,
            'work',
            '#1E88E5',
            () => navigation.navigate('MyJobs')
          )}
          {renderStatCard(
            'Active Jobs',
            stats.activeJobs,
            'check-circle',
            '#4CAF50',
            () => navigation.navigate('MyJobs')
          )}
        </View>
        
        <View style={styles.statsRow}>
          {renderStatCard(
            'Total Applications',
            stats.totalApplications,
            'people',
            '#FF9800',
            () => navigation.navigate('MyJobs')
          )}
          {renderStatCard(
            'Hired',
            stats.statusCounts.hired,
            'star',
            '#4CAF50',
            () => navigation.navigate('MyJobs')
          )}
        </View>
      </View>

      {/* Application Status Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Status Overview</Text>
        <View style={styles.statusGrid}>
          {Object.entries(stats.statusCounts).map(([status, count]) => (
            <View key={status} style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
              <Text style={styles.statusLabel}>{status}</Text>
              <Text style={styles.statusCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Applications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyJobs')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentApplications.length > 0 ? (
          <FlatList
            data={recentApplications}
            renderItem={renderApplicationCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostJob')}
          >
            <Icon name="add" size={24} color="#1E88E5" />
            <Text style={styles.actionText}>Post New Job</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyJobs')}
          >
            <Icon name="list" size={24} color="#1E88E5" />
            <Text style={styles.actionText}>Manage Jobs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="settings" size={24} color="#1E88E5" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '500',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 5,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  applicationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  applicantInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  applicantInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applicantDetails: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 12,
    color: '#999',
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
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedDate: {
    fontSize: 12,
    color: '#666',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  postJobButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postJobButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
  },
  actionText: {
    fontSize: 12,
    color: '#1E88E5',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
