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
