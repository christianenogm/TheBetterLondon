/**
 * MyReportsScreen - TheBetterLondon
 * US-107: View My Submitted Reports
 * - Lists all reports submitted by the current user
 * - Filterable by: All, Open Issues, Resolved Issues
 * - Tappable to view full report details
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer, Card, Badge, EmptyState, Loading } from '../components';
import { getUserReports } from '../services/reportsService';
import { formatTimeAgo } from '../utils/helpers';
import { ISSUE_CATEGORIES } from '../utils/constants';

// Filter definitions
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open Issues' },
  { key: 'resolved', label: 'Resolved' },
];

const OPEN_STATUSES = ['pending', 'open', 'under_review', 'in_progress'];
const RESOLVED_STATUSES = ['resolved', 'closed'];

const MyReportsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadReports = async () => {
    try {
      const data = await getUserReports(user.id);
      setReports(data);
    } catch (error) {
      console.error('Error loading user reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports();
  }, []);

  const getFilteredReports = () => {
    switch (activeFilter) {
      case 'open':
        return reports.filter(r => OPEN_STATUSES.includes(r.status));
      case 'resolved':
        return reports.filter(r => RESOLVED_STATUSES.includes(r.status));
      default:
        return reports;
    }
  };

  const getCategoryInfo = (categoryId) => {
    return (
      ISSUE_CATEGORIES.find(c => c.id === categoryId) || {
        label: 'Other',
        icon: 'help-circle',
        color: theme.colors.neutral[500],
      }
    );
  };

  const handleReportPress = (report) => {
    navigation.navigate('ReportDetails', { reportId: report.id });
  };

  const filteredReports = getFilteredReports();

  const renderReportCard = ({ item }) => {
    const category = getCategoryInfo(item.category);

    return (
      <TouchableOpacity onPress={() => handleReportPress(item)} activeOpacity={0.7}>
        <Card style={styles.reportCard}>
          {/* Header: category + status badge */}
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.colors.neutral[100] }]}>
              <Icon
                name={category.icon}
                size={theme.iconSize.sm}
                color={category.color}
                style={{ marginRight: theme.spacing[1] }}
              />
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.label}
              </Text>
            </View>
            <Badge variant={item.status} />
          </View>

          {/* Thumbnail photo */}
          {item.photos && item.photos.length > 0 && (
            <Image source={{ uri: item.photos[0] }} style={styles.photo} />
          )}

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Location row */}
          <View style={styles.locationRow}>
            <Icon
              name="map-marker"
              size={theme.iconSize.sm}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location?.address || 'Unknown location'}
            </Text>
          </View>

          {/* Footer: timestamp + upvotes (own reports can't be upvoted) */}
          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <Icon
                name="clock-outline"
                size={theme.iconSize.sm}
                color={theme.colors.text.secondary}
              />
              <Text style={styles.metaText}>{formatTimeAgo(item.createdAt)}</Text>
            </View>
            <View style={[styles.metaRow, styles.upvoteCount]}>
              <Icon
                name="arrow-up-bold"
                size={theme.iconSize.sm}
                color={theme.colors.neutral[400]}
              />
              <Text style={[styles.metaText, { color: theme.colors.neutral[400] }]}>
                {item.upvotes ?? 0} upvotes
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    filterBar: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      gap: theme.spacing[2],
      backgroundColor: theme.colors.neutral[0],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    filterChip: {
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      backgroundColor: theme.colors.neutral[0],
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary[500],
      borderColor: theme.colors.primary[500],
    },
    filterChipText: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
      fontWeight: theme.fontWeight.medium,
    },
    filterChipTextActive: {
      color: theme.colors.neutral[0],
    },
    listContent: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[4],
      paddingBottom: theme.spacing[8],
    },
    reportCard: {
      marginBottom: theme.spacing[4],
      padding: theme.spacing[4],
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[3],
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[1],
      paddingHorizontal: theme.spacing[2],
      borderRadius: theme.borderRadius.full,
    },
    categoryText: {
      ...theme.typography.caption,
      fontWeight: theme.fontWeight.semibold,
    },
    photo: {
      width: '100%',
      height: 180,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing[3],
      backgroundColor: theme.colors.neutral[100],
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
      lineHeight: 20,
      marginBottom: theme.spacing[3],
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing[3],
    },
    locationText: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing[1],
      flex: 1,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.default,
      paddingTop: theme.spacing[3],
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[1],
    },
    upvoteCount: {
      paddingVertical: theme.spacing[1],
      paddingHorizontal: theme.spacing[2],
      backgroundColor: theme.colors.neutral[100],
      borderRadius: theme.borderRadius.full,
    },
    metaText: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing[1],
    },
    emptyContainer: {
      flex: 1,
      paddingTop: theme.spacing[16],
    },
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <View style={styles.filterBar}>
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Report list */}
      <FlatList
        data={filteredReports}
        keyExtractor={item => item.id}
        renderItem={renderReportCard}
        contentContainerStyle={[
          styles.listContent,
          filteredReports.length === 0 && { flex: 1 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="file-document-outline"
              title="No reports yet"
              description={
                activeFilter === 'all'
                  ? "You haven't submitted any reports yet.\nTap the Report tab to get started."
                  : `No ${activeFilter === 'open' ? 'open' : 'resolved'} reports found.`
              }
              actionLabel={activeFilter === 'all' ? 'Report an Issue' : undefined}
              onActionPress={
                activeFilter === 'all'
                  ? () => navigation.navigate('Report')
                  : undefined
              }
            />
          </View>
        }
      />
    </View>
  );
};

export default MyReportsScreen;
