import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  push, 
  update, 
  remove, 
  onValue, 
  off 
} from 'firebase/database';
import { Product, Duration, Price, LicenseKey, Coupon, Order, Settings } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyDKupV0toRbcPDDW8sLd9JNrbVVMDkfb2E",
  authDomain: "novaespstore.firebaseapp.com",
  projectId: "novaespstore",
  storageBucket: "novaespstore.firebasestorage.app",
  messagingSenderId: "1087211684495",
  appId: "1:1087211684495:web:5dd3025e9aa29340d626fa",
  databaseURL: "https://novaespstore-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);

// Helper: Read raw snapshot data
export async function getData<T = any>(path: string): Promise<T | null> {
  try {
    const snapshot = await get(ref(db, path));
    return snapshot.exists() ? snapshot.val() as T : null;
  } catch (error) {
    console.warn(`Firebase get error at path ${path}:`, error);
    return null;
  }
}

// Helper: Get formatted list from object node
export async function getList<T extends { id: string }>(path: string): Promise<T[]> {
  const data = await getData<Record<string, Omit<T, 'id'>>>(path);
  if (!data) return [];
  return Object.entries(data).map(([id, val]) => ({ id, ...val } as unknown as T));
}

// Helper: Set data
export async function setData(path: string, data: any): Promise<void> {
  await set(ref(db, path), data);
}

// Helper: Push data
export async function pushData(path: string, data: any): Promise<string> {
  const newRef = push(ref(db, path));
  const generatedId = newRef.key || `id_${Date.now()}`;
  await set(newRef, { ...data, id: generatedId });
  return generatedId;
}

// Helper: Update data
export async function updateData(path: string, data: any): Promise<void> {
  await update(ref(db, path), data);
}

// Helper: Delete data
export async function deleteData(path: string): Promise<void> {
  await remove(ref(db, path));
}

// Trial Key Delete Helper
// Deletes by the Firebase Realtime Database child id used by App.tsx.
// After deleting, it verifies the child is actually gone so the admin UI
// cannot silently report success when Firebase rejected the operation.
export async function deleteTrialKeyFromDb(k: { id?: string; trialCode?: string; key?: string }): Promise<void> {
  if (!k?.id && !k?.trialCode && !k?.key) {
    throw new Error('Trial key is missing its Firebase id/code.');
  }

  try {
    // Normal case: the UI id is the actual Firebase child key.
    if (k.id) {
      const directRef = ref(db, `trialKeys/${k.id}`);
      const directSnapshot = await get(directRef);
      if (directSnapshot.exists()) {
        await remove(directRef);
        if ((await get(directRef)).exists()) {
          throw new Error('Firebase did not remove the trial key.');
        }
        return;
      }
    }

    // Backward-compatible fallback for older/migrated records where the
    // stored `id`, trialCode, or key does not equal the Firebase child key.
    const snapshot = await get(ref(db, 'trialKeys'));
    if (!snapshot.exists()) {
      throw new Error('Trial key was not found in Firebase.');
    }

    const idsToDelete: string[] = [];
    snapshot.forEach((child) => {
      const value = child.val() || {};
      const matches =
        (k.id && (child.key === k.id || value.id === k.id)) ||
        (k.trialCode && value.trialCode === k.trialCode) ||
        (k.key && value.key === k.key) ||
        (k.trialCode && value.key === k.trialCode) ||
        (k.key && value.trialCode === k.key);

      if (matches && child.key) idsToDelete.push(child.key);
    });

    if (!idsToDelete.length) {
      throw new Error('Trial key was not found in Firebase.');
    }

    const updates: Record<string, null> = {};
    idsToDelete.forEach((id) => {
      updates[`trialKeys/${id}`] = null;
    });
    await update(ref(db), updates);

    const remaining = await Promise.all(
      idsToDelete.map(async (id) => (await get(ref(db, `trialKeys/${id}`))).exists())
    );
    if (remaining.some(Boolean)) {
      throw new Error('Firebase did not remove the trial key.');
    }
  } catch (err) {
    console.error('Error deleting trial key:', err);
    throw err;
  }
}

// Clears only the currently selected Trial Keys filter.
// We delete the exact Firebase child nodes, then verify that the selected
// nodes are gone. This avoids relying on trialCode/key text matching.
export async function clearTrialKeysFromDb(
  filter: 'active' | 'used'
): Promise<{ deleted: number }> {
  try {
    const snapshot = await get(ref(db, 'trialKeys'));
    if (!snapshot.exists()) {
      return { deleted: 0 };
    }

    const ids: string[] = [];

    snapshot.forEach((childSnap) => {
      const val = childSnap.val();
      const isUsed = !!val?.used;

      if ((filter === 'active' && !isUsed) || (filter === 'used' && isUsed)) {
        if (childSnap.key) ids.push(childSnap.key);
      }
    });

    if (ids.length === 0) {
      return { deleted: 0 };
    }

    // One atomic multi-location update is safer/faster than many individual
    // requests and guarantees all selected child paths are targeted.
    const updates: Record<string, null> = {};
    ids.forEach((id) => {
      updates[`trialKeys/${id}`] = null;
    });

    await update(ref(db), updates);

    // Verify every requested child was removed.
    const remainingChecks = await Promise.all(
      ids.map(async (id) => {
        const child = await get(ref(db, `trialKeys/${id}`));
        return child.exists() ? id : null;
      })
    );

    const failedIds = remainingChecks.filter(Boolean);
    if (failedIds.length > 0) {
      throw new Error(
        `Firebase did not remove ${failedIds.length} trial key(s).`
      );
    }

    return { deleted: ids.length };
  } catch (err) {
    console.error(`Error clearing ${filter} trial keys:`, err);
    throw err;
  }
}

