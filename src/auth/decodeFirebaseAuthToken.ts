import { auth } from '.';
//
import { handleError } from '../utils';
//

//

export default async function decodeFirebaseAuthToken(token?: string) {
  try {
    // console.log('decoding auth token...', token);

    if (!token) {
      return null;
    }

    //confirm with firebase if auth token is valid
    const decodedToken = await auth.verifyIdToken(token);
    // console.log('decoded token: ', decodedToken);

    return decodedToken;
  } catch (err: unknown) {
    handleError(err, 'Error Decoding Firebase Auth idToken');
  }
}
