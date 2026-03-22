import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';

const ThemeContext = createContext();

const STORAGE_PREF = 'themePreference';
const LEGACY_THEME = 'theme';

function readPreference() {
    try {
        const pref = localStorage.getItem(STORAGE_PREF);
        if (pref === 'light' || pref === 'dark' || pref === 'system') return pref;
        const legacy = localStorage.getItem(LEGACY_THEME);
        if (legacy === 'light' || legacy === 'dark') return legacy;
    } catch {
        /* ignore */
    }
    return 'system';
}

function systemPrefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [themePreference, setThemePreferenceState] = useState(readPreference);
    const [systemDark, setSystemDark] = useState(systemPrefersDark);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => setSystemDark(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const resolvedTheme = useMemo(() => {
        if (themePreference === 'system') return systemDark ? 'dark' : 'light';
        return themePreference;
    }, [themePreference, systemDark]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        try {
            localStorage.setItem(STORAGE_PREF, themePreference);
            localStorage.removeItem(LEGACY_THEME);
        } catch {
            /* ignore */
        }
    }, [resolvedTheme, themePreference]);

    const setThemePreference = useCallback((pref) => {
        if (pref === 'light' || pref === 'dark' || pref === 'system') {
            setThemePreferenceState(pref);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setThemePreferenceState((prev) => {
            if (prev === 'system') {
                return systemDark ? 'light' : 'dark';
            }
            return prev === 'light' ? 'dark' : 'light';
        });
    }, [systemDark]);

    const value = useMemo(
        () => ({
            theme: resolvedTheme,
            themePreference,
            setThemePreference,
            toggleTheme,
        }),
        [resolvedTheme, themePreference, setThemePreference, toggleTheme],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};