// Realtime Subscriber
export function subscribeToPath<T>(path: string, callback: (data: T | null) => void): () => void {
  const dbRef = ref(db, path);
  const listener = onValue(
    dbRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn(`Realtime subscription error on ${path}:`, error);
      callback(null);
    }
  );

  return () => off(dbRef, 'value', listener);
}

// Default Seed Data Generator (populates initial store data if DB is blank)
export async function seedInitialDataIfEmpty() {
  try {
    const existingProducts = await getList<Product>('products');
    if (existingProducts.length > 0) return; // already seeded

    console.log('Seeding initial products, durations, and prices...');

    // 1. Add Default Products
    const prod1Id = await pushData('products', {
      name: 'NovaEsp VIP Hack',
      enabled: true,
      category: 'Gaming ESP',
      icon: 'Shield',
      description: 'Undetected ESP visual hack, smooth aimbot, radar, and memory safe features.',
      createdAt: Date.now()
    });

    const prod2Id = await pushData('products', {
      name: 'Apex Legends Chams Pro',
      enabled: true,
      category: 'Gaming ESP',
      icon: 'Zap',
      description: 'Wallhack glowing chams, recoil control, item glow, and streaming safe overlay.',
      createdAt: Date.now()
    });

    const prod3Id = await pushData('products', {
      name: 'Windows 11 Pro Lifetime Key',
      enabled: true,
      category: 'Software Keys',
      icon: 'KeyRound',
      description: 'Genuine digital activation key for Windows 11 Professional edition.',
      createdAt: Date.now()
    });

    // 2. Add Durations for Products
    const dur1Id = await pushData('durations', {
      productId: prod1Id,
      name: '1 Day Pass',
      unit: 'days',
      createdAt: Date.now()
    });

    const dur2Id = await pushData('durations', {
      productId: prod1Id,
      name: '7 Days Pass',
      unit: 'days',
      createdAt: Date.now()
    });

    const dur3Id = await pushData('durations', {
      productId: prod1Id,
      name: '30 Days VIP',
      unit: 'days',
      createdAt: Date.now()
    });

    const dur4Id = await pushData('durations', {
      productId: prod2Id,
      name: '7 Days Pro',
      unit: 'days',
      createdAt: Date.now()
    });

    const dur5Id = await pushData('durations', {
      productId: prod3Id,
      name: 'Lifetime License',
      unit: 'years',
      createdAt: Date.now()
    });

    // 3. Add Prices
    await pushData('prices', { productId: prod1Id, durationId: dur1Id, price: 99, createdAt: Date.now() });
    await pushData('prices', { productId: prod1Id, durationId: dur2Id, price: 399, createdAt: Date.now() });
    await pushData('prices', { productId: prod1Id, durationId: dur3Id, price: 999, createdAt: Date.now() });
    await pushData('prices', { productId: prod2Id, durationId: dur4Id, price: 499, createdAt: Date.now() });
    await pushData('prices', { productId: prod3Id, durationId: dur5Id, price: 699, createdAt: Date.now() });

    // 4. Add Sample Stock Keys
    const sampleKeys1 = [
      'NOVA-VIP-1D-894A-22BF-9001',
      'NOVA-VIP-1D-11CC-44EE-8822',
      'NOVA-VIP-1D-77AA-9988-3311'
    ];
    for (const key of sampleKeys1) {
      await pushData('licenseKeys', { productId: prod1Id, durationId: dur1Id, key, used: false, createdAt: Date.now() });
    }

    const sampleKeys2 = [
      'NOVA-VIP-7D-X992-K881-P002',
      'NOVA-VIP-7D-Q771-M442-W333'
    ];
    for (const key of sampleKeys2) {
      await pushData('licenseKeys', { productId: prod1Id, durationId: dur2Id, key, used: false, createdAt: Date.now() });
    }

    const sampleKeys3 = [
      'NOVA-WIN11-PRO-X889-7721-KEY9'
    ];
    for (const key of sampleKeys3) {
      await pushData('licenseKeys', { productId: prod3Id, durationId: dur5Id, key, used: false, createdAt: Date.now() });
    }

    // 5. Add Coupons
    await pushData('coupons', {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minOrderValue: 100,
      expiryDate: null,
      createdAt: Date.now()
    });

    await pushData('coupons', {
      code: 'NOVA50',
      type: 'fixed',
      value: 50,
      minOrderValue: 200,
      expiryDate: null,
      createdAt: Date.now()
    });

    // 6. Settings
    await setData('settings/razorpay', { keyId: 'rzp_test_5dd3025e9aa2' });
    await setData('settings/admin', { username: 'admin', password: 'password123' });
    await setData('settings/apk', { 
      url: 'https://github.com/novaesp/releases/releases/download/v2.4/NovaEsp_v2.4.apk',
      appName: 'NovaEsp Android VIP Loader',
      version: 'v2.4.0'
    });

    console.log('Seed data successfully populated!');
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
}
