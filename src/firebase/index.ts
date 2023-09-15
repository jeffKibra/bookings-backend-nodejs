import { getAuth } from 'firebase-admin/auth';
//
import init from './init';

//initialize firebase
init();

export const initFirebase = init;

export const firebaseAuth = getAuth();
