/**
 * TakePhotosScreen - TheBetterLondon
 * US-202: Take or Upload Photos of the Issue - DONE
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import CustomerAlert from '../../components/Alert/Alert';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenContainer, PrimaryButton, SecondaryButton, Card, EmptyState, Photo } from '../../components';

const MAX_PHOTOS = 5;

const TakePhotosScreen = ({ navigation, route}) => {
  const theme = useTheme();

  // const category = route.params?.category; 
  const { category } = route.params || {};
  const [photos, setPhotos] = useState(route.params?.photos || []);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if ((route.params?.photos || []).length === 0) {
      takePhoto();
    }
  }, []);

  const checkPhotoLimit = () => {
    if (photos.length >= MAX_PHOTOS) {
      setLimitReached(true);
      return false;
    }

    setLimitReached(false);
    return true;
  };

  // take photo using camera
  const takePhoto = async () => {

    if (!checkPhotoLimit()) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {

      const asset = result.assets[0];

      const newPhoto = {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      setPhotos(prev => [...prev, newPhoto]);
      setLimitReached(false);
    }
  };

  // pick photo from gallery
  const pickFromGallery = async () => {

    if (!checkPhotoLimit()) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {

      const asset = result.assets[0];

      const newPhoto = {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
    };

    setPhotos(prev => [...prev, newPhoto]);
    setLimitReached(false);
  }
};

// remove photo from list
const removePhoto = (index) => {
  const updated = photos.filter((_, i) => i !== index);
  setPhotos(updated);

  if (updated.length < MAX_PHOTOS) {
    setLimitReached(false);
  }
};
 
// continue to next step
const continueHandler = () => {

  if (photos.length === 0)  { 
    Alert.alert('At least one photo is required');
    return;
  }

  const goToReview = route.params?.goToReview || false;
  if (goToReview) {
    navigation.navigate('ReviewSubmit', { ...route.params, photos });
  } else {
    navigation.navigate('AddLocation', { photos, category });
  }
};

return (
  <ScreenContainer scrollable>
    {/* Category card */}
    {category && (
    <View style={[styles.categoryBox, { backgroundColor: `${category.color}33` }]}>
      <Icon name={category.icon} size={24} color={category.color} />
      <Text style={[styles.categoryLabel, { color: category.color }]}>{category.label}</Text>
    </View>
    )}
    {/* title and subtitle */}
    <Text style={styles.title}>Add Photos</Text>
    <Text style={styles.subtitle}>
      At least one photo is required to help identify the issue.
     </Text>

    {/* Photos container */}
    <View style={styles.photoContainer}>
      {photos.length === 0 ? (
      <View style={styles.emptyContainer}>
      <EmptyState
          icon="camera-plus-outline"
          title="No photos added yet"
          description={`Add up to ${MAX_PHOTOS} photos to help identify the issue`}
      />
      </View>
      ) : (
    <ScrollView showsVerticalScrollIndicator={false}  
      contentContainerStyle={{ paddingBottom: 10 }}>
      <View style={styles.photosGrid}>
        {photos.map((photo, index) => (
        <View key={index} style={styles.photoBox}>
        <Image source={{ uri: photo.uri }} style={styles.photo} />
          <TouchableOpacity
            style={styles.removePhotoBtn}
            onPress={() => removePhoto(index)}>
            <Icon name="close-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
      </View>
    </ScrollView>
     )}
  </View>
  {limitReached && (
    <CustomerAlert
      type="warning"
      title="Photo limit reached"
      message={`You can only add up to ${MAX_PHOTOS} photos.`}
      style={{ marginBottom: 16 }}
    />
  )}
  {/* Action Buttons */}
  <View style={styles.actionsRow}>
    <SecondaryButton
      onPress={takePhoto}
      style={{ flex: 1, marginRight: 8 }}
    >
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="camera" size={20} color="#4CAF50" />
      <Text style={{ marginLeft: 6, color: '#4CAF50', fontWeight: '600' }}>Take Photo</Text>
    </View>
    </SecondaryButton>

    <SecondaryButton
      onPress={pickFromGallery}
      style={{ flex: 1, marginLeft: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="image" size={20} color="#4CAF50" />
        <Text style={{ marginLeft: 6, color: '#4CAF50', fontWeight: '600' }}>Choose Photo</Text>
      </View>
    </SecondaryButton>
  </View>

  {/* Button Continue */}
  <View style={styles.actionsRow}>
    <PrimaryButton
      title="Continue"
      onPress={continueHandler}
      style={{ marginTop: 20, width: '100%' }}  
      disabled={photos.length === 0}
    />
  </View>
  {/* Note */}
    <Text style={styles.note}>At least one photo is required.</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  photoBox: {
    width: '48%',   
    aspectRatio: 1, 
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 15,
    padding: 4,
    zIndex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
  },
  note: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default TakePhotosScreen;
