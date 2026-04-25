export interface StoredUserMeta {
  role: string;
  name: string;
}

export function saveUserMeta(user: StoredUserMeta) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('user_name', user.name);
  } catch (error) {
    console.warn('Unable to persist user metadata in localStorage:', error);
  }
}

export function clearUserMeta() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  } catch (error) {
    console.warn('Unable to clear user metadata from localStorage:', error);
  }
}
