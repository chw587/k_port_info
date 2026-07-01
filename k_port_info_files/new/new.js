document.addEventListener('DOMContentLoaded', () => {
    const depSelect = document.getElementById('depAirportSelect');
    const arrSelect = document.getElementById('arrAirportSelect');
    const swapBtn = document.getElementById('swapAirports');

    const portInfoWrap = document.querySelector('.port-info_wrap');
    const startPortSpan = document.querySelector('.table_st1 .start-port');
    const arrivePortSpan = document.querySelector('.table_st1 .arrive-port');

    const tempInfoWrap = document.querySelector('.temp_info_wrap');
    const startInfoDiv = document.querySelector('.temp_info_wrap .start-info');
    const arriveInfoDiv = document.querySelector('.temp_info_wrap .arrive-info');

    let depSelected = false;
    let arrSelected = false;


    /* -------------------------------------------
       리셋 시간ㄴ
    ------------------------------------------- */

    function getCurrentTimeString() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const day = days[now.getDay()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${month}.${date}.(${day}) ${hours}:${minutes} 갱신 (현지시각)`;
    }

    function updateAllIssueDates() {
        document.querySelectorAll('.tm_issue_date a').forEach(el => {
            el.textContent = getCurrentTimeString();
        });
    }

    function startIssueDateInterval() {
        return setInterval(updateAllIssueDates, 3600000); // 1시간
    }

    // 페이지 로드 시 초기 세팅
    function initIssueDate() {
        updateAllIssueDates();

        let intervalId = startIssueDateInterval();

        document.querySelectorAll('.tm_issue_date a').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();

                // 현재 시간으로 즉시 갱신
                updateAllIssueDates();

                clearInterval(intervalId);
                intervalId = startIssueDateInterval();
            });
        });
    }

    initIssueDate();


    /* -------------------------------------------
       공항 select 관련
    ------------------------------------------- */

    // select에서 선택된 option 텍스트 앞 2글자
    function getShortName(selectEl) {
        const optionText = selectEl.options[selectEl.selectedIndex].text;
        return optionText.slice(0, 2);
    }

    function updatePortInfo() {
        if (!depSelected || !arrSelected) {
            portInfoWrap.style.display = 'none';
            return;
        }

        if (depSelect.value === arrSelect.value) {
            alert('동일한 공항입니다.');
            portInfoWrap.style.display = 'none';
            return;
        }

        startPortSpan.textContent = getShortName(depSelect);
        arrivePortSpan.textContent = getShortName(arrSelect);

        portInfoWrap.style.display = 'block';
    }

    depSelect.addEventListener('change', () => {
        depSelected = true;
        updatePortInfo();
    });

    arrSelect.addEventListener('change', () => {
        arrSelected = true;
        updatePortInfo();
    });


    /* -------------------------------------------
       출발/도착 교환 관련
    ------------------------------------------- */

    function swapTempInfoPosition() {
        const placeholder = document.createComment('start-info-placeholder');
        tempInfoWrap.insertBefore(placeholder, startInfoDiv);
        tempInfoWrap.insertBefore(startInfoDiv, arriveInfoDiv);
        tempInfoWrap.insertBefore(arriveInfoDiv, placeholder);
        tempInfoWrap.removeChild(placeholder);
    }

    swapBtn.addEventListener('click', () => {
        const tempValue = depSelect.value;
        depSelect.value = arrSelect.value;
        arrSelect.value = tempValue;

        depSelect.dispatchEvent(new Event('change'));
        arrSelect.dispatchEvent(new Event('change'));

        swapTempInfoPosition();
    });
});