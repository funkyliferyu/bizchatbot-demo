/* ===== 비즈플래닛 챗봇관리 데모: 시나리오 네비게이션 + 하이라이트 ===== */
(function () {
  'use strict';

  var PLACE_URL = 'https://naver.me/5Q3VgeaD';
  var DB_PLACE_URL = 'https://m.place.naver.com/place/1824807602/home';
  var CHATBOT_URL = 'https://chat.rbdialog.co.kr/?botId=8558886c0e8c4b0b849efafe82cc574d';
  var INFO_FILE = 'info_해화로in수산.docx';
  var REVIEWS_FILE = 'reviews_해화로in수산.docx';
  var DB_DESCRIPTION = "안녕하세요. '해화로'를 찾아주셔서 진심으로 감사드립니다. 저희는 바다와 사람이 만나 이루는 조화로운 맛을 정성껏 담아, 따뜻한 한 끼를 선물하고자 이 공간을 열었습니다. 신선한 재료만을 엄선해 자연 그대로의 깊은 맛을 전하며, 과한 기교보다 재료 본연의 풍미에 집중합니다. '재료를 아끼지 말고, 장사는 사람을 남기는 것' 이라는 마음으로 좋은 재료를 아낌없이 사용하고, 누구나 부담 없이 즐기실 수 있는 정직한 한 끼를 준비했습니다. 싱싱한 회부터 정갈한 식사, 계절을 담은 해산물 요리까지, 한 끼가 하루를 따뜻하게 채우는 시간이 되길 바랍니다. 고객님께 드리는 모든 음식에는 저희의 진심이 담겨 있습니다. 앞으로도 변함없는 맛과 정성으로 늘 같은 자리에서 기다리겠습니다. 감사합니다.\n\n(AI요약정보) 신선한 대방어의 겨울철 진미";
  var DB_PARKING_NOTE = '도보이용시 : 어린이대공원역 5번출구 광진광장공영주차장 입구 에서 도보 1분 지하철 이용시 : 어린이대공원역 5번출구 광진광장공영주차장 입구 에서 도보 1분 버스 이용시 : 어린이대공원역. 화양천주교회 정류장 자차 이용시 : 광진광장공영주차장에 주차 혹은 어린이대공원 정문 주차장에 주차후 5분 도보 그 외 유료주차장(주말에 비교적 수월하게 이용가능 주차장) AJ파크 어린이회관점 유료주차장 KCC파크타운 유료주차장';

  var SCENARIO = [
    {
      page: 'soho_store_register.html',
      label: '매장 등록',
      target: { selector: '#place-fetch-btn' },
      guide: '네이버 플레이스 주소가 입력되어 있습니다. [불러오기]를 눌러 해화로in수산 매장 정보를 채웁니다.',
      next: 'soho_store_register_loaded.html'
    },
    {
      page: 'soho_store_register_loaded.html',
      label: '매장 정보 불러옴',
      target: { selector: '#rag-generate-button' },
      scrollTarget: true,
      guide: '해화로in수산의 실제 DB 정보가 입력되었습니다. [챗봇용 RAG 문서 생성]을 눌러 챗봇 지식 문서를 만듭니다.',
      next: 'soho_store_register_rag_generated.html'
    },
    {
      page: 'soho_store_register_rag_generated.html',
      label: 'RAG 문서 생성',
      target: { selector: '.rag-download-link' },
      scrollTarget: true,
      guide: 'RAG 문서 2개가 생성되었습니다. info 또는 reviews DOCX 파일을 눌러 다운로드합니다.',
      next: 'soho_store_register_download_modal.html'
    },
    {
      page: 'soho_store_register_download_modal.html',
      label: '다운로드 완료',
      target: { selector: '#download-confirm-button' },
      guide: '다운로드 완료 팝업입니다. [확인]을 누르면 챗봇 솔루션의 지식 관리 목록으로 이동합니다.',
      next: 'RB-Dialog-soho1.html'
    },
    {
      page: 'RB-Dialog-soho1.html',
      label: '지식 관리 목록',
      target: { selector: '.knowledge-row', text: 'info_해화로in수산.docx' },
      guide: 'RB Dialog 지식 관리 목록입니다. info 문서를 눌러 벡터 임베딩 설정을 확인합니다.',
      next: 'RB-Dialog-soho2.html'
    },
    {
      page: 'RB-Dialog-soho2.html',
      label: 'info 임베딩 설정',
      target: { selector: '.demo-rb-action', text: 'review 파일 보기' },
      guide: '업체 정보 문서가 RAG 검색용 벡터로 임베딩되었습니다. [review 파일 보기]로 리뷰 문서 설정을 확인합니다.',
      next: 'RB-Dialog-soho3.html'
    },
    {
      page: 'RB-Dialog-soho3.html',
      label: 'review 임베딩 설정',
      target: { selector: '.demo-rb-action', text: '챗봇 구현 확인하기' },
      guide: '방문자 리뷰 문서도 임베딩되었습니다. [챗봇 구현 확인하기]를 눌러 실제 챗봇 화면으로 이동합니다.',
      next: 'chatbot_live.html'
    },
    {
      page: 'chatbot_live.html',
      label: '실 챗봇 확인',
      target: null,
      guide: '실제 RB Dialog 챗봇입니다. 새 창 버튼 또는 화면 안의 챗봇에서 직접 질문해볼 수 있습니다.',
      next: null
    }
  ];

  var STORAGE_KEY = 'bizplanetChatbotDemoGuide';
  var page = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  var stepIndex = -1;
  for (var i = 0; i < SCENARIO.length; i++) {
    if (SCENARIO[i].page === page) { stepIndex = i; break; }
  }
  if (stepIndex === -1) return;
  var step = SCENARIO[stepIndex];

  function field(id) {
    return document.getElementById(id);
  }

  function setValue(id, value) {
    var el = field(id);
    if (!el) return;
    el.value = value;
    el.classList.add('autofilled');
  }

  function setHidden(id, hidden) {
    var el = field(id);
    if (el) el.hidden = hidden;
  }

  function setHtml(id, html) {
    var el = field(id);
    if (el) el.innerHTML = html;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function chips(items) {
    return items.map(function (item) {
      return '<span class="metadata-chip">' + escapeHtml(item) + '</span>';
    }).join('');
  }

  function stat(label, value) {
    return '<div class="stat-card"><div class="stat-label">' + escapeHtml(label) + '</div><div class="stat-value">' + escapeHtml(value) + '</div></div>';
  }

  function link(label, url) {
    return '<a class="metadata-link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(label) + '</a>';
  }

  function writeCategory(value) {
    var select = field('f-type');
    if (!select) return;
    var option = document.createElement('option');
    option.value = value;
    option.textContent = '불러온 업종: ' + value;
    option.setAttribute('data-demo-option', 'true');
    select.appendChild(option);
    select.value = value;
    select.classList.add('autofilled');
  }

  function setParking() {
    var radio = document.querySelector('input[name="parking"][value="near"]');
    if (radio) radio.checked = true;
    var group = document.querySelector('[data-autofill-group="parking"]');
    if (group) group.classList.add('autofilled');
  }

  function setRagLink(id, fileName, href) {
    var a = field(id);
    if (!a) return;
    a.textContent = fileName;
    a.href = href;
    a.setAttribute('download', fileName);
    a.hidden = false;
  }

  function populateHaehwaroBase() {
    setValue('place-url', DB_PLACE_URL);
    writeCategory('음식점 > 일식 > 생선회');
    setValue('f-name', '해화로in수산');
    setValue('f-biz', '');
    setValue('f-tel', '0507-1359-5863');
    setValue('f-addr1', '서울 광진구 광나루로 383 1,2층');
    setValue('f-addr2', '');
    setValue('f-email', '');
    setValue('f-open', '11:20');
    setValue('f-close', '24:00');
    setValue('f-break1', '14:30');
    setValue('f-break2', '16:30');
    setValue('f-parking-note', DB_PARKING_NOTE);
    setValue('f-desc', DB_DESCRIPTION);
    setParking();

    var ragButton = field('rag-generate-button');
    if (ragButton) ragButton.disabled = false;
    var rawButton = field('raw-data-button');
    if (rawButton) rawButton.disabled = false;

    setHidden('place-metadata-section', false);
    setHidden('place-metadata-empty', true);
    setHtml('place-links-list', link('인스타그램', 'https://www.instagram.com/forebus_jubong') + '<br>' + link('식신', 'https://www.siksinhot.com/P/1760971') + '<br>' + link('다이닝코드', 'https://diningcode.com/profile.php?rid=k18mJkCL81Tr'));
    setHtml('place-booking', link('네이버 예약', 'https://m.booking.naver.com/booking/6/bizes/1352276'));
    setHtml('place-facilities', chips(['단체 이용 가능', '예약', '무선 인터넷', '남/녀 화장실 구분', '유아의자', '대기공간', '포장', '배달', '테이크아웃 할인', '콜키지 가능 (유료)', '출입구 휠체어 이용가능', '좌석 휠체어 이용가능']));
    setHtml('place-review-stats', stat('방문자 리뷰', '1,861') + stat('블로그 리뷰', '432') + stat('텍스트 리뷰', '1,766') + stat('평점', '-'));
    setHtml('place-broadcasts', '<div class="broadcast-item"><div class="broadcast-title">KBS2 · 2TV생생정보</div><div class="broadcast-meta">26.01.09. · 해물조림</div></div>');
    setHtml('place-keywords', chips(['숙성회', '군자횟집', '어린이대공원횟집', '군자생선구이', '군자점심']));

    setHidden('place-menu-section', false);
    var count = field('place-menu-count');
    if (count) count.textContent = '55개';
    setHtml('place-menu-list',
      '<div class="menu-item"><div class="menu-title">모듬 회ㆍ산물</div><div class="menu-meta">59,000원 · 회도,해산물도 좋아하는 이들의 최고의 선택지</div></div>' +
      '<div class="menu-item"><div class="menu-title">속초식 항아리 물회</div><div class="menu-meta">39,000원 · 속초식 정통 물회</div></div>' +
      '<div class="menu-item"><div class="menu-title">무늬 오징어 회</div><div class="menu-meta">59,000원 · 쫄깃한 식감이 일품인 무늬 오징어 회에 소금김밥 조합은 극락 입니다</div></div>' +
      '<div class="menu-item"><div class="menu-title">초신선 大활어 3종 스페셜</div><div class="menu-meta">49,000원 · 엄선한 대어종 활어의 신선함을 그대로 담았습니다.</div></div>' +
      '<div class="menu-item"><div class="menu-title">7종 골라먹는 大숙성회</div><div class="menu-meta">59,000원 · 신선한 제철회와 숙성회 7종을 직접 골라 드세요. 최고의 맛을 선사합니다.</div></div>' +
      '<div class="menu-item"><div class="menu-title">화덕 모듬 생선구이 쌈밥</div><div class="menu-meta">20,000원 · 6가지 랜덤 모듬 화덕구이 생선과 쌈밥의 조화</div></div>' +
      '<div class="menu-item"><div class="menu-title">직화 쭈꾸미 쌈밥</div><div class="menu-meta">13,000원 · 모듬쌈, 우렁쌈장, 직화쭈꾸미, 미역국, 밥, 7찬</div></div>' +
      '<div class="menu-item"><div class="menu-title">화덕 고등어구이 쌈밥</div><div class="menu-meta">14,000원 · 모듬쌈, 우렁쌈장, 화덕고등어 1인 1마리, 미역국, 밥, 7찬</div></div>'
    );
    setHtml('place-menu-images', '');
    setHidden('place-menu-images-panel', true);

    clearRag();
  }

  function clearRag() {
    var status = field('rag-doc-status');
    if (status) status.textContent = '업체에 최적화된 응답을 제공하기 위해 RAG 용 문서를 생성해주세요.';
    ['rag-info-download', 'rag-reviews-download', 'rag-doc-source-info', 'rag-doc-source-reviews'].forEach(function (id) {
      var a = field(id);
      if (!a) return;
      a.hidden = true;
      a.removeAttribute('href');
      a.removeAttribute('download');
    });
    setHidden('rag-doc-source-empty', false);
  }

  function populateRagGenerated() {
    populateHaehwaroBase();
    var status = field('rag-doc-status');
    if (status) status.textContent = '챗봇용 RAG 문서 생성 완료 · 리뷰 100개 포함 · 2026. 6. 16. 오후 6:42';
    setRagLink('rag-info-download', INFO_FILE, '/api/stores/store_1824807602/rag-documents/info/download');
    setRagLink('rag-reviews-download', REVIEWS_FILE, '/api/stores/store_1824807602/rag-documents/reviews/download');
    setRagLink('rag-doc-source-info', INFO_FILE, '/api/stores/store_1824807602/rag-documents/info/download');
    setRagLink('rag-doc-source-reviews', REVIEWS_FILE, '/api/stores/store_1824807602/rag-documents/reviews/download');
    setHidden('rag-doc-source-empty', true);
  }

  function showDownloadModal() {
    populateRagGenerated();
    var modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'download-complete-modal';
    modal.innerHTML =
      '<div class="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="download-modal-title">' +
      '<div class="modal-title" id="download-modal-title">다운로드가 완료되었습니다.</div>' +
      '<p class="modal-desc">생성된 RAG 문서 2개를 챗봇 솔루션 지식 관리에 등록할 수 있습니다.</p>' +
      '<div class="modal-actions"><button type="button" id="download-confirm-button" class="btn btn-primary">확인</button></div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  var PREP = {
    'soho_store_register.html': function () {
      setValue('place-url', PLACE_URL);
    },
    'soho_store_register_loaded.html': populateHaehwaroBase,
    'soho_store_register_rag_generated.html': populateRagGenerated,
    'soho_store_register_download_modal.html': showDownloadModal
  };

  function guideOn() {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  }

  function nextUrl() {
    return step.next || null;
  }

  function goNext() {
    var url = nextUrl();
    if (url) location.href = url;
  }

  function matchingTargets() {
    if (!step.target) return [];
    var nodes = Array.prototype.slice.call(document.querySelectorAll(step.target.selector));
    return nodes.filter(function (node) {
      return !step.target.text || (node.textContent || '').indexOf(step.target.text) !== -1;
    });
  }

  var bar = document.createElement('div');
  bar.className = 'demo-bar';

  var homeBtn = document.createElement('a');
  homeBtn.className = 'demo-home-btn';
  homeBtn.href = 'index.html';
  homeBtn.title = '데모 홈';
  homeBtn.textContent = '⌂';

  var prevBtn = document.createElement('a');
  prevBtn.className = 'demo-nav-btn' + (stepIndex === 0 ? ' disabled' : '');
  prevBtn.href = stepIndex > 0 ? SCENARIO[stepIndex - 1].page : '#';
  prevBtn.title = '이전 화면';
  prevBtn.textContent = '‹';

  var stepLabel = document.createElement('span');
  stepLabel.className = 'demo-step-label';
  stepLabel.innerHTML = '<strong>' + (stepIndex + 1) + '/' + SCENARIO.length + '</strong>' + step.label;

  var nextBtn = document.createElement('a');
  nextBtn.className = 'demo-nav-btn' + (!step.next ? ' disabled' : '');
  nextBtn.href = nextUrl() || '#';
  nextBtn.title = '다음 화면';
  nextBtn.textContent = '›';
  nextBtn.addEventListener('click', function (event) {
    if (!step.next) return;
    event.preventDefault();
    goNext();
  });

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'demo-toggle';
  toggle.innerHTML = '<span class="demo-dot"></span>사용자 시나리오';

  bar.appendChild(homeBtn);
  bar.appendChild(prevBtn);
  bar.appendChild(stepLabel);
  bar.appendChild(nextBtn);
  bar.appendChild(toggle);

  var tooltip = null;
  var highlightEls = [];

  function anchorEl() {
    return highlightEls[0] || nextBtn;
  }

  function positionTooltip() {
    if (!tooltip) return;
    var el = anchorEl();
    var rect = el.getBoundingClientRect();
    var top = rect.top + window.scrollY - tooltip.offsetHeight - 14;
    var below = false;
    if (top < window.scrollY + 8) {
      top = rect.bottom + window.scrollY + 14;
      below = true;
    }
    var left = rect.left + window.scrollX;
    var maxLeft = window.scrollX + document.documentElement.clientWidth - tooltip.offsetWidth - 12;
    if (left > maxLeft) left = Math.max(maxLeft, window.scrollX + 12);
    tooltip.classList.toggle('below', below);
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  }

  function showTooltip() {
    if (tooltip) return;
    tooltip = document.createElement('div');
    tooltip.className = 'demo-tooltip';
    tooltip.innerHTML = '<span class="demo-tooltip-step">STEP ' + (stepIndex + 1) + '/' + SCENARIO.length + '</span>' + step.guide;
    document.body.appendChild(tooltip);
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip, true);
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }

  function applyHighlight() {
    highlightEls.forEach(function (el) { el.classList.add('demo-highlight'); });
    showTooltip();
  }

  function removeHighlight() {
    highlightEls.forEach(function (el) { el.classList.remove('demo-highlight'); });
    hideTooltip();
  }

  function syncGuide() {
    var on = guideOn();
    toggle.classList.toggle('on', on);
    if (on) applyHighlight();
    else removeHighlight();
  }

  function bindTargets(elements) {
    highlightEls = elements;
    elements.forEach(function (el) {
      if (el.tagName === 'A') el.removeAttribute('target');
      if (el.disabled) {
        el.disabled = false;
        el.removeAttribute('disabled');
      }
      el.style.cursor = 'pointer';
      el.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        goNext();
      }, true);
    });
    if (step.scrollTarget && elements[0]) {
      setTimeout(function () { elements[0].scrollIntoView({ block: 'center' }); }, 80);
    }
    syncGuide();
  }

  function waitForTarget() {
    if (!step.target) {
      syncGuide();
      return;
    }
    var found = matchingTargets();
    if (found.length) {
      bindTargets(found);
      return;
    }
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      var elements = matchingTargets();
      if (elements.length) {
        clearInterval(timer);
        bindTargets(elements);
      } else if (tries > 40) {
        clearInterval(timer);
        syncGuide();
      }
    }, 150);
  }

  toggle.addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, guideOn() ? 'off' : 'on');
    syncGuide();
  });

  function init() {
    document.body.appendChild(bar);
    if (PREP[page]) {
      setTimeout(function () {
        try { PREP[page](); } catch (e) { console.warn(e); }
        waitForTarget();
      }, 300);
    } else {
      waitForTarget();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
