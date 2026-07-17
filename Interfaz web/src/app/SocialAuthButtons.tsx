import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useCustomerAuth } from "../hooks/useCustomerAuth";

type SocialAuthButtonsProps = {
  label: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function SocialAuthButtons({
  label,
  onSuccess,
  onError,
}: SocialAuthButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { socialLogin } = useCustomerAuth();

  const handleSocialLogin = async (
    provider: "google" | "facebook",
    accessToken: string,
    userData?: { email?: string; name?: string; picture?: string; id?: string },
  ) => {
    try {
      setIsSubmitting(true);
      await socialLogin(provider, accessToken, userData);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        ).then((res) => res.json());

        await handleSocialLogin("google", tokenResponse.access_token, {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          id: userInfo.sub,
        });
      } catch (error) {
        onError?.(error);
      }
    },
    onError: () => onError?.("Google login failed"),
  });

  const handleFacebookClick = () => {
    if (typeof window === "undefined" || !window.FB) {
      onError?.("Facebook SDK no disponible");
      return;
    }

    window.FB.login(
      (response: { authResponse?: { accessToken?: string } }) => {
        if (response.authResponse?.accessToken) {
          void handleSocialLogin("facebook", response.authResponse.accessToken);
          return;
        }
        onError?.("Facebook login cancelado");
      },
      { scope: "public_profile,email" },
    );
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => handleGoogleLogin()}
        type="button"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-white hover:bg-muted transition-colors text-sm font-semibold text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Google icon */}
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path
            d="M43.611 20.083H42V20H24v8h11.303C33.92 32.657 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            fill="#FFC107"
          />
          <path
            d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            fill="#FF3D00"
          />
          <path
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.402 0-9.894-3.338-11.298-7.976l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            fill="#4CAF50"
          />
          <path
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            fill="#1976D2"
          />
        </svg>
        {label} con Google
      </button>
      <button
        onClick={handleFacebookClick}
        type="button"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "#1877F2" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
        {label} con Facebook
      </button>
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">
          o continúa con correo
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    </div>
  );
}
