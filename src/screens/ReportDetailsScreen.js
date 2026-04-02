/**
 * ReportDetailsScreen - TheBetterLondon
 * US-302: View Individual Report Details
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Share, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer, Badge, Loading, IconButton } from '../components';
import { getReportById, upvoteReport } from '../services/reportsService';
import { formatTimeAgo } from '../utils/helpers';
import { ISSUE_CATEGORIES } from '../utils/constants';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

const ReportDetailsScreen = ({ route, navigation }) => {
  const { reportId } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      const data = await getReportById(reportId);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
      Alert.alert('Error', 'Could not load report details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const isOwnReport = report && report.userId === user?.id;
  const hasUpvoted = report?.upvotedBy?.includes(user?.id) ?? false;

  const handleUpvote = async () => {
    if (isOwnReport) {
      Alert.alert("Can't Upvote", 'You cannot upvote your own report.');
      return;
    }
    if (hasUpvoted) {
      Alert.alert('Already Upvoted', 'You have already upvoted this report.');
      return;
    }

    // Optimistic update
    setReport(prev => ({
      ...prev,
      upvotes: (prev.upvotes || 0) + 1,
      upvotedBy: [...(prev.upvotedBy || []), user.id],
    }));

    try {
      const updatedReport = await upvoteReport(reportId, user.id);
      setReport(updatedReport);
    } catch (error) {
      console.error('Error upvoting report:', error);
      // Revert optimistic update
      setReport(prev => ({
        ...prev,
        upvotes: Math.max((prev.upvotes || 1) - 1, 0),
        upvotedBy: (prev.upvotedBy || []).filter(id => id !== user.id),
      }));
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this issue in London: ${report.title}\n${report.address || ''}`,
        title: report.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getCategoryInfo = () => {
    const category = ISSUE_CATEGORIES.find(c => c.id === report.category);
    return category || { color: theme.colors.neutral[500], icon: 'alert-circle' };
  };

  const getCategoryLabel = (categoryId) => {
    const category = ISSUE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.label : 'Other';
  }

  const styles = StyleSheet.create({
    scrollContainer: {
      flex: 1,
    },
    photosContainer: {
      height: IMAGE_HEIGHT,
      position: 'relative',
    },
    photosScroll: {
      height: IMAGE_HEIGHT,
    },
    photo: {
      width,
      height: IMAGE_HEIGHT,
      backgroundColor: theme.colors.neutral[100],
    },
    photoIndicator: {
      position: 'absolute',
      bottom: theme.spacing[4],
      alignSelf: 'center',
      flexDirection: 'row',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.neutral[0],
      marginHorizontal: 4,
      opacity: 0.5,
    },
    activeDot: {
      opacity: 1,
    },
    noPhotoContainer: {
      height: IMAGE_HEIGHT,
      backgroundColor: theme.colors.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    noPhotoIcon: {
      marginBottom: theme.spacing[2],
    },
    noPhotoText: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
    },
    content: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[4],
      paddingBottom: theme.spacing[6],
    },
    header: {
      marginBottom: theme.spacing[4],
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing[3],
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.borderRadius.full,
    },
    categoryIcon: {
      marginRight: theme.spacing[2],
    },
    categoryText: {
      ...theme.typography.body2,
      fontWeight: theme.fontWeight.semibold,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    metaText: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing[1],
    },
    separator: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
      marginHorizontal: theme.spacing[2],
    },
    section: {
      marginBottom: theme.spacing[5],
    },
    sectionTitle: {
      ...theme.typography.body1,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    description: {
      ...theme.typography.body1,
      color: theme.colors.text.secondary,
      lineHeight: 24,
    },
    mapContainer: {
      height: 200,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      marginBottom: theme.spacing[2],
    },
    map: {
      flex: 1,
    },
    avatarMini: {
      width: 24, height: 24, borderRadius: 12, marginRight: 6, overflow: 'hidden',
    },
    avatarMiniFallback: {
      backgroundColor: theme.colors.neutral[200],
      alignItems: 'center', justifyContent: 'center',
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addressText: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing[1],
      flex: 1,
    },
    actionsRow: {
      flexDirection: 'row',
      paddingTop: theme.spacing[4],
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral[200],
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[3],
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing[2],
    },
    upvoteButton: {
      backgroundColor: theme.colors.primary.light,
    },
    upvoteButtonVoted: {
      backgroundColor: theme.colors.primary[100],
    },
    upvoteButtonDisabled: {
      backgroundColor: theme.colors.neutral[100],
    },
    shareButton: {
      backgroundColor: theme.colors.neutral[100],
    },
    actionIcon: {
      marginRight: theme.spacing[2],
    },
    actionText: {
      ...theme.typography.body2,
      fontWeight: theme.fontWeight.semibold,
    },
    upvoteText: {
      color: theme.colors.primary.main,
    },
    shareText: {
      color: theme.colors.text.primary,
    },
  });

  if (loading) {
    return <Loading />;
  }

  if (!report) {
    return null;
  }

  const categoryInfo = getCategoryInfo();

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Photos Gallery */}
        {report.photos && report.photos.length > 0 ? (
          <View style={styles.photosContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentPhotoIndex(index);
              }}
              scrollEventThrottle={16}
              style={styles.photosScroll}
            >
              {report.photos.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
            {report.photos.length > 1 && (
              <View style={styles.photoIndicator}>
                {report.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentPhotoIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noPhotoContainer}>
            <Icon
              name="image-off"
              size={theme.iconSize.xl}
              color={theme.colors.text.disabled}
              style={styles.noPhotoIcon}
            />
            <Text style={styles.noPhotoText}>No photos available</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: categoryInfo.color + '20' },
                ]}
              >
                <Icon
                  name={categoryInfo.icon}
                  size={theme.iconSize.sm}
                  color={categoryInfo.color}
                  style={styles.categoryIcon}
                />
                <Text style={[styles.categoryText, { color: categoryInfo.color, textTransform: 'capitalize' }]}>
                  {getCategoryLabel(report.category)}
                </Text>
              </View>
              <Badge variant={report.status} />
            </View>

            <Text style={styles.title}>{report.title}</Text>

            <View style={styles.metaRow}>
              {report.userPhotoURL ? (
                <Image source={{ uri: report.userPhotoURL }} style={styles.avatarMini} />
              ) : (
                <View style={[styles.avatarMini, styles.avatarMiniFallback]}>
                  <Icon name="account" size={14} color={theme.colors.text.secondary} />
                </View>
              )}
              <Text style={styles.metaText}>{report.userName}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.metaText}>{formatTimeAgo(report.createdAt)}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{report.description}</Text>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={{
                  latitude: report.location.latitude,
                  longitude: report.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: report.location.latitude,
                    longitude: report.location.longitude,
                  }}
                  pinColor={categoryInfo.color}
                />
              </MapView>
            </View>
            <View style={styles.addressRow}>
              <Icon
                name="map-marker"
                size={theme.iconSize.sm}
                color={theme.colors.text.secondary}
              />
              <Text style={styles.addressText}>{report.address || 'Unknown location'}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.upvoteButton,
                hasUpvoted && styles.upvoteButtonVoted,
                isOwnReport && styles.upvoteButtonDisabled,
              ]}
              onPress={handleUpvote}
              disabled={isOwnReport || hasUpvoted}
            >
              <Icon
                name={hasUpvoted ? 'arrow-up-bold' : 'arrow-up-bold-outline'}
                size={theme.iconSize.md}
                color={
                  isOwnReport
                    ? theme.colors.neutral[400]
                    : hasUpvoted
                    ? theme.colors.primary[500]
                    : theme.colors.primary.main
                }
                style={styles.actionIcon}
              />
              <Text
                style={[
                  styles.actionText,
                  styles.upvoteText,
                  (isOwnReport || hasUpvoted) && { color: isOwnReport ? theme.colors.neutral[400] : theme.colors.primary[500] },
                ]}
              >
                {report.upvotes ?? 0} {hasUpvoted ? 'Upvoted' : 'Upvotes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Icon
                name="share-variant"
                size={theme.iconSize.md}
                color={theme.colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, styles.shareText]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default ReportDetailsScreen;