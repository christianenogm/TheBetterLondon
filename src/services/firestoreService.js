/**
 * Firestore Service
 * Handles real-time data synchronization with Firestore
 */

import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Subscribe to real-time vehicle updates
 * @param {Array<string>} routeIds - Array of route IDs to filter
 * @param {Function} onUpdate - Callback function when data changes
 * @param {Function} onError - Callback function when error occurs
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToVehicles = (routeIds, onUpdate, onError) => {
  try {
    const vehiclesRef = collection(db, 'vehicles');
    
    // If no routes filter provided, get all vehicles
    if (!routeIds || routeIds.length === 0) {
      const q = vehiclesRef; // Query all documents
      
      return onSnapshot(
        q,
        (snapshot) => {
          const vehicles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log(`📡 Firestore: Received ${vehicles.length} vehicles (all routes)`);
          onUpdate(vehicles);
        },
        (error) => {
          console.error('Firestore vehicle subscription error:', error);
          onError && onError(error);
        }
      );
    }
    
    // Firestore 'in' queries are limited to 10 items, so we need to batch
    const batches = [];
    for (let i = 0; i < routeIds.length; i += 10) {
      const batch = routeIds.slice(i, i + 10);
      batches.push(batch);
    }
    
    // If only one batch, create a single query
    if (batches.length === 1) {
      const q = query(
        vehiclesRef,
        where('routeId', 'in', batches[0])
      );
      
      return onSnapshot(
        q,
        (snapshot) => {
          const vehicles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log(`📡 Firestore: Received ${vehicles.length} vehicles`);
          onUpdate(vehicles);
        },
        (error) => {
          console.error('Firestore vehicle subscription error:', error);
          onError && onError(error);
        }
      );
    }
    
    // Multiple batches: subscribe to all and merge results
    let allVehicles = [];
    const unsubscribes = [];
    
    batches.forEach((batch, index) => {
      const q = query(
        vehiclesRef,
        where('routeId', 'in', batch)
      );
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const vehicles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Merge with existing vehicles from other batches
          allVehicles = [
            ...allVehicles.filter(v => !batch.includes(v.routeId)),
            ...vehicles
          ];
          
          console.log(`📡 Firestore: Batch ${index + 1}/${batches.length} - ${vehicles.length} vehicles`);
          onUpdate(allVehicles);
        },
        (error) => {
          console.error(`Firestore vehicle subscription error (batch ${index}):`, error);
          onError && onError(error);
        }
      );
      
      unsubscribes.push(unsubscribe);
    });
    
    // Return combined unsubscribe function
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  } catch (error) {
    console.error('Error setting up vehicle subscription:', error);
    onError && onError(error);
    return () => {};
  }
};

/**
 * Subscribe to real-time arrivals for a specific stop
 * @param {string} stopId - The stop ID
 * @param {Function} onUpdate - Callback function when data changes
 * @param {Function} onError - Callback function when error occurs
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToStopArrivals = (stopId, onUpdate, onError) => {
  try {
    const arrivalsRef = collection(db, 'stopArrivals');
    const q = query(
      arrivalsRef,
      where('stopId', '==', stopId),
      limit(1)
    );
    
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          const arrivals = data.arrivals || [];
          
          console.log(`📡 Firestore: Received ${arrivals.length} arrivals for stop ${stopId}`);
          onUpdate(arrivals);
        } else {
          console.log(`📡 Firestore: No arrivals found for stop ${stopId}`);
          onUpdate([]);
        }
      },
      (error) => {
        console.error('Firestore arrivals subscription error:', error);
        onError && onError(error);
      }
    );
  } catch (error) {
    console.error('Error setting up arrivals subscription:', error);
    onError && onError(error);
    return () => {};
  }
};

/**
 * Subscribe to system metadata (last update times, status, etc.)
 * @param {Function} onUpdate - Callback function when data changes
 * @param {Function} onError - Callback function when error occurs
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToMetadata = (onUpdate, onError) => {
  try {
    const metadataRef = collection(db, 'metadata');
    const q = query(metadataRef, where('__name__', '==', 'system'));
    
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          
          console.log('📡 Firestore: Received metadata update');
          onUpdate(data);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error('Firestore metadata subscription error:', error);
        onError && onError(error);
      }
    );
  } catch (error) {
    console.error('Error setting up metadata subscription:', error);
    onError && onError(error);
    return () => {};
  }
};
