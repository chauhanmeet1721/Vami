import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  });
}
