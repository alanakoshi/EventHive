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
  arrayUnion
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
    const cohostQuery = query(
      collection(db, 'cohosts'),
      where('eventID', '==', eventID),
      where('email', '==', email)
    );

    const existingCohosts = await getDocs(cohostQuery);

    // If already exists, don't add again
    if (!existingCohosts.empty) {
      console.log('Cohost already exists, skipping Firestore add.');
      return;
    }

    await addDoc(collection(db, 'cohosts'), {
      eventID,
      email,
      name,
      role,
      addedAt: serverTimestampFn(),
    });

    console.log('Cohost successfully added!');
  } catch (error) {
    console.error('Error adding cohost:', error);
  }
};

// Add Vote
export const addVoteToFirestore = async (eventID, userID, category, scores) => {
  try {
    const eventRef = doc(db, 'events', eventID);
    const eventSnap = await getDoc(eventRef);

    const existingVotes = eventSnap.exists() && eventSnap.data().votes ? eventSnap.data().votes : {};

    const updatedVotes = {
      ...existingVotes,
      [userID]: {
        ...(existingVotes[userID] || {}),
        [category]: scores,
      },
    };

    await updateDoc(eventRef, {
      votes: updatedVotes,
      lastVoteAt: serverTimestampFn(), // Optional: track timestamp of latest vote
    });

    console.log('Vote successfully saved!');
  } catch (error) {
    console.error('Error saving vote:', error);
  }
};

// Add Task
export const addTaskToFirestore = async (eventID, cohostName, text) => {
  try {
    const task = {
      cohostName,
      text,
      completed: false,
      createdAt: serverTimestampFn(),
    };

    const eventRef = doc(db, 'events', eventID);
    await updateDoc(eventRef, {
      tasks: arrayUnion(task),
    });
  } catch (error) {
    console.error('Error adding task to event document:', error);
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
  const eventDocRef = doc(db, 'events', eventID);
  const eventSnap = await getDoc(eventDocRef);
  if (eventSnap.exists()) {
    return eventSnap.data().tasks || [];
  }
  return [];
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

// Fetch all votes for an event
export const fetchVotesForEvent = async (eventID) => {
  const q = query(collection(db, 'votes'), where('eventID', '==', eventID));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

// Save Ranking Vote to Firestore
export const saveRankingVoteToFirestore = async (eventID, userID, category, scores) => {
  try {
    const eventDocRef = doc(db, 'events', eventID);
    const eventSnap = await getDoc(eventDocRef);

    if (!eventSnap.exists()) {
      console.error('Event not found!');
      return;
    }

    const existingVotes = eventSnap.data().votes || {};

    const updatedVotes = {
      ...existingVotes,
      [userID]: {
        ...(existingVotes[userID] || {}),
        [category]: scores, // Update just this category for this user
      },
    };

    await updateDoc(eventDocRef, {
      votes: updatedVotes,
      lastVoteAt: serverTimestampFn(), // Optional tracking of vote time
    });

    console.log('Ranking vote successfully saved!');
  } catch (error) {
    console.error('Error saving ranking vote:', error);
  }
};

