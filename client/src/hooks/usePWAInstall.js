import { useState, useEffect } from "react";

export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is already running in standalone mode
        const checkStandalone = () => {
            if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
                setIsStandalone(true);
            }
        };

        checkStandalone();

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for the appinstalled event
        window.addEventListener('appinstalled', (evt) => {
            console.log('App was installed.');
            setIsStandalone(true);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    return {
        isInstallable: !!deferredPrompt,
        isStandalone,
        handleInstallClick,
        showInstallButton: !!deferredPrompt && !isStandalone
    };
};
