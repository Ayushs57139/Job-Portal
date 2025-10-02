import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const EducationModal = ({ visible, onClose, onSave, onSkip }) => {
  const [educationEntries, setEducationEntries] = useState([{
    id: 1,
    levelOfEducation: '',
    degree: '',
    specialization: '',
    institution: '',
    educationStatus: '',
    startDate: '',
    endDate: '',
    educationType: '',
    educationMedium: '',
    marksType: '',
    marksValue: '',
    isHighest: false,
    itiTrade: '',
    diplomaField: '',
    graduateDegree: '',
    postGraduateDegree: '',
    doctorateDegree: ''
  }]);

  const educationOptions = {
    levels: ['No Education', 'Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate', 'PPG', 'Doctorate', 'Ph.D', 'Other'],
    institutions: ['Delhi University', 'Sharada University', 'No Education', 'Other'],
    statuses: ['Pursuing / Running', 'Pass Out / Completed'],
    types: ['Full Time', 'Part Time', 'Correspondence', 'Any'],
    marksTypes: ['Grade', 'Percentage', 'Division', 'CGPA'],
    itiTrades: ['Electrical', 'Mechanical Engineering', 'Electronics', 'Civil Engineering', 'Fitter', 'Electrical Engineering', 'Wireman', 'Computer Science & Engineering', 'Diesel Mechanic', 'Electronics & Communication Engineering', 'Mechanical', 'Automobile Engineering', 'Electrician', 'Information Technology (IT)', 'Mechanic Motor Vehicle', 'Mechatronics', 'Draughtsman (Mechanical)', 'Aeronautical Engineering', 'Draughtsman (Civil)', 'Mining Engineering', 'Tool & Die Maker', 'Medical Laboratory Technology (DMLT)', 'Mechanic Machine Tool Maintenance', 'Radiology & Imaging Technology', 'Electronics Mechanic', 'Nursing', 'Mechanic (Refrigeration & Air-Conditioning)', 'Pharmacy', 'Welder', 'Physiotherapy', 'COPA', 'Optometry', 'Stenographer', 'Veterinary Science', 'Hair & Skin Care', 'Ayurveda Pharmacy', 'Secretarial Practice', 'Accounting & Finance', 'Dress Making', 'Business Administration', 'Sewing Technology', 'Banking & Insurance', 'Plumber', 'Digital Marketing', 'Painter', 'Retail Management', 'Mechanic Two and Three Wheeler', 'Taxation', 'Financial Management', 'E-commerce', 'Office Management', 'Fashion Designing', 'Interior Designing', 'Graphic Designing', 'Animation & Multimedia', 'Journalism & Mass Communication', 'Photography', 'Event Management', 'Hotel Management', 'Fine Arts', 'Travel & Tourism', 'Biotechnology', 'Microbiology', 'Environmental Science', 'Forensic Science', 'Food Technology', 'Clinical Research', 'Education (Special Education, Early Childhood)', 'Social Work', 'Public Administration', 'Psychology', 'Library & Information Science', 'Dairy Technology', 'Food Processing', 'Industrial Safety', 'Fire & Safety Engineering', 'Applied Art', 'Drawing & Painting', 'Sculpture & Modelling', 'Textile Designing', 'Aerospace Engineering', 'Industrial Engineering', 'Information Engineering', 'Chemical Engineering', 'Instrumentation Engineering', 'Marine Engineering', 'Computer Engineering', 'Petroleum Engineering', 'Electronics Engineering', 'Textile Engineering', 'Geographic Information Systems (GIS)', 'Paint Technology', 'Elementary Education', 'Architecture', 'Chemical Fertilizer', 'Metallurgical Engineering', 'IT Smart', 'Other'],
    graduateDegrees: ['B.A', 'B.Arch', 'B.A Hons', 'B.Com', 'B.Com Hons.', 'B.Design', 'B.Ed', 'B.EI.Ed', 'B.E / B.Tech', 'B.F Tech', 'B.Sc', 'B.Sc Hons.', 'B.P.Ed', 'B.U.M.S', 'B.Voc', 'B.Pharma', 'B.Pharma Hons.', 'Bachelor', 'BASc', 'BAF', 'BAMS', 'BBA', 'BBA Hons.', 'BCA', 'BDS', 'BFA', 'BHM', 'BHMS', 'BHMCT', 'BPA', 'BMS', 'MBBS', 'LLB', 'LLB Hons.', 'Pharma.D', 'BS', 'BVSC', 'Dual Degree (BE/B.Tech + ME/M.Tech)', 'B.Ed Special Education', 'Bachelor of Audiology and Speech Language Pathology', 'Bachelor of Commerce in Banking and Finance', 'Bachelor of Commerce in Business Economics', 'Bachelor of Development Studies', 'Bachelor of Environmental Design', 'Bachelor of Environmental Management', 'Bachelor of Event Management', 'Bachelor of international economics', 'Bachelor of Journalism and Mass Communication', 'Bachelor of Music', 'Bachelor of Music Therapy', 'Bachelor of Naturopathy and Yogic Science', 'Bachelor of Occupational Therapy', 'Bachelor of Physiotherapy', 'Bachelor of Public Health', 'Bachelor of Social innovation', 'Bachelor of Social Work', 'Bachelor of Tourism Studies in Cultural Heritage', 'Bachelor of Urban Planning', 'Bachelor of Veterinary Science', 'Bachelor of Vocational Studies', 'Bachelors of Liberal Arts', 'Certified Financial Planner', 'Company Secretary', 'Nursery Teacher Training', 'Other'],
    postGraduateDegrees: ['M.A', 'M.Arch', 'M.A Hons', 'M.Com', 'M.Com Hons.', 'M.Design', 'M.Ed', 'M.EI.Ed', 'M.E / M.Tech', 'M.F Tech', 'M.Sc', 'M.Sc Hons.', 'M.P.Ed', 'M.U.M.S', 'M.Voc', 'M.Pharma', 'M.Pharma Hons.', 'Master', 'MASc', 'MAF', 'MAMS', 'MBA', 'MBA Hons.', 'MCA', 'MDS', 'MFA', 'MHM', 'MHMS', 'MHMCT', 'MPA', 'MMS', 'MD', 'LLM', 'LLM Hons.', 'Pharma.D', 'MS', 'MVSC', 'Dual Degree (BE/B.Tech + ME/M.Tech)', 'M.Ed Special Education', 'Master of Audiology and Speech Language Pathology', 'Master of Commerce in Banking and Finance', 'Master of Commerce in Business Economics', 'Master of Development Studies', 'Master of Environmental Design', 'Master of Environmental Management', 'Master of Event Management', 'Master of international economics', 'Master of Journalism and Mass Communication', 'Master of Music', 'Master of Music Therapy', 'Master of Naturopathy and Yogic Science', 'Master of Occupational Therapy', 'Master of Physiotherapy', 'Master of Public Health', 'Master of Social innovation', 'Master of Social Work', 'Master of Tourism Studies in Cultural Heritage', 'Master of Urban Planning', 'Master of Veterinary Science', 'Master of Vocational Studies', 'Masters of Liberal Arts', 'Certified Financial Planner', 'Company Secretary', 'Nursery Teacher Training', 'Other'],
    doctorateDegrees: ['Ph.D', 'D.Phil', 'D.Sc', 'D.Litt', 'D.M', 'M.Ch', 'D.M.S', 'Other']
  };

  const addEducationEntry = () => {
    const newEntry = {
      id: Date.now(),
      levelOfEducation: '',
      degree: '',
      specialization: '',
      institution: '',
      educationStatus: '',
      startDate: '',
      endDate: '',
      educationType: '',
      educationMedium: '',
      marksType: '',
      marksValue: '',
      isHighest: false,
      itiTrade: '',
      diplomaField: '',
      graduateDegree: '',
      postGraduateDegree: '',
      doctorateDegree: ''
    };
    setEducationEntries([...educationEntries, newEntry]);
  };

  const removeEducationEntry = (id) => {
    if (educationEntries.length > 1) {
      setEducationEntries(educationEntries.filter(entry => entry.id !== id));
    } else {
      Alert.alert('Cannot Remove', 'At least one education entry is required.');
    }
  };

  const updateEducationEntry = (id, field, value) => {
    setEducationEntries(educationEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const getDependentFields = (level) => {
    switch(level) {
      case 'ITI':
        return 'itiTrade';
      case 'Diploma':
        return 'diplomaField';
      case 'Graduate':
        return 'graduateDegree';
      case 'Post Graduate':
        return 'postGraduateDegree';
      case 'Doctorate':
      case 'Ph.D':
        return 'doctorateDegree';
      default:
        return null;
    }
  };

  const getDependentOptions = (field) => {
    switch(field) {
      case 'itiTrade':
        return educationOptions.itiTrades;
      case 'diplomaField':
        return educationOptions.itiTrades; // Same options as ITI
      case 'graduateDegree':
        return educationOptions.graduateDegrees;
      case 'postGraduateDegree':
        return educationOptions.postGraduateDegrees;
      case 'doctorateDegree':
        return educationOptions.doctorateDegrees;
      default:
        return [];
    }
  };

  const handleSave = () => {
    const validEntries = educationEntries.filter(entry => entry.levelOfEducation);
    if (validEntries.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one education entry or skip this step.');
      return;
    }
    onSave(validEntries);
  };

  const handleSkip = () => {
    onSkip();
  };

  const renderEducationEntry = (entry, index) => {
    const dependentField = getDependentFields(entry.levelOfEducation);
    const dependentOptions = getDependentOptions(dependentField);

    return (
      <View key={entry.id} style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryNumber}>{index + 1}</Text>
          {educationEntries.length > 1 && (
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeEducationEntry(entry.id)}
            >
              <Icon name="delete" size={20} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Level of Education *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={entry.levelOfEducation}
                  onValueChange={(value) => updateEducationEntry(entry.id, 'levelOfEducation', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Level" value="" />
                  {educationOptions.levels.map(level => (
                    <Picker.Item key={level} label={level} value={level} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Institution</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={entry.institution}
                  onValueChange={(value) => updateEducationEntry(entry.id, 'institution', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Institution" value="" />
                  {educationOptions.institutions.map(institution => (
                    <Picker.Item key={institution} label={institution} value={institution} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Education Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={entry.educationStatus}
                  onValueChange={(value) => updateEducationEntry(entry.id, 'educationStatus', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Status" value="" />
                  {educationOptions.statuses.map(status => (
                    <Picker.Item key={status} label={status} value={status} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Education Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={entry.educationType}
                  onValueChange={(value) => updateEducationEntry(entry.id, 'educationType', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Type" value="" />
                  {educationOptions.types.map(type => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date (MM-YYYY)</Text>
              <TextInput
                style={styles.input}
                value={entry.startDate}
                onChangeText={(value) => updateEducationEntry(entry.id, 'startDate', value)}
                placeholder="MM-YYYY"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>End Date (MM-YYYY)</Text>
              <TextInput
                style={styles.input}
                value={entry.endDate}
                onChangeText={(value) => updateEducationEntry(entry.id, 'endDate', value)}
                placeholder="MM-YYYY"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Details</Text>
          
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Degree/Course</Text>
              <TextInput
                style={styles.input}
                value={entry.degree}
                onChangeText={(value) => updateEducationEntry(entry.id, 'degree', value)}
                placeholder="Enter degree or course name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.input}
                value={entry.specialization}
                onChangeText={(value) => updateEducationEntry(entry.id, 'specialization', value)}
                placeholder="Enter specialization"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Education Medium</Text>
              <TextInput
                style={styles.input}
                value={entry.educationMedium}
                onChangeText={(value) => updateEducationEntry(entry.id, 'educationMedium', value)}
                placeholder="e.g., English, Hindi, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marks Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={entry.marksType}
                  onValueChange={(value) => updateEducationEntry(entry.id, 'marksType', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Type" value="" />
                  {educationOptions.marksTypes.map(type => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marks/Percentage/Grade</Text>
              <TextInput
                style={styles.input}
                value={entry.marksValue}
                onChangeText={(value) => updateEducationEntry(entry.id, 'marksValue', value)}
                placeholder="Enter your marks"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Highest Qualification</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={entry.isHighest}
                  onValueChange={(value) => updateEducationEntry(entry.id, 'isHighest', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="No" value={false} />
                  <Picker.Item label="Yes" value={true} />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Dependent Fields */}
        {dependentField && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {entry.levelOfEducation} Details
            </Text>
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {entry.levelOfEducation} Field
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={entry[dependentField]}
                    onValueChange={(value) => updateEducationEntry(entry.id, dependentField, value)}
                    style={styles.picker}
                  >
                    <Picker.Item label={`Select ${entry.levelOfEducation} Field`} value="" />
                    {dependentOptions.map(option => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Education Details</Text>
          <Text style={styles.subtitle}>Please provide your educational background</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {educationEntries.map((entry, index) => renderEducationEntry(entry, index))}

          <TouchableOpacity style={styles.addButton} onPress={addEducationEntry}>
            <Icon name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Another Education</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  entryContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  entryNumber: {
    backgroundColor: '#667eea',
    color: 'white',
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
    fontSize: 14,
  },
  removeButton: {
    padding: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  addButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  skipButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  skipButtonText: {
    color: '#212529',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default EducationModal;
