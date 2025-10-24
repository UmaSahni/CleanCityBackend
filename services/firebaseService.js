// Firebase Service for additional operations
const { auth, db, storage } = require('../config/firebase');

// Firestore operations
class FirestoreService {
    // Create a document
    static async createDocument(collection, docId, data) {
        try {
            const docRef = await db.collection(collection).doc(docId).set(data);
            return { success: true, id: docId };
        } catch (error) {
            throw new Error(`Failed to create document: ${error.message}`);
        }
    }

    // Get a document
    static async getDocument(collection, docId) {
        try {
            const doc = await db.collection(collection).doc(docId).get();
            if (doc.exists) {
                return { success: true, data: { id: doc.id, ...doc.data() } };
            } else {
                throw new Error('Document not found');
            }
        } catch (error) {
            throw new Error(`Failed to get document: ${error.message}`);
        }
    }

    // Update a document
    static async updateDocument(collection, docId, data) {
        try {
            await db.collection(collection).doc(docId).update(data);
            return { success: true, id: docId };
        } catch (error) {
            throw new Error(`Failed to update document: ${error.message}`);
        }
    }

    // Delete a document
    static async deleteDocument(collection, docId) {
        try {
            await db.collection(collection).doc(docId).delete();
            return { success: true, id: docId };
        } catch (error) {
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }

    // Query documents
    static async queryDocuments(collection, field, operator, value) {
        try {
            const snapshot = await db.collection(collection).where(field, operator, value).get();
            const documents = [];
            snapshot.forEach(doc => {
                documents.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: documents };
        } catch (error) {
            throw new Error(`Failed to query documents: ${error.message}`);
        }
    }
}

// Firebase Storage operations
class StorageService {
    // Upload file to Firebase Storage
    static async uploadFile(bucketName, fileName, fileBuffer, metadata = {}) {
        try {
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(fileName);

            await file.save(fileBuffer, {
                metadata: {
                    contentType: metadata.contentType || 'application/octet-stream',
                    ...metadata
                }
            });

            // Make file publicly accessible
            await file.makePublic();

            return {
                success: true,
                url: `https://storage.googleapis.com/${bucketName}/${fileName}`,
                fileName: fileName
            };
        } catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    // Delete file from Firebase Storage
    static async deleteFile(bucketName, fileName) {
        try {
            const bucket = storage.bucket(bucketName);
            await bucket.file(fileName).delete();
            return { success: true, fileName: fileName };
        } catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    // Get file metadata
    static async getFileMetadata(bucketName, fileName) {
        try {
            const bucket = storage.bucket(bucketName);
            const [metadata] = await bucket.file(fileName).getMetadata();
            return { success: true, metadata };
        } catch (error) {
            throw new Error(`Failed to get file metadata: ${error.message}`);
        }
    }
}

// Firebase Auth operations
class AuthService {
    // Get user by email
    static async getUserByEmail(email) {
        try {
            const userRecord = await auth.getUserByEmail(email);
            return {
                success: true,
                data: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    emailVerified: userRecord.emailVerified,
                    disabled: userRecord.disabled
                }
            };
        } catch (error) {
            throw new Error(`Failed to get user by email: ${error.message}`);
        }
    }

    // List users
    static async listUsers(maxResults = 1000) {
        try {
            const listUsersResult = await auth.listUsers(maxResults);
            const users = listUsersResult.users.map(userRecord => ({
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled
            }));
            return { success: true, data: users };
        } catch (error) {
            throw new Error(`Failed to list users: ${error.message}`);
        }
    }

    // Set custom user claims
    static async setCustomUserClaims(uid, customClaims) {
        try {
            await auth.setCustomUserClaims(uid, customClaims);
            return { success: true, uid: uid };
        } catch (error) {
            throw new Error(`Failed to set custom user claims: ${error.message}`);
        }
    }
}

module.exports = {
    FirestoreService,
    StorageService,
    AuthService
};
