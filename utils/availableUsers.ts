/**
 * This file contains the list of available users who can log in to the app.
 * Only users in this list will be allowed to authenticate.
 */

// List of available usernames
export const AVAILABLE_USERNAMES = [
  'restaurant manager',
  'General Manager'
];

/**
 * Check if the provided username is in the list of available users
 * @param username The username to check
 * @returns True if the username is valid, false otherwise
 */
export const isValidUsername = (username: string): boolean => {
  return AVAILABLE_USERNAMES.some(
    availableUsername => availableUsername.toLowerCase() === username.toLowerCase()
  );
};