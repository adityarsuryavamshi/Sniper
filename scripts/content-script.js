const MIN_RELOAD_INTERVAL_IN_SEC = 30


const checkAndPerformAction = async (elementSelector, action, arguments = [], reloadAble = false) => {
    if (reloadAble) {
        // For reload able actions, put a background music to keep the tab active
        addBackgroundAudioAndPlay();
    }

    if (elementSelector) {
        const elems = document.querySelectorAll(elementSelector);
        for (const elem of elems) {
            if (action) {
                applyFunc(elem, action, arguments)
                attributeSet(elem, action, ...arguments)
            }
        }
    }

}


const applyFunc = function (elem, func, args = []) {
    try {
        elem[func](...args)
    } catch (error) {
        console.error(`Failed to applyFunc Element: ${elem}, Function: ${func}, Arguments: ${args}, Error : ${error}`)
    }
}

const attributeSet = function (elem, property, value) {
    try {
        elem[property] = value
    } catch (error) {
        console.error(`Failed to attributeSet Element: ${elem}, Property: ${property}, Value: ${value}, Error: ${error}`)
    }
}


function addBackgroundAudioAndPlay() {
    const backgroundAudio = chrome.runtime.getURL("media/rainfall.mp3");
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
        checkAndPerformAction(wc.elementSelector, wc.actionToPerform, wc.actionArguments, reloadIntervals?.length > 0);
    }
    if (reloadIntervals?.length > 0) {
        // If there are multiple reload intervals then the smallest one is the one we pick, with enforcing 10 seconds to avoid accidental DOS-ing
        setInterval(() => {
            location.reload();
        }, Math.max(MIN_RELOAD_INTERVAL_IN_SEC, Math.min(...reloadIntervals)) * 1000);
    }

})();