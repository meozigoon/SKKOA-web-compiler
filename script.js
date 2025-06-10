document.getElementById('runButton').addEventListener('click', function() {
});

document.getElementById('saveButton').addEventListener('click', function() {
    const code = document.querySelector('.code-input').value;
    let filename = document.getElementById('filenameInput').value.trim();
    // 항상 .koa 확장자만 사용
    filename = filename.replace(/\.[^/.]+$/, '');
    filename += '.koa';

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
    window.open('https://github.com/meozigoon/skkoa-web-compiler', '_blank');
});

let tabs = [];
let activeTabId = null;
let isDirty = false; // 추가: 더티 플래그

function createTab(filename = 'untitled', content = '') {
    // 항상 .koa 확장자만 사용
    filename = filename.replace(/\.[^/.]+$/, '');
    if (!filename.endsWith('.koa')) filename += '.koa';
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
        // 항상 .koa 확장자만 표시
        let fname = tab.filename.replace(/\.[^/.]+$/, '');
        if (!fname.endsWith('.koa')) fname += '.koa';
        document.getElementById('filenameInput').value = fname;
    }
    renderTabs();
}

function renderTabs() {
    const tabBar = document.getElementById('tabBar');
    tabBar.innerHTML = '';
    // 코드: 줄 번호 영역의 실제 너비만큼 탭바에 margin-left 적용
    const linenumDiv = document.getElementById('editorLinenum');
    if (linenumDiv) {
        // getBoundingClientRect로 실제 표시 너비를 구함
        const linenumRect = linenumDiv.getBoundingClientRect();
        tabBar.style.marginLeft = linenumRect.width + 'px';
    } else {
        tabBar.style.marginLeft = '';
    }
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
                // .koa 확장자 제거 후 표시
                let baseName = tab.filename.replace(/\.[^/.]+$/, '');
                if (baseName.endsWith('.koa')) baseName = baseName.slice(0, -4);
                input.value = baseName;
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
                        let finalName = base;
                        while (tabs.some(t => t.filename === finalName + '.koa' && t.id !== tab.id)) {
                            finalName = base + '_' + num;
                            num++;
                        }
                        tab.filename = finalName + '.koa';
                        document.getElementById('filenameInput').value = finalName + '.koa';
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
                name = 'untitled' + untitledNum + '.koa';
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

// 줄 번호 표시 기능 (줄 번호를 textarea 내부에 가상으로 표시)
function updateLineNumbers() {
    const textarea = document.querySelector('.code-input');
    if (!textarea) return;
    // 줄 번호를 위한 배경 레이어가 없으면 생성
    let linenumLayer = textarea.parentElement.querySelector('.linenum-layer');
    if (!linenumLayer) {
        linenumLayer = document.createElement('div');
        linenumLayer.className = 'linenum-layer';
        linenumLayer.style.position = 'absolute';
        linenumLayer.style.left = '0';
        linenumLayer.style.top = '0';
        linenumLayer.style.bottom = '0';
        linenumLayer.style.width = '36px'; // 더 좁은 줄 번호 영역 너비
        linenumLayer.style.overflow = 'hidden';
        linenumLayer.style.background = 'transparent';
        linenumLayer.style.color = '#888';
        linenumLayer.style.textAlign = 'right';
        linenumLayer.style.padding = '2px 4px 2px 0'; // 오른쪽 4px로 코드와 거의 붙게
        linenumLayer.style.pointerEvents = 'none';
        linenumLayer.style.userSelect = 'none';
        linenumLayer.style.lineHeight = window.getComputedStyle(textarea).lineHeight;
        linenumLayer.style.zIndex = '2';
        textarea.parentElement.style.position = 'relative';
        textarea.parentElement.insertBefore(linenumLayer, textarea);
        textarea.style.position = 'relative';
        textarea.style.zIndex = '3';
        textarea.style.paddingLeft = '22px'; // 줄 번호 영역과 정확히 일치
        textarea.style.paddingTop = '2px';
        textarea.style.paddingBottom = '2px';
        textarea.style.paddingRight = '0';
        textarea.style.margin = '0';
    }
    // 줄 번호 생성
    const lines = textarea.value.split('\n').length;
    let nums = '';
    let activeLine = 1;
    if (typeof textarea.selectionStart === 'number') {
        const uptoCursor = textarea.value.slice(0, textarea.selectionStart);
        activeLine = uptoCursor.split('\n').length;
    }
    for (let i = 1; i <= lines; i++) {
        let lineClass = '';
        if (i === activeLine) lineClass = 'active-linenum active-linenum-border';
        nums += `<div class="${lineClass}" style='display:flex;justify-content:flex-end;align-items:center;font-size:0.85em;'>${i}</div>`;
    }
    linenumLayer.innerHTML = nums;
    // 스크롤 동기화
    linenumLayer.scrollTop = textarea.scrollTop;
    linenumLayer.style.height = textarea.clientHeight + 'px';
}

const codeInput = document.querySelector('.code-input');
codeInput.addEventListener('input', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) tab.content = codeInput.value;
    updateLineNumbers();
    isDirty = true; // 코드 입력 시 더티 플래그 설정
});
codeInput.addEventListener('scroll', function() {
    const linenumLayer = codeInput.parentElement.querySelector('.linenum-layer');
    if (linenumLayer) linenumLayer.scrollTop = codeInput.scrollTop;
});
codeInput.addEventListener('click', updateLineNumbers);
codeInput.addEventListener('keyup', updateLineNumbers);
codeInput.addEventListener('select', updateLineNumbers);
filenameInput.addEventListener('input', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) {
        let fname = filenameInput.value.trim().replace(/\.[^/.]+$/, '');
        if (!fname.endsWith('.koa')) fname += '.koa';
        tab.filename = fname;
        document.getElementById('filenameInput').value = fname;
    }
    renderTabs();
    isDirty = true; // 탭 이름 변경 시 더티 플래그 설정
});

