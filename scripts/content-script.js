const MIN_RELOAD_INTERVAL_IN_SEC = 30


const checkAndPerformAction = async (elementToCheck, elementToAct, action, arguments = [], reloadAble = false) => {
    if (reloadAble) {
        // For reload able actions, put a background music to keep the tab active
        addBackgroundAudioAndPlay();
    }
    if (elementToCheck) {
        const checkElements = document.querySelectorAll(elementToCheck);
        if (checkElements?.length > 0) {
            if (elementToAct) {
                const actElements = document.querySelectorAll(elementToAct);
                if (action) {
                    for (const elem of actElements) {
                        elem[action](...arguments)
                    }
                }
            }
        }
    }

}


function addBackgroundAudioAndPlay() {
    const backgroundAudio = chrome.runtime.getURL("media/background.ogg");
    const audioElem = document.createElement('audio');
    audioElem.src = backgroundAudio;
    audioElem.loop = true;
    document.querySelector('body').appendChild(audioElem);
    audioElem.play()
        .catch(e => {
            console.error(`Failed to Play Audio : ${e}`)
        })
    return audioElem;
}


(async () => {
    const websiteConfigs = await chrome.runtime.sendMessage({ request: 'getConfig' });
    const reloadIntervals = websiteConfigs
        .filter(({ reloadInterval }) => Number.isInteger(reloadInterval))
        .map(({ reloadInterval }) => Number.parseInt(reloadInterval));


    for (const wc of websiteConfigs) {
        checkAndPerformAction(wc.elementToCheck, wc.elementToAct, wc.actionToPerform, wc.actionArguments, reloadIntervals?.length > 0);
    }
    if (reloadIntervals?.length > 0) {
        // If there are multiple reload intervals then the smallest one is the one we pick, with enforcing 10 seconds to avoid accidental DOS-ing
        setInterval(() => {
            location.reload();
        }, Math.max(MIN_RELOAD_INTERVAL_IN_SEC, Math.min(...reloadIntervals)) * 1000);
    }

})();