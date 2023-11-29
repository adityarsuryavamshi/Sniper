const siteRegexInput = document.querySelector('#site-regex');
const reloadIntervalInput = document.querySelector('#reload-interval');
const elementToCheckInput = document.querySelector('#element-to-check');
const elementToActInput = document.querySelector('#element-to-act');
const actionToPerformInput = document.querySelector('#element-action');
const actionArgumentsInput = document.querySelector('#element-action-arguments');


const websiteConfigTemplateElement = document.querySelector('#saved-site-config');
const websiteConfigContainer = document.querySelector('.website-configs-container');

async function showStoredConfigs() {
    while (websiteConfigContainer.hasChildNodes()) {
        websiteConfigContainer.firstChild.remove();
    }

    const { sniperWebsiteConfigs } = await chrome.storage.local.get('sniperWebsiteConfigs');


    for (const websiteConfig of sniperWebsiteConfigs) {
        const websiteConfigElemet = websiteConfigTemplateElement.content.cloneNode(true);
        const spanElements = websiteConfigElemet.querySelectorAll('.wesbite-config li span.website-config-value');
        spanElements[0].textContent = websiteConfig.siteRegex;
        spanElements[1].textContent = websiteConfig.reloadInterval;
        spanElements[2].textContent = websiteConfig.elementToCheck;
        spanElements[3].textContent = websiteConfig.elementToAct;
        spanElements[4].textContent = websiteConfig.actionToPerform;
        spanElements[5].textContent = websiteConfig.actionArguments;
        websiteConfigContainer.appendChild(websiteConfigElemet);
    }


}



document.querySelector('#save-config').addEventListener('click', async (e) => {
    e.preventDefault();
    const siteRegex = siteRegexInput.value;
    const reloadInterval = parseInt(reloadIntervalInput.value);
    const elementToCheck = elementToCheckInput.value;
    const elementToAct = elementToActInput.value;
    const actionToPerform = actionToPerformInput.value;
    const actionArguments = actionArgumentsInput.value;

    let { sniperWebsiteConfigs } = await chrome.storage.local.get('sniperWebsiteConfigs');

    sniperWebsiteConfigs.push({
        siteRegex: siteRegex,
        reloadInterval: reloadInterval,
        elementToCheck: elementToCheck,
        elementToAct: elementToAct,
        actionToPerform: actionToPerform,
        actionArguments: actionArguments,
    })

    chrome.storage.local.set({ sniperWebsiteConfigs });
    showStoredConfigs();

    siteRegexInput.value = ""
    reloadIntervalInput.value = ""
    elementToCheckInput.value = ""
    elementToActInput.value = ""
    actionToPerformInput.value = ""
    actionArgumentsInput.value = ""

});

(async () => {
    await showStoredConfigs();
})();

