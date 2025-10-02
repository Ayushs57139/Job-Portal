import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useJobs } from '../context/JobContext';

const PostJobScreen = ({ navigation }) => {
  const { postJob, loading } = useJobs();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: {
      name: '',
      website: '',
      size: '1-10',
      industry: '',
    },
    location: {
      city: '',
      state: '',
      country: 'India',
      isRemote: false,
    },
    salary: {
      min: '',
      max: '',
      currency: 'INR',
      isNegotiable: false,
    },
    requirements: {
      experience: {
        min: 0,
        max: 10,
      },
      skills: [],
      education: '',
    },
    jobType: 'full-time',
    workMode: 'office',
    benefits: [],
    applicationDeadline: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.requirements.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          skills: [...prev.requirements.skills, newSkill.trim()],
        },
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: prev.requirements.skills.filter(skill => skill !== skillToRemove),
      },
    }));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (benefitToRemove) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove),
    }));
  };

  const validateForm = () => {
    const required = [
      'title',
      'description',
      'company.name',
      'location.city',
      'location.state',
      'salary.min',
      'salary.max',
    ];

    for (const field of required) {
      const value = field.includes('.') 
        ? formData[field.split('.')[0]][field.split('.')[1]]
        : formData[field];
      
      if (!value || value.toString().trim() === '') {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return false;
      }
    }

    if (parseInt(formData.salary.min) >= parseInt(formData.salary.max)) {
      Alert.alert('Validation Error', 'Minimum salary must be less than maximum salary');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const jobData = {
      ...formData,
      salary: {
        ...formData.salary,
        min: parseInt(formData.salary.min),
        max: parseInt(formData.salary.max),
      },
      requirements: {
        ...formData.requirements,
        experience: {
          min: parseInt(formData.requirements.experience.min),
          max: parseInt(formData.requirements.experience.max),
        },
      },
    };

    const result = await postJob(jobData);
    
    if (result.success) {
      Alert.alert(
        'Success',
        'Job posted successfully!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default', required = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={field.includes('.') 
          ? formData[field.split('.')[0]][field.split('.')[1]]
          : formData[field]
        }
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType={keyboardType}
        multiline={field === 'description'}
        numberOfLines={field === 'description' ? 4 : 1}
      />
    </View>
  );

  const renderPicker = (label, field, options, required = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={field.includes('.') 
            ? formData[field.split('.')[0]][field.split('.')[1]]
            : formData[field]
          }
          onValueChange={(value) => handleInputChange(field, value)}
          style={styles.picker}
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderTags = (label, items, onAdd, onRemove, placeholder) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.tagsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity
              onPress={() => onRemove(item)}
              style={styles.removeTagButton}
            >
              <Icon name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.addTagContainer}>
        <TextInput
          style={styles.addTagInput}
          placeholder={placeholder}
          value={label === 'Skills' ? newSkill : newBenefit}
          onChangeText={label === 'Skills' ? setNewSkill : setNewBenefit}
          onSubmitEditing={onAdd}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={onAdd}>
          <Icon name="add" size={20} color="#1E88E5" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Job Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Information</Text>
            
            {renderInput(
              'Job Title',
              'title',
              'e.g., Senior React Developer',
              'default',
              true
            )}
            
            {renderInput(
              'Job Description',
              'description',
              'Describe the role, responsibilities, and requirements...',
              'default',
              true
            )}
            
            <View style={styles.row}>
              {renderPicker(
                'Job Type',
                'jobType',
                [
                  { label: 'Full Time', value: 'full-time' },
                  { label: 'Part Time', value: 'part-time' },
                  { label: 'Contract', value: 'contract' },
                  { label: 'Internship', value: 'internship' },
                  { label: 'Freelance', value: 'freelance' },
                ],
                true
              )}
              
              {renderPicker(
                'Work Mode',
                'workMode',
                [
                  { label: 'Office', value: 'office' },
                  { label: 'Remote', value: 'remote' },
                  { label: 'Hybrid', value: 'hybrid' },
                ],
                true
              )}
            </View>
          </View>

          {/* Company Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            
            {renderInput(
              'Company Name',
              'company.name',
              'e.g., Tech Corp',
              'default',
              true
            )}
            
            <View style={styles.row}>
              {renderInput(
                'Website',
                'company.website',
                'https://company.com',
                'default'
              )}
              
              {renderPicker(
                'Company Size',
                'company.size',
                [
                  { label: '1-10 employees', value: '1-10' },
                  { label: '11-50 employees', value: '11-50' },
                  { label: '51-200 employees', value: '51-200' },
                  { label: '201-500 employees', value: '201-500' },
                  { label: '501-1000 employees', value: '501-1000' },
                  { label: '1000+ employees', value: '1000+' },
                ]
              )}
            </View>
            
            {renderInput(
              'Industry',
              'company.industry',
              'e.g., Technology, Healthcare, Finance',
              'default'
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <View style={styles.row}>
              {renderInput(
                'City',
                'location.city',
                'e.g., Mumbai',
                'default',
                true
              )}
              
              {renderInput(
                'State',
                'location.state',
                'e.g., Maharashtra',
                'default',
                true
              )}
            </View>
          </View>

          {/* Salary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salary</Text>
            
            <View style={styles.row}>
              {renderInput(
                'Min Salary (₹)',
                'salary.min',
                'e.g., 50000',
                'numeric',
                true
              )}
              
              {renderInput(
                'Max Salary (₹)',
                'salary.max',
                'e.g., 100000',
                'numeric',
                true
              )}
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            
            <View style={styles.row}>
              {renderInput(
                'Min Experience (Years)',
                'requirements.experience.min',
                '0',
                'numeric'
              )}
              
              {renderInput(
                'Max Experience (Years)',
                'requirements.experience.max',
                '10',
                'numeric'
              )}
            </View>
            
            {renderInput(
              'Education',
              'requirements.education',
              'e.g., Bachelor\'s degree in Computer Science',
              'default'
            )}
            
            {renderTags(
              'Skills',
              formData.requirements.skills,
              handleAddSkill,
              handleRemoveSkill,
              'Add skill'
            )}
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits & Perks</Text>
            
            {renderTags(
              'Benefits',
              formData.benefits,
              handleAddBenefit,
              handleRemoveBenefit,
              'Add benefit'
            )}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Post Job</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
  },
  removeTagButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E88E5',
    paddingVertical: 15,
    borderRadius: 25,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PostJobScreen;
