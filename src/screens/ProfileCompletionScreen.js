import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const ProfileCompletionScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    whatsappUpdates: false,
    educationLevel: '',
    degree: '',
    institution: '',
    specialization: '',
    educationStatus: '',
    experience: '',
    currentJobTitle: '',
    currentCompany: '',
    skills: '',
    currentCity: '',
    preferredLocations: '',
    jobTypePreference: '',
    expectedSalary: ''
  });

  const steps = [
    { id: 1, title: 'Basic Details', subtitle: 'Tell us about yourself' },
    { id: 2, title: 'Education', subtitle: 'Your educational background' },
    { id: 3, title: 'Experience', subtitle: 'Professional experience' },
    { id: 4, title: 'Preferences', subtitle: 'Job preferences' },
    { id: 5, title: 'Review', subtitle: 'Review and complete' }
  ];

  const updateProfileData = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        completeProfile();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1:
        if (!profileData.fullName.trim()) {
          Alert.alert('Error', 'Full name is required');
          return false;
        }
        if (!profileData.dateOfBirth) {
          Alert.alert('Error', 'Date of birth is required');
          return false;
        }
        if (!profileData.gender) {
          Alert.alert('Error', 'Please select your gender');
          return false;
        }
        break;
      case 2:
        if (!profileData.educationLevel) {
          Alert.alert('Error', 'Please select your education level');
          return false;
        }
        break;
      case 3:
        if (!profileData.experience) {
          Alert.alert('Error', 'Please select your experience level');
          return false;
        }
        break;
      case 4:
        if (!profileData.currentCity.trim()) {
          Alert.alert('Error', 'Current city is required');
          return false;
        }
        break;
    }
    return true;
  };

  const completeProfile = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile: profileData
        })
      });

      if (response.ok) {
        // Get user data from navigation params to show user ID
        const { user } = navigation.getState().routes.find(route => route.name === 'ProfileCompletion')?.params || {};
        const userId = user?.userId || 'N/A';
        
        Alert.alert(
          'Success', 
          `Profile completed successfully!\n\nYour User ID: ${userId}\n\nYou can use this User ID, your email, or phone number to login.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
        );
      } else {
        throw new Error('Failed to complete profile');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      Alert.alert('Error', 'Failed to complete profile. You can update it later.');
      navigation.navigate('Dashboard');
    }
  };

  const skipProfile = () => {
    Alert.alert(
      'Skip Profile',
      'Are you sure you want to skip profile completion? You can complete it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.navigate('Dashboard') }
      ]
    );
  };

  const getAuthToken = async () => {
    // Get token from AsyncStorage or secure storage
    return 'your-auth-token'; // Replace with actual token retrieval
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View
          key={step.id}
          style={[
            styles.stepDot,
            currentStep === step.id && styles.stepDotActive,
            currentStep > step.id && styles.stepDotCompleted
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell us your full name</Text>
      <Text style={styles.stepSubtitle}>This will be displayed on your profile</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={profileData.fullName}
          onChangeText={(value) => updateProfileData('fullName', value)}
          placeholder="Enter full name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date of Birth (DOB) *</Text>
        <TextInput
          style={styles.input}
          value={profileData.dateOfBirth}
          onChangeText={(value) => updateProfileData('dateOfBirth', value)}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.optionGrid}>
          {['Male', 'Female', 'Other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.optionButton,
                profileData.gender === gender.toLowerCase() && styles.optionButtonSelected
              ]}
              onPress={() => updateProfileData('gender', gender.toLowerCase())}
            >
              <Text style={[
                styles.optionButtonText,
                profileData.gender === gender.toLowerCase() && styles.optionButtonTextSelected
              ]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profileData.email}
          onChangeText={(value) => updateProfileData('email', value)}
          placeholder="Enter email address"
          keyboardType="email-address"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What is your highest level of education?</Text>
      <Text style={styles.stepSubtitle}>Select highest education level even if not completed</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Education Level *</Text>
        <View style={styles.optionGrid}>
          {['10th', '12th', 'Diploma', 'ITI', 'Graduate', 'Post Graduate', 'Doctorate'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                profileData.educationLevel === level.toLowerCase() && styles.optionButtonSelected
              ]}
              onPress={() => updateProfileData('educationLevel', level.toLowerCase())}
            >
              <Text style={[
                styles.optionButtonText,
                profileData.educationLevel === level.toLowerCase() && styles.optionButtonTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Degree/Course</Text>
        <TextInput
          style={styles.input}
          value={profileData.degree}
          onChangeText={(value) => updateProfileData('degree', value)}
          placeholder="Enter your degree or course"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Institution/University</Text>
        <TextInput
          style={styles.input}
          value={profileData.institution}
          onChangeText={(value) => updateProfileData('institution', value)}
          placeholder="Enter institution name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Specialization (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profileData.specialization}
          onChangeText={(value) => updateProfileData('specialization', value)}
          placeholder="Enter specialization"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell us about your professional experience</Text>
      <Text style={styles.stepSubtitle}>This helps us match you with relevant jobs</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Total Experience *</Text>
        <View style={styles.optionGrid}>
          {['Fresher', '3 Months', '6 Months', '9 Months', '1 Year', '1.5 Years', '2 Years', '2.5 Years', '3 Years', '3.5 Years', '4 Years', '4.5 Years', '5 Years', '5.5 Years', '6 Years', '6.5 Years', '7 Years', '7.5 Years', '8 Years', '8.5 Years', '9 Years', '9.5 Years', '10 Years', '10.5 Years', '11 Years', '11.5 Years', '12 Years', '12.5 Years', '13 Years', '13.5 Years', '14 Years', '14.5 Years', '15 Years', '15.5 Years', '16 Years', '16.5 Years', '17 Years', '17.5 Years', '18 Years', '18.5 Years', '19 Years', '19.5 Years', '20 Years', '20.5 Years', '21 Years', '21.5 Years', '22 Years', '22.5 Years', '23 Years', '23.5 Years', '24 Years', '24.5 Years', '25 Years', '25.5 Years', '26 Years', '26.5 Years', '27 Years', '27.5 Years', '28 Years', '28.5 Years', '29 Years', '29.5 Years', '30 Years', '30.5 Years', '31 Years', '31 Years Plus'].map((exp) => (
            <TouchableOpacity
              key={exp}
              style={[
                styles.optionButton,
                profileData.experience === exp && styles.optionButtonSelected
              ]}
              onPress={() => updateProfileData('experience', exp)}
            >
              <Text style={[
                styles.optionButtonText,
                profileData.experience === exp && styles.optionButtonTextSelected
              ]}>
                {exp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Job Title (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profileData.currentJobTitle}
          onChangeText={(value) => updateProfileData('currentJobTitle', value)}
          placeholder="Enter your current job title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Company (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profileData.currentCompany}
          onChangeText={(value) => updateProfileData('currentCompany', value)}
          placeholder="Enter your current company"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Skills (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profileData.skills}
          onChangeText={(value) => updateProfileData('skills', value)}
          placeholder="Enter your skills separated by commas"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Where are you located?</Text>
      <Text style={styles.stepSubtitle}>This helps us show you relevant local jobs</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Current City *</Text>
        <TextInput
          style={styles.input}
          value={profileData.currentCity}
          onChangeText={(value) => updateProfileData('currentCity', value)}
          placeholder="Enter your current city"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Preferred Job Locations (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profileData.preferredLocations}
          onChangeText={(value) => updateProfileData('preferredLocations', value)}
          placeholder="Enter preferred cities separated by commas"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Job Type Preference</Text>
        <View style={styles.optionGrid}>
          {['Full Time', 'Part Time', 'Contract', 'Internship'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                profileData.jobTypePreference === type.toLowerCase() && styles.optionButtonSelected
              ]}
              onPress={() => updateProfileData('jobTypePreference', type.toLowerCase())}
            >
              <Text style={[
                styles.optionButtonText,
                profileData.jobTypePreference === type.toLowerCase() && styles.optionButtonTextSelected
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Expected Salary (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profileData.expectedSalary}
          onChangeText={(value) => updateProfileData('expectedSalary', value)}
          placeholder="Enter expected salary in LPA"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review your profile</Text>
      <Text style={styles.stepSubtitle}>Please review your information before completing</Text>
      
      <ScrollView style={styles.reviewContainer}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Personal Information</Text>
          <Text><Text style={styles.reviewLabel}>Name:</Text> {profileData.fullName || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Date of Birth:</Text> {profileData.dateOfBirth || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Gender:</Text> {profileData.gender || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Email:</Text> {profileData.email || 'Not provided'}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Education</Text>
          <Text><Text style={styles.reviewLabel}>Education Level:</Text> {profileData.educationLevel || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Degree:</Text> {profileData.degree || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Institution:</Text> {profileData.institution || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Specialization:</Text> {profileData.specialization || 'Not provided'}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Professional</Text>
          <Text><Text style={styles.reviewLabel}>Experience:</Text> {profileData.experience || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Current Job:</Text> {profileData.currentJobTitle || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Current Company:</Text> {profileData.currentCompany || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Skills:</Text> {profileData.skills || 'Not provided'}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Preferences</Text>
          <Text><Text style={styles.reviewLabel}>Current City:</Text> {profileData.currentCity || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Preferred Locations:</Text> {profileData.preferredLocations || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Job Type:</Text> {profileData.jobTypePreference || 'Not provided'}</Text>
          <Text><Text style={styles.reviewLabel}>Expected Salary:</Text> {profileData.expectedSalary ? profileData.expectedSalary + ' LPA' : 'Not provided'}</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>{steps[currentStep - 1]?.title}</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipButton} onPress={skipProfile}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>
              {currentStep === 5 ? 'Complete Profile' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {renderStepIndicator()}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 10,
    backgroundColor: 'white',
    minWidth: 100,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  reviewContainer: {
    maxHeight: 400,
  },
  reviewSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  reviewLabel: {
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  skipButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#6c757d',
    borderRadius: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#667eea',
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
    gap: 10,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
  },
  stepDotActive: {
    backgroundColor: '#667eea',
  },
  stepDotCompleted: {
    backgroundColor: '#28a745',
  },
});

export default ProfileCompletionScreen;
