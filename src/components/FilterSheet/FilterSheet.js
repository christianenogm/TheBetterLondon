/**
 * FilterSheet - TheBetterLondon
 * Bottom-sheet modal for multi-select category filtering
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ISSUE_CATEGORIES } from '../../utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FilterSheet = ({ visible, selectedCategories, onApply, onClose }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(selectedCategories);

  // Keep draft in sync when sheet opens
  useEffect(() => {
    if (visible) setDraft(selectedCategories);
  }, [visible, selectedCategories]);

  const toggleCategory = (id) => {
    setDraft(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => setDraft([]);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.neutral[0],
      borderTopLeftRadius: theme.borderRadius['2xl'] || 24,
      borderTopRightRadius: theme.borderRadius['2xl'] || 24,
      paddingBottom: insets.bottom + theme.spacing[4],
      maxHeight: SCREEN_HEIGHT * 0.75,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.neutral[300],
      alignSelf: 'center',
      marginTop: theme.spacing[3],
      marginBottom: theme.spacing[2],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeight.semibold,
    },
    clearText: {
      ...theme.typography.body2,
      color: theme.colors.primary[500],
      fontWeight: theme.fontWeight.semibold,
    },
    categoryList: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[3],
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[100],
    },
    categoryIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing[3],
    },
    categoryLabel: {
      ...theme.typography.body1,
      color: theme.colors.text.primary,
      flex: 1,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.neutral[400],
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary[500],
      borderColor: theme.colors.primary[500],
    },
    footer: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[4],
    },
    applyButton: {
      backgroundColor: theme.colors.primary[500],
      paddingVertical: theme.spacing[4],
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
    },
    applyText: {
      ...theme.typography.body1,
      color: theme.colors.neutral[0],
      fontWeight: theme.fontWeight.bold,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Filter by Type</Text>
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              {/* Category list */}
              <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                {ISSUE_CATEGORIES.map(cat => {
                  const isSelected = draft.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.categoryRow}
                      onPress={() => toggleCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '22' }]}>
                        <Icon name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <Text style={styles.categoryLabel}>{cat.label}</Text>
                      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && (
                          <Icon name="check" size={14} color={theme.colors.neutral[0]} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Apply button */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyText}>
                    {draft.length === 0
                      ? 'Show All Reports'
                      : `Show ${draft.length === ISSUE_CATEGORIES.length ? 'All' : draft.length} Type${draft.length !== 1 ? 's' : ''}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FilterSheet;
