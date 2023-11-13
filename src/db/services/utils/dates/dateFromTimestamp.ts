import { Timestamp } from "firebase-admin/firestore";

export default function dateFromTimestamp(timestamp: Timestamp | Date) {
  if (timestamp instanceof Timestamp) {
    return new Date(timestamp.seconds * 1000);
  } else {
    return timestamp;
  }
}
