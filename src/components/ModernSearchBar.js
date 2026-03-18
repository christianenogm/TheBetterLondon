/**
 * ModernSearchBar - Improved search UI with better visual hierarchy
 */

import React from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, elevation } from '../utils/designSystem';

const ModernSearchBar = ({ 
  value, 
  onChangeText, 
  onFocus, 
  onClear, 
  onRefresh,
  placeholder = 'Where to?',
  lastUpdated,
  refreshing = false,
  editable = true,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Search Input Card */}
      <View style={[styles.searchCard, elevation.medium]}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={24} 
          color={colors.text.secondary} 
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.hint}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          editable={editable}
        />
        
        {value !== '' && editable && (
          <TouchableOpacity 
            onPress={onClear}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons 
              name="close-circle" 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
        )}
        
        {/* Divider */}
        {editable && (
          <View style={styles.divider} />
        )}
        
        {/* Refresh Button */}
        <TouchableOpacity 
          onPress={onRefresh}
          disabled={refreshing}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons 
            name={refreshing ? "loading" : "refresh"} 
            size={24} 
            color={refreshing ? colors.text.disabled : colors.primary.main}
          />
        </TouchableOpacity>
      </View>
      
      {/* Last Updated Badge */}
      {lastUpdated && (
        <View style={styles.updateBadge}>
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={12} 
            color={colors.text.secondary} 
          />
          <Text style={styles.updateText}>
            Updated {lastUpdated.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.default,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body.large,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xs,
  },
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    gap: 4,
  },
  updateText: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
});

export default ModernSearchBar;
