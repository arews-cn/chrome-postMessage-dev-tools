const headerRowId = "header-row";
const isDarkTheme = chrome.devtools.panels.themeName === "dark";
const themeClassName = isDarkTheme ? "dark" : "default";

const setHeaderRowColor = () => {
  const headerRow = document.querySelector('#header-row');
  headerRow.className = themeClassName;
}

const addControllBarAction = () => {
    const clearBtn = document.querySelector('#clear-content')
    const tableBody = document.querySelector('#post-message-table-body');
    clearBtn.addEventListener('click', e => {
        tableBody.innerHTML = ''
    })
}

const addTableRow = (origin, data) => {
  try {
    const tableBody = document.querySelector('#post-message-table-body');
    const row = document.createElement('tr');
    row.className = themeClassName;

    const originCell = document.createElement('td');
    const dataCell = document.createElement('td');

    originCell.innerText = origin;
    dataCell.innerText = JSON.stringify(data);

    row.appendChild(originCell);
    row.appendChild(dataCell);
    tableBody.appendChild(row);
  } catch (err) {
    console.error(err);
  }
};

document.addEventListener("DOMContentLoaded", (event) => {
  setHeaderRowColor();
  addControllBarAction();
});

const sendInjectContentScriptMessage = () => {
  backgroundPageConnection.postMessage({
    type: "init",
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "postMessageDevToolsContentScript.js",
  });
};

// Init
const backgroundPageConnection = chrome.runtime.connect({ name: "devToolsPanel" });

backgroundPageConnection.onMessage.addListener((message) => {

  message_data = JSON.stringify(message.data)

  if(message_data.indexOf("wappalyzer") == -1 && message_data.indexOf("untrustedTypes") == -1) {

    addTableRow(message.origin,decodeURI(decodeURIComponent(message_data)).replace(/\"/g,""));
  }
});

sendInjectContentScriptMessage();

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    sendInjectContentScriptMessage();
  }
});