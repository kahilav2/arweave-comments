import { providers } from './assets/ethers-5.2.esm.min.js'
const PROGRESS_BAR_NO_OF_STEPS = 5;


function updateProgressBar(step, message, { error } = {}) {
    const descriptionDiv = document.getElementById('description');
    const progressBar = document.getElementById('progressBar');

    if (error) {
        progressBar.classList.add('error');
        progressBar.style.width = "100%";
        descriptionDiv.innerHTML = message;
        return;
    }

    progressBar.style.width = `${(step / PROGRESS_BAR_NO_OF_STEPS) * 100}%`;
    descriptionDiv.innerHTML = message;
}


function createPayload() {
    const params = new URLSearchParams(window.location.search);
    const bodyParam = params.get('body');
    const nicknameParam = params.get('nickname');
    const reactionParam = params.get('reaction');
    const hostnameParam = params.get('hostname');
    const pathParam = params.get('path');

    const dataToUpload = {}; 
    const tags =  [{
        name: "Content-Type",
        value: "application/json",
    },
    {
        name: "App-Name",
        value: "arweave-comments",
    },
    {
        name: "App-Version",
        value: "0.0.1-alpha.0",
    },
    {
        name: "Metadata",
        value: "true",
    },
    {
        name: "Metadata-Schema",
        value: "url-comment-0.0.1-alpha.0"
    },
    {
        name: "Target-Hostname",
        value: hostnameParam,
    },
    {
        name: "Target-Path",
        value: pathParam,
    },
    ...(reactionParam ? [{
        name: "Reaction",
        value: reactionParam,
    }] : []),
    ...(!!nicknameParam ? [{
        name: "Nickname",
        value: nicknameParam,
    }] : []),
    {
        name: "Preview",
        value: bodyParam,
    }]
    const dataStr = JSON.stringify(tags)
    const lenghtInBytes = new TextEncoder().encode(dataStr).length
    if (lenghtInBytes > 2000) {
        const shortenedPreview = bodyParam.substring(0, 250)
        tags.find(tag => tag.name === "Preview").value = shortenedPreview
        dataToUpload.body = bodyParam
        dataToUpload.reaction = reactionParam
        dataToUpload.nickname = nicknameParam
        tags.push({
            name: "Truncated",
            value: "true",
        })
    }
    return {
        tags,
        dataToUpload,
    }
}


window.onload = async function() {
    try {
        await upload();
    } catch(err) {
        updateProgressBar(0, `Error posting: ${err.message}`, { error: true });
        console.error(err)
    }
};


async function upload() {
    
    updateProgressBar(0, "Connecting to Metamask");
    await window.ethereum.enable();
    const provider = new providers.Web3Provider(window.ethereum);
    
    updateProgressBar(1, "Connecting to Bundlr")
    const bundlr = new Bundlr.default("https://node2.bundlr.network", "matic", provider);
    await bundlr.ready()

    updateProgressBar(2, "Getting balance")
    const balance = await bundlr.getLoadedBalance();
    const readableBalance = bundlr.utils.fromAtomic(balance).toNumber()
    if (readableBalance <= 0) {
        descriptionDiv.innerHTML = `Balance too low (${readableBalance} MATIC)` 
        return;
    }
    updateProgressBar(3, `Balance OK (${readableBalance} MATIC)`)
    
    const { tags, dataToUpload } = createPayload();
    
    updateProgressBar(4, "Signing the transaction")
    const response = await bundlr.upload(
        JSON.stringify(dataToUpload), {
        tags
    });

    updateProgressBar(5, "Comment was posted successfully, you can now close this tab.")
    console.log(`Data Available at => https://arweave.net/${response.id}`);
};