![alt text](./images/icon128.png)
# Arweave Comments
Arweave Comments is a Chrome extension that enables users to contribute comments to any URL or domain in a permissionless and permanent way, utilizing the Arweave blockchain for storage.

Uniquely, Arweave Comments crafts a new layer of interaction atop the conventional web, independent of the control of website owners or the entities behind internet URLs. This design forms a global dialogue platform, fostering an open and dynamic exchange of ideas and comments across any site on the internet.

## Motivation
On the internet it's not always possible for users to discern the thoughts and opinions of others regarding a particular site or content. Some websites, either by design or circumstance, lack the feature for users to leave comments. This absence can present a tangible hurdle for users wishing to share their perspectives or engage in meaningful discourse.

Arweave Comments seeks to revolutionize this space by providing a seamless, user-friendly avenue for users to voice their thoughts and interact with each other about any online content. Leveraging the Arweave blockchain, Arweave Comments ensures censorship resistance and facilitates a free flow of dialogue accross the internet. 

## Description
With Arweave Comments, you can now leave a permanent mark on any website with your insights, reviews, or simply a shoutout. By leveraging Arweave's decentralized data storage, your comments achieve permanence and can't be tampered with or deleted.

Payments for the storage are made via the Metamask wallet, using the Polygon Network (MATIC token). This ensures a low-cost yet secure transaction to store your comments forever.

## How It Works
Arweave Comments uploads a very small item into Arweave, with the comment metadata saved as transactional tags that Arweave supports. The following is a proposed metadata schema for these transactions:

```json
{
    "Content-Type": "application/json",
    "App-Name": "<any application name>",
    "App-Version": "<any version number>",
    "Metadata": "true",
    "Metadata-Schema": "url-comment-0.0.1",
    "Target-Hostname": "<the hostname of the url that the comment targets, e.g. games.com>",
    "Target-Path": "<the path of the url that the comment targets, e.g. /games/zelda>",
    "Reaction": "<optional reaction that the user chooses, a single unicode emoji>",
    "Nickname": "<optional nickname of the one who posts, shown instead of public address>",
    "Preview": "<preview contains max 255 first characters of the body of the message>",
    "Truncated": "true" // when the message body is longer than 255 chars this field will be true and the whole message will be in the uploaded json file itself, jsonpath: $.body
}
```

## Expanding the Use-cases
The proposed metadata schema presents an opportunity to expand its application beyond commenting. One significant extension could be in the domain of user feedback. This metadata schema has the capability to capture user sentiments and insights, even on websites that do not provide an avenue for user feedback.

The flexibility of the schema also makes it well-suited for reviews of books, products, or any other item listed on a website. Users could create permanent, permissionless reviews on any product page.

Another exciting possibility is anchoring comments to specific text or DOM elements on a page. This could allow users to make comments contextually relevant, and these comments could then be rendered directly into the DOM upon user request, providing a dynamic and interactive user experience.

## Limitations
Given the permissionless nature of this extension, there is an inherent challenge related to preventing spam or filtering out comments posted by bots. Further development is required to devise mechanisms for ensuring the quality of comments. This, however, is a common problem in the internet space, and your insights and contributions to address it are most welcome!

## Installation
1. Clone the repository
2. Navigate to chrome://extensions in your browser
3. Enable 'Developer mode'
4. Click 'Load unpacked'
5. Select the cloned repository

## Contribution

We're open to any and all feedback! Feel free to open an issue or submit a pull request.