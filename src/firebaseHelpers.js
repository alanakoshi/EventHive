// firebaseHelpers.js
import { db, serverTimestampFn } from './firebase';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  arrayUnion
} from 'firebase/firestore';

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

export const addCohostToFirestore = async (eventID, name, email, role = 'cohost') => {
  try {
    const cohostQuery = query(
      collection(db, 'cohosts'),
      where('eventID', '==', eventID),
      where('email', '==', email)
    );

    const existingCohosts = await getDocs(cohostQuery);

    if (!existingCohosts.empty) {
      console.log('Cohost already exists.');
      return;
    }

    // Check if user with this email exists and use their name if found
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);
    const matchedUserName = !userSnapshot.empty ? userSnapshot.docs[0].data().name : name;

    await addDoc(collection(db, 'cohosts'), {
      eventID,
      email,
      name: matchedUserName,
      role,
      addedAt: serverTimestampFn(),
    });

    console.log('Cohost document added to Firestore.');
  } catch (error) {
    console.error('Error adding cohost to Firestore:', error);
  }
};

export const fetchCohostsForEvent = async (eventID) => {
  try {
    const q = query(collection(db, 'cohosts'), where('eventID', '==', eventID));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching cohosts:', error);
    return [];
  }
};

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
      lastVoteAt: serverTimestampFn(),
    });

    console.log('Vote successfully saved!');
  } catch (error) {
    console.error('Error saving vote:', error);
  }
};

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

export const updateEventInFirestore = async (eventID, data) => {
  const eventDocRef = doc(db, 'events', eventID);
  await updateDoc(eventDocRef, data);
};

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

export const fetchTasksForEvent = async (eventID) => {
  const eventDocRef = doc(db, 'events', eventID);
  const eventSnap = await getDoc(eventDocRef);
  if (eventSnap.exists()) {
    return eventSnap.data().tasks || [];
  }
  return [];
};

export const fetchEventByID = async (eventID) => {
  const eventDocRef = doc(db, 'events', eventID);
  const eventSnap = await getDoc(eventDocRef);
  if (eventSnap.exists()) {
    return { id: eventSnap.id, ...eventSnap.data() };
  }
  return null;
};

export const fetchUserNameByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data().name || email;
  }
  return email;
};

export const fetchUserNameByUID = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().name || uid;
  }
  return uid;
};

export const fetchVotesForEvent = async (eventID) => {
  const q = query(collection(db, 'votes'), where('eventID', '==', eventID));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

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
        [category]: scores,
      },
    };

    await updateDoc(eventDocRef, {
      votes: updatedVotes,
      lastVoteAt: serverTimestampFn(),
    });

    console.log('Ranking vote successfully saved!');
  } catch (error) {
    console.error('Error saving ranking vote:', error);
  }
};

export const deleteCohostFromFirestore = async (eventID, email) => {
  try {
    const q = query(
      collection(db, 'cohosts'),
      where('eventID', '==', eventID),
      where('email', '==', email)
    );
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'cohosts', docSnap.id));
    }
    console.log(`Cohost with email ${email} removed from collection`);
  } catch (error) {
    console.error('Error removing cohost:', error);
  }
};

export async function deleteEventFromFirestore(eventID) {
  if (!eventID) throw new Error("deleteEventFromFirestore: missing eventID");
  const eventRef = doc(db, "events", eventID);
  await deleteDoc(eventRef);
}