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

// Open File 기능
const openFileMenu = document.getElementById('openFileMenu');
openFileMenu.addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.html,.js,.css,.json,.md,.py,.java,.c,.cpp,.ts,.tsx,.jsx,.csv,.xml,.yml,.yaml,.sh,.bat,.php,.rb,.go,.rs,.swift,.kt,.dart,.sql,.ini,.conf,.log,.env,.cfg,.pl,.lua,.r,.ipynb,.h,.hpp,.m,.mm,.vb,.cs,.asp,.jsp,.vue,.svelte,.scss,.less,.styl,.lock,.gitignore,.dockerfile,.makefile,.gradle,.pom,.toml,.lock,.properties,.config,.rc,.editorconfig,.babelrc,.eslintrc,.prettierrc,.npmrc,.yarnrc,.pnpmfile,.pnpm-lock,.pnpm-workspace,.pnpm-workspace.yaml,.pnpm-workspace.yml,.pnpm-workspace.json,.pnpm-workspace.js,.pnpm-workspace.cjs,.pnpm-workspace.mjs,.pnpm-workspace.ts,.pnpm-workspace.tsx,.pnpm-workspace.jsx,.pnpm-workspace.vue,.pnpm-workspace.svelte,.pnpm-workspace.scss,.pnpm-workspace.less,.pnpm-workspace.styl,.pnpm-workspace.lock,.pnpm-workspace.gitignore,.pnpm-workspace.dockerfile,.pnpm-workspace.makefile,.pnpm-workspace.gradle,.pnpm-workspace.pom,.pnpm-workspace.toml,.pnpm-workspace.lock,.pnpm-workspace.properties,.pnpm-workspace.config,.pnpm-workspace.rc,.pnpm-workspace.editorconfig,.pnpm-workspace.babelrc,.pnpm-workspace.eslintrc,.pnpm-workspace.prettierrc,.pnpm-workspace.npmrc,.pnpm-workspace.yarnrc';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', function(e) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            document.querySelector('.code-input').value = evt.target.result;
            document.getElementById('filenameInput').value = file.name.replace(/\.[^/.]+$/, '');
        };
        reader.readAsText(file);
    });
    input.click();
    setTimeout(() => document.body.removeChild(input), 1000);
});

// New File 기능
const newFileMenu = document.getElementById('newFileMenu');
newFileMenu.addEventListener('click', function() {
    document.querySelector('.code-input').value = '';
    document.getElementById('filenameInput').value = 'untitled1';
});
