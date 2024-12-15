import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

    useEffect(() => {
        // Check if the WebContainer instance is already created
        if (webcontainer) return;

        const initializeWebContainer = async () => {
            try {
                const webcontainerInstance = await WebContainer.boot();
                setWebcontainer(webcontainerInstance);

            } catch (error) {
                console.error("Error in webcontainer initialization:", error);
                console.log("web container",webcontainer);
            }
        };

        initializeWebContainer();
    }, [webcontainer]); // Only run this effect if `webcontainer` is null

    return webcontainer;
}
