// firebaseHelpers.js
import { db, serverTimestampFn } from './firebase';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

export const addUserToFirestore = async (uid, name, email) => {
  try {
    await setDoc(doc(db, "users", uid), {
      uid: uid,
      name: name,
      email: email,
      profilePic: "",
      createdAt: serverTimestampFn(),
    });
    console.log("User added to Firestore");
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
  }
};

export const addEventToFirestore = async (hostID, name, date, location) => {
  try {
    const eventRef = await addDoc(collection(db, "events"), {
      hostID: hostID,
      name: name,
      date: date,
      location: location,
      createdAt: serverTimestampFn(),
    });
    console.log("Event added to Firestore");
    return eventRef.id;
  } catch (error) {
    console.error("Error adding event:", error);
  }
};

export const addCohostToFirestore = async (eventID, email, role = "cohost") => {
  try {
    await addDoc(collection(db, "cohosts"), {
      eventID: eventID,
      email: email,
      role: role,
      addedAt: serverTimestampFn(),
    });
    console.log("Cohost invited via email.");
  } catch (error) {
    console.error("Error adding cohost:", error);
  }
};

export const addVoteToFirestore = async (eventID, userID, category, option) => {
  try {
    await addDoc(collection(db, "votes"), {
      eventID: eventID,
      userID: userID,
      category: category,
      option: option,
      votedAt: serverTimestampFn(),
    });
    console.log("Vote added to Firestore");
  } catch (error) {
    console.error("Error adding vote:", error);
  }
};

export const updateEventInFirestore = async (eventID, data) => {
  const eventDocRef = doc(db, "events", eventID);
  await updateDoc(eventDocRef, data);
};

export const getUserIDByName = async (name) => {
  const q = query(collection(db, "users"), where("name", "==", name));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data().uid;
  }
  return null;
};

export const fetchUserEvents = async (uid) => {
  const eventsAsHost = query(collection(db, 'events'), where('hostID', '==', uid));
  const hostSnapshot = await getDocs(eventsAsHost);
  const hostEvents = hostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const cohostSnapshot = await getDocs(query(collection(db, 'cohosts'), where('userID', '==', uid)));
  const cohostEventIDs = cohostSnapshot.docs.map(doc => doc.data().eventID);

  let cohostEvents = [];
  if (cohostEventIDs.length > 0) {
    const eventsAsCohost = query(collection(db, 'events'), where('__name__', 'in', cohostEventIDs));
    const cohostSnapshot = await getDocs(eventsAsCohost);
    cohostEvents = cohostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  return [...hostEvents, ...cohostEvents];
};

export const addTaskToFirestore = async (eventID, cohostName, text) => {
  try {
    await addDoc(collection(db, 'tasks'), {
      eventID: eventID,
      cohostName: cohostName,
      text: text,
      completed: false,
      createdAt: serverTimestampFn(),
    });
    console.log("Task added to Firestore");
  } catch (error) {
    console.error("Error adding task:", error);
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