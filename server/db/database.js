import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const databaseFile =
  process.env.DATA_FILE ||
  (process.env.VERCEL ? join("/tmp", "interntex-db.json") : join(__dirname, "db.json"));

const defaultData = {
  users: [],
  courses: [],
  lessons: [],
  enrollments: [],
  internships: [],
  internshipApplications: [],
  certificates: [],
  quizzes: [],
  quizAttempts: [],
  jobs: [],
  jobApplications: [],
  savedJobs: [],
  companies: [],
  ambassadors: [],
  referralTransactions: [],
  walletHistory: [],
  withdrawalRequests: [],
  colleges: [],
  verificationLogs: [],
  placementDrives: [],
  chatLogs: [],
  analyticsEvents: [],
  otps: []
};

function ensureShape(data) {
  return {
    ...structuredClone(defaultData),
    ...(data || {})
  };
}

let db;

if (process.env.MONGODB_URI) {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const mongoDb = client.db(process.env.MONGODB_DB || "interntex");
  const stateCollection = mongoDb.collection("app_state");
  const savedState = await stateCollection.findOne({ _id: "main" });

  db = {
    isMongo: true,
    data: ensureShape(savedState?.data),
    read() {
      return this.data;
    },
    async refresh() {
      const latestState = await stateCollection.findOne({ _id: "main" });
      this.data = ensureShape(latestState?.data);
      return this.data;
    },
    write() {
      const snapshot = structuredClone(this.data);
      return stateCollection
        .updateOne(
          { _id: "main" },
          { $set: { data: snapshot, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        )
        .catch((error) => console.error("MongoDB state write failed:", error));
    },
    async persist() {
      return this.write();
    }
  };

  if (!savedState) {
    await db.persist();
  }
} else {
  const adapter = new JSONFileSync(databaseFile);
  db = new LowSync(adapter, defaultData);
  db.read();
  db.data = ensureShape(db.data);
  db.write();
  db.refresh = async () => db.read();
  db.persist = async () => db.write();
}

export { defaultData };
export default db;
