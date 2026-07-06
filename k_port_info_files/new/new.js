document.addEventListener('DOMContentLoaded', () => {
    const depSelect = document.getElementById('depAirportSelect');
    const arrSelect = document.getElementById('arrAirportSelect');
    const swapBtn = document.getElementById('swapAirports');

    const portInfoWrap = document.querySelector('.port-info_wrap');
    const tempInfoWrap = document.querySelector('.temp_info_wrap');
    const startInfoDiv = document.querySelector('.temp_info_wrap .start-info');
    const arriveInfoDiv = document.querySelector('.temp_info_wrap .arrive-info');


    /* ======================================================================
       발표시각(issue date) 갱신
       ====================================================================== */

    function getCurrentTimeString() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const day = days[now.getDay()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${month}.${date}.(${day}) ${hours}:${minutes} 갱신 (현재시각)`;
    }

    function updateAllIssueDates() {
        document.querySelectorAll('.tm_issue_date a').forEach((el) => {
            el.textContent = getCurrentTimeString();
        });
    }

    function initIssueDate() {
        updateAllIssueDates();

        // 1시간마다 자동 갱신. 클릭 시 즉시 갱신하고 타이머를 다시 시작한다.
        let intervalId = setInterval(updateAllIssueDates, 3600000);

        document.querySelectorAll('.tm_issue_date a').forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                updateAllIssueDates();
                clearInterval(intervalId);
                intervalId = setInterval(updateAllIssueDates, 3600000);
            });
        });
    }


    /* ======================================================================
       공항 선택(select) / 출·도착 테이블
       ====================================================================== */

    function addAirportPlaceholder(selectEl) {
        if (!selectEl || selectEl.querySelector('option[value=""]')) return;

        const option = document.createElement('option');
        option.value = '';
        option.dataset.name = '';
        option.textContent = '공항 선택';
        selectEl.insertBefore(option, selectEl.firstChild);
        selectEl.value = '';
    }

    // select에서 선택된 공항명을 2글자로 축약해 반환한다. 선택값이 없으면 '전체'.
    function getShortName(selectEl) {
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        if (!selectedOption || !selectEl.value) return '전체';

        const optionName = selectedOption.dataset.name || selectedOption.textContent.replace(/\s*공항\s*$/, '').trim();
        return optionName.slice(0, 2);
    }

    function initPortInfo() {
        if (!depSelect || !arrSelect || !portInfoWrap) return;

        addAirportPlaceholder(depSelect);
        addAirportPlaceholder(arrSelect);
        depSelect.value = 'RKSI';
        arrSelect.value = '';

        const tableOver = portInfoWrap.querySelector('.table_over');
        const tableBody = portInfoWrap.querySelector('tbody');
        const routeHeaderCell = portInfoWrap.querySelector('.table_st1 thead tr:first-child th');
        const originalRows = tableBody ? Array.from(tableBody.querySelectorAll('tr')) : [];

        // 데이터가 없을 때 표시할 행 / 빈 상태 안내 메시지
        const noDataRow = document.createElement('tr');
        noDataRow.className = 'port-no-data-row';
        noDataRow.hidden = true;
        noDataRow.innerHTML = '<td colspan="7">출•도착 항공편이 없습니다</td>';
        if (tableBody) tableBody.appendChild(noDataRow);

        // NOTE: emptyMessage(.port-empty-message)는 현재 표시되는 분기가 없다.
        // 추후 "테이블 자체를 숨기는" 빈 상태를 쓸 계획이면 showTable()/updatePortInfo()에
        // 해당 상태로 전환하는 로직을 추가해야 한다.
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'port-empty-message';
        emptyMessage.textContent = '출•도착 항공편이 없습니다';
        emptyMessage.hidden = true;
        portInfoWrap.appendChild(emptyMessage);

        function showTable() {
            portInfoWrap.classList.remove('is-empty');
            portInfoWrap.style.display = 'block';
            emptyMessage.hidden = true;

            if (tableOver) {
                tableOver.style.display = '';
            }
        }

        function setTableRowsVisible(isVisible) {
            originalRows.forEach((row) => {
                row.hidden = !isVisible;
            });
            noDataRow.hidden = isVisible;
            portInfoWrap.classList.toggle('has-no-data', !isVisible);
        }

        function renderRouteHeader(startName, arriveName) {
            if (!routeHeaderCell) return;

            routeHeaderCell.textContent = '';

            const title = document.createElement('b');
            const start = document.createElement('span');
            const arrive = document.createElement('span');

            start.className = 'start-port';
            arrive.className = 'arrive-port';
            start.textContent = startName;
            arrive.textContent = arriveName;

            title.appendChild(start);
            title.append(' - ');
            title.appendChild(arrive);
            title.append(' 도착 정보');
            routeHeaderCell.appendChild(title);
        }

        function updatePortInfo() {
            const hasDeparture = Boolean(depSelect.value);
            const hasArrival = Boolean(arrSelect.value);
            const sameAirport = hasDeparture && hasArrival && depSelect.value === arrSelect.value;
            const startName = hasDeparture ? getShortName(depSelect) : '전체';

            showTable();

            if (!hasArrival) {
                if (routeHeaderCell) routeHeaderCell.textContent = '선택된 공항이 없습니다.';
                setTableRowsVisible(false);
                return;
            }

            renderRouteHeader(startName, getShortName(arrSelect));
            setTableRowsVisible(!sameAirport);
        }

        depSelect.addEventListener('change', updatePortInfo);
        arrSelect.addEventListener('change', updatePortInfo);

        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                const tempValue = depSelect.value;
                depSelect.value = arrSelect.value;
                arrSelect.value = tempValue;

                updatePortInfo();
                swapStartArriveInfoOrder();
            });
        }

        updatePortInfo();
    }

    // start-info / arrive-info 두 요소의 DOM 순서를 서로 바꾼다.
    // 두 요소가 형제 관계에서 떨어져 있어도 동작하도록 임시 placeholder 노드를 사용한다.
    function swapStartArriveInfoOrder() {
        if (!tempInfoWrap || !startInfoDiv || !arriveInfoDiv) return;

        const placeholder = document.createComment('start-info-placeholder');
        tempInfoWrap.insertBefore(placeholder, startInfoDiv);
        tempInfoWrap.insertBefore(startInfoDiv, arriveInfoDiv);
        tempInfoWrap.insertBefore(arriveInfoDiv, placeholder);
        tempInfoWrap.removeChild(placeholder);
    }


    /* ======================================================================
       헤더 타이틀 마퀴(길이 초과 시 좌우 스크롤)
       ====================================================================== */

    function initHeaderTitleMarquee() {
        const titleEls = Array.from(document.querySelectorAll('.temp_info_wrap>div .temp_header h3'));
        if (!titleEls.length) return;

        // 텍스트를 span으로 한 번 감싸서 실제 텍스트 너비를 측정할 수 있게 한다.
        titleEls.forEach((titleEl) => {
            if (titleEl.querySelector('.header-title-text')) return;

            const textWrap = document.createElement('span');
            textWrap.className = 'header-title-text';

            while (titleEl.firstChild) {
                textWrap.appendChild(titleEl.firstChild);
            }

            titleEl.appendChild(textWrap);
        });

        function updateTitleMarquee() {
            titleEls.forEach((titleEl) => {
                const textWrap = titleEl.querySelector('.header-title-text');
                if (!textWrap) return;

                const overflowWidth = textWrap.scrollWidth - titleEl.clientWidth;
                const isOverflowing = overflowWidth > 1;

                titleEl.classList.toggle('is-overflowing', isOverflowing);
                titleEl.style.setProperty('--header-title-distance', `${Math.max(0, overflowWidth + 16)}px`);
            });
        }

        requestAnimationFrame(updateTitleMarquee);
        window.addEventListener('resize', updateTitleMarquee);
    }


    /* ======================================================================
       초기화
       ====================================================================== */

    initIssueDate();
    initPortInfo();
    initHeaderTitleMarquee();
});