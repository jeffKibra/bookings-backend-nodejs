import { https } from "firebase-functions";

export { default as formatUserProfile } from "./formatUserProfile";

export function isAuthenticated(context: https.CallableContext) {
  const auth = context.auth;

  if (!auth) {
    throw new https.HttpsError("unauthenticated", "Action not Authorized");
  }

  return auth;
}
