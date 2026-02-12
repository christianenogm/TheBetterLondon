/**
 * TextInput Component - TheBetterLondon
 */

import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const TextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing[4],
    },
    label: {
      ...theme.typography.body2,
      fontWeight: theme.typography.button.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      ...theme.components.input,
      borderColor: error
        ? theme.colors.error
        : isFocused
        ? theme.colors.primary[500]
        : theme.colors.neutral[300],
      borderWidth: isFocused ? 2 : 1,
      height: multiline ? numberOfLines * 24 + 24 : 48,
      paddingTop: multiline ? theme.spacing[3] : 0,
    },
    input: {
      flex: 1,
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.primary,
      paddingVertical: 0,
    },
    leftIcon: {
      marginRight: theme.spacing[2],
      marginTop: multiline ? theme.spacing[1] : 0,
    },
    rightIcon: {
      marginLeft: theme.spacing[2],
      marginTop: multiline ? theme.spacing[1] : 0,
    },
    helperText: {
      ...theme.typography.caption,
      color: error ? theme.colors.error : theme.colors.text.hint,
      marginTop: theme.spacing[1],
    },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={theme.iconSize.sm}
            color={theme.colors.text.secondary}
            style={styles.leftIcon}
          />
        )}
        <RNTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.hint}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
        {rightIcon && (
          <Icon
            name={rightIcon}
            size={theme.iconSize.sm}
            color={theme.colors.text.secondary}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
      {(error || helperText) && (
        <Text style={styles.helperText}>{error || helperText}</Text>
      )}
    </View>
  );
};

export default TextInput;
