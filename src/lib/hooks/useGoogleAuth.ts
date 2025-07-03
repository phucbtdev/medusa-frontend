import { useState } from 'react';
import { sdk } from "@lib/config"

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Gửi request đến Medusa Auth API
      const response = await sdk.auth.login("customer", "google", {});

      if (typeof response === 'object' && response.location) {
        // Redirect đến Google OAuth
        window.location.href = response.location;
      } else if (typeof response === 'string') {
        // Customer đã authenticated trước đó, có token
        console.log('Customer already authenticated');
        
        // Lấy thông tin customer
        const customer = await sdk.store.customer.retrieve();
        return { success: true, customer };
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to authenticate with Google');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginWithGoogle,
    isLoading,
    error
  };
};