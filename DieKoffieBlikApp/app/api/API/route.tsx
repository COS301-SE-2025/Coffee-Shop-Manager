// api/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    display_name?: string;
  };
}

export interface Profile {
  id: string;
  auth_user_id: string;
  username: string;
  email: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  profile?: Profile;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  lastName?: string;
  phoneNo?: string;
  dateOfBirth?: string;
}

class AuthService {
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await this.makeRequest('auth', {
      action: 'login',
      email,
      password,
    });

    if (result.success && result.user) {
      await this.storeUserData(result.user, result.profile);
    }

    return result;
  }

  async register(params: RegisterParams): Promise<AuthResponse> {
    const result = await this.makeRequest('auth', {
      action: 'register',
      ...params,
    });

    if (result.success && result.user) {
      await this.storeUserData(result.user);
    }

    return result;
  }

  async getUsername(email: string): Promise<{ success: boolean; username?: string; message?: string }> {
    return await this.makeRequest('auth', {
      action: 'username',
      email,
    });
  }

  async changeUsername(email: string, username: string): Promise<AuthResponse> {
    const result = await this.makeRequest('auth', {
      action: 'change_Username',
      email,
      username,
    });

    if (result.success && result.user) {
      await this.storeUserData(result.user);
    }

    return result;
  }

  async storeUserData(user: User, profile?: Profile): Promise<void> {
    try {
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      if (profile) {
        await AsyncStorage.setItem('@profile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  async getUserData(): Promise<{ user: User | null; profile: Profile | null }> {
    try {
      const userJson = await AsyncStorage.getItem('@user');
      const profileJson = await AsyncStorage.getItem('@profile');
      
      const user = userJson ? JSON.parse(userJson) : null;
      const profile = profileJson ? JSON.parse(profileJson) : null;
      
      return { user, profile };
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return { user: null, profile: null };
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['@user', '@profile']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const user = await AsyncStorage.getItem('@user');
      return user !== null;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }
}

export default new AuthService();