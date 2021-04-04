chrome.runtime.onInstalled.addListener(async () => {
  let url = chrome.runtime.getURL("../view/hello.html");
  let tab = await chrome.tabs.create({ url });
});
