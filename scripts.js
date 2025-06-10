async function registerPeriodicNewsCheck(registered) {    
    try {
        const periodicPermission = await navigator.permissions.query({
            name: 'periodic-background-sync',
        })

        if (periodicPermission.state === 'granted') {
            // Periodic background sync can be used.
            try {
                await registered.periodicSync.register("check-notifications-count", {
                    minInterval: 60 * 1000,
                });
            } catch (e) {
                console.log("Periodic Sync could not be registered!", e);
            }
        } else {
            // Periodic background sync cannot be used.
            // TODO fallback to intervals in sw?
            console.log("Permission is not 'granted", periodicPermission)
        }
    } catch (e) {
        console.log("Can't query permisions", e)
    }    
}


if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        const registered = await navigator.serviceWorker.register("./serviceWorker.js");
        console.log("ServiceWorker registered,", registered)
        await registerPeriodicNewsCheck(registered)
    });
}