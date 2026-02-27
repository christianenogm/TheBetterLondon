/**
 * HomeScreen - TheBetterLondon
 * Epic 3: View Reports Feed (US-301)
 * Display community-reported issues
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer, Card, Badge, EmptyState, Loading, FilterSheet } from '../components';
import { getAllReports, upvoteReport } from '../services/reportsService';
import { formatTimeAgo } from '../utils/helpers';
import { ISSUE_CATEGORIES } from '../utils/constants';

const FILTER_STORAGE_KEY = '@home_category_filters';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Load persisted filters on mount
  useEffect(() => {
    AsyncStorage.getItem(FILTER_STORAGE_KEY)
      .then(stored => {
        if (stored) setSelectedCategories(JSON.parse(stored));
      })
      .catch(() => {});
  }, []);

  // Persist filters whenever they change
  useEffect(() => {
    AsyncStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(selectedCategories)).catch(() => {});
  }, [selectedCategories]);

  const filteredReports =
    selectedCategories.length === 0
      ? reports
      : reports.filter(r => selectedCategories.includes(r.category));

  const loadReports = async () => {
    try {
      const data = await getAllReports();
      // Sort by upvotes descending so popular reports rise to the top
      const sorted = [...data].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      setReports(sorted);
    } catch (error) {
      console.error('Error loading reports:', error);
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

  const handleApplyFilters = (categories) => {
    setSelectedCategories(categories);
  };

  const removeFilter = (id) => {
    setSelectedCategories(prev => prev.filter(c => c !== id));
  };

  const handleUpvote = async (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (report.userId === user?.id) {
      Alert.alert("Can't Upvote", 'You cannot upvote your own report.');
      return;
    }
    if (report.upvotedBy?.includes(user?.id)) {
      Alert.alert('Already Upvoted', 'You have already upvoted this report.');
      return;
    }

    // Optimistic update
    setReports(prev =>
      prev.map(r =>
        r.id === reportId
          ? { ...r, upvotes: (r.upvotes || 0) + 1, upvotedBy: [...(r.upvotedBy || []), user.id] }
          : r
      )
    );

    try {
      await upvoteReport(reportId, user.id);
    } catch (error) {
      console.error('Error upvoting report:', error);
      // Revert on failure
      setReports(prev =>
        prev.map(r =>
          r.id === reportId
            ? { ...r, upvotes: Math.max((r.upvotes || 1) - 1, 0), upvotedBy: (r.upvotedBy || []).filter(id => id !== user.id) }
            : r
        )
      );
    }
  };

  const handleReportPress = (report) => {
    navigation.navigate('ReportDetails', { reportId: report.id });
  };

  const getCategoryColor = (categoryId) => {
    const category = ISSUE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.color : theme.colors.neutral[500];
  };

  const getCategoryIcon = (categoryId) => {
    const category = ISSUE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.icon : 'alert-circle';
  };

  const getCategoryLabel = (categoryId) => {
    const category = ISSUE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.label : 'Other';
  }

  const renderReportCard = ({ item }) => {
    const categoryColor = getCategoryColor(item.category);
    const categoryIcon = getCategoryIcon(item.category);
    const isOwnReport = item.userId === user?.id;
    const hasUpvoted = item.upvotedBy?.includes(user?.id) ?? false;
    const upvoteDisabled = isOwnReport || hasUpvoted;
    const upvoteColor = hasUpvoted
      ? theme.colors.primary[500]
      : isOwnReport
      ? theme.colors.neutral[400]
      : theme.colors.primary.main;

    return (
      <TouchableOpacity
        onPress={() => handleReportPress(item)}
        activeOpacity={0.7}
      >
        <Card style={styles.reportCard}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Icon
                name={categoryIcon}
                size={theme.iconSize.sm}
                color={categoryColor}
                style={styles.categoryIcon}
              />
              <Text style={[styles.categoryText, { color: categoryColor, textTransform: 'capitalize' }]}>
                {getCategoryLabel(item.category)}
              </Text>
            </View>
            <Badge variant={item.status} />
          </View>

          {/* Photo if available */}
          {item.photos && item.photos.length > 0 && (
            <Image
              source={{ uri: item.photos[0] }}
              style={styles.photo}
            />
          )}

          {/* Title & Description */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Icon
              name="map-marker"
              size={theme.iconSize.sm}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location.address}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <Icon
                name="account"
                size={theme.iconSize.sm}
                color={theme.colors.text.secondary}
              />
              <Text style={styles.metaText}>{item.userName}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.metaText}>{formatTimeAgo(item.createdAt)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.upvoteButton,
                hasUpvoted && styles.upvoteButtonVoted,
                isOwnReport && styles.upvoteButtonDisabled,
              ]}
              onPress={() => handleUpvote(item.id)}
              disabled={upvoteDisabled}
            >
              <Icon
                name={hasUpvoted ? 'arrow-up-bold' : 'arrow-up-bold-outline'}
                size={theme.iconSize.sm}
                color={upvoteColor}
              />
              <Text style={[styles.upvoteText, { color: upvoteColor }]}>{item.upvotes ?? 0}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[2],
      paddingBottom: theme.spacing[4],
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      backgroundColor: theme.colors.neutral[0],
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      backgroundColor: theme.colors.neutral[0],
      marginRight: theme.spacing[2],
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary[500],
      borderColor: theme.colors.primary[500],
    },
    filterButtonText: {
      ...theme.typography.body2,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeight.semibold,
      marginLeft: theme.spacing[1],
    },
    filterButtonTextActive: {
      color: theme.colors.neutral[0],
    },
    clearAllButton: {
      marginRight: theme.spacing[2],
    },
    clearAllText: {
      ...theme.typography.body2,
      color: theme.colors.primary[500],
      fontWeight: theme.fontWeight.semibold,
    },
    countText: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginLeft: 'auto',
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      gap: theme.spacing[2],
      backgroundColor: theme.colors.neutral[0],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[1],
      paddingHorizontal: theme.spacing[2],
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    chipText: {
      ...theme.typography.caption,
      fontWeight: theme.fontWeight.semibold,
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
      backgroundColor: theme.colors.neutral[100],
      paddingVertical: theme.spacing[1],
      paddingHorizontal: theme.spacing[2],
      borderRadius: theme.borderRadius.full,
    },
    categoryIcon: {
      marginRight: theme.spacing[1],
    },
    categoryText: {
      ...theme.typography.caption,
      fontWeight: theme.fontWeight.semibold,
    },
    photo: {
      width: '100%',
      height: 200,
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
      paddingTop: theme.spacing[3],
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral[200],
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    metaText: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing[1],
    },
    separator: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginHorizontal: theme.spacing[2],
    },
    upvoteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary.light,
      paddingVertical: theme.spacing[1],
      paddingHorizontal: theme.spacing[2],
      borderRadius: theme.borderRadius.full,
    },
    upvoteButtonVoted: {
      backgroundColor: theme.colors.primary[100],
    },
    upvoteButtonDisabled: {
      backgroundColor: theme.colors.neutral[100],
    },
    upvoteText: {
      ...theme.typography.caption,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.primary.main,
      marginLeft: theme.spacing[1],
    },
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <ScreenContainer edges={['left', 'right']}>
      {/* Filter toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategories.length > 0 && styles.filterButtonActive,
          ]}
          onPress={() => setFilterSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Icon
            name="filter-variant"
            size={theme.iconSize.sm}
            color={
              selectedCategories.length > 0
                ? theme.colors.neutral[0]
                : theme.colors.text.primary
            }
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedCategories.length > 0 && styles.filterButtonTextActive,
            ]}
          >
            {selectedCategories.length > 0
              ? `Filtered (${selectedCategories.length})`
              : 'Filter'}
          </Text>
        </TouchableOpacity>

        {selectedCategories.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={() => setSelectedCategories([])}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.countText}>
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Active filter chips */}
      {selectedCategories.length > 0 && (
        <View style={styles.chipsRow}>
          {selectedCategories.map(id => {
            const cat = ISSUE_CATEGORIES.find(c => c.id === id);
            if (!cat) return null;
            return (
              <View key={id} style={[styles.chip, { backgroundColor: cat.color + '22', borderColor: cat.color + '55' }]}>
                <Icon name={cat.icon} size={12} color={cat.color} style={{ marginRight: 4 }} />
                <Text style={[styles.chipText, { color: cat.color }]}>{cat.label}</Text>
                <TouchableOpacity onPress={() => removeFilter(id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icon name="close" size={12} color={cat.color} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {filteredReports.length === 0 ? (
        <EmptyState
          icon="clipboard-search-outline"
          title="No Reports Found"
          description={
            selectedCategories.length > 0
              ? 'No reports match your current filters. Try adjusting or clearing them.'
              : 'Be the first to report an issue in your community!'
          }
          actionLabel={selectedCategories.length > 0 ? 'Clear Filters' : 'Report an Issue'}
          onActionPress={
            selectedCategories.length > 0
              ? () => setSelectedCategories([])
              : () => navigation.navigate('Report')
          }
        />
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReportCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary.main}
            />
          }
        />
      )}

      <FilterSheet
        visible={filterSheetVisible}
        selectedCategories={selectedCategories}
        onApply={handleApplyFilters}
        onClose={() => setFilterSheetVisible(false)}
      />
    </ScreenContainer>
  );
};

export default HomeScreen;
