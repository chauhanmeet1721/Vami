import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
}
