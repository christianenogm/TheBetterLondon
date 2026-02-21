/**
 * ReviewSubmitScreen - TheBetterLondon
 * US-205: Review and Submit the Report
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, PrimaryButton, SecondaryButton, Card, Loading } from '../../components';


const POINTS_REWARD = 10;

const ReviewSubmitScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
   const { 
    photos = [], 
    category, 
    title, 
    description, 
    location, 
    address 
  } = route.params || {};

  const [submitting, setSubmitting] = useState(false);

  const submitReport = async () => {
    if (submitting) return;  
    setSubmitting(true);

    try {
      await new Promise((res) => setTimeout(res, 2000));

      Alert.alert(
        'Report Submitted!',
        `You earned ${POINTS_REWARD} points.`,
        [{ 
          text: 'OK', 
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }) 
        }]
      );

    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <ScreenContainer>
        <Loading text="Submitting report..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable edges={[]}>
   {/* Header */}
      <Text style={styles.mainTitle}>Review Report</Text>
      <Text style={styles.mainSubtitle}>Make sure everything looks correct before submitting</Text>

      {/* Category */}
      {category && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SelectCategory', {
                  fromReview: true,
                  ...route.params,
                })
              }
            >
              <Text style={styles.linkText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.categoryBox, { backgroundColor: `${category.color}33` }]}>
            <Icon name={category.icon} size={24} color={category.color} />
            <Text style={[styles.categoryLabel, { color: category.color }]}>{category.label}</Text>
          </View>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Details</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddDetails', { ...route.params })
            }
          >
            <Text style={styles.linkText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.detailTitle}>{title}</Text>
          {!!description && <Text style={styles.detailDescription}>{description}</Text>}
        </View>
      </View>

      {/* Photos */}
     <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('TakePhotos', {
              ...route.params,
              photos,
              // onUpdatePhotos: (updatedPhotos) => navigation.setParams({ photos: updatedPhotos }),
            })
          }
        >
          <Text style={styles.linkText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {photos.map((photo, i) => (
          <Image key={i} source={{ uri: photo.uri }} style={styles.photo} />
        ))}
      </ScrollView>
    </View>

      {/* Location */}
      {location && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity
             onPress={() =>
              navigation.navigate('AddLocation', {
                ...route.params,
                goToReview: true   
              })
            }
            >
              <Text style={styles.linkText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }}
            scrollEnabled={false}
          >
            <Marker coordinate={location} />
          </MapView>

          <Text style={styles.address}>{address}</Text>
        </View>
      )}

      {/* Prize */}
      <View style={styles.prizeContainer}>
        <Icon name="trophy-outline" size={24} color="#FFD700" />
        <Text style={styles.prizeText}>You'll earn {POINTS_REWARD} points for this report</Text>
      </View>

      {/* Submit */}
      <PrimaryButton
        title="Submit Report"
        onPress={submitReport}
        disabled={submitting}
        style={styles.submitButton}
      />

      {/* Cancel */}
      <SecondaryButton
        title="Cancel"
        onPress={() =>
          Alert.alert(
            'Cancel Report',
            'Are you sure you want to cancel? Your changes will be lost.',
            [
              { text: 'No', style: 'cancel' },
              { 
                text: 'Yes', 
                onPress: () =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  })
              },
            ]
          )
        }
        style={styles.cancelButton}
      />
    </ScreenContainer>
  );
};
const styles = StyleSheet.create({

  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 20,
    marginTop: 16
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#555',
    marginHorizontal: 20,
    marginBottom: 12
  },
  section: {
    marginHorizontal: 20,
    marginTop: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  sectionTitle: {
    fontWeight: '700'
  },
  linkText: {
    color: '#4CAF50',
    fontWeight: '600'
  },
  categoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  categoryLabel: {
    marginLeft: 6,
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10
  },
  detailTitle: {
    fontWeight: '700',
    fontSize: 16
  },
  detailDescription: {
    color: '#555',
    marginTop: 4
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10
  },
  map: {
    height: 200,
    borderRadius: 12
  },
  address: {
    color: '#555',
    marginTop: 4
  },
  prizeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24
  },
  prizeText: {
    marginLeft: 6,
    fontWeight: '700'
  },
  submitButton: {
    marginHorizontal: 20,
    marginTop: 20
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 40
  }
});

export default ReviewSubmitScreen;
