// firebaseHelpers.js
import { db, serverTimestampFn } from './firebase';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where
} from 'firebase/firestore';

export const addUserToFirestore = async (uid, name, email) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      email,
      profilePic: '',
      createdAt: serverTimestampFn()
    });
    console.log('User added to Firestore');
  } catch (error) {
    console.error('Error adding user to Firestore:', error);
  }
};

export const addEventToFirestore = async (hostID, name, date, location) => {
  try {
    const eventRef = await addDoc(collection(db, 'events'), {
      hostID,
      name,
      date,
      location,
      createdAt: serverTimestampFn()
    });
    console.log('Event added to Firestore');
    return eventRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
  }
};

export const addCohostToFirestore = async (eventID, email, name, role = 'cohost') => {
  try {
    let userID = null;
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(userQuery);

    if (!snapshot.empty) {
      userID = snapshot.docs[0].data().uid;
      name = snapshot.docs[0].data().name;
    }

    await addDoc(collection(db, 'cohosts'), {
      eventID,
      email,
      name,
      userID,
      role,
      addedAt: serverTimestampFn()
    });
    console.log('Cohost invited');
  } catch (error) {
    console.error('Error adding cohost:', error);
  }
};

export const addVoteToFirestore = async (eventID, userID, category, option) => {
  try {
    await addDoc(collection(db, 'votes'), {
      eventID,
      userID,
      category,
      option,
      votedAt: serverTimestampFn()
    });
    console.log('Vote added to Firestore');
  } catch (error) {
    console.error('Error adding vote:', error);
  }
};

export const updateEventInFirestore = async (eventID, data) => {
  const eventDocRef = doc(db, 'events', eventID);
  await updateDoc(eventDocRef, data);
};

export const getUserIDByName = async (name) => {
  const q = query(collection(db, 'users'), where('name', '==', name));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data().uid;
  }
  return null;
};

export const fetchUserEvents = async (uid, email) => {
  const eventsAsHostQuery = query(collection(db, 'events'), where('hostID', '==', uid));
  const hostSnapshot = await getDocs(eventsAsHostQuery);
  const hostEvents = hostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const cohostQuery = query(collection(db, 'cohosts'), where('email', '==', email));
  const cohostSnapshot = await getDocs(cohostQuery);
  const eventIDs = cohostSnapshot.docs.map(doc => doc.data().eventID);

  let cohostEvents = [];
  if (eventIDs.length > 0) {
    const eventQuery = query(collection(db, 'events'), where('__name__', 'in', eventIDs));
    const cohostEventSnapshot = await getDocs(eventQuery);
    cohostEvents = cohostEventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  return [...hostEvents, ...cohostEvents];
};

export const addTaskToFirestore = async (eventID, cohostName, text) => {
  try {
    await addDoc(collection(db, 'tasks'), {
      eventID,
      cohostName,
      text,
      completed: false,
      createdAt: serverTimestampFn()
    });
    console.log('Task added to Firestore');
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

export const fetchTasksForEvent = async (eventID) => {
  const q = query(collection(db, 'tasks'), where('eventID', '==', eventID));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

export const fetchUserNameByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return snapshot.docs[0].data().name || email;
  }
  return email;
};

// Fetch a specific event's data by eventID
export const fetchEventByID = async (eventID) => {
  const eventDocRef = doc(db, 'events', eventID);
  const eventSnap = await getDoc(eventDocRef);

  if (eventSnap.exists()) {
    return { id: eventSnap.id, ...eventSnap.data() };
  }
  return null;
};