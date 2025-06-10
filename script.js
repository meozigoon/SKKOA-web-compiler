document.getElementById('runButton').addEventListener('click', function() {
});

document.getElementById('saveButton').addEventListener('click', function() {
    const code = document.querySelector('.code-input').value;
    let filename = document.getElementById('filenameInput').value.trim();
    if (filename === '') filename = 'untitled1';
    filename = filename.replace(/\.[^/.]+$/, '');
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
});

document.getElementById('githubButton').addEventListener('click', function() {
    window.open('https://github.com/Team-ToyoTech', '_blank');
});

let tabs = [];
let activeTabId = null;
let isDirty = false; // 추가: 더티 플래그

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
        // 탭 이름 영역
        const nameSpan = document.createElement('span');
        nameSpan.textContent = tab.filename;
        nameSpan.style.flex = '1';
        if (tab.id === activeTabId) {
            nameSpan.style.cursor = 'pointer';
            nameSpan.onclick = (e) => {
                e.stopPropagation();
                // 인라인 입력창으로 변경 (배경 검정, 텍스트 흰색, 기존 박스 스타일 제거)
                const input = document.createElement('input');
                input.type = 'text';
                input.value = tab.filename;
                input.style.background = '#000';
                input.style.color = '#fff';
                input.style.border = 'none';
                input.style.outline = 'none';
                input.style.fontFamily = 'inherit';
                input.style.fontSize = '15px';
                input.style.padding = '2px 6px';
                input.style.borderRadius = '4px';
                input.style.width = Math.max(60, tab.filename.length * 9) + 'px';
                nameSpan.replaceWith(input);
                input.focus();
                input.select();
                input.onblur = input.onkeydown = function(ev) {
                    if (ev.type === 'blur' || ev.key === 'Enter') {
                        let newName = input.value.trim() || 'untitled';
                        // 중복 방지
                        let base = newName, num = 1;
                        while (tabs.some(t => t.filename === newName && t.id !== tab.id)) {
                            newName = base + '_' + num;
                            num++;
                        }
                        tab.filename = newName;
                        document.getElementById('filenameInput').value = newName;
                        renderTabs();
                    } else if (ev.key === 'Escape') {
                        renderTabs();
                    }
                };
            };
        }
        tabEl.appendChild(nameSpan);
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
    // + 버튼을 탭바의 마지막에 추가
    let addBtn = document.getElementById('tabAddBtn');
    if (!addBtn) {
        addBtn = document.createElement('button');
        addBtn.id = 'tabAddBtn';
        addBtn.className = 'tab-add-btn';
        addBtn.title = 'New Tab';
        addBtn.textContent = '+';
        addBtn.onclick = function() {
            let untitledNum = 1;
            let name;
            do {
                name = 'untitled' + untitledNum;
                untitledNum++;
            } while (tabs.some(t => t.filename === name));
            createTab(name, '');
        };
    }
    tabBar.appendChild(addBtn);
}

function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx !== -1) {
        tabs.splice(idx, 1);
        if (activeTabId === id) {
            if (tabs.length > 0) {
                setActiveTab(tabs[Math.max(0, idx - 1)].id);
            } else {
                createTab('untitled1', '');
            }
        } else {
            renderTabs();
        }
    }
}

// 줄 번호 표시 기능
function updateLineNumbers() {
    const textarea = document.querySelector('.code-input');
    const linenumDiv = document.getElementById('editorLinenum');
    if (!textarea || !linenumDiv) return;
    const lines = textarea.value.split('\n').length;
    // 커서 위치 줄 계산
    let activeLine = 1;
    if (typeof textarea.selectionStart === 'number') {
        const uptoCursor = textarea.value.slice(0, textarea.selectionStart);
        activeLine = uptoCursor.split('\n').length;
    }
    let nums = '';
    for (let i = 1; i <= lines; i++) {
        if (i === activeLine) {
            nums += `<span class='active-linenum'>${i}</span>\n`;
        } else {
            nums += i + '\n';
        }
    }
    linenumDiv.innerHTML = nums;
}

