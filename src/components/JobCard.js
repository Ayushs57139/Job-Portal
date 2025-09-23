import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const JobCard = ({ job, onPress, showApplyButton = true }) => {
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

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <View style={styles.logoContainer}>
            {job.company.logo ? (
              <Image source={{ uri: job.company.logo }} style={styles.logo} />
            ) : (
              <View style={styles.defaultLogo}>
                <Text style={styles.logoText}>
                  {job.company.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.companyDetails}>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={styles.companyName} numberOfLines={1}>
              {job.company.name}
            </Text>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.location} numberOfLines={1}>
                {job.location.isRemote 
                  ? 'Remote' 
                  : `${job.location.city}, ${job.location.state}`
                }
              </Text>
            </View>
          </View>
        </View>
        
        {job.featured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={12} color="#FFD700" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.salaryContainer}>
          <Icon name="attach-money" size={16} color="#4CAF50" />
          <Text style={styles.salary}>
            {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
          </Text>
          {job.salary.isNegotiable && (
            <Text style={styles.negotiable}>(Negotiable)</Text>
          )}
        </View>

        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: getJobTypeColor(job.jobType) + '20' }]}>
            <Text style={[styles.tagText, { color: getJobTypeColor(job.jobType) }]}>
              {job.jobType.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
          
          <View style={[styles.tag, { backgroundColor: getWorkModeColor(job.workMode) + '20' }]}>
            <Text style={[styles.tagText, { color: getWorkModeColor(job.workMode) }]}>
              {job.workMode.toUpperCase()}
            </Text>
          </View>

          {job.requirements.experience.min > 0 && (
            <View style={[styles.tag, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.tagText, { color: '#1976D2' }]}>
                {job.requirements.experience.min}+ Years
              </Text>
            </View>
          )}
        </View>

        {job.requirements.skills && job.requirements.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsLabel}>Skills:</Text>
            <View style={styles.skillsList}>
              {job.requirements.skills.slice(0, 3).map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {job.requirements.skills.length > 3 && (
                <Text style={styles.moreSkills}>
                  +{job.requirements.skills.length - 3} more
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Icon name="visibility" size={14} color="#666" />
              <Text style={styles.metaText}>{job.views} views</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="people" size={14} color="#666" />
              <Text style={styles.metaText}>{job.applicationsCount} applications</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="schedule" size={14} color="#666" />
              <Text style={styles.metaText}>
                {new Date(job.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {showApplyButton && (
            <TouchableOpacity style={styles.applyButton}>
              <LinearGradient
                colors={['#1E88E5', '#1976D2']}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    paddingBottom: 10,
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  defaultLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  companyDetails: {
    flex: 1,
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
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 2,
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  negotiable: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#666',
  },
  moreSkills: {
    fontSize: 11,
    color: '#1E88E5',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  applyButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default JobCard;
