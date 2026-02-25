/**
 * ProfileScreen - TheBetterLondon
 * US-106: Log Out of My Account
 * US-105: View My Profile and Stats (partial) - DONE
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  ScreenContainer,
  Card,
  PrimaryButton,
  SecondaryButton,
} from '../components';
import { icons } from '../theme/icons';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, signOut } = useAuth();

   // Mock stats  
  const totalReports = user?.reports || 0;
  const points = user?.points || 0;
  const badges = user?.badges || [];

  // Menu options
    const menuItems = [
  { label: 'Edit Profile',  icon: icons.edit, onPress: () => navigation.navigate('EditProfile') },
  { label: 'My Reports', icon: 'file-document', onPress: () => navigation.navigate('MyReports') },
  { label: 'Settings', icon: icons.settings, onPress: () => navigation.navigate('Settings') },
  { label: 'Help & Support', icon: icons.help, onPress: () => navigation.navigate('Help') },
];

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing[4],
      alignItems: 'center',
      paddingTop: theme.spacing[6],
    },
    header: {
      ...theme.typography.h1,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[4],
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: theme.spacing[3],
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      ...theme.typography.h2,
      color: theme.colors.neutral[0],
      fontWeight: theme.fontWeight.bold,
    },
    name: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeight.bold,
    },
    email: {
      ...theme.typography.body1,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing[4],
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: theme.spacing[4],
    },
    statCard: {
      flex: 1,
      marginHorizontal: theme.spacing[1],
      paddingVertical: theme.spacing[3],
      alignItems: 'center',
    },
    statValue: {
      ...theme.typography.h2,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    statLabel: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing[1],
    },
    menuContainer: {
      width: '100%',
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.neutral[0],
      marginBottom: theme.spacing[4],
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[300],
    },
    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuLabel: {
      ...theme.typography.body1,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing[3],
    },
    icon: {
      fontSize: theme.iconSize.md,
      color: theme.colors.text.primary,
    },
  });

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>

      {/* Avatar */}
      {user?.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary[100] }]}>
          <Icon 
            name="account"                
            size={50}                       
            color={theme.colors.primary[500]}  
          />
        </View>
      )}
        <Text style={styles.name}>{user?.name || 'Your Name'}</Text>
        <Text style={styles.email}>{user?.email || 'you@example.com'}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={{ flexDirection: 'row', width: '100%' }}>
              
              {/* Reports */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.statValue, { color: theme.colors.primary[500] }]}>{totalReports}</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </View>

              {/* Points */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.statValue, { color: theme.colors.primary[500] }]}>{points}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>

              {/* Badges */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.statValue, { color: theme.colors.primary[500] }]}>{badges.length}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>

            </View>
          </Card>
        </View>

        {/* Menu */}
        <Card style={{ width: '100%' }}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              {/* Left: ícon + label */}
              <View style={styles.menuLeft}>
                <Icon 
                  name={item.icon} 
                  size={theme.iconSize.md} 
                  color={theme.colors.text.primary} 
                />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>

              {/* Right: seta chevron */}
              <Icon 
                name={icons.forward}  
                size={theme.iconSize.md} 
                color={theme.colors.text.primary} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Log Out Button */}
        <SecondaryButton title="Log Out" 
        onPress={signOut}
        style={{
        width: '100%',             
        marginTop: theme.spacing[4],  
        paddingVertical: 14,    
     }}
        />
      </View>
    </ScreenContainer>
  );
};

export default ProfileScreen;
