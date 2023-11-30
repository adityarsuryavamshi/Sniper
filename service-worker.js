chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.storage.local.set({ sniperWebsiteConfigs: [] });
    }
})



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.request) {
        case 'getAllConfigs':
            // Async Response with onMessage is a bit weird see for example https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
            chrome.storage.local.get('sniperWebsiteConfigs')
                .then(({ sniperWebsiteConfigs }) => sendResponse(sniperWebsiteConfigs));
            return true;
            break;
        case 'addNewConfig':
            addNewConfig(message.payload)
            break;
        case 'clearConfig':
            chrome.storage.local.set({ sniperWebsiteConfigs: [] });
            break;


    }
});

async function addNewConfig(websiteConfig) {
    const { sniperWebsiteConfigs } = await chrome.storage.local.get('sniperWebsiteConfigs');
    sniperWebsiteConfigs.push(websiteConfig);
    chrome.storage.local.set({ sniperWebsiteConfigs });
    chrome.scripting.registerContentScripts([
        {
            id: websiteConfig.configID,
            matches: [websiteConfig.siteRegex],
            js: ["scripts/content-script.js"]
        }
    ])
}
