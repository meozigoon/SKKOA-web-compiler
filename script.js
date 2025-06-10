document.getElementById('runButton').addEventListener('click', function() {
    // 실행 기능 미구현
});

document.getElementById('saveButton').addEventListener('click', function() {
    const code = document.querySelector('.code-input').value;
    let filename = document.getElementById('filenameInput').value.trim();
    // 확장자 .txt 제거 후, 뒤에만 .txt 붙이기
    if (filename === '') filename = 'untitled1';
    filename = filename.replace(/\.[^/.]+$/, ''); // 마지막 .xxx 확장자 제거
    filename += '.txt';

    const blob = new Blob([code], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
});

document.getElementById('stopButton').addEventListener('click', function() {
    // 정지 기능 미구현
});

document.getElementById('githubButton').addEventListener('click', function() {
    window.open('https://github.com/', '_blank');
});

// 탭 관리 로직
let tabs = [];
let activeTabId = null;

function createTab(filename = 'untitled', content = '') {
    const id = 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    tabs.push({ id, filename, content });
    setActiveTab(id);
    renderTabs();
}

function setActiveTab(id) {
    activeTabId = id;
    const tab = tabs.find(t => t.id === id);
    if (tab) {
        document.querySelector('.code-input').value = tab.content;
        document.getElementById('filenameInput').value = tab.filename;
    }
    renderTabs();
}

function renderTabs() {
    const tabBar = document.getElementById('tabBar');
    tabBar.innerHTML = '';
    tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
        tabEl.textContent = tab.filename;
        // 닫기 버튼
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        };
        tabEl.appendChild(closeBtn);
        tabEl.onclick = () => setActiveTab(tab.id);
        tabBar.appendChild(tabEl);
    });
}

function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx !== -1) {
        tabs.splice(idx, 1);
        if (activeTabId === id) {
            if (tabs.length > 0) {
                setActiveTab(tabs[Math.max(0, idx - 1)].id);
            } else {
                // 마지막 탭 닫으면 새 탭 생성
                createTab('untitled1', '');
            }
        } else {
            renderTabs();
        }
    }
}

// 코드/파일명 변경 시 탭 데이터 동기화
const codeInput = document.querySelector('.code-input');
const filenameInput = document.getElementById('filenameInput');
codeInput.addEventListener('input', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) tab.content = codeInput.value;
});
filenameInput.addEventListener('input', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) tab.filename = filenameInput.value;
    renderTabs();
});

// Open File 기능
const openFileMenu = document.getElementById('openFileMenu');
openFileMenu.addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.html,.js,.css,.json,.md,.py,.java,.c,.cpp,.ts,.tsx,.jsx,.csv,.xml,.yml,.yaml,.sh,.bat,.php,.rb,.go,.rs,.swift,.kt,.dart,.sql,.ini,.conf,.log,.env,.cfg,.pl,.lua,.r,.ipynb,.h,.hpp,.m,.mm,.vb,.cs,.asp,.jsp,.vue,.svelte,.scss,.less,.styl,.lock,.gitignore,.dockerfile,.makefile,.gradle,.pom,.toml,.lock,.properties,.config,.rc,.editorconfig,.babelrc,.eslintrc,.prettierrc,.npmrc,.yarnrc';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', function(e) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            createTab(file.name.replace(/\.[^/.]+$/, ''), evt.target.result);
        };
        reader.readAsText(file);
    });
    input.click();
    setTimeout(() => document.body.removeChild(input), 1000);
});

// New File 기능
const newFileMenu = document.getElementById('newFileMenu');
newFileMenu.addEventListener('click', function() {
    let untitledNum = 1;
    let name;
    do {
        name = 'untitled' + untitledNum;
        untitledNum++;
    } while (tabs.some(t => t.filename === name));
    createTab(name, '');
});

// 최초 탭 생성
window.addEventListener('DOMContentLoaded', () => {
    if (tabs.length === 0) createTab('untitled1', '');
});
