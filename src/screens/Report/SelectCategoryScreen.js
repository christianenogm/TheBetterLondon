/**
 * SelectCategoryScreen - TheBetterLondon
 * US-201: Choose What Type of Issue to Report - DONE
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenContainer, Card } from '../../components';
import { ISSUE_CATEGORIES } from '../../utils/constants';

const CARD_SIZE = 70;

const SelectCategoryScreen = ({ navigation }) => {
  const theme = useTheme();
  const [selected, setSelected] = React.useState(null);

  const handleSelect = (category) => {
    setSelected(category.id);
    navigation.navigate('TakePhotos', { category });
  };

  return (
    <ScreenContainer>
     <Text style={styles.title}>What type of issue?</Text>
      <Text style={styles.description}>
        Select the category that best describes the problem.
      </Text>

      <View style={styles.grid}>
        {ISSUE_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <TouchableOpacity
              style={[
                styles.circle,
                {
                  backgroundColor: `${category.color}33`,
                },
                selected === category.id && {
                  borderWidth: 3,
                  borderColor: category.color,
                },
              ]}
              onPress={() => handleSelect(category)}
            >
              <Icon name={category.icon} size={40} color={category.color} />
            </TouchableOpacity>
            <Text style={styles.label}>{category.label}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-between',  
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    marginHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: CARD_SIZE / 2, 
    alignItems: 'center',
    justifyContent: 'center',     
  },
  categoryContainer: {
    width: '45%', 
    alignItems: 'center',
    marginBottom: 20,
    marginRight: '5%', 
  },
  circle: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SelectCategoryScreen;
