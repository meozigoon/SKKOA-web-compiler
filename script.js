// SKKOA 소개 페이지용 스크립트
// 향후 인터랙션, 테마 토글 등 확장 가능

document.addEventListener("DOMContentLoaded", function () {
    // 예시: 버튼 클릭 시 애니메이션 효과
    const btn = document.querySelector("button");
    if (btn) {
        btn.addEventListener("mousedown", () => {
            btn.style.transform = "scale(0.96)";
        });
        btn.addEventListener("mouseup", () => {
            btn.style.transform = "scale(1)";
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "scale(1)";
        });
    }
});
