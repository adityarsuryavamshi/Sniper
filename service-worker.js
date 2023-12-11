const extensionID = "inildfinknkmggbooddbdcnnpliflbbj";
const sniperWebsiteConfigKey = 'sniperWebsiteConfigs';

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.storage.local.set({ sniperWebsiteConfigs: [] });
    } else {
        // It's due to an update or chrome update or something like that
        // Just ensure that all the scripts are re-registered
        chrome.storage.local.get(sniperWebsiteConfigKey)
            .then(({ sniperWebsiteConfigs }) => registerConfigs(...sniperWebsiteConfigs))
    }
})



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(JSON.stringify(sender));

    if (new URL(sender.origin).hostname === extensionID) {
        // Request from Extension Pages

        switch (message.request) {
            case 'getAllConfigs':
                // Async Response with onMessage is a bit weird see for example https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
                chrome.storage.local.get(sniperWebsiteConfigKey)
                    .then(({ sniperWebsiteConfigs }) => sendResponse(sniperWebsiteConfigs));
                return true;
                break;
            case 'addNewConfig':
                addNewConfig(message.payload)
                break;
            case 'clearConfig':
                chrome.storage.local.set({ sniperWebsiteConfigs: [] });
                break;

            case 'updateConfig':
                updateConfig(message.payload)
                break;
            case 'deleteConfig':
                clearConfigFor(message.payload);
                break;
        }
    } else {
        // Request from Content Scripts and other untrusted sources

        switch (message?.request) {
            case 'getConfig':
                const requestURL = sender.url;
                if (requestURL) {
                    fetchConfigFor(requestURL).then(sendResponse);
                }
                return true;
                break;
            default:
                console.warn(`Unkown message received : ${JSON.stringify(message)}, sender: ${JSON.stringify(sender)}`);
                break;
        }
    }


});





async function clearConfigFor(configId) {
    const { sniperWebsiteConfigs } = await chrome.storage.local.get(sniperWebsiteConfigKey);
    for (let idx = 0; idx < sniperWebsiteConfigs.length; idx++) {
        const websiteConfig = sniperWebsiteConfigs[idx];
        if (websiteConfig.configID === configId) {
            sniperWebsiteConfigs.splice(idx, 1)
        }
    }
    await chrome.storage.local.set({ sniperWebsiteConfigs });
    deregisterConfigs(configId)

}

function deregisterConfigs(...configs) {
    chrome.scripting.unregisterContentScripts({
        ids: configs
    })
}

async function fetchConfigFor(requestURL) {
    const { sniperWebsiteConfigs } = await chrome.storage.local.get(sniperWebsiteConfigKey);
    const websiteConfigs = []
    for (const wc of sniperWebsiteConfigs) {
        let [scheme, rest] = wc.siteRegex.split("://")
        let [host, path] = rest.split("/")
        const pattern = new URLPattern({
            protocol: scheme,
            hostname: host,
            path: path
        });
        if (pattern.test(requestURL)) {
            websiteConfigs.push(wc);
        }
    }
    return websiteConfigs;
}


async function updateConfig(updatedWebsiteConfig) {
    updateConfigs(updatedWebsiteConfig);
    const { sniperWebsiteConfigs } = await chrome.storage.local.get(sniperWebsiteConfigKey);
    for (let idx = 0; idx < sniperWebsiteConfigs.length; idx++) {
        const websiteConfig = sniperWebsiteConfigs[idx];
        if (websiteConfig.configID === updatedWebsiteConfig.configID) {
            sniperWebsiteConfigs.splice(idx, 1, updatedWebsiteConfig)
        }
    }
    chrome.storage.local.set({ sniperWebsiteConfigs })
}

async function addNewConfig(websiteConfig) {
    const { sniperWebsiteConfigs } = await chrome.storage.local.get(sniperWebsiteConfigKey);
    sniperWebsiteConfigs.push(websiteConfig);
    chrome.storage.local.set({ sniperWebsiteConfigs });
    registerConfigs(websiteConfig)
}

function registerConfigs(...configs) {
    const registrationSpecs = configs.map(c => {
        return {
            id: c.configID,
            matches: [c.siteRegex],
            js: ["scripts/content-script.js"]
        }
    });
    chrome.scripting.registerContentScripts(registrationSpecs);
}

function updateConfigs(...configs) {
    const registrationSpecs = configs.map(c => {
        return {
            id: c.configID,
            matches: [c.siteRegex],
            js: ["scripts/content-script.js"]
        }
    });
    chrome.scripting.updateContentScripts(registrationSpecs);
}