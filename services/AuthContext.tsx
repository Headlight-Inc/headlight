import React, { createContext, useContext, useMemo } from 'react';
import { useAuth as useClerkAuth, useClerk, useUser } from '@clerk/clerk-react';

export interface AppUser {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    imageUrl?: string | null;
}

export interface AppProfile {
    id: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    role?: string | null;
    subscription_status?: string | null;
    stripe_customer_id?: string | null;
    [key: string]: any;
}

interface AuthContextType {
    source: 'clerk';
    session: any | null;
    user: AppUser | null;
    profile: AppProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapClerkUser = (user: any): AppUser | null => {
    if (!user) return null;
    return {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        fullName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
        imageUrl: user.imageUrl || null
    };
};

const mapClerkProfile = (user: any): AppProfile | null => {
    if (!user) return null;
    const publicMetadata = (user.publicMetadata || {}) as Record<string, any>;
    const unsafeMetadata = (user.unsafeMetadata || {}) as Record<string, any>;
    const privateMetadata = (user.privateMetadata || {}) as Record<string, any>;

    return {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        first_name: user.firstName || null,
        last_name: user.lastName || null,
        role: String(publicMetadata.role || unsafeMetadata.role || 'SAAS_USER'),
        subscription_status: String(publicMetadata.subscription_status || privateMetadata.subscription_status || 'free'),
        stripe_customer_id: String(privateMetadata.stripe_customer_id || publicMetadata.stripe_customer_id || ''),
        ...publicMetadata,
        ...unsafeMetadata
    };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoaded, isSignedIn, sessionId, getToken } = useClerkAuth();
    const { user } = useUser();
    const clerk = useClerk();

    const mappedUser = useMemo(() => mapClerkUser(user), [user]);
    const mappedProfile = useMemo(() => mapClerkProfile(user), [user]);
    const session = isSignedIn ? { id: sessionId, source: 'clerk' } : null;

    const signOut = async () => {
        await clerk.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                source: 'clerk',
                session,
                user: mappedUser,
                profile: mappedProfile,
                loading: !isLoaded,
                signOut,
                getToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
