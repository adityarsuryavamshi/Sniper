const configIDInput = document.querySelector('#config-id');
const siteRegexInput = document.querySelector('#site-regex');
const reloadIntervalInput = document.querySelector('#reload-interval');
const elementSelectorInput = document.querySelector('#element-selector');
const actionToPerformInput = document.querySelector('#element-action');
const actionArgumentsInput = document.querySelector('#element-action-arguments');


const websiteConfigTemplateElement = document.querySelector('#saved-site-config');
const websiteConfigContainer = document.querySelector('.website-configs-container');

function showSiteConfigs(...siteConfigs) {
    for (const siteConfig of siteConfigs) {
        const websiteConfigElemet = websiteConfigTemplateElement.content.cloneNode(true);
        const spanElements = websiteConfigElemet.querySelectorAll('.wesbite-config li span.website-config-value');
        spanElements[0].textContent = siteConfig.configID;
        spanElements[1].textContent = siteConfig.siteRegex;
        spanElements[2].textContent = siteConfig.reloadInterval;
        spanElements[3].textContent = siteConfig.elementSelector;
        spanElements[4].textContent = siteConfig.actionToPerform;
        spanElements[5].textContent = siteConfig.actionArguments;


        const deleteElement = websiteConfigElemet.querySelector('.delete-config');
        deleteElement.addEventListener('click', async (e) => {
            e.preventDefault();
            await chrome.runtime.sendMessage({ request: 'deleteConfig', payload: siteConfig.configID });
            await getAndShowAllConfigs()
        })

        const editButton = websiteConfigElemet.querySelector('.edit-config');
        let inEditMode = false;
        editButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (!inEditMode) {
                for (let i = 1; i < spanElements.length; i++) {
                    elem = spanElements[i];
                    elem.setAttribute('contentEditable', true);
                    elem.classList.toggle('editable')
                    elem.focus();
                }
                editButton.textContent = 'Save';
            } else {
                for (let i = 1; i < spanElements.length; i++) {
                    elem = spanElements[i];
                    elem.setAttribute('contentEditable', false);
                    elem.classList.toggle('editable')
                }
                editButton.textContent = 'Edit';

                const websiteConfig = {
                    configID: spanElements[0].textContent,
                    siteRegex: spanElements[1].textContent,
                    reloadInterval: parseInt(spanElements[2].textContent),
                    elementSelector: spanElements[3].textContent,
                    actionToPerform: spanElements[4].textContent,
                    actionArguments: spanElements[5].textContent.split(","),
                }


                chrome.runtime.sendMessage({ request: "updateConfig", payload: websiteConfig })
                    .then(() => getAndShowAllConfigs())
                    .catch(err => console.error(err))
            }
            inEditMode = !inEditMode;
        })



        websiteConfigContainer.appendChild(websiteConfigElemet);
    }
}




async function getAndShowAllConfigs() {
    // Clear out the existing contents
    while (websiteConfigContainer.hasChildNodes()) {
        websiteConfigContainer.firstChild.remove();
    }
    const storedConfigs = await chrome.runtime.sendMessage({ request: 'getAllConfigs' });
    showSiteConfigs(...storedConfigs);
}


document.querySelector('#save-config').addEventListener('click', async (e) => {
    e.preventDefault();

    const websiteConfig = {
        configID: configIDInput.value,
        siteRegex: siteRegexInput.value,
        reloadInterval: parseInt(reloadIntervalInput.value),
        elementSelector: elementSelectorInput.value,
        actionToPerform: actionToPerformInput.value,
        actionArguments: actionArgumentsInput.value.split(","),
    }


    chrome.runtime.sendMessage({ request: "addNewConfig", payload: websiteConfig })
        .then(() => showSiteConfigs(websiteConfig))
        .catch(err => console.error(err))


    // Clear out the form
    configIDInput.value = ""
    siteRegexInput.value = ""
    reloadIntervalInput.value = ""
    elementSelectorInput.value = ""
    actionToPerformInput.value = ""
    actionArgumentsInput.value = ""

});


document.querySelector('#clear-config').addEventListener('click', async () => {
    const response = chrome.runtime.sendMessage({ request: 'clearConfig' });
    // Getting it again from storage to ensure it's cleared out and to accurately reflect the state
    getAndShowAllConfigs();
});

(async () => {
    await getAndShowAllConfigs();
})();

