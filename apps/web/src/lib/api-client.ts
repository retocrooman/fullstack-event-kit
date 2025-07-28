const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  age?: number;
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  age?: number;
}

export class ApiClient {
  private static async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // TODO: Add Auth0 token when authentication is properly configured
    // For now, no authentication header

    return headers;
  }

  static async getCurrentUser(): Promise<UserProfile> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    return response.json();
  }

  static async updateCurrentUser(data: UpdateUserRequest): Promise<UserProfile> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.statusText}`);
    }

    return response.json();
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    const response = await fetch(`${API_BASE_URL}/users`);

    if (!response.ok) {
      throw new Error(`Failed to get all users: ${response.statusText}`);
    }

    return response.json();
  }
}