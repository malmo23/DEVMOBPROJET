import { db, auth } from '../config/firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export const addFood = async (foodData) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        console.log(`Firestore: Saving food for user: ${user.email} (UID: ${user.uid})`);

        const foodsRef = collection(db, `users/${user.uid}/foods`);
        const docRef = await addDoc(foodsRef, {
            ...foodData,
            createdAt: serverTimestamp(),
        });
        console.log("Firestore: Food added successfully with ID:", docRef.id);
    } catch (error) {
        console.error("Firestore: Save error:", error);
        throw error;
    }
};

export const getFoods = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log("Firestore: No user found for getFoods");
            return [];
        }
        console.log(`Firestore: Fetching foods for: ${user.email} (UID: ${user.uid})`);

        const foodsRef = collection(db, `users/${user.uid}/foods`);
        const q = query(foodsRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);
        const foods = [];
        querySnapshot.forEach((doc) => {
            foods.push({ id: doc.id, ...doc.data() });
        });

        console.log(`Firestore: Fetched ${foods.length} items from ${querySnapshot.metadata.fromCache ? 'CACHE' : 'SERVER'}`);
        return foods;
    } catch (error) {
        console.error("Firestore: Fetch error:", error);
        return [];
    }
};

export const deleteFood = async (id) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        await deleteDoc(doc(db, `users/${user.uid}/foods`, id));
        console.log("Food deleted from Firestore");
    } catch (error) {
        console.error("Error deleting food: ", error);
        throw error;
    }
};
