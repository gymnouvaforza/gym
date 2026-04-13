/**
 * Firebase Cloud Functions - Triggers and Logic
 * Translation from Supabase Postgres Functions/Triggers
 */

import { onDocumentUpdated, onDocumentCreated } from "firebase-functions/v2/firestore";
import { onUserCreated } from "firebase-functions/v2/auth";
import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Equivalent to: handle_updated_at() trigger
 */
export const handleUpdatedAt = onDocumentUpdated("*/{docId}", (event) => {
  const newValue = event.data.after.data();
  const previousValue = event.data.before.data();

  // Prevent infinite loops
  if (newValue.updated_at && previousValue.updated_at && 
      newValue.updated_at.isEqual(previousValue.updated_at)) {
    return null;
  }

  return event.data.after.ref.set({
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
});

/**
 * Equivalent to: on_auth_user_created() trigger
 */
export const onAuthUserCreated = onUserCreated(async (user) => {
  const { uid, email } = user;
  
  // Create user_roles record (default: member)
  await db.collection("user_roles").doc(uid).set({
    role: "member",
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  // If email matches admin, upgrade role
  if (email === "admin@novaforza.pe") {
    await db.collection("user_roles").doc(uid).update({ role: "admin" });
  }
});

/**
 * Logic for CMS Documents (from 202603230004_create_cms_documents.sql)
 */
export const onCmsDocumentCreated = onDocumentCreated("cms_documents/{docId}", (event) => {
  // Logic for slug generation or content indexing
  const data = event.data.data();
  console.log(`New CMS doc: ${data.title}`);
});
