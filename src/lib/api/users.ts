interface UpdateUserData {
  name?: string;
  email?: string;
  notifications?: {
    email?: boolean;
    combat?: boolean;
    encounters?: boolean;
    weeklyDigest?: boolean;
    productUpdates?: boolean;
    securityAlerts?: boolean;
  };
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<{ success: boolean }> {
  const response = await fetch(`/api/users/${userId}/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  return response.json();
}