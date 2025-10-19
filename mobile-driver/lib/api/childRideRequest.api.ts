import { API_BASE_URL } from '../../config/api';

export const getAssignedPassengersApi = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/driver/child-ride-requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch passengers: ${res.status} ${txt}`);
  }

  return res.json();
};
