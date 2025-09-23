import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const JobDetailsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const { user } = useAuth();
  const { currentJob, loading, fetchJobById, applyForJob } = useJobs();
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    await fetchJobById(jobId);
  };

  const handleApply = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to apply for jobs');
      return;
    }

    if (user.userType !== 'jobseeker') {
      Alert.alert('Access Denied', 'Only job seekers can apply for jobs');
      return;
    }

    if (!user.profile?.resume) {
      Alert.alert(
        'Resume Required',
        'Please upload your resume before applying for jobs',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upload Resume', onPress: () => navigation.navigate('Profile') },
        ]
      );
      return;
    }

    Alert.alert(
      'Apply for Job',
      'Are you sure you want to apply for this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Apply', onPress: confirmApply },
      ]
    );
  };

  const confirmApply = async () => {
    setApplying(true);
    const result = await applyForJob(jobId, {
      coverLetter: '',
      expectedSalary: user.profile?.expectedSalary || 0,
    });

    if (result.success) {
      Alert.alert('Success', 'Application submitted successfully!');
    } else {
      Alert.alert('Error', result.error);
    }
    setApplying(false);
  };

  const handleCompanyWebsite = () => {
    if (currentJob?.company?.website) {
      Linking.openURL(currentJob.company.website);
    }
  };

  const formatSalary = (min, max, currency = 'INR') => {
    const formatNumber = (num) => {
      if (num >= 100000) {
        return `${(num / 100000).toFixed(1)}L`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toString();
    };

    return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const getJobTypeColor = (jobType) => {
    const colors = {
      'full-time': '#4CAF50',
      'part-time': '#FF9800',
      'contract': '#9C27B0',
      'internship': '#2196F3',
      'freelance': '#FF5722',
    };
    return colors[jobType] || '#666';
  };

  const getWorkModeColor = (workMode) => {
    const colors = {
      'office': '#F44336',
      'remote': '#4CAF50',
      'hybrid': '#FF9800',
    };
    return colors[workMode] || '#666';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!currentJob) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={80} color="#ccc" />
        <Text style={styles.errorTitle}>Job Not Found</Text>
        <Text style={styles.errorText}>
          The job you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#1E88E5', '#1976D2']}
        style={styles.header}
      >
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            {currentJob.company.logo ? (
              <Image source={{ uri: currentJob.company.logo }} style={styles.logo} />
            ) : (
              <View style={styles.defaultLogo}>
                <Text style={styles.logoText}>
                  {currentJob.company.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.jobTitle}>{currentJob.title}</Text>
            <Text style={styles.companyName}>{currentJob.company.name}</Text>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#fff" />
              <Text style={styles.location}>
                {currentJob.location.isRemote 
                  ? 'Remote' 
                  : `${currentJob.location.city}, ${currentJob.location.state}`
                }
              </Text>
            </View>
          </View>
        </View>

        {currentJob.featured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.featuredText}>Featured Job</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        {/* Job Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          
          <View style={styles.detailRow}>
            <Icon name="attach-money" size={20} color="#4CAF50" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Salary</Text>
              <Text style={styles.detailValue}>
                {formatSalary(currentJob.salary.min, currentJob.salary.max, currentJob.salary.currency)}
                {currentJob.salary.isNegotiable && ' (Negotiable)'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="work" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Job Type</Text>
              <View style={styles.tagsContainer}>
                <View style={[styles.tag, { backgroundColor: getJobTypeColor(currentJob.jobType) + '20' }]}>
                  <Text style={[styles.tagText, { color: getJobTypeColor(currentJob.jobType) }]}>
                    {currentJob.jobType.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: getWorkModeColor(currentJob.workMode) + '20' }]}>
                  <Text style={[styles.tagText, { color: getWorkModeColor(currentJob.workMode) }]}>
                    {currentJob.workMode.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {currentJob.requirements.experience.min > 0 && (
            <View style={styles.detailRow}>
              <Icon name="schedule" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Experience Required</Text>
                <Text style={styles.detailValue}>
                  {currentJob.requirements.experience.min} - {currentJob.requirements.experience.max} years
                </Text>
              </View>
            </View>
          )}

          {currentJob.requirements.education && (
            <View style={styles.detailRow}>
              <Icon name="school" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Education</Text>
                <Text style={styles.detailValue}>{currentJob.requirements.education}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{currentJob.description}</Text>
        </View>

        {/* Skills Required */}
        {currentJob.requirements.skills && currentJob.requirements.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills Required</Text>
            <View style={styles.skillsContainer}>
              {currentJob.requirements.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Company</Text>
          <Text style={styles.companyDescription}>
            {currentJob.company.description || 'No company description available.'}
          </Text>
          
          <View style={styles.companyDetails}>
            <View style={styles.companyDetailRow}>
              <Icon name="business" size={16} color="#666" />
              <Text style={styles.companyDetailText}>
                Company Size: {currentJob.company.size}
              </Text>
            </View>
            
            {currentJob.company.industry && (
              <View style={styles.companyDetailRow}>
                <Icon name="category" size={16} color="#666" />
                <Text style={styles.companyDetailText}>
                  Industry: {currentJob.company.industry}
                </Text>
              </View>
            )}

            {currentJob.company.website && (
              <TouchableOpacity 
                style={styles.companyDetailRow}
                onPress={handleCompanyWebsite}
              >
                <Icon name="language" size={16} color="#1E88E5" />
                <Text style={[styles.companyDetailText, { color: '#1E88E5' }]}>
                  Visit Website
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Job Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="visibility" size={20} color="#666" />
              <Text style={styles.statValue}>{currentJob.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="people" size={20} color="#666" />
              <Text style={styles.statValue}>{currentJob.applicationsCount}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="schedule" size={20} color="#666" />
              <Text style={styles.statValue}>
                {new Date(currentJob.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.statLabel}>Posted</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Apply Button */}
      {user?.userType === 'jobseeker' && (
        <View style={styles.applyContainer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            disabled={applying}
          >
            <LinearGradient
              colors={['#1E88E5', '#1976D2']}
              style={styles.applyButtonGradient}
            >
              {applying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="send" size={20} color="#fff" />
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    marginRight: 15,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  defaultLogo: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginLeft: 5,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  featuredText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailContent: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#666',
  },
  companyDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  companyDetails: {
    marginTop: 10,
  },
  companyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  applyContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default JobDetailsScreen;
