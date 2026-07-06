document.addEventListener('DOMContentLoaded', () => {
    const depSelect = document.getElementById('depAirportSelect');
    const arrSelect = document.getElementById('arrAirportSelect');
    const swapBtn = document.getElementById('swapAirports');

    const portInfoWrap = document.querySelector('.port-info_wrap');
    const tempInfoWrap = document.querySelector('.temp_info_wrap');
    const startInfoDiv = document.querySelector('.temp_info_wrap .start-info');
    const arriveInfoDiv = document.querySelector('.temp_info_wrap .arrive-info');

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

    function addAirportPlaceholder(selectEl) {
        if (!selectEl || selectEl.querySelector('option[value=""]')) return;

        const option = document.createElement('option');
        option.value = '';
        option.dataset.name = '';
        option.textContent = '공항 선택';
        selectEl.insertBefore(option, selectEl.firstChild);
        selectEl.value = '';
    }

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
        const noDataRow = document.createElement('tr');
        noDataRow.className = 'port-no-data-row';
        noDataRow.hidden = true;
        noDataRow.innerHTML = '<td colspan="7">출•도착 항공편이 없습니다</td>';
        if (tableBody) tableBody.appendChild(noDataRow);

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

                if (tempInfoWrap && startInfoDiv && arriveInfoDiv) {
                    const placeholder = document.createComment('start-info-placeholder');
                    tempInfoWrap.insertBefore(placeholder, startInfoDiv);
                    tempInfoWrap.insertBefore(startInfoDiv, arriveInfoDiv);
                    tempInfoWrap.insertBefore(arriveInfoDiv, placeholder);
                    tempInfoWrap.removeChild(placeholder);
                }
            });
        }

        updatePortInfo();
    }

    function initHeaderTitleMarquee() {
        const titleEls = Array.from(document.querySelectorAll('.temp_info_wrap>div .temp_header h3'));
        if (!titleEls.length) return;

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

    initIssueDate();
    initPortInfo();
    initHeaderTitleMarquee();
});
