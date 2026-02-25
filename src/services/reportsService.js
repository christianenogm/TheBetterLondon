/**
 * Reports Service - TheBetterLondon
 * Handles issue reporting and retrieval using Firebase
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const REPORTS_COLLECTION = 'reports';

/**
 * Upload photo to Firebase Storage
 */
const uploadPhoto = async (photoUri, reportId, photoIndex) => {
  try {
    // For React Native, we need to handle file uploads differently
    const response = await fetch(photoUri);
    const blob = await response.blob();
    
    // Create a reference to the storage location
    const filename = `${reportId}_${photoIndex}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `reports/${reportId}/${filename}`);
    
    // Upload the blob with metadata
    const metadata = {
      contentType: 'image/jpeg',
    };
    
    const uploadTask = await uploadBytes(storageRef, blob, metadata);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};

/**
 * Upload multiple photos
 */
const uploadPhotos = async (photos, reportId) => {
  if (!photos || photos.length === 0) return [];
  
  try {
    const uploadPromises = photos.map((photoUri, index) => 
      uploadPhoto(photoUri, reportId, index)
    );
    
    const photoURLs = await Promise.all(uploadPromises);
    return photoURLs;
  } catch (error) {
    console.error('Error uploading photos:', error);
    throw error;
  }
};

/**
 * US-205: Submit Report
 */
export const createReport = async (reportData) => {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    
    // Create a temporary ID for photo uploads
    const tempId = `temp_${Date.now()}`;
    
    // Upload photos to Firebase Storage if any
    let photoURLs = [];
    if (reportData.photos && reportData.photos.length > 0) {
      photoURLs = await uploadPhotos(reportData.photos, tempId);
    }
    
    // Create report document
    const reportDoc = {
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      location: reportData.location,
      userId: reportData.userId,
      userName: reportData.userName,
      photos: photoURLs,
      status: 'pending',
      upvotes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(reportsRef, reportDoc);
    
    // Return the created report with ID
    return {
      id: docRef.id,
      ...reportDoc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating report:', error);
    return { success: false, error: 'Failed to create report' };
  }
};

/**
 * US-301: Get all reports
 */
export const getAllReports = async () => {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const q = query(reportsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    const reports = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });
    
    return reports;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return [];
  }
};

/**
 * Get report by ID
 */
export const getReportById = async (reportId) => {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    const reportSnap = await getDoc(reportRef);
    
    if (!reportSnap.exists()) {
      return null;
    }
    
    const data = reportSnap.data();
    return {
      id: reportSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return null;
  }
};

/**
 * Get user's reports
 */
export const getUserReports = async (userId) => {
  if (!userId) {
    console.error('getUserReports called with undefined userId');
    return [];
  }
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const q = query(
      reportsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const reports = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });
    
    return reports;
  } catch (error) {
    console.error('Failed to fetch user reports:', error);
    return [];
  }
};

/**
 * US-304: Upvote a report
 */
export const upvoteReport = async (reportId) => {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    
    // Increment upvotes using Firestore increment
    await updateDoc(reportRef, {
      upvotes: increment(1),
      updatedAt: serverTimestamp(),
    });
    
    // Fetch and return updated report
    const updatedReport = await getReportById(reportId);
    return updatedReport;
  } catch (error) {
    console.error('Failed to upvote report:', error);
    throw error;
  }
};

export default {
  createReport,
  getAllReports,
  getReportById,
  getUserReports,
  upvoteReport,
};
