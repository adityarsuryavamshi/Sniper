chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.clear();
    chrome.storage.local.set({ sniperWebsiteConfigs: [] })
    chrome.storage.local.set({
        config: {
            reloadIntervalInSeconds: 30,
            elementToCheck: '#siteTable .thing .entry .expando-button',
            elementToAct: "#siteTable .thing .entry .expando-button",
            action: "click",
            argument: []
        }
    })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`Received Message: ${message}`)
    if (message.reason === 'getConfig') {
        // Can't have this async/awaited since the listener can't be async for some reason
        chrome.storage.local.get('config').then(sendResponse);
        return true;
    }
})