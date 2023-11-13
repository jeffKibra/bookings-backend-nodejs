import { UserRecord } from "firebase-admin/auth";

export default function formatUserProfile(user: UserRecord) {
  const {
    displayName,
    email,
    emailVerified,
    phoneNumber,
    photoURL,
    tenantId,
    uid,
    providerData,
  } = user;

  return {
    displayName,
    email,
    emailVerified,
    phoneNumber,
    photoURL,
    tenantId,
    uid,
    providerData,
  };
}
