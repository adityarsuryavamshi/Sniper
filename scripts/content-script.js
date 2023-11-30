const checkAndPerformAction = async (elementToCheck, elementToAct, action, arguments = []) => {
    addBackgroundAudioAndPlay();
    const checkElement = document.querySelector(elementToCheck);
    if (checkElement) {
        const actElement = document.querySelector(elementToAct);
        actElement[action](...arguments);
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
    addBackgroundAudioAndPlay();
    // const { config } = await chrome.runtime.sendMessage({ reason: "getConfig" });
    // console.log(`Received Config ${config}`)
    // if (config) {
    //     checkAndPerformAction(config.elementToCheck, config.elementToAct, config.action, config.arguments);
    // }

    setInterval(() => {
        location.reload();
    }, 30 * 1000);

})();
