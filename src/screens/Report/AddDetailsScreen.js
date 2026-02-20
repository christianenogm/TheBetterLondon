/**
 * AddDetailsScreen - TheBetterLondon
 * US-204: Add a Title and Description - DONE
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenContainer, TextInput, PrimaryButton } from '../../components';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const AddDetailsScreen = ({ route, navigation }) => {
  const { category, photos, location, address } = route.params || {};
  const theme = useTheme();

  // State for title and description
  const [title, setTitle] = useState(route.params?.title || '');
  const [description, setDescription] = useState(route.params?.description || '');
  
  // Continue handler with validation
  const continueHandler = () => {
    if (!title.trim()) {
      Alert.alert( 'Error', 'Please enter a title for the report.');
      return;
    }
    navigation.navigate('ReviewSubmit', {
      category,
      photos,
      location,
      address,
      title,
      description,
    });
  };

  return (
    <ScreenContainer scrollable edges={[]}>
  {/* Category */}
  {category && (
    <View style={[styles.categoryBox, { backgroundColor: `${category.color}33` }]}>
      <Icon name={category.icon} size={24} color={category.color} />
      <Text style={[styles.categoryLabel, { color: category.color }]}>{category.label}</Text>
    </View>
  )}

  {/* Title and subtitle */}
    <Text style={styles.title}>Describe the issue</Text>
    <Text style={styles.subtitle}>Help us understand what needs to be fixed</Text>

 {/* Inputs */}
    <View style={styles.inputsContainer}>
    <TextInput
      label="Title"
      placeholder="Brief summary of the issue"
      value={title}
      maxLength={MAX_TITLE_LENGTH}
      onChangeText={(text) => {
      setTitle(text);
    }}                  
    />
         
  {/* Character Counter for Title */}
    <Text style={styles.charCount}>{title.length}/{MAX_TITLE_LENGTH}</Text>
    <TextInput
      label="Description"
      placeholder="Provide detailed information about the issue..."
      value={description}
      onChangeText={setDescription}
      maxLength={MAX_DESCRIPTION_LENGTH}
      multiline
      numberOfLines={6}
    />
    
  {/* Character Counter for Description */}
    <Text style={styles.charCount}>{description.length}/{MAX_DESCRIPTION_LENGTH}</Text>
    </View>

  {/* Helpful Tips */}
  <View style={styles.tipsContainer}>
    <View style={styles.tipsHeader}>
      <Icon name="lightbulb-on-outline" size={20} color={theme.colors.primary[500]} />
        <Text style={styles.tipsTitle}>Helpful Tips:</Text>
    </View>
    <View style={{ marginTop: 8 }}>
      <Text style={styles.tipItem}>• Be specific about the location and size of the issue</Text>
      <Text style={styles.tipItem}>• Mention when you first noticed the problem</Text>
      <Text style={styles.tipItem}>• Include any safety concerns or urgency</Text>
      <Text style={styles.tipItem}>• Note if it affects accessibility</Text>
    </View>
  </View>

  {/* Continue Button */}
  <View style={styles.buttonContainer}>
    <PrimaryButton title="Continue" onPress={continueHandler} />
  </View>
</ScreenContainer>
  );
};

const styles = StyleSheet.create({
 categoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  categoryLabel: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  inputsContainer: {
    marginHorizontal: 20,
  },
  charCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginBottom: 12,
  },
  tipsContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipsTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
    color: '#555',
  },
  tipItem: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
  },
});

export default AddDetailsScreen;
