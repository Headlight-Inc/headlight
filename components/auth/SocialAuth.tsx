import React from 'react';
import { motion } from 'framer-motion';

interface SocialAuthProps {
  onStrategy: (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_x') => void;
  loading: boolean;
  disabled: boolean;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ onStrategy, loading, disabled }) => {
  const providers = [
    {
      id: 'oauth_apple' as const,
      name: 'Apple',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.08-.46-2.01-.48-3.13-.03-1.4.58-2.14.46-3.06-.41C4.85 17.27 4.04 12.31 5.8 9.38c.87-1.45 2.39-2.35 3.96-2.38 1.18-.02 2.1.47 2.82.47.7 0 1.83-.57 3.23-.43 1.48.15 2.59.73 3.3 1.76-2.91 1.76-2.42 5.58.54 6.81-.6 1.54-1.39 3.06-2.6 4.67zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.54-3.74 4.25z" />
        </svg>
      )
    },
    {
      id: 'oauth_google' as const,
      name: 'Google',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )
    },
    {
      id: 'oauth_x' as const,
      name: 'X',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex items-center gap-4">
      {providers.map((provider) => (
        <motion.button
          key={provider.id}
          whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => onStrategy(provider.id as any)}
          disabled={disabled || loading}
          className="flex-1 h-12 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm"
        >
          <div className="text-white opacity-70 group-hover:opacity-100 transition-opacity">
            {provider.icon}
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default SocialAuth;

