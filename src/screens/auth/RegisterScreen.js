import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'jobseeker',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  
  const { register, error, clearError } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectResume = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.plainText],
      });

      if (result.length > 0) {
        const file = result[0];
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        setSelectedResume(file);
        await parseResume(file);
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled the picker
      } else {
        console.error('Document picker error:', error);
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };

  const parseResume = async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.success) {
        setResumeData(result.data);
        Alert.alert('Success', 'Resume parsed successfully! Form will be updated with extracted information.');
        
        // Update form fields with parsed data
        if (result.data.firstName && !formData.firstName) {
          setFormData(prev => ({ ...prev, firstName: result.data.firstName }));
        }
        if (result.data.lastName && !formData.lastName) {
          setFormData(prev => ({ ...prev, lastName: result.data.lastName }));
        }
        if (result.data.email && !formData.email) {
          setFormData(prev => ({ ...prev, email: result.data.email }));
        }
        if (result.data.phone && !formData.phone) {
          setFormData(prev => ({ ...prev, phone: result.data.phone }));
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Resume parsing error:', error);
      Alert.alert('Error', 'Failed to parse resume: ' + error.message);
    }
  };

  const removeResume = () => {
    setSelectedResume(null);
    setResumeData(null);
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword, phone } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    clearError();

    const registrationData = {
      ...formData,
      resumeData: resumeData
    };
    
    const result = await register(registrationData);
    
    if (result.success) {
      // For job seekers, navigate to profile completion
      if (formData.userType === 'jobseeker') {
        const userId = result.user?.userId || 'N/A';
        Alert.alert(
          'Registration Successful!', 
          `Your User ID: ${userId}\n\nYou can use this User ID, your email, or phone number to login.\n\nPlease complete your profile.`,
          [{ text: 'Continue', onPress: () => navigation.navigate('ProfileCompletion', { 
            token: result.token, 
            user: result.user 
          })}]
        );
      } else {
        // For other user types, navigate directly to dashboard
        const userId = result.user?.userId || 'N/A';
        Alert.alert(
          'Registration Successful!', 
          `Your User ID: ${userId}\n\nYou can use this User ID, your email, or phone number to login.`,
          [{ text: 'Continue', onPress: () => navigation.navigate('Dashboard') }]
        );
      }
    } else {
      Alert.alert('Registration Failed', result.error);
    }
    
    setLoading(false);
  };


  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#1E88E5', '#1976D2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of job seekers</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#999"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#999"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone (Optional)"
                placeholderTextColor="#999"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.pickerContainer}>
              <Icon name="work" size={20} color="#666" style={styles.pickerIcon} />
              <Picker
                selectedValue={formData.userType}
                onValueChange={(value) => handleInputChange('userType', value)}
                style={styles.picker}
              >
                <Picker.Item label="Job Seeker" value="jobseeker" />
                <Picker.Item label="Employer" value="employer" />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Resume Upload Section */}
            <View style={styles.resumeSection}>
              <Text style={styles.sectionTitle}>Upload Resume (Optional)</Text>
              <Text style={styles.sectionSubtitle}>AI will extract your details automatically</Text>
              
              {selectedResume ? (
                <View style={styles.resumePreview}>
                  <Icon name="description" size={24} color="#28a745" />
                  <Text style={styles.resumeFileName} numberOfLines={1}>
                    {selectedResume.name}
                  </Text>
                  <TouchableOpacity onPress={removeResume} style={styles.removeButton}>
                    <Icon name="close" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={selectResume}>
                  <Icon name="cloud-upload" size={24} color="#667eea" />
                  <Text style={styles.uploadButtonText}>Choose Resume File</Text>
                </TouchableOpacity>
              )}
              
              <Text style={styles.uploadHint}>
                Supported: PDF, DOC, DOCX, TXT (Max 5MB)
              </Text>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
              <Text style={styles.loginButtonText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  pickerIcon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  registerButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f8f9ff',
  },
  uploadButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  resumePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 8,
  },
  resumeFileName: {
    flex: 1,
    color: '#333',
    fontSize: 14,
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
    borderRadius: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  loginButton: {
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterScreen;
