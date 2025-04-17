import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  StatusBar,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://172.16.16.169:1337/api';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [timeGreeting, setTimeGreeting] = useState('');
  const [user, setUser] = useState({});
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  // Determine professional greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser(parsed);
        }
        
        // Fetch recent scans (mock data for now)
        setRecentScans([
          { id: 1, name: 'John Doe', company: 'Tech Solutions', date: '2 days ago' },
          { id: 2, name: 'Sarah Smith', company: 'Design Studio', date: '1 week ago' }
        ]);
      } catch (err) {
        console.error('Error reading user from storage', err);
      }
    };

    setTimeGreeting(getTimeBasedGreeting());
    fetchUserData();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.cancelled && result.assets) {
        setImage(result.assets[0].uri);
        await uploadScannedCard(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Camera error', 'Something went wrong while scanning.');
    }
  };

  const uploadScannedCard = async (photo) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('files', {
        uri: photo.uri,
        name: 'scanned_card.jpg',
        type: 'image/jpeg',
      });

      // Upload image to Strapi
      const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageId = uploadRes.data[0].id;

      // Create a new card entry
      const cardData = {
        name: user.fullName || 'Unknown',
        // CompanyName: 'Default Corp',
        phoneNumber: user.phoneNumber,
        email: user.email || '',
        // companyAddress: '123 Main St',
       // Designation: 'Employee',
       // CompanyWebsite: 'www.example.com',
        scannedCard: imageId,
      };

      await axios.post(`${API_BASE_URL}/cards`, { data: cardData });

      // Add to recent scans
      const newScan = {
        id: Date.now(),
        name: cardData.name,
        company: cardData.CompanyName,
        date: 'Just now'
      };
      
      setRecentScans([newScan, ...recentScans]);
      Alert.alert('Success', 'Card scanned and uploaded successfully!');
    } catch (err) {
      console.error('Upload failed', err);
      Alert.alert('Upload failed', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToCardDetails = (cardId) => {
    navigation.navigate('CardDetails', { id: cardId });
  };

  // Format name for professional greeting
  const getFormattedName = () => {
    if (!user.fullName) return '';
    const nameParts = user.fullName.split(' ');
    if (nameParts.length > 0) {
      return nameParts[0]; // Use just the first name for a professional but friendly greeting
    }
    return '';
  };

  // Render user avatar or default icon
  const renderUserAvatar = () => {
    if (user.avatar) {
      return (
        <Image 
          source={{ uri: user.avatar }} 
          style={styles.avatar} 
        />
      );
    } else {
      return (
        <View style={styles.defaultAvatarContainer}>
          <Ionicons name="person" size={24} color="#4a90e2" />
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Professional Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.greetingText}>
              {timeGreeting}{getFormattedName() ? `, ${getFormattedName()}` : ''}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => navigation.navigate('MyProfile')}
          >
            {renderUserAvatar()}
          </TouchableOpacity>
        </View>
        
        {/* Action Card */}
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Business Card Scanner</Text>
          <Text style={styles.actionDescription}>
            Digitize business contacts instantly with our scanner
          </Text>
          
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={pickImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="camera" size={24} color="#ffffff" />
                <Text style={styles.scanButtonText}>Scan Business Card</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Preview Section */}
        {image && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Last Scanned Card</Text>
            <Image source={{ uri: image }} style={styles.preview} />
          </View>
        )}
        
        {/* Recent Scans Section */}
        <View style={styles.recentScansContainer}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          
          {recentScans.length > 0 ? (
            recentScans.map(card => (
              <TouchableOpacity 
                key={card.id} 
                style={styles.cardItem}
                onPress={() => navigateToCardDetails(card.id)}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="business" size={24} color="#4a90e2" />
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardName}>{card.name}</Text>
                  <Text style={styles.cardCompany}>{card.company}</Text>
                </View>
                <Text style={styles.cardDate}>{card.date}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyState}>No recent scans</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
  },
  defaultAvatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7f1fd',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  previewContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 10,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
  },
  recentScansContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e7f1fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  cardCompany: {
    fontSize: 13,
    color: '#6c757d',
  },
  cardDate: {
    fontSize: 12,
    color: '#adb5bd',
  },
  emptyState: {
    textAlign: 'center',
    color: '#adb5bd',
    paddingVertical: 20,
  },
});

export default HomeScreen;