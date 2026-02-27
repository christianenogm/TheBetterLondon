/**
 * SortSheet - TheBetterLondon
 * Bottom-sheet modal for selecting a single sort option
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SORT_OPTIONS = [
  {
    key: 'recent',
    label: 'Most Recent',
    description: 'Newest reports first',
    icon: 'clock-outline',
  },
  {
    key: 'upvotes',
    label: 'Most Upvoted',
    description: 'Most community support first',
    icon: 'arrow-up-bold-circle-outline',
  },
  {
    key: 'nearest',
    label: 'Closest to Me',
    description: 'Reports near your location',
    icon: 'map-marker-radius-outline',
  },
];

const SortSheet = ({ visible, selectedSort, onSelect, onClose }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
      paddingBottom: insets.bottom + theme.spacing[6],
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
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[100],
    },
    optionIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing[3],
    },
    optionTextWrap: {
      flex: 1,
    },
    optionLabel: {
      ...theme.typography.body1,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeight.semibold,
    },
    optionLabelActive: {
      color: theme.colors.primary[500],
    },
    optionDescription: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.colors.neutral[400],
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioActive: {
      borderColor: theme.colors.primary[500],
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary[500],
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
              <View style={styles.handle} />

              <View style={styles.header}>
                <Text style={styles.headerTitle}>Sort By</Text>
              </View>

              {SORT_OPTIONS.map(option => {
                const isActive = selectedSort === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.optionRow}
                    onPress={() => { onSelect(option.key); onClose(); }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.optionIconWrap,
                        {
                          backgroundColor: isActive
                            ? theme.colors.primary[100]
                            : theme.colors.neutral[100],
                        },
                      ]}
                    >
                      <Icon
                        name={option.icon}
                        size={20}
                        color={isActive ? theme.colors.primary[500] : theme.colors.text.secondary}
                      />
                    </View>

                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>

                    <View style={[styles.radio, isActive && styles.radioActive]}>
                      {isActive && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SortSheet;