const codeInput = document.querySelector('.code-input');
codeInput.addEventListener('input', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) tab.content = codeInput.value;
    updateLineNumbers();
    isDirty = true; // 코드 입력 시 더티 플래그 설정
});
codeInput.addEventListener('scroll', function() {
    document.getElementById('editorLinenum').scrollTop = codeInput.scrollTop;
});
codeInput.addEventListener('click', updateLineNumbers);
codeInput.addEventListener('keyup', updateLineNumbers);
codeInput.addEventListener('select', updateLineNumbers);
filenameInput.addEventListener('input', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) tab.filename = filenameInput.value;
    renderTabs();
    isDirty = true; // 탭 이름 변경 시 더티 플래그 설정
});

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

const tabAddBtn = document.getElementById('tabAddBtn');
tabAddBtn.addEventListener('click', function() {
    let untitledNum = 1;
    let name;
    do {
        name = 'untitled' + untitledNum;
        untitledNum++;
    } while (tabs.some(t => t.filename === name));
    createTab(name, '');
});

document.getElementById('menuToggleBtn').addEventListener('click', function() {
    const sideMenu = document.querySelector('.side-menu');
    const editorArea = document.querySelector('.editor-area');
    sideMenu.classList.toggle('open');
    if (sideMenu.classList.contains('open')) {
        editorArea.style.marginLeft = '210px';
    } else {
        editorArea.style.marginLeft = '0';
    }
});

// Settings(설정) 모달 열기/닫기 및 배경색 변경
const settingsMenu = document.getElementById('settingsMenu');
const settingsModal = document.getElementById('settingsModal');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const bgRadios = document.getElementsByName('bgcolor');
const fontRadios = document.getElementsByName('fontsize');
const fontsizeInput = document.getElementById('fontsizeInput');
const fontsizeToggleBtn = document.getElementById('fontsizeToggleBtn');

settingsMenu.addEventListener('click', function() {
    settingsModal.style.display = 'flex';
    // 현재 배경색에 맞게 라디오 체크
    const body = document.body;
    let val = 'default';
    if (body.classList.contains('bg-white')) val = 'white';
    else if (body.classList.contains('bg-purple')) val = 'purple';
    for (const r of bgRadios) r.checked = (r.value === val);

    // 현재 코드 입력창 폰트 크기 반영
    const codeInput = document.querySelector('.code-input');
    let curFont = codeInput ? codeInput.style.fontSize.replace('px','') : '14';
    if (!curFont) curFont = window.getComputedStyle(codeInput).fontSize.replace('px','');
    fontsizeInput.value = curFont;
});
settingsCloseBtn.addEventListener('click', function() {
    settingsModal.style.display = 'none';
});
settingsModal.addEventListener('click', function(e) {
    if (e.target === settingsModal) settingsModal.style.display = 'none';
});

for (const radio of bgRadios) {
    radio.addEventListener('change', function() {
        document.body.classList.remove('bg-white', 'bg-purple');
        if (this.value === 'white') document.body.classList.add('bg-white');
        else if (this.value === 'purple') document.body.classList.add('bg-purple');
        // 기본은 아무 클래스도 없음
    });
}

for (const radio of fontRadios) {
    radio.addEventListener('change', function() {
        const size = this.value + 'px';
        document.querySelector('.code-input').style.fontSize = size;
        document.getElementById('editorLinenum').style.fontSize = size;
    });
}

fontsizeToggleBtn.addEventListener('click', function() {
    let size = parseInt(fontsizeInput.value, 10);
    if (isNaN(size) || size < 10) size = 10;
    if (size > 32) size = 32;
    document.querySelector('.code-input').style.fontSize = size + 'px';
    document.getElementById('editorLinenum').style.fontSize = size + 'px';
});
fontsizeInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') fontsizeToggleBtn.click();
});

window.addEventListener('DOMContentLoaded', () => {
    updateLineNumbers();
    if (tabs.length === 0) createTab('untitled1', '');
});

window.addEventListener('beforeunload', function(e) {
    if (isDirty) {
        e.preventDefault();
        e.returnValue = '만약 변경 사항이 있는데 페이지 새로 고침 되거나 탭이 닫히면 종료하시겠습니까? 변경 사항이 저장되지 않을 수 있습니다.';
        return e.returnValue;
    }
});