const openFileMenu = document.getElementById('openFileMenu');
openFileMenu.addEventListener('click', openFileHandler);

const openFileToolbarBtn = document.getElementById('openFileToolbarBtn');
if (openFileToolbarBtn) openFileToolbarBtn.addEventListener('click', openFileHandler);

function openFileHandler() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.koa'; // .koa 파일만 열기
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', function(e) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            // 항상 .koa 확장자만 사용
            let fname = file.name.replace(/\.[^/.]+$/, '');
            if (!fname.endsWith('.koa')) fname += '.koa';
            createTab(fname, evt.target.result);
        };
        reader.readAsText(file);
    });
    input.click();
    setTimeout(() => document.body.removeChild(input), 1000);
}

const newFileMenu = document.getElementById('newFileMenu');
newFileMenu.addEventListener('click', function() {
    let untitledNum = 1;
    let name;
    do {
        name = 'untitled' + untitledNum + '.koa';
        untitledNum++;
    } while (tabs.some(t => t.filename === name));
    createTab(name, '');
});

const tabAddBtn = document.getElementById('tabAddBtn');
tabAddBtn.addEventListener('click', function() {
    let untitledNum = 1;
    let name;
    do {
        name = 'untitled' + untitledNum + '.koa';
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
// close 버튼 삭제, x 버튼 생성
let settingsCloseBtn = document.getElementById('settingsCloseBtn');
if (settingsCloseBtn) settingsCloseBtn.remove();

// x 버튼 생성 및 스타일 적용
const closeX = document.createElement('button');
closeX.innerHTML = '&times;';
closeX.setAttribute('aria-label', 'Close');
closeX.style.position = 'absolute';
closeX.style.top = '16px';
closeX.style.right = '20px';
closeX.style.background = 'none';
closeX.style.border = 'none';
closeX.style.color = '#fff';
closeX.style.fontSize = '2rem';
closeX.style.cursor = 'pointer';
closeX.style.zIndex = '10';
closeX.id = 'settingsModalCloseX';
settingsModal.appendChild(closeX);
closeX.addEventListener('click', function() {
    settingsModal.style.display = 'none';
});

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
    }
});

codeInput.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        this.value = value.substring(0, start) + '    ' + value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
        updateLineNumbers();
        isDirty = true;
    }
});
