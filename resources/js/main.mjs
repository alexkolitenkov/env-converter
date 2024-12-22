import { build, safeParseInput } from './utils.mjs';
import { prefixes, services, inputOptions, outputOptions } from './constants.mjs';
import { monacoEditor, getEditorContent, setEditorContent, tabSize } from './editor.mjs';

/* Buttons */
const convertBtn = document.querySelector('.convert');
const prettyPrintBtn = document.querySelector('.prettyPrint');
const copyToClipboardJsonInputBtn = document.querySelector('.copyToClipboardJsonInput');
const copyToClipboardEnvOutputBtn = document.querySelector('.copyToClipboardEnvOutput');
const openFileBtn = document.querySelector('.openFile');
const inputSaveToFileBtn = document.querySelector('div.inputButtons button.saveToFile');
const outputSaveToFileBtn = document.querySelector('div.outputButtons button.saveToFile');
const clearInputBtn = document.querySelector('.clearInput');
const clearOutputBtn = document.querySelector('.clearOutput');

/* Textareas */
const envOutputTextarea = document.getElementById('output');

/* Dropdowns */
const dropdownPrefixes = document.getElementById('prefixes');
const dropdownServices = document.getElementById('services');

/* Feedback spans */
const spanCopyToClipboardJsonInput = document.querySelector('.spanCopyToClipboardJsonInput');
const spanCopyToClipboardEnvOutput = document.querySelector('.spanCopyToClipboardEnvOutput');

// Populate dropdowns
Object.keys(prefixes).forEach(prefix => {
    const el = document.createElement('option');
    el.textContent = prefix;
    el.value = prefix;
    dropdownPrefixes.appendChild(el);
});

Object.keys(services).forEach(service => {
    const el = document.createElement('option');
    el.textContent = service;
    el.value = service;
    dropdownServices.appendChild(el);
});

// Convert function
convertBtn.addEventListener('click', () => {
    prettyPrint(tabSize);
    try {
        const input = getEditorContent(monacoEditor);
        const parsedJson = JSON.parse(input);

        const prefix = getPrefix();
        const service = getService();
        let res = '';

        for (const key in parsedJson) {
            res += build(parsedJson, key, prefix, service);
        }
        envOutputTextarea.value = res;
    } catch (e) {
        console.error('Conversion error:', e.message);
    }
});

setupCopyButton(copyToClipboardJsonInputBtn, null, spanCopyToClipboardJsonInput);
setupCopyButton(copyToClipboardEnvOutputBtn, envOutputTextarea, spanCopyToClipboardEnvOutput);
setupSaveButton(inputSaveToFileBtn, null, inputOptions);
setupSaveButton(outputSaveToFileBtn, envOutputTextarea, outputOptions);

prettyPrintBtn.addEventListener('click', () => prettyPrint(tabSize));
openFileBtn.addEventListener('click', async () => {
    const defaultPath = 'D:';

    const entries = await Neutralino.os.showOpenDialog('Open a file', {
        filters: [
            { name: 'JSON object', extensions: ['json'] },
            { name: 'JavaScript object', extensions: ['js'] },
        ],
        multiSelections: false,
        defaultPath
    });
    let data = await Neutralino.filesystem.readFile(entries[0]);
    setEditorContent(monacoEditor, data);
});
clearInputBtn.addEventListener('click', () => setEditorContent(monacoEditor, ''));
clearOutputBtn.addEventListener('click', () => envOutputTextarea.value = '');

function prettyPrint(tabSize = 2) {
    const input = getEditorContent(monacoEditor);
    const obj = safeParseInput(input);
    const stringified = JSON.stringify(obj, null, tabSize);
    setEditorContent(monacoEditor, stringified);
}

function setupCopyButton(button, textarea, feedbackSpan) {
    button.addEventListener('click', () => {
        const content = textarea ? textarea.value : getEditorContent(monacoEditor);
        if (content) {
            copyToClipboard(content);
            feedbackSpan.innerHTML = 'Copied!';
        }
    });

    button.addEventListener('mouseout', () => {
        setTimeout(() => {
            feedbackSpan.innerHTML = 'Copy to clipboard';
        }, 100);
    });
}

function getPrefix() {
    const selectedPrefix = dropdownPrefixes.value;
    return prefixes[selectedPrefix];
}

function getService() {
    const selectedService = dropdownServices.value;
    return services[selectedService];
}

function setupSaveButton(button, textarea, options) {
    button.addEventListener('click', async () => {
        const content = textarea ? textarea.value : getEditorContent(monacoEditor);
        if (content) {
            let entry = await Neutralino.os.showSaveDialog('Save to file', options);
            await Neutralino.filesystem.writeFile(entry, content);
        } else {
            console.log('No value to save');
        }
    });
}

async function copyToClipboard(text) {
    await Neutralino.clipboard.writeText(text);
}

function setTray() {
    if (NL_MODE != 'window') {
        console.log('INFO: Tray menu is only available in the window mode.');
        return;
    }

    let tray = {
        icon: '/resources/icons/trayIcon.png',
        menuItems: [
            { id: 'VERSION', text: 'Get version' },
            { id: 'SEP', text: '-' },
            { id: 'QUIT', text: 'Quit' }
        ]
    };

    Neutralino.os.setTray(tray);
}

function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case 'VERSION':
            Neutralino.os.showMessageBox('Version information',
                `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
            break;
        case 'QUIT':
            Neutralino.app.exit();
            break;
    }
}

function onWindowClose() {
    Neutralino.app.exit();
}

Neutralino.init();

Neutralino.events.on('trayMenuItemClicked', onTrayMenuItemClicked);
Neutralino.events.on('windowClose', onWindowClose);

if (NL_OS != 'Darwin') {
    setTray();
}