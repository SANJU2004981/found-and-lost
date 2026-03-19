import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// ── Single source of truth for auth state ──────────────────────────────────
const AuthContext = createContext({ session: undefined, user: null });

export const AuthProvider = ({ children }) => {
    // undefined = still loading, null = no session, object = active session
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        // 1. Hydrate immediately from Supabase (handles refresh & direct open)
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[AUTH-CTX] Initial getSession:', session ? `user=${session.user.id}` : 'no session');
            setSession(session ?? null);
            if (session) {
                localStorage.setItem('supabase_session', JSON.stringify(session));
            } else {
                localStorage.removeItem('supabase_session');
            }
        });

        // 2. Keep state in sync for login / logout / token refresh events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[AUTH-CTX] onAuthStateChange: ${event}`, session ? `user=${session.user.id}` : 'no session');
            setSession(session ?? null);
            if (session) {
                localStorage.setItem('supabase_session', JSON.stringify(session));
            } else {
                localStorage.removeItem('supabase_session');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,                       // undefined | null | Session
        user: session?.user ?? null,   // null until session resolves
        loading: session === undefined // true while the first getSession is pending
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Convenience hook
export const useAuth = () => useContext(AuthContext);
