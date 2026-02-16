// types.ts
export interface RequestData {
  id: string;
  uid: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  createdAt: any; // Using any for Firebase Timestamp flexibility
}

export interface SuggestionData {
  id: string;
  uid: string;
  name: string;
  email: string;
  rating: number;
  suggestion: string;
  createdAt: any;
}

export interface UserData {
  id: string;
  name?: string;
  email?: string;
  credits?: number;
  createdAt?: any;
  photoURL?: string;
  isAdmin?: boolean;
}