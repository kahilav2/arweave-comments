const GRAPHQL_ENDPOINT = "https://node2.bundlr.network/graphql";
const DATA_UPLOADER_SITE_ADDRESS = "3xb46gwjt6mtws2rd3qo2jpewim2jmifqdlq5uncmjaih7slqm3a.arweave.net/3cPPGsmfmTtLUR7g7SXkshmksQWA1w7RomJAg_5LgzY/";

function convertTimestamp(timestamp) {
    let date = new Date(timestamp);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let formattedDate = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();    
    return formattedDate;
}


document.addEventListener("DOMContentLoaded",  async function() {

    document.getElementById('send-button').addEventListener('click', async function(e) {
        e.preventDefault();
        const body = document.getElementById('body').value;
        const nickname = document.getElementById('nickname').value;
        const reaction = document.querySelector('input[name="reaction"]:checked')?.value;
        if (body.length === 0 && !reaction ) {
            alert('Please enter a comment or a reaction.');
            return
        }
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentURL = new URL(tabs[0].url);
        const hostname = currentURL.hostname;
        const path = currentURL.pathname + currentURL.search;
        try {
            window.open(`https://${DATA_UPLOADER_SITE_ADDRESS}?body=${body}${nickname ? '&nickname=' + nickname : ''}${reaction ? '&reaction=' + reaction : ''}&hostname=${hostname}&path=${path}`);
        }   catch (e) {
            console.error(e)
        }
    });

    document.getElementById('write-button').addEventListener('click', function() {
        document.getElementById('comments-view').style.display = 'none';
        document.getElementById('write-view').style.display = 'block';
        document.getElementById('write-button').style.display = 'none';
    });

    loadComments();
});


async function loadComments() {
    document.querySelector('.loading-spinner').style.display = 'block';

    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        const url = new URL(tabs[0].url);
        const isRootDomain = (url.pathname === "/");         
        document.getElementById('commentTarget').textContent = isRootDomain ? url.hostname : url.pathname + url.search;
        
        // send the graphql request
        const tagsPart = isRootDomain ? `[
            {name: "App-Name", values: ["arweave-comments"]}, 
            {name: "Metadata", values: ["true"]},
            {name: "Target-Hostname", values: ["${url.hostname}"]}
            {name: "Target-Path", values: ["/"]}
        ]` : `[
            {name: "App-Name", values: ["arweave-comments"]},
            {name: "Metadata", values: ["true"]}
            {name: "Target-Hostname", values: ["${url.hostname}"]},
            {name: "Target-Path", values: ["${url.pathname + url.search}"]}
        ]`; 
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operationName: null,
                variables: {},
                query: `{
                    transactions(tags: ${tagsPart}) {
                        edges {
                            node {
                                id
                                address
                                timestamp
                                tags {
                                    name
                                    value
                                }
                            }
                        }
                    }
                }`
            }),
        });
        
        // process the response
        const data = await response.json();
        const comments = data.data.transactions.edges.map((a)=> ({ 
            tags: {
                preview: a.node.tags.filter((b)=>b.name === "Preview")[0]?.value,
                reaction: a.node.tags.filter((b)=>b.name === "Reaction")[0]?.value,
                nickname: a.node.tags.filter((b)=>b.name === "Nickname")[0]?.value,
                truncated: a.node.tags.filter((b)=>b.name === "Truncated")[0]?.value,
            },
            id: a.node.id,
            owner: a.node.address,
            timestamp: a.node.timestamp
        }));

        // display the comments
        const commentsDiv = document.getElementById('comments');
        if (comments.length === 0) {
            const noCommentsDiv = document.createElement('div');
            noCommentsDiv.classList.add('no-comments');
            noCommentsDiv.textContent = 'No comments yet.';
            commentsDiv.appendChild(noCommentsDiv);
        }
        // render a comment list
        for (const comment of comments) {
            if (comment.tags.preview.length === 0) continue; // empty comments have no text but only reactions

            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            
            const authorDiv = document.createElement('div');
            authorDiv.classList.add('comment-author');
            authorDiv.textContent = comment.tags.nickname || `Anon (${comment.owner.substring(0,10)})`;
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('comment-date');
            dateDiv.textContent = convertTimestamp(comment.timestamp);
            commentDiv.appendChild(dateDiv);
            commentDiv.appendChild(authorDiv);

            if (comment.tags.reaction) {
                const reactionDiv = document.createElement('div');
                reactionDiv.classList.add('comment-reaction');
                reactionDiv.textContent = comment.tags.reaction;
                commentDiv.appendChild(reactionDiv);
            }

            const contentDiv = document.createElement('div');
            contentDiv.classList.add('comment-content');
            contentDiv.textContent = comment.tags.preview;
            commentDiv.appendChild(contentDiv);

            if (comment.tags.truncated) {
                const readMoreDiv = document.createElement('a');
                readMoreDiv.classList.add('comment-read-more');
                readMoreDiv.textContent = 'Read more';
                // when click on read more, fetch whole message and replace comment-content
                readMoreDiv.addEventListener('click', async function() {
                    // fetch whole data from arweave
                    const response = await fetch('https://arweave.net/' + comment.id);
                    const data = await response.json();
                    contentDiv.textContent = data.body;
                    readMoreDiv.style.display = 'none';
                });     
                commentDiv.appendChild(readMoreDiv);
            }
            commentsDiv.appendChild(commentDiv);    
        }
        const likesCount = comments.filter((a)=>a.tags.reaction === "👍").length;
        const dislikesCount = comments.filter((a)=>a.tags.reaction === "👎").length;
        const totalReviews = likesCount + dislikesCount;

        const likePercentage = (likesCount / totalReviews) * 100 - 1.5;
        const dislikePercentage = (dislikesCount / totalReviews) * 100 - 1.5;

        document.getElementById('likes').style.width = `${likePercentage}%`;
        document.getElementById('dislikes').style.width = `${dislikePercentage}%`;
        document.getElementById('likes').style.display = 'inline-block';
        document.getElementById('dislikes').style.display = 'inline-block';

        const noOfComments = comments.filter((a)=>a.tags.preview.length > 0).length;
        document.getElementById('total').textContent = 
            `${noOfComments} comment${noOfComments === 1 ? '' : 's'}, ${totalReviews} review${totalReviews === 1 ? '' : 's'}`;
        document.getElementById('total').style.display = 'inline-block';
        document.querySelector('.loading-spinner').style.display = 'none';
    });
}