import { firebase as FirebaseConfig } from '../config';
import { User, UserAttributes } from '@often/often-core';

const firebase = require('firebase');

interface AuthData {
	token: string;
	userData: UserAttributes;
}

interface EmailPassword {
	email: string;
	password: string;
}

export default class Authenticator {
	user: any;

	/**
	 * Checks user authentication with a provider and updates local cache with auth data
	 * @param {string} provider - Name of a provider (i.e. facebook, twitter, etc.)
	 * @returns {Promise<TResult>} - Promise that resolves to nothing, when auth process completes
	 */
	public static authWithProvider(providerId: string): Promise<void> {

		let provider;

		if (providerId == 'facebook') {
			provider = new firebase.auth.FacebookAuthProvider();
		} else if (providerId == 'twitter') {
			provider = new firebase.auth.TwitterAuthProvider();
		}

		let authPromise = new Promise((resolve, reject) => {
			return firebase.auth().signInWithPopup(provider).then(authData => {
				//this.user = authData.user;
				resolve(authData);
			});
		});
		return authPromise.then(() => { return this.getAndSetUserAuthData(); });
	}

	/**
	 * Checks user authentication with email and password and updates local cache with auth data
	 * @param {string} emailPassword - Object containing user email and password
	 * @returns {Promise<TResult>} - Promise that resolves to nothing, when auth process completes
	 */
	public static authWithPassword(emailPassword: EmailPassword): Promise<void> {
		let authPromise = new Promise((resolve, reject) => {
			return firebase.auth().createUserWithEmailAndPassword(emailPassword.email, emailPassword.password).then((authData) => {
				//this.user = authData.user;
				resolve(authData);
			});
		});

		return authPromise.then(() => { return this.getAndSetUserAuthData(); });
	}


	/**
	 * Factory method for instantiating an authenticated user instance with localStorage data
	 * @returns {User} - Returns an authenticated user object
	 */
	public static getAuthorizedUser() {
		let stringProps = localStorage.getItem('userData');
		let userAttributes = JSON.parse(stringProps);
		return new User(userAttributes);
	}

	/**
	 * Deauthenticates the user from firebase, and also clears local storage cache with user data.
	 */
	public static deauthorize() {
		localStorage.removeItem('token');
		localStorage.removeItem('userData');
		return firebase.auth().signOut();
	}

	/**
	 * Checks whether the client is authenticated
	 * @returns {boolean} - True for authenticated, false otherwise
	 */
	public static isAuthorized() {
		return !!localStorage.getItem('token');
	}

	/**
	 * Retrieves user authentication data from firebase, checks for administration privileges and returns token and user data
	 * @returns {Promise<AuthData>} - Returns authentication token and data pertaining to user.
	 */
	private static getUserAuthData(): Promise<AuthData> {
		let user = {uid: '', token: ''};

		let userObj = new User({id: user.uid});
		return userObj.syncData().then((syncedModel) => {

			if (!userObj.isAdmin) {
				throw new Error('User is not an admin');
			}

			if (!user.token) {
				throw new Error('Could not retrieve user token');
			}

			return {
				token: user.token,
				userData: userObj.toJSON()
			};


		});
	}

	/**
	 * Sets the user and authentication data on localStorage
	 * @param authData - Object containing authentication token and data pertaining to user.
	 */
	private static setUserAuthData(authData: AuthData): void {
		localStorage.setItem('token', authData.token);
		localStorage.setItem('userData', JSON.stringify(authData.userData));
	}

	/**
	 * Helper method for chaining retrieval and setting of authentication data
	 * @returns {Promise<void>} - Returns a promise that resolves to void.
	 */
	private static getAndSetUserAuthData(): Promise<void> {
		return this.getUserAuthData()
			.then((userAuthData: AuthData) => {
				return this.setUserAuthData(userAuthData);
			});
	}

}

