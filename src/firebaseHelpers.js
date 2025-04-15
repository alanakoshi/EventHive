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
  where,
} from 'firebase/firestore';

// Add User
export const addUserToFirestore = async (uid, name, email) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      uid,
      name,
      email,
      profilePic: '',
      createdAt: serverTimestampFn(),
    });
    console.log('User added');
  } catch (error) {
    console.error('Error adding user:', error);
  }
};

// Add Event
export const addEventToFirestore = async (hostID, name, date, location) => {
  try {
    const eventRef = await addDoc(collection(db, 'events'), {
      hostID,
      name,
      date,
      location,
      createdAt: serverTimestampFn(),
    });
    return eventRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
  }
};

// Add Cohost
export const addCohostToFirestore = async (eventID, name, email, role = 'cohost') => {
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
      addedAt: serverTimestampFn(),
    });
  } catch (error) {
    console.error('Error adding cohost:', error);
  }
};

// Add Vote
export const addVoteToFirestore = async (eventID, userID, category, option) => {
  try {
    await addDoc(collection(db, 'votes'), {
      eventID,
      userID,
      category,
      option,
      votedAt: serverTimestampFn(),
    });
  } catch (error) {
    console.error('Error adding vote:', error);
  }
};

// Add Task
export const addTaskToFirestore = async (eventID, cohostName, text) => {
  try {
    await addDoc(collection(db, 'tasks'), {
      eventID,
      cohostName,
      text,
      completed: false,
      createdAt: serverTimestampFn(),
    });
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

// Update Event
export const updateEventInFirestore = async (eventID, data) => {
  const eventDocRef = doc(db, 'events', eventID);
  await updateDoc(eventDocRef, data);
};

// Fetch Events
export const fetchUserEvents = async (uid, email) => {
  const hostEventsQuery = query(collection(db, 'events'), where('hostID', '==', uid));
  const hostSnapshot = await getDocs(hostEventsQuery);
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

// Fetch Tasks
export const fetchTasksForEvent = async (eventID) => {
  const q = query(collection(db, 'tasks'), where('eventID', '==', eventID));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

// Fetch Event by ID
export const fetchEventByID = async (eventID) => {
  const eventDocRef = doc(db, 'events', eventID);
  const eventSnap = await getDoc(eventDocRef);
  if (eventSnap.exists()) {
    return { id: eventSnap.id, ...eventSnap.data() };
  }
  return null;
};

// Fetch Username by Email
export const fetchUserNameByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data().name || email;
  }
  return email;
};

// Fetch Username by UID
export const fetchUserNameByUID = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().name || uid;
  }
  return uid;
};
