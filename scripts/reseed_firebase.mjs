import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { 
  initialChapters, 
  initialBinders, 
  initialSeparators, 
  initialAuditLogs 
} from "../src/data/initialData.js";

const firebaseConfig = {
  apiKey: "AIzaSyC3Lt0xKAwasvKR8jfKgAjZUNm-jq2palo",
  authDomain: "archrive-5798a.firebaseapp.com",
  projectId: "archrive-5798a",
  storageBucket: "archrive-5798a.firebasestorage.app",
  messagingSenderId: "306846062744",
  appId: "1:306846062744:web:8a7f5e2ffe734b1e38d8ed"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanAndSeed() {
  console.log("Starting Firebase clean and seed with 7 new chapters...");

  const collections = ["chapters", "binders", "separators", "audit_logs"];

  // 1. Delete old documents
  for (const colName of collections) {
    console.log(`Clearing collection: ${colName}...`);
    const snap = await getDocs(collection(db, colName));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, colName, d.id));
      console.log(`  Deleted ${colName}/${d.id}`);
    }
  }

  // 2. Insert new chapters
  console.log(`Inserting ${initialChapters.length} chapters...`);
  for (const ch of initialChapters) {
    await setDoc(doc(db, "chapters", ch.id), ch);
    console.log(`  Added chapter: ${ch.code} - ${ch.name}`);
  }

  // 3. Insert new binders
  console.log(`Inserting ${initialBinders.length} binders...`);
  for (const b of initialBinders) {
    await setDoc(doc(db, "binders", b.id), b);
    console.log(`  Added binder: ${b.code} - ${b.name}`);
  }

  // 4. Insert new separators
  console.log(`Inserting ${initialSeparators.length} separators...`);
  for (const s of initialSeparators) {
    await setDoc(doc(db, "separators", s.id), s);
    console.log(`  Added separator: ${s.code} - ${s.name}`);
  }

  // 5. Insert new audit logs
  console.log(`Inserting ${initialAuditLogs.length} audit logs...`);
  for (const l of initialAuditLogs) {
    await setDoc(doc(db, "audit_logs", l.id), l);
    console.log(`  Added audit log: ${l.id} - ${l.docTitle}`);
  }

  console.log("SUCCESS: Firebase Firestore successfully updated with the 7 new chapters!");
  process.exit(0);
}

cleanAndSeed().catch(err => {
  console.error("Error reseeding Firebase:", err);
  process.exit(1);
});
