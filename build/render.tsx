/**
 * 비즈플래닛 "챗봇관리" 데모 빌드 스크립트.
 *
 * BLOG-demo 와 같은 방식으로 원본 web/ HTML 을 읽어 정적 데모 화면으로
 * 복제하고, demo.css / demo.js 레이어를 주입한다.
 *
 * 실행:
 *   ../bizp-store-learning-poc/poc-server/node_modules/.bin/tsx build/render.tsx
 *
 * 원본(bizp-store-learning-poc/web)은 절대 수정하지 않는다.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = join(here, '..');
const webDir = join(demoDir, '..', 'bizp-store-learning-poc', 'web');

const SCREENS: Array<{ out: string; src: string }> = [
  { out: 'soho_store_register.html', src: 'soho_store_register.html' },
  { out: 'soho_store_register_loaded.html', src: 'soho_store_register.html' },
  { out: 'soho_store_register_rag_generated.html', src: 'soho_store_register.html' },
  { out: 'soho_store_register_download_modal.html', src: 'soho_store_register.html' }
];

function copyAssets(): number {
  let count = 0;
  for (const name of readdirSync(webDir)) {
    const full = join(webDir, name);
    if (!statSync(full).isFile()) continue;
    const ext = extname(name).toLowerCase();
    if (ext === '.html' || ext === '.md') continue;
    copyFileSync(full, join(demoDir, name));
    count += 1;
  }
  return count;
}

function injectDemoLayer(html: string): string {
  const resetStoreScript =
    '<script>try{localStorage.removeItem("bizplanet.storeRegistration.storeId");}catch(e){}</script>';
  let out = html;
  if (out.includes('</head>')) {
    out = out.replace('</head>', `  <link rel="stylesheet" href="demo.css">\n  ${resetStoreScript}\n</head>`);
  }
  if (out.includes('</body>')) {
    out = out.replace('</body>', '  <script defer src="demo.js"></script>\n</body>');
  } else {
    out += '\n<script defer src="demo.js"></script>\n';
  }
  return out;
}

function shellPage(title: string, body: string, extraHead = ''): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · 챗봇관리 데모</title>
<link rel="stylesheet" href="demo.css" />
${extraHead}
</head>
<body>
${body}
<script defer src="demo.js"></script>
</body>
</html>
`;
}

function rbStyles(): string {
  return `<style>
  *{box-sizing:border-box}
  body{margin:0;background:#EEF1F7;color:#172033;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif}
  .rb-shell{min-height:100vh;display:grid;grid-template-columns:232px 1fr;background:#F5F7FB}
  .rb-side{background:#111827;color:#D5DAE7;padding:22px 16px;display:flex;flex-direction:column;gap:18px}
  .rb-brand{font-size:18px;font-weight:900;color:#fff;letter-spacing:.02em}
  .rb-bot{padding:13px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.06)}
  .rb-bot-name{font-size:13px;font-weight:800;color:#fff}
  .rb-bot-meta{font-size:11px;color:#9CA3AF;margin-top:4px}
  .rb-nav{display:flex;flex-direction:column;gap:4px}
  .rb-nav a{height:34px;display:flex;align-items:center;padding:0 10px;border-radius:6px;color:#B9C0D0;text-decoration:none;font-size:13px;font-weight:650}
  .rb-nav a.active{background:#2B4FD8;color:#fff}
  .rb-main{padding:28px 32px 56px}
  .rb-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}
  .rb-kicker{font-size:11px;font-weight:800;color:#637089;letter-spacing:.08em;text-transform:uppercase}
  h1{font-size:24px;line-height:1.2;margin:6px 0 8px;color:#111827}
  .rb-desc{font-size:13px;color:#6B7280;line-height:1.55;margin:0}
  .rb-btn{height:34px;border:0;border-radius:6px;background:#2B4FD8;color:#fff;font-weight:800;font-size:13px;padding:0 14px;cursor:pointer}
  .rb-btn.secondary{background:#fff;color:#2B4FD8;border:1px solid #D8E0EC}
  .rb-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}
  .rb-metric{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:14px}
  .rb-metric-label{font-size:11px;color:#7B8496;font-weight:700}
  .rb-metric-value{font-size:22px;font-weight:900;color:#111827;margin-top:4px}
  .rb-panel{background:#fff;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:16px}
  .rb-panel-head{height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E2E8F0}
  .rb-panel-title{font-size:14px;font-weight:850;color:#111827}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{padding:13px 16px;border-bottom:1px solid #EDF2F7;text-align:left;vertical-align:middle}
  th{font-size:11px;color:#7B8496;background:#FAFBFC;font-weight:800}
  tr:last-child td{border-bottom:0}
  .knowledge-row{cursor:pointer}
  .knowledge-row:hover{background:#F7F9FF}
  .doc-name{font-weight:850;color:#1F2937}
  .doc-sub{font-size:11px;color:#7B8496;margin-top:3px}
  .badge{display:inline-flex;align-items:center;min-height:22px;border-radius:999px;padding:2px 9px;font-size:11px;font-weight:800}
  .badge.green{background:#E8F8EF;color:#178447}
  .badge.blue{background:#EEF2FF;color:#2B4FD8}
  .badge.gray{background:#F1F3F5;color:#667085}
  .detail-layout{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:16px;align-items:start}
  .doc-card{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:18px}
  .doc-title{font-size:20px;font-weight:900;margin-bottom:8px}
  .doc-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .form-row{display:grid;grid-template-columns:140px 1fr;gap:12px;padding:13px 0;border-top:1px solid #EDF2F7}
  .form-label{font-size:12px;font-weight:850;color:#4B5563}
  .form-value{font-size:13px;color:#111827;line-height:1.55}
  .doc-inspector{position:sticky;top:74px}
  .section-label{font-size:11px;font-weight:900;color:#667085;letter-spacing:.08em;text-transform:uppercase;margin:18px 0 8px}
  .doc-preview{border:1px solid #D8E0EC;border-radius:8px;background:#fff;overflow:hidden}
  .doc-preview-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:#FAFBFC;border-bottom:1px solid #E2E8F0}
  .doc-preview-title{font-size:13px;font-weight:900;color:#111827}
  .doc-preview-note{font-size:11px;color:#7B8496}
  .doc-section{padding:14px 16px;border-bottom:1px solid #EDF2F7}
  .doc-section:last-child{border-bottom:0}
  .doc-section h3{font-size:14px;margin:0 0 8px;color:#111827}
  .doc-section p,.doc-section li{font-size:13px;line-height:1.7;color:#374151}
  .doc-section ul{margin:0;padding-left:18px}
  .review-entry{display:grid;grid-template-columns:72px 1fr;gap:10px;padding:14px 16px;border-bottom:1px solid #EDF2F7}
  .review-entry:last-child{border-bottom:0}
  .review-meta{font-size:11px;color:#7B8496;line-height:1.5}
  .review-body{font-size:13px;line-height:1.7;color:#374151}
  .reply{margin-top:8px;padding:9px 10px;border-left:3px solid #2B4FD8;background:#F5F7FF;border-radius:0 6px 6px 0;color:#344054}
  .vector-box{border:1px solid #D8E0EC;border-radius:8px;padding:14px;background:#FAFBFC}
  .vector-title{font-size:13px;font-weight:900;margin-bottom:10px}
  .progress{height:8px;background:#E8EEF7;border-radius:999px;overflow:hidden}
  .progress span{display:block;height:100%;width:100%;background:#2B4FD8}
  .chunk-list{display:flex;flex-direction:column;gap:8px;margin-top:12px}
  .chunk{padding:11px 12px;border:1px solid #E2E8F0;border-radius:6px;background:#fff;font-size:12px;line-height:1.55;color:#4B5563}
  .chunk strong{display:block;color:#111827;font-size:12px;margin-bottom:4px}
  .chunk small{display:block;color:#7B8496;font-size:10px;margin-top:6px}
  .chunk.active{border-color:#2B4FD8;box-shadow:0 0 0 3px rgba(43,79,216,.08)}
  .scroll-hint{margin-top:10px;font-size:11px;color:#7B8496;line-height:1.5}
  @media(max-width:900px){.rb-shell{grid-template-columns:1fr}.rb-side{display:none}.rb-grid{grid-template-columns:repeat(2,1fr)}.detail-layout{grid-template-columns:1fr}.doc-inspector{position:static}.review-entry{grid-template-columns:1fr}}
</style>`;
}

function rbListPage(): string {
  return shellPage(
    '챗봇 지식 관리 목록',
    `<div class="rb-shell">
  <aside class="rb-side">
    <div class="rb-brand">RB Dialog</div>
    <div class="rb-bot"><div class="rb-bot-name">해화로in수산 챗봇</div><div class="rb-bot-meta">botId · 8558886c...</div></div>
    <nav class="rb-nav">
      <a href="#">대시보드</a><a href="#" class="active">지식 관리</a><a href="#">대화 이력</a><a href="#">배포 설정</a>
    </nav>
  </aside>
  <main class="rb-main">
    <div class="rb-top">
      <div><div class="rb-kicker">Knowledge Base</div><h1>챗봇 지식 관리</h1><p class="rb-desc">비즈플래닛에서 생성한 RAG 문서를 업로드하고 벡터 임베딩 상태를 관리합니다.</p></div>
      <button class="rb-btn">문서 업로드</button>
    </div>
    <section class="rb-grid">
      <div class="rb-metric"><div class="rb-metric-label">등록 문서</div><div class="rb-metric-value">2</div></div>
      <div class="rb-metric"><div class="rb-metric-label">임베딩 완료</div><div class="rb-metric-value">2</div></div>
      <div class="rb-metric"><div class="rb-metric-label">총 청크</div><div class="rb-metric-value">148</div></div>
      <div class="rb-metric"><div class="rb-metric-label">마지막 동기화</div><div class="rb-metric-value">오늘</div></div>
    </section>
    <section class="rb-panel">
      <div class="rb-panel-head"><div class="rb-panel-title">지식 문서 목록</div><span class="badge blue">해화로in수산</span></div>
      <table>
        <thead><tr><th>문서명</th><th>유형</th><th>청크</th><th>상태</th><th>업데이트</th></tr></thead>
        <tbody>
          <tr class="knowledge-row"><td><div class="doc-name">info_해화로in수산.docx</div><div class="doc-sub">매장 기본정보, 영업시간, 메뉴, 편의시설</div></td><td>업체 정보</td><td>42</td><td><span class="badge green">임베딩 완료</span></td><td>2026-06-16 18:42</td></tr>
          <tr class="knowledge-row"><td><div class="doc-name">reviews_해화로in수산.docx</div><div class="doc-sub">방문자 리뷰 100개와 사장님 답글</div></td><td>리뷰 모음</td><td>106</td><td><span class="badge green">임베딩 완료</span></td><td>2026-06-16 18:43</td></tr>
        </tbody>
      </table>
    </section>
  </main>
</div>`,
    rbStyles()
  );
}

function rbKnowledgeInfoPage(): string {
  const chunks: Array<{ overlapIn?: string; body: string; overlapOut?: string }> = [
    {
      body: '해화로in수산 식당 정보 기본 정보 상호명: 해화로in수산 업종: 생선회 / 해산물 전화번호: 0507-1359-5863 주소(도로명): 서울 광진구 광나루로 383 1,2층 주소(지번): 서울 광진구 군자동 361-24 우편번호: 05005 인스타그램: https://www.instagram.com/forebus_jubong',
      overlapOut: '오시는 길 및 주차 주차: 매장 전용 주차 불가 ◆ 대중교통ㆍ지하철/도보: 어린이대공원역 5번출구 → 광진광장공영주차장 입구 방향 도보 1분'
    },
    {
      overlapIn: '오시는 길 및 주차 주차: 매장 전용 주차 불가 ◆ 대중교통ㆍ지하철/도보: 어린이대공원역 5번출구 → 광진광장공영주차장 입구 방향 도보 1분',
      body: '버스: 어린이대공원역ㆍ화양천주교회 정류장 하차 ◆ 자차 이용 시 인근 주차장: 광진광장공영주차장(도보 1분) · 어린이대공원 정문 주차장(도보 5분) · AJ파크 어린이회관점 유료주차장 · KCC파크타운 유료주차장(주말에 비교적 수월하게 이용 가능)',
      overlapOut: '영업시간 월ㆍ화ㆍ수ㆍ목: 11:20 ~ 23:30 / 브레이크타임 14:30~16:30 / 라스트오더 22:40 금ㆍ토: 11:20 ~ 24:00 / 라스트오더 23:10 일: 11:20 ~ 23:30'
    },
    {
      overlapIn: '영업시간 월ㆍ화ㆍ수ㆍ목: 11:20 ~ 23:30 / 브레이크타임 14:30~16:30 / 라스트오더 22:40 금ㆍ토: 11:20 ~ 24:00 / 라스트오더 23:10 일: 11:20 ~ 23:30',
      body: '※ 공휴일ㆍ대체공휴일에도 정상 영업(11:20~23:30) ※ 별도 휴무일 없음(연중무휴) 편의시설 및 서비스 테이크아웃 할인(회 메뉴 포장 시 40% 할인 이벤트 진행 중) 콜키지 가능(유료, 프리미엄 위스키/와인 10,000원)',
      overlapOut: '단체 이용 가능(최대 120명) 네이버 예약 가능 무선인터넷(Wifi) 남/녀 화장실 구분 유아의자 대기공간 포장 배달'
    },
    {
      overlapIn: '단체 이용 가능(최대 120명) 네이버 예약 가능 무선인터넷(Wifi) 남/녀 화장실 구분 유아의자 대기공간 포장 배달',
      body: '출입구 및 좌석 휠체어 이용 가능 반려동물 동반 가능(케이지 필수) 고유가 피해지원금 사용 가능(신용ㆍ체크카드) ※ 실제 사용 가능 여부는 매장에 확인 필요 저희는 바다와 사람이 만나 이루는 조화로운 맛을 정성껏 담아, 따뜻한 한 끼를 선물하고자 이 공간을 열었습니다. 신선한 재료만을 엄선해 자연 그대로의 깊은 맛을 전하며, 과한 기교보다 재료 본연의 풍미에 집중합니다.',
      overlapOut: "'재료를 아끼지 말고, 장사는 사람을 남기는 것'이라는 마음으로 좋은 재료를 아낌없이 사용하고, 누구나 부담 없이 즐기실 수 있는 정직한 한 끼를 준비했습니다."
    },
    {
      overlapIn: "'재료를 아끼지 말고, 장사는 사람을 남기는 것'이라는 마음으로 좋은 재료를 아낌없이 사용하고, 누구나 부담 없이 즐기실 수 있는 정직한 한 끼를 준비했습니다.",
      body: '싱싱한 회부터 정갈한 식사, 계절을 담은 해산물 요리까지, 한 끼가 하루를 따뜻하게 채우는 시간이 되길 바랍니다. 고객님께 드리는 모든 음식에는 저희의 진심이 담겨 있습니다. 앞으로도 변함없는 맛과 정성으로 늘 같은 자리에서 기다리겠습니다. 감사합니다. 메뉴판 해화로in수산 메뉴 구성: ① 대표: 인기 메뉴 ② 메인 요리 ③ 식사 메뉴 ④ 활어 & 숙성회 ⑤ 곁들임ㆍ추가 메뉴 10,000~20,000원',
      overlapOut: '대표ㆍ인기 메뉴 모듬 회ㆍ산물 - 59,000원(회도, 해산물도 좋아하는 분들의 선택) 무늬 오징어 회 - 59,000원(쫄깃한 식감, 소금김밥 조합 추천) 초신선 大활어 3종 스페셜 - 49,000원'
    },
    {
      overlapIn: '대표ㆍ인기 메뉴 모듬 회ㆍ산물 - 59,000원(회도, 해산물도 좋아하는 분들의 선택) 무늬 오징어 회 - 59,000원(쫄깃한 식감, 소금김밥 조합 추천) 초신선 大활어 3종 스페셜 - 49,000원',
      body: '화덕 모듬 생선구이 쌈밥 - 20,000원(6가지 랜덤) 직화 쭈꾸미 쌈밥 - 13,000원 화덕 고등어구이 쌈밥 - 14,000원(1인 1마리) 직화 오징어 불고기 우렁 쌈밥 정식 - 13,000원 모듬 해산물 - 49,000원 도다리 세로회(연중) - 55,000원 특 시마아지 숙성회(2~10월) - 가격 변동 ② 메인 요리 한우대창 알곤이찜 - 32,000원 통우럭 시레기 조림 - 39,000원 얼큰 알고니 칼국수탕 - 29,000원',
      overlapOut: '속초식 깻잎 막회 - 45,000원 속초식 항아리 물회 - 39,000원 알고니 가득 매운탕(칼국수) - 29,000원 통오징어 화덕 버터구이 - 18,000원'
    },
    {
      overlapIn: '속초식 깻잎 막회 - 45,000원 속초식 항아리 물회 - 39,000원 알고니 가득 매운탕(칼국수) - 29,000원 통오징어 화덕 버터구이 - 18,000원',
      body: '화덕 고등어 우렁 쌈밥 정식 - 14,000원 1인 선별 고등어 화덕구이 - 주간 인기 2위 프리미엄 고등어 화덕구이 정찬 - 13,000원 직화 쭈꾸미 우렁 쌈밥 정식(2인 이상) - 주간 인기 3위 / 13,000원 1인 물회 + 밥 - 주간 인기 4위 / 15,000원 오ㆍ삼 불고기 우렁 쌈밥 정식 - 13,000원 직화 오징어 볶음 우렁 쌈밥 - 13,000원 정통 직화 제육 우렁 쌈밥 - 12,000원 회 비빔국수 - 14,000원',
      overlapOut: '방앗간 들기름 명품 회덮밥 - 12,000원 뚝배기 갈치속젓 알밥 - 10,000원'
    },
    {
      overlapIn: '방앗간 들기름 명품 회덮밥 - 12,000원 뚝배기 갈치속젓 알밥 - 10,000원',
      body: '활민어 大숙성회(4~10월) - 69,000원 명품 大광어 숙성회(연중) - 49,000원 명품 쫀득 大도미 숙성회(연중) - 69,000원 명품 大삼치 숙성회(연중) - 49,000원 숙성 고등어회(연중) - 가격 변동 프리미엄 숙성 연어회(연중) - 39,000원 1인 물회 - 15,000원 산낙지 - 25,000원 우니 단새우 - 가격 변동 제철 해산물 모듬(대하ㆍ전어ㆍ석화ㆍ굴찜ㆍ산오징어) - 가격 변동',
      overlapOut: '프리미엄 잿방어 숙성회(4~10월) - 69,000원 8kg이상 특돼지방어 숙성회(11~2월) - 69,000원'
    },
    {
      overlapIn: '프리미엄 잿방어 숙성회(4~10월) - 69,000원 8kg이상 특돼지방어 숙성회(11~2월) - 69,000원',
      body: '정통 대접 맨초밥 - 4,000원 프리미엄 위스키/와인 콜키지 - 10,000원 제철 메뉴(시즌별) 11월~2월: 대방어, 숭어 3월~6월: 시마아지, 갯방어, 숭어, 도다리, 벤자리, 병어돔 6월~10월: 산오징어, 부시리, 농어, 자연산민어, 벤자리, 자리돔, 덕자, 대삼치, 연어, 무늬오징어, 빨고둥어, 호래기, 능성어, 자바리 예약 안내 ◆ 네이버 예약 가능(바로 확정 예약)',
      overlapOut: '수제 새우 튀김 - 10,000원 레트로 설탕 토스트 - 10,000원 들기름 계란 후라이 - 10,000원 매운 불파게티 - 7,000원'
    },
    {
      overlapIn: '수제 새우 튀김 - 10,000원 레트로 설탕 토스트 - 10,000원 들기름 계란 후라이 - 10,000원 매운 불파게티 - 7,000원',
      body: '네이버 예약 가능 시간: 11:30 ~ 21:30 ◆ 룸 이용 인원 / 12인룸 운영(사전 문의 필수) ◆ 예약금 안내(30,000원) 방문 시 결제 금액에서 차감 또는 취소 후 환불 · 당일 취소/노쇼: 예약금 반환 불가 · 결제 시 예약금 반환 방법은 당일 매장에 문의 링크: https://m.booking.naver.com/booking/6/bizes/1352276',
      overlapOut: '예약 특전 4인 이상 예약(회 또는 요리 메뉴 이용 시) → 후식 화덕밥 or 후배기 고막알밥 무료 제공'
    },
    {
      overlapIn: '예약 특전 4인 이상 예약(회 또는 요리 메뉴 이용 시) → 후식 화덕밥 or 후배기 고막알밥 무료 제공',
      body: '포장 할인 이벤트(진행 중) 회 메뉴 매장 방문 포장 시 40% 할인 기간: 2026.03.19 ~ 2026.10.31(사장님 재량으로 종료 가능) ◆ 무료 서비스 비 오는 날 또는 평일 오후 6시 이전 입장 시 → 뚝배기 조개 지리탕 서비스(2025.09.27~) 매장 운영 데이터 ◆ 평균 결제 금액 1회 평균 5만원대 · 점심 35,000~40,000원 · 저녁 65,000~70,000원 · 밤 85,000~90,000원',
      overlapOut: '혼잡 시간대 평일(월~금): 오후 6시 가장 혼잡 토요일: 오후 6시(주중 가장 한가함) 일요일: 오후 6시 평균 체류 시간: 약 60분'
    },
    {
      overlapIn: '혼잡 시간대 평일(월~금): 오후 6시 가장 혼잡 토요일: 오후 6시(주중 가장 한가함) 일요일: 오후 6시 평균 체류 시간: 약 60분',
      body: '주간 인기 메뉴 순위 1위: 선별 고등어 화덕구이 우렁 쌈밥 정식(2인 이상) 2위: 1인 선별 고등어 화덕구이 3위: 직화 쭈꾸미 우렁 쌈밥 정식(2인 이상) 4위: 1인 물회 + 밥 5위: 얼큰 대 서더리탕(식사메뉴 주문 시 별도 불가) 소식 및 이벤트: 매장 제철 및 신메뉴 정보, 포장 할인, TV 출연 정보와 영업 안내를 포함합니다.'
    }
  ];

  const escapeChunkText = (value: string): string =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const renderPart = (value: string | undefined, className: string): string =>
    value ? `<mark class="${className}">${escapeChunkText(value)}</mark>` : '';

  return shellPage(
    'info 파일 벡터 임베딩 설정',
    `<div class="knowledge-page">
  <header class="knowledge-topbar">
    <div class="rb-logo">rb<span>DIALOG</span></div>
    <div class="tenant">soho-test <span>›</span> <b>해화로in수산</b> <span class="caret">▼</span></div>
    <div class="top-actions"><span>공지사항</span><span class="avatar"></span><span>류*근님</span></div>
  </header>
  <nav class="knowledge-nav">
    <a>시나리오</a><a>인텐트</a><a>엔티티</a><a>봇 응답</a><a>API 관리</a><a>AI 에이전트 <em>PRO</em></a><a class="active">Knowledge 관리 <em>PRO</em></a><a>지식 Lab</a><a>봇 설정</a>
    <span class="nav-spacer"></span><a>훈련</a><a>서비스 배포</a><a>검증</a><a>통계</a><a>테스트</a>
  </nav>
  <main class="knowledge-main">
    <section class="knowledge-title-row">
      <input class="knowledge-title-input" value="info_haehwaro" readonly />
      <button class="save-button" type="button">저장</button>
    </section>
    <div class="modified">최종수정 2026.05.20 14:44&nbsp;&nbsp; | &nbsp;&nbsp;이*원</div>

    <section class="knowledge-card file-card">
      <div class="file-info">
        <strong>info_haehwaro.docx</strong>
        <p>가능 확장자: pdf, doc, docx, ppt, pptx &nbsp;&nbsp; 문서 크기 최대 10MB 미만</p>
      </div>
      <button class="blue-button" type="button">문서 업로드</button>
      <div class="embed-status">
        <div class="embed-label">임베딩 변환</div>
        <div class="complete">완료</div>
        <small>(skp/text-embeddings-20240402)</small>
      </div>
      <button class="blue-button retry" type="button">변환 재시도</button>
    </section>

    <section class="knowledge-card reference-row">
      <label>참고 정보명 <span>*</span> <i>?</i></label>
      <input value="식당정보" readonly />
    </section>

    <section class="knowledge-card chunk-settings">
      <label>청크 크기 <span>*</span> <i>?</i></label>
      <input value="500" readonly />
      <label>청크 오버랩 <span>*</span> <i>?</i></label>
      <input value="100" readonly />
      <button type="button">적용</button>
      <div class="chunk-total">청크&nbsp;&nbsp;총 12</div>
    </section>

    <section class="chunk-area">
      ${chunks
        .map((chunk, index) => {
          const chunkText = [
            renderPart(chunk.overlapIn, 'chunk-overlap overlap-in'),
            `<span>${escapeChunkText(chunk.body)}</span>`,
            renderPart(chunk.overlapOut, 'chunk-overlap overlap-out')
          ]
            .filter(Boolean)
            .join(' ');
          return `<article class="chunk-row" data-chunk="${index + 1}">${chunkText}</article>`;
        })
        .join('\n      ')}
    </section>
  </main>
</div>`,
    `<style>
  *{box-sizing:border-box}
  body{margin:0;background:#f3f5f8;color:#2d3340;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;font-size:14px}
  .knowledge-topbar{height:52px;background:#302e43;color:#fff;display:flex;align-items:center;padding:0 24px;gap:28px}
  .rb-logo{font-size:19px;font-weight:900;letter-spacing:-.03em}.rb-logo span{font-size:14px;margin-left:1px}
  .tenant{font-size:13px;color:#d8dbe7}.tenant span{color:#9da3b6;margin:0 8px}.tenant b{color:#fff}.caret{font-size:10px}
  .top-actions{margin-left:auto;display:flex;align-items:center;gap:12px;font-size:12px;color:#e5e7ef}.avatar{width:18px;height:18px;border-radius:50%;background:#8f95a3;display:inline-block}
  .knowledge-nav{height:45px;background:#fff;border-bottom:1px solid #e4e8f1;display:flex;align-items:center;padding:0 24px;gap:0;box-shadow:0 1px 2px rgba(16,24,40,.04)}
  .knowledge-nav a{height:45px;display:flex;align-items:center;padding:0 14px;color:#262b36;text-decoration:none;font-size:14px;font-weight:700;white-space:nowrap;border-bottom:3px solid transparent}
  .knowledge-nav a.active{color:#3468f6;border-bottom-color:#3468f6}.knowledge-nav em{font-style:normal;font-size:9px;color:#fff;background:#ff6262;border-radius:999px;padding:1px 4px;margin-left:4px}
  .nav-spacer{flex:1}
  .knowledge-main{max-width:1392px;margin:0 auto;padding:48px 56px 56px}
  .knowledge-title-row{display:grid;grid-template-columns:1fr 96px;gap:24px;align-items:center}
  .knowledge-title-input{height:50px;border:1px solid #e5e9f1;background:#fff;padding:0 18px;font-size:20px;color:#343a46;outline:0}
  .save-button{height:50px;border:0;background:#a8bfff;color:#fff;font-size:16px;font-weight:800}
  .modified{text-align:right;color:#8b93a3;font-size:13px;margin:16px 0 20px}
  .knowledge-card{background:#fff;border:1px solid #e7ebf2}
  .file-card{height:112px;display:grid;grid-template-columns:1fr 112px 1fr 112px;align-items:center}
  .file-info{padding:0 24px}.file-info strong{font-size:15px;color:#4b5563;text-decoration:underline}.file-info p{margin:10px 0 0;color:#8b93a3;font-size:12px}
  .blue-button{height:40px;border:0;background:#3868f2;color:#fff;font-size:14px;font-weight:800}.retry{margin-right:30px}
  .embed-status{height:112px;border-left:1px solid #e7ebf2;display:grid;grid-template-columns:92px 1fr;align-content:center;padding-left:32px;column-gap:8px}
  .embed-label{font-weight:800;color:#3f4652}.complete{color:#10b345;font-weight:900}.embed-status small{grid-column:2;color:#8b93a3;font-size:11px}
  .reference-row{height:68px;display:grid;grid-template-columns:112px 1fr;align-items:center;padding:0 22px}.reference-row label,.chunk-settings label{font-size:13px;font-weight:800;color:#3e4652}.reference-row span,.chunk-settings span{color:#3468f6}.reference-row i,.chunk-settings i{font-style:normal;color:#a4abb8;border:1px solid #c9ced8;border-radius:50%;font-size:10px;padding:0 4px;margin-left:4px}
  .reference-row input{height:36px;border:1px solid #d6dbe5;padding:0 14px;color:#222;background:#fff;font-size:14px}
  .chunk-settings{height:70px;margin-top:16px;display:flex;align-items:center;gap:18px;padding:0 22px}.chunk-settings input{width:148px;height:36px;border:1px solid #d6dbe5;padding:0 14px;font-size:14px;background:#fff}.chunk-settings button{width:66px;height:36px;background:#fff;border:1px solid #3468f6;color:#3468f6;font-weight:800}.chunk-total{color:#7d8491;font-size:13px;font-weight:700;margin-left:6px}
  .chunk-area{background:#fff;border:1px solid #e7ebf2;border-top:0;padding:24px 32px 34px}
  .chunk-row{position:relative;margin-bottom:24px;border:1px solid #edf0f5;background:#fff;min-height:96px;padding:26px 26px 24px 30px;line-height:2.05;font-size:13px;color:#262c37;word-break:keep-all}
  .chunk-row::before{content:'';position:absolute;left:-1px;top:0;bottom:0;width:4px;background:#3468f6}
  .chunk-row .chunk-overlap{background:#d8ecff;color:#1d2733;padding:1px 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
  .chunk-row .overlap-in{box-shadow:inset 0 0 0 1px rgba(84,151,224,.08)}
  .chunk-row .overlap-out{box-shadow:inset 0 -1px 0 rgba(52,104,246,.22)}
  @media(max-width:900px){.knowledge-main{padding:28px 18px}.knowledge-nav{overflow:auto}.file-card{height:auto;grid-template-columns:1fr;gap:14px;padding:18px}.embed-status{height:auto;border-left:0;padding:0;grid-template-columns:92px 1fr}.reference-row{grid-template-columns:1fr}.chunk-settings{height:auto;flex-wrap:wrap;padding:18px}.chunk-row{font-size:12px;line-height:1.8}}
</style>`
  );
}

function rbKnowledgeReviewPage(): string {
  const chunks: Array<{ overlapIn?: string; body: string; overlapOut?: string }> = [
    {
      body: '[리뷰 1.0.0] 직원분들이 정말 친절하고 회도 신선해요. 해화로in수산 방문 후기: 회식으로 방문했는데 자리 안내가 빠르고, 물회와 생선구이, 쌈밥까지 메뉴 폭이 넓어 취향이 다른 일행도 만족했습니다. 모듬 회ㆍ산물은 해산물 종류가 다양하고 접시 구성이 풍성해서 여러 명이 나눠 먹기 좋았습니다. 처음 방문했는데 직원분이 오늘 좋은 생선과 추천 메뉴를 차분하게 설명해줘서 메뉴 선택이 쉬웠습니다. 어린이대공원역 근처에서 횟집 찾는 분에게 추천할 만하고, 예약 후 방문하면 대기 부담도 적습니다.',
      overlapOut: '광진광장공영주차장 쪽에서 걸어오면 금방이고, 초신선 大활어 3종 스페셜과 속초식 항아리 물회 조합이 좋았습니다. 회가 두툼하고 숙성회 식감이 좋아 첫 방문 메뉴로도 부담이 적었습니다.'
    },
    {
      overlapIn: '광진광장공영주차장 쪽에서 걸어오면 금방이고, 초신선 大활어 3종 스페셜과 속초식 항아리 물회 조합이 좋았습니다. 회가 두툼하고 숙성회 식감이 좋아 첫 방문 메뉴로도 부담이 적었습니다.',
      body: '[리뷰 1.0.10] 목요일 오후 방문. 직원분들이 정말 친절했고 회가 신선했습니다. 어린이대공원역 5번 출구에서 도보로 이동하기 편했으며 매장 앞 전용 주차보다는 주변 공영주차장을 이용하는 안내가 정확했습니다. 모듬 회ㆍ산물은 회와 해산물을 같이 먹고 싶은 손님에게 잘 맞고, 콜키지도 가능해서 와인 모임으로 방문하기 괜찮았습니다. 예약하고 가니 자리 안내가 빨랐고 단체 모임이나 가족 식사에도 어울리는 분위기였습니다.',
      overlapOut: '다음에는 7종 골라먹는 大숙성회도 먹어보고 싶습니다. 네이버 예약, 주차, 단체 이용 가능 여부를 챗봇이 한 번에 안내하면 처음 방문하는 고객에게 도움이 될 것 같습니다.'
    },
    {
      overlapIn: '다음에는 7종 골라먹는 大숙성회도 먹어보고 싶습니다. 네이버 예약, 주차, 단체 이용 가능 여부를 챗봇이 한 번에 안내하면 처음 방문하는 고객에게 도움이 될 것 같습니다.',
      body: '[리뷰 2.0.0] 부모님 모시고 갔는데 생선구이 쌈밥이 든든하고 반찬도 깔끔했습니다. 화덕 고등어구이 쌈밥은 1인 1마리라 양이 충분했고 우렁쌈장과 같이 먹으니 점심 메뉴로 만족스러웠습니다. 회를 못 먹는 가족은 생선구이 정식이나 쌈밥을 선택할 수 있어서 모두 만족했습니다. 아이 의자와 대기공간이 있어 가족 단위 방문에도 편했고 좌석 간격도 괜찮아 대화하기 좋았습니다.',
      overlapOut: '속초식 항아리 물회는 새콤달콤한 육수가 좋고 양도 넉넉해서 여름 점심 메뉴로 추천할 만합니다. 포장도 깔끔하게 되어 집에서 먹기 편했고 회 신선도가 잘 유지됐습니다.'
    },
    {
      overlapIn: '속초식 항아리 물회는 새콤달콤한 육수가 좋고 양도 넉넉해서 여름 점심 메뉴로 추천할 만합니다. 포장도 깔끔하게 되어 집에서 먹기 편했고 회 신선도가 잘 유지됐습니다.',
      body: '[리뷰 5.0.26] 평일 저녁에 방문했는데 손님이 많아 예약하고 가길 잘했다고 생각했습니다. 네이버 예약으로 잡고 방문하면 대기 부담이 적습니다. 후식 화덕밥 서비스와 예약 특전 안내도 좋았고 룸 이용은 사전 문의가 필요하다고 안내받았습니다. 저녁 시간에는 손님이 많아서 예약을 추천합니다. 회 메뉴 외에도 알곤이찜, 매운탕, 칼국수탕처럼 술자리 마무리 메뉴가 있어 회식 코스로 좋았습니다.',
      overlapOut: '매운탕이 얼큰하고 마지막 식사로 잘 어울렸습니다. 직원분들이 접시 정리와 메뉴 설명을 빠르게 도와줘 편했습니다. 피크 시간에는 예약 권장 안내가 필요합니다.'
    },
    {
      overlapIn: '매운탕이 얼큰하고 마지막 식사로 잘 어울렸습니다. 직원분들이 접시 정리와 메뉴 설명을 빠르게 도와줘 편했습니다. 피크 시간에는 예약 권장 안내가 필요합니다.',
      body: '[리뷰 6.0.6] 프리미엄 잿방어 숙성회와 대방어 시즌 메뉴가 인상적이었습니다. 겨울철에는 방어가 고소하고 기름져서 만족도가 높았고 기본 반찬이 깔끔해서 회 맛을 해치지 않았습니다. 숙성 고등어회와 도다리 세로회처럼 계절 메뉴가 있어 다시 방문하고 싶습니다. 점심에는 직화 쭈꾸미 쌈밥과 화덕 고등어구이 정식이 든든했고 반찬 구성도 깔끔했습니다.',
      overlapOut: '회 전문점이지만 식사 메뉴도 든든하다는 리뷰가 반복됩니다. 회를 선호하지 않는 고객에게 생선구이 정식, 쌈밥, 회덮밥을 추천할 수 있습니다.'
    },
    {
      overlapIn: '회 전문점이지만 식사 메뉴도 든든하다는 리뷰가 반복됩니다. 회를 선호하지 않는 고객에게 생선구이 정식, 쌈밥, 회덮밥을 추천할 수 있습니다.',
      body: '[리뷰 8.0.40] 가족 모임으로 방문했습니다. 아이와 함께 갔는데 유아의자가 있어 편했고, 매장 분위기가 너무 시끄럽지 않아 가족 식사 장소로 추천할 수 있을 것 같습니다. 메뉴판 사진과 실제 메뉴 구성이 비슷했고 해산물 모듬은 여러 가지를 한 번에 먹을 수 있어서 첫 방문 메뉴로 좋았습니다. 인스타그램에서 본 분위기와 실제 매장 느낌도 비슷했습니다.',
      overlapOut: '처음 방문한 사람에게는 모듬 회ㆍ산물이나 속초식 항아리 물회를 추천하고 싶습니다. 사진으로 본 메뉴와 실제 구성이 비슷해 기대와 만족도가 잘 맞았습니다.'
    },
    {
      overlapIn: '처음 방문한 사람에게는 모듬 회ㆍ산물이나 속초식 항아리 물회를 추천하고 싶습니다. 사진으로 본 메뉴와 실제 구성이 비슷해 기대와 만족도가 잘 맞았습니다.',
      body: '[리뷰 11.0.30] 회 초보자도 부담 없이 고를 수 있게 메뉴 설명이 자세했습니다. 물회처럼 시원한 메뉴와 화덕 생선구이 메뉴를 함께 추천받으니 취향이 다른 사람들과 방문해도 고르기 쉬웠습니다. 직원분이 오늘 좋은 생선과 추천 메뉴를 알려주셔서 좋았습니다. 챗봇에서도 오늘 추천 메뉴, 처음 방문 추천, 가족 식사 추천 질문에 비슷한 톤으로 답하면 유용할 것 같습니다.',
      overlapOut: '네이버 예약, 주차, 대표 메뉴 정보를 한 번에 안내받을 수 있으면 편할 것 같습니다. 어린이대공원역에서 가까워 약속 장소로 잡기 좋고 지하철 방문이 편했습니다.'
    },
    {
      overlapIn: '네이버 예약, 주차, 대표 메뉴 정보를 한 번에 안내받을 수 있으면 편할 것 같습니다. 어린이대공원역에서 가까워 약속 장소로 잡기 좋고 지하철 방문이 편했습니다.',
      body: '[리뷰 15.0.12] 주차는 광진광장공영주차장이나 어린이대공원 정문 주차장 안내를 받았습니다. 대중교통과 주차 정보를 미리 알고 가면 훨씬 편합니다. 매장 전용 주차는 어렵지만 주변 주차장 안내가 자세해서 불편하지 않았습니다. 어린이대공원역 5번 출구와 가까워 대중교통 이용이 편합니다. 위치 질문에는 지하철 동선과 주변 주차장을 함께 안내하는 것이 정확합니다.',
      overlapOut: '광진광장공영주차장, 어린이대공원 정문 주차장, AJ파크 어린이회관점, KCC파크타운 정보를 미리 알려주면 좋습니다. 예약 후 방문하면 자리 안내가 빨랐습니다.'
    },
    {
      overlapIn: '광진광장공영주차장, 어린이대공원 정문 주차장, AJ파크 어린이회관점, KCC파크타운 정보를 미리 알려주면 좋습니다. 예약 후 방문하면 자리 안내가 빨랐습니다.',
      body: '[리뷰 17.3.7] 포장해서 먹었는데 포장 상태가 깔끔했습니다. 매장에서 먹을 때와 다르게 집에서 먹어도 회 신선도가 유지됐고 구성 설명을 잘 해주셔서 가족들과 나눠 먹기 편했습니다. 포장 할인 이벤트가 진행 중이면 방문 포장으로 이용해도 좋겠습니다. 집에서 먹을 메뉴를 찾는 사람에게 회 포장, 물회, 생선구이 정찬을 상황에 맞춰 알려주면 좋겠습니다.',
      overlapOut: '포장과 배달도 가능하다고 안내받았습니다. 매장에서 먹기 어려운 고객에게 포장 가능 여부, 포장 할인 이벤트, 추천 포장 메뉴를 안내하면 좋겠습니다.'
    },
    {
      overlapIn: '포장과 배달도 가능하다고 안내받았습니다. 매장에서 먹기 어려운 고객에게 포장 가능 여부, 포장 할인 이벤트, 추천 포장 메뉴를 안내하면 좋겠습니다.',
      body: '[리뷰 18.1.1] 회식 장소로 방문했는데 단체 이용 가능해서 편했습니다. 직원분이 와인잔과 접시를 빠르게 정리해주고 콜키지 안내도 명확했습니다. 회와 해산물 메뉴가 와인과 잘 맞아 소규모 모임에도 추천합니다. 와인을 가져가도 편했고 접시와 잔을 빠르게 챙겨줬습니다. 모임 장소 추천, 회식 장소 추천, 와인과 어울리는 해산물 메뉴 질문에 활용하기 좋은 청크입니다.',
      overlapOut: '콜키지가 가능해서 와인 모임으로 방문했습니다. 회와 해산물 메뉴가 와인과 잘 맞았고 직원분이 접시와 자리 정리를 빠르게 도와줘 편하게 이용했습니다.'
    },
    {
      overlapIn: '콜키지가 가능해서 와인 모임으로 방문했습니다. 회와 해산물 메뉴가 와인과 잘 맞았고 직원분이 접시와 자리 정리를 빠르게 도와줘 편하게 이용했습니다.',
      body: '[리뷰 24.3.0] 프리미엄 고등어 화덕구이 정찬은 밥 메뉴로 만족도가 높았습니다. 최상품 고등어와 정통 수제 반찬 구성이 좋아서 회를 먹지 않는 사람에게도 추천할 수 있습니다. 점심 메뉴로는 물회, 쌈밥, 회덮밥이 괜찮았습니다. 직장인 점심이나 가족 식사 모두 어울립니다. 메뉴 설명이 자세해서 회 초보자도 부담 없이 고를 수 있었습니다.',
      overlapOut: '화덕 고등어구이 쌈밥은 1인 1마리라 양이 충분했고 우렁쌈장과 같이 먹으니 점심 메뉴로 만족스러웠습니다. 회를 못 먹는 사람도 식사류를 선택할 수 있습니다.'
    },
    {
      overlapIn: '화덕 고등어구이 쌈밥은 1인 1마리라 양이 충분했고 우렁쌈장과 같이 먹으니 점심 메뉴로 만족스러웠습니다. 회를 못 먹는 사람도 식사류를 선택할 수 있습니다.',
      body: '[리뷰 26.3.9] 전체적으로 재방문 의사가 높고 긍정 키워드는 신선도와 친절한 응대에 집중됩니다. 다만 주차는 사전 확인이 필요하고 저녁에는 예약을 권장한다는 리뷰가 반복됩니다. 사장님 답글은 친절하고 차분하며 고객 경험을 챗봇 답변에 녹일 때도 과장 없이 추천하는 방식이 적합합니다. 추천 답변에는 장점과 이용 팁을 함께 넣는 것이 좋겠습니다.',
      overlapOut: '방문자 리뷰 전반에서 반복되는 긍정 키워드는 신선도, 친절한 응대, 메뉴 다양성, 물회, 생선구이 쌈밥, 예약 편의성입니다. 주의 키워드는 저녁 피크 시간대 혼잡, 주차 사전 확인, 예약 권장입니다.'
    },
    {
      overlapIn: '방문자 리뷰 전반에서 반복되는 긍정 키워드는 신선도, 친절한 응대, 메뉴 다양성, 물회, 생선구이 쌈밥, 예약 편의성입니다. 주의 키워드는 저녁 피크 시간대 혼잡, 주차 사전 확인, 예약 권장입니다.',
      body: '[리뷰 30.0.0] 사장님 답글이 정성스럽고 재방문 고객에게 감사 인사를 남겨주는 점이 좋았습니다. 리뷰 답글 톤은 친절하고 차분하며, 고객 경험을 챗봇 답변에 녹일 때도 과장 없이 추천하는 방식이 적합합니다. 손님이 처음 방문 추천을 묻는 경우 모듬 회ㆍ산물, 속초식 항아리 물회, 초신선 大활어 3종 스페셜을 우선 안내하고, 식사 중심이면 화덕 고등어구이 쌈밥과 직화 쭈꾸미 쌈밥을 함께 제안하는 구성이 자연스럽습니다.',
      overlapOut: '리뷰 답글에는 방문 감사, 신선한 재료 준비, 다음 방문에 대한 기대가 반복됩니다. 챗봇 답변도 과장된 홍보 문구보다 실제 방문 팁과 메뉴 선택 기준을 함께 제시하는 톤이 적합합니다.'
    },
    {
      overlapIn: '리뷰 답글에는 방문 감사, 신선한 재료 준비, 다음 방문에 대한 기대가 반복됩니다. 챗봇 답변도 과장된 홍보 문구보다 실제 방문 팁과 메뉴 선택 기준을 함께 제시하는 톤이 적합합니다.',
      body: '[리뷰 31.1.0] 아이와 함께 방문했는데 유아의자가 있고 직원분들이 자리를 편하게 잡아줘서 좋았습니다. 회를 못 먹는 가족은 화덕 고등어구이 쌈밥을 먹었고, 회를 좋아하는 가족은 모듬 회ㆍ산물을 주문했습니다. 가족 식사 추천 질문에 적합한 리뷰입니다. 남녀 화장실 구분, 대기공간, 포장, 배달, 테이크아웃 할인, 콜키지 가능 같은 편의시설도 함께 안내하면 실제 방문 전 궁금증을 줄일 수 있습니다.',
      overlapOut: '가족 단위 방문에는 아이 의자, 대기공간, 식사 메뉴 선택지가 중요한 근거로 반복됩니다. 아이 동반 문의가 들어오면 편의시설과 회를 못 먹는 사람을 위한 식사 메뉴를 같이 답변합니다.'
    },
    {
      overlapIn: '가족 단위 방문에는 아이 의자, 대기공간, 식사 메뉴 선택지가 중요한 근거로 반복됩니다. 아이 동반 문의가 들어오면 편의시설과 회를 못 먹는 사람을 위한 식사 메뉴를 같이 답변합니다.',
      body: '[리뷰 32.2.0] 속초식 항아리 물회가 시원해서 더운 날 방문하기 좋았습니다. 육수가 새콤하고 회가 넉넉해 둘이 나눠 먹기에도 괜찮았습니다. 점심 메뉴 추천이나 여름철 인기 메뉴 질문에 물회와 회덮밥을 함께 안내하면 자연스럽습니다. 물회 국물이 시원하고 회 양도 괜찮다는 리뷰가 반복되므로, 여름 점심이나 가벼운 술자리 메뉴로 제안하기 좋습니다.',
      overlapOut: '여름철 인기 메뉴는 속초식 항아리 물회와 회덮밥, 점심 식사류가 함께 언급됩니다. 시원한 메뉴를 찾는 고객에게 물회, 회덮밥, 생선구이 쌈밥을 상황별로 추천합니다.'
    },
    {
      overlapIn: '여름철 인기 메뉴는 속초식 항아리 물회와 회덮밥, 점심 식사류가 함께 언급됩니다. 시원한 메뉴를 찾는 고객에게 물회, 회덮밥, 생선구이 쌈밥을 상황별로 추천합니다.',
      body: '[리뷰 33.0.0] 네이버 예약 후 방문했더니 자리 안내가 빨랐습니다. 저녁에는 손님이 많아 대기할 수 있으니 예약을 권장한다는 안내가 실제 이용 경험과 잘 맞습니다. 챗봇은 피크 시간, 예약 가능 여부, 단체 이용 가능 여부를 함께 답변하는 것이 좋겠습니다. 회식이나 가족 모임처럼 인원이 있는 경우에는 예약 후 방문, 룸 이용 사전 문의, 주차장 안내를 한 번에 제공해야 합니다.',
      overlapOut: '예약 질문에는 네이버 예약 링크, 저녁 피크 시간 혼잡, 단체 이용 가능 여부, 룸 이용 사전 문의를 함께 안내합니다. 예약 후 방문하면 자리 안내가 빨랐다는 리뷰가 반복됩니다.'
    },
    {
      overlapIn: '예약 질문에는 네이버 예약 링크, 저녁 피크 시간 혼잡, 단체 이용 가능 여부, 룸 이용 사전 문의를 함께 안내합니다. 예약 후 방문하면 자리 안내가 빨랐다는 리뷰가 반복됩니다.',
      body: '[리뷰 34.4.0] 대방어 시즌 메뉴가 고소하고 식감이 좋았습니다. 프리미엄 잿방어 숙성회와 숙성 고등어회처럼 계절 메뉴가 있어 계절별 추천 답변을 구성하기 좋습니다. 겨울 메뉴를 묻는 고객에게 대방어와 숙성회 정보를 우선 노출할 수 있습니다. 기본 반찬이 깔끔해서 회 맛을 해치지 않았고, 숙성회와 활어 메뉴 모두 신선했다는 표현이 반복됩니다.',
      overlapOut: '겨울철에는 대방어, 프리미엄 잿방어 숙성회, 숙성 고등어회가 계절 메뉴 근거로 사용됩니다. 회 품질 질문에는 신선도, 두툼한 식감, 다양한 구성을 같이 답변합니다.'
    },
    {
      overlapIn: '겨울철에는 대방어, 프리미엄 잿방어 숙성회, 숙성 고등어회가 계절 메뉴 근거로 사용됩니다. 회 품질 질문에는 신선도, 두툼한 식감, 다양한 구성을 같이 답변합니다.',
      body: '[리뷰 35.1.4] 점심으로 직화 쭈꾸미 쌈밥을 먹었는데 반찬 구성이 깔끔하고 양이 충분했습니다. 회 전문점이지만 식사 메뉴도 든든하다는 리뷰가 반복됩니다. 회를 선호하지 않는 고객에게 생선구이 정식, 쌈밥, 회덮밥을 추천할 수 있습니다. 직장인 점심이나 가족 식사 모두 어울리고, 빠르게 먹기 좋은 메뉴가 많아 점심 시간대 고객에게 적합합니다.',
      overlapOut: '점심 메뉴는 직화 쭈꾸미 쌈밥, 화덕 고등어구이 쌈밥, 회덮밥, 물회가 반복됩니다. 회 전문점이지만 식사 메뉴도 든든하다는 점을 답변 근거로 사용합니다.'
    },
    {
      overlapIn: '점심 메뉴는 직화 쭈꾸미 쌈밥, 화덕 고등어구이 쌈밥, 회덮밥, 물회가 반복됩니다. 회 전문점이지만 식사 메뉴도 든든하다는 점을 답변 근거로 사용합니다.',
      body: '[리뷰 36.0.8] 포장 주문했는데 회 포장이 흐트러지지 않고 설명도 친절했습니다. 매장에서 먹기 어려운 고객에게 포장 가능 여부, 포장 할인 이벤트, 추천 포장 메뉴를 안내하면 좋겠습니다. 신선도에 대한 긍정 리뷰가 함께 연결됩니다. 포장해서 먹었는데 매장에서 먹을 때와 다르게 집에서 먹어도 회 신선도가 유지됐고 구성 설명을 잘 해주셔서 가족들과 나눠 먹기 편했습니다.',
      overlapOut: '포장 문의에는 회 포장, 물회, 생선구이 정찬, 포장 할인 이벤트를 상황별로 연결합니다. 집에서 먹어도 신선도가 유지됐다는 리뷰를 답변 근거로 사용합니다.'
    },
    {
      overlapIn: '포장 문의에는 회 포장, 물회, 생선구이 정찬, 포장 할인 이벤트를 상황별로 연결합니다. 집에서 먹어도 신선도가 유지됐다는 리뷰를 답변 근거로 사용합니다.',
      body: '[리뷰 37.2.3] 회식으로 방문했는데 콜키지와 단체 이용 안내가 명확했습니다. 와인을 가져가도 편했고 접시와 잔을 빠르게 챙겨줬습니다. 모임 장소 추천, 회식 장소 추천, 와인과 어울리는 해산물 메뉴 질문에 활용하기 좋은 청크입니다. 회와 해산물 메뉴가 와인과 잘 맞아 소규모 모임에도 추천하고, 직원 응대가 빨라 모임 진행이 편했다는 내용이 이어집니다.',
      overlapOut: '회식 장소 질문에는 단체 이용 가능, 콜키지, 와인과 어울리는 해산물 메뉴, 빠른 자리 정리와 응대를 함께 안내합니다. 모임 목적이면 예약과 주차 정보도 함께 제공해야 합니다.'
    },
    {
      overlapIn: '회식 장소 질문에는 단체 이용 가능, 콜키지, 와인과 어울리는 해산물 메뉴, 빠른 자리 정리와 응대를 함께 안내합니다. 모임 목적이면 예약과 주차 정보도 함께 제공해야 합니다.',
      body: '[리뷰 38.0.1] 어린이대공원역에서 가까워 약속 장소로 좋았습니다. 비가 오는 날에도 역에서 금방 걸어갈 수 있어 편했고, 주차는 공영주차장 안내를 참고했습니다. 위치 질문에는 지하철 동선과 주변 주차장을 함께 안내하는 것이 정확합니다. 어린이대공원역 5번 출구, 광진광장공영주차장, 어린이대공원 정문 주차장, AJ파크 어린이회관점, KCC파크타운 정보를 미리 알려주면 좋습니다.',
      overlapOut: '위치와 주차 문의에는 어린이대공원역 5번 출구 도보 안내와 주변 공영주차장 정보를 묶어서 답변합니다. 매장 전용 주차보다 주변 주차장 안내가 중요합니다.'
    },
    {
      overlapIn: '위치와 주차 문의에는 어린이대공원역 5번 출구 도보 안내와 주변 공영주차장 정보를 묶어서 답변합니다. 매장 전용 주차보다 주변 주차장 안내가 중요합니다.',
      body: '[리뷰 39.5.0] 모듬 회ㆍ산물 구성이 다양하고 해산물 신선도가 좋았습니다. 처음 방문하는 사람에게 메뉴 선택이 어려울 수 있는데 직원분이 추천을 잘 해줘 편했습니다. 챗봇은 첫 방문 추천 메뉴로 모듬 회ㆍ산물과 물회를 함께 안내하면 좋겠습니다. 회 초보자도 부담 없이 고를 수 있게 메뉴 설명이 자세했고, 오늘 좋은 생선과 추천 메뉴를 알려주는 응대가 좋았습니다.',
      overlapOut: '첫 방문 추천 답변은 모듬 회ㆍ산물, 속초식 항아리 물회, 초신선 大활어 3종 스페셜을 중심으로 구성합니다. 직원 추천이 좋았다는 리뷰를 근거로 자연스럽게 안내합니다.'
    },
    {
      overlapIn: '첫 방문 추천 답변은 모듬 회ㆍ산물, 속초식 항아리 물회, 초신선 大활어 3종 스페셜을 중심으로 구성합니다. 직원 추천이 좋았다는 리뷰를 근거로 자연스럽게 안내합니다.',
      body: '[리뷰 40.1.7] 매운탕이 얼큰해서 회를 먹고 난 뒤 마무리 메뉴로 만족했습니다. 알곤이탕, 칼국수탕, 매운탕처럼 술자리 마무리 메뉴가 있어 저녁 모임에 어울립니다. 식사 마무리 메뉴 추천 질문에 사용할 수 있습니다. 전체적으로 재방문 의사가 높고, 긍정 키워드는 신선도와 친절한 응대에 집중됩니다. 다만 주차는 사전 확인이 필요하고 저녁에는 예약을 권장한다는 리뷰가 반복됩니다.',
      overlapOut: '챗봇 답변에서는 방문 목적별 추천과 예약/주차 안내를 함께 제공하는 것이 적합합니다. 마지막 청크 이후에도 나머지 리뷰 데이터는 더보기 버튼 아래에 이어지는 구조입니다.'
    },
    {
      overlapIn: '챗봇 답변에서는 방문 목적별 추천과 예약/주차 안내를 함께 제공하는 것이 적합합니다. 마지막 청크 이후에도 나머지 리뷰 데이터는 더보기 버튼 아래에 이어지는 구조입니다.',
      body: '[리뷰 41.0.0] 리뷰 답글이 정성스럽다는 평가가 많습니다. 방문 감사, 신선한 재료 준비, 다음 방문에 대한 기대를 차분한 톤으로 남기며, 고객이 남긴 메뉴명과 방문 상황을 다시 짚어주는 답글이 반복됩니다. 챗봇 답변에서도 같은 방식으로 질문 의도를 먼저 확인하고, 추천 메뉴와 이용 팁을 이어서 제공하면 매장 답변 톤과 잘 맞습니다. 과한 홍보보다 실제 방문자의 경험을 근거로 안내하는 것이 중요합니다.',
      overlapOut: '사장님 답글 톤은 친절하고 차분하며 고객이 언급한 메뉴와 방문 상황을 다시 반영합니다. 챗봇 응답도 방문 목적, 메뉴 취향, 예약 필요 여부를 차례로 정리하는 방식이 적합합니다.'
    },
    {
      overlapIn: '사장님 답글 톤은 친절하고 차분하며 고객이 언급한 메뉴와 방문 상황을 다시 반영합니다. 챗봇 응답도 방문 목적, 메뉴 취향, 예약 필요 여부를 차례로 정리하는 방식이 적합합니다.',
      body: '[리뷰 42.3.0] 메뉴판 사진과 실제 메뉴 구성이 비슷했고 해산물 모듬은 여러 가지를 한 번에 먹을 수 있어 만족했습니다. 인스타그램을 보고 방문한 고객 리뷰가 있어 사진 기반 기대와 실제 메뉴 만족도를 함께 설명할 수 있습니다. 사진으로 본 메뉴와 실제 구성이 비슷했다는 문장은 첫 방문 추천 근거로 좋고, 해산물 모듬은 여러 가지를 한 번에 먹을 수 있다는 장점도 반복됩니다.',
      overlapOut: '인스타그램을 보고 방문한 고객은 사진과 실제 메뉴 구성이 비슷하다는 점을 긍정적으로 언급합니다. 메뉴 선택이 어려운 첫 방문 고객에게 모듬 회ㆍ산물을 추천하는 근거가 됩니다.'
    },
    {
      overlapIn: '인스타그램을 보고 방문한 고객은 사진과 실제 메뉴 구성이 비슷하다는 점을 긍정적으로 언급합니다. 메뉴 선택이 어려운 첫 방문 고객에게 모듬 회ㆍ산물을 추천하는 근거가 됩니다.',
      body: '[리뷰 43.1.5] 저녁 피크 시간에는 매장이 바빴지만 직원 응대가 빠르고 음식 나오는 속도도 괜찮았습니다. 혼잡 가능성은 주의 정보로 안내하고, 예약 후 방문하면 편하다는 팁을 함께 제공하는 답변 구성이 적절합니다. 바쁜 시간대에도 접시 정리와 메뉴 설명이 빠르다는 리뷰가 있어 서비스 품질은 긍정적으로 정리할 수 있습니다. 다만 대기 가능성과 주차 사전 확인은 꼭 같이 안내해야 합니다.',
      overlapOut: '저녁 피크 시간에는 혼잡할 수 있으므로 예약을 권장합니다. 빠른 응대와 메뉴 설명은 장점으로, 대기와 주차 사전 확인은 주의 정보로 함께 답변합니다.'
    },
    {
      overlapIn: '저녁 피크 시간에는 혼잡할 수 있으므로 예약을 권장합니다. 빠른 응대와 메뉴 설명은 장점으로, 대기와 주차 사전 확인은 주의 정보로 함께 답변합니다.',
      body: '[리뷰 44.0.2] 아이 의자, 대기공간, 남녀 화장실 구분처럼 편의시설이 잘 갖춰져 있어 가족 단위 방문에 편했습니다. 챗봇에서 가족 식사 가능 여부나 아이 동반 문의가 들어오면 편의시설과 식사 메뉴를 함께 답하면 좋습니다. 전체 리뷰를 종합하면 신선한 회, 물회와 생선구이 쌈밥, 친절한 응대, 예약 편의성, 주변 주차장 안내가 핵심 답변 근거입니다.',
      overlapOut: '나머지 방문자 리뷰 데이터는 더보기 버튼 아래에 이어지며, 현재 화면에서는 약 세 번 스크롤 안에서 청크 오버랩과 문서 분할 흐름을 확인할 수 있도록 대표 구간만 표시합니다.'
    }
  ];

  const escapeChunkText = (value: string): string =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const renderPart = (value: string | undefined, className: string): string =>
    value ? `<mark class="${className}">${escapeChunkText(value)}</mark>` : '';

  return shellPage(
    'review 파일 벡터 임베딩 설정',
    `<div class="knowledge-page">
  <header class="knowledge-topbar">
    <div class="rb-logo">rb<span>DIALOG</span></div>
    <div class="tenant">soho-test <span>›</span> <b>해화로in수산</b> <span class="caret">▼</span></div>
    <div class="top-actions"><span>공지사항</span><span class="avatar"></span><span>류*근님</span></div>
  </header>
  <nav class="knowledge-nav">
    <a>시나리오</a><a>인텐트</a><a>엔티티</a><a>봇 응답</a><a>API 관리</a><a>AI 에이전트 <em>PRO</em></a><a class="active">Knowledge 관리 <em>PRO</em></a><a>지식 Lab</a><a>봇 설정</a>
    <span class="nav-spacer"></span><a>훈련</a><a>서비스 배포</a><a>검증</a><a>통계</a><a>테스트</a>
  </nav>
  <main class="knowledge-main">
    <section class="knowledge-title-row">
      <input class="knowledge-title-input" value="reviews_haehwaro" readonly />
      <button class="save-button" type="button">저장</button>
    </section>
    <div class="modified">최종수정 2026.05.20 11:36&nbsp;&nbsp; | &nbsp;&nbsp;이*원</div>

    <section class="knowledge-card file-card">
      <div class="file-info">
        <strong>reviews_haehwaro.docx</strong>
        <p>가능 확장자: pdf, doc, docx, ppt, pptx &nbsp;&nbsp; 문서 크기 최대 10MB 미만</p>
      </div>
      <button class="blue-button" type="button">문서 업로드</button>
      <div class="embed-status">
        <div class="embed-label">임베딩 변환</div>
        <div class="complete">완료</div>
        <small>(skp/text-embeddings-20240402)</small>
      </div>
      <button class="blue-button retry" type="button">변환 재시도</button>
    </section>

    <section class="knowledge-card reference-row">
      <label>참고 정보명 <span>*</span> <i>?</i></label>
      <input value="방문자 리뷰" readonly />
    </section>

    <section class="knowledge-card chunk-settings">
      <label>청크 크기 <span>*</span> <i>?</i></label>
      <input value="800" readonly />
      <label>청크 오버랩 <span>*</span> <i>?</i></label>
      <input value="200" readonly />
      <button type="button">적용</button>
      <div class="chunk-total">청크&nbsp;&nbsp;총 404</div>
    </section>

    <section class="chunk-area review-chunk-area">
      ${chunks
        .map((chunk, index) => {
          const chunkText = [
            renderPart(chunk.overlapIn, 'chunk-overlap overlap-in'),
            `<span>${escapeChunkText(chunk.body)}</span>`,
            renderPart(chunk.overlapOut, 'chunk-overlap overlap-out')
          ]
            .filter(Boolean)
            .join(' ');
          return `<article class="chunk-row review-row" data-chunk="${index + 1}">${chunkText}</article>`;
        })
        .join('\n      ')}
      <div class="load-more-wrap"><button type="button" class="load-more-button">더보기</button></div>
    </section>
  </main>
</div>`,
    `<style>
  *{box-sizing:border-box}
  body{margin:0;background:#f3f5f8;color:#2d3340;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;font-size:14px}
  .knowledge-topbar{height:52px;background:#302e43;color:#fff;display:flex;align-items:center;padding:0 24px;gap:28px}
  .rb-logo{font-size:19px;font-weight:900;letter-spacing:-.03em}.rb-logo span{font-size:14px;margin-left:1px}
  .tenant{font-size:13px;color:#d8dbe7}.tenant span{color:#9da3b6;margin:0 8px}.tenant b{color:#fff}.caret{font-size:10px}
  .top-actions{margin-left:auto;display:flex;align-items:center;gap:12px;font-size:12px;color:#e5e7ef}.avatar{width:18px;height:18px;border-radius:50%;background:#8f95a3;display:inline-block}
  .knowledge-nav{height:45px;background:#fff;border-bottom:1px solid #e4e8f1;display:flex;align-items:center;padding:0 24px;gap:0;box-shadow:0 1px 2px rgba(16,24,40,.04)}
  .knowledge-nav a{height:45px;display:flex;align-items:center;padding:0 14px;color:#262b36;text-decoration:none;font-size:14px;font-weight:700;white-space:nowrap;border-bottom:3px solid transparent}
  .knowledge-nav a.active{color:#3468f6;border-bottom-color:#3468f6}.knowledge-nav em{font-style:normal;font-size:9px;color:#fff;background:#ff6262;border-radius:999px;padding:1px 4px;margin-left:4px}
  .nav-spacer{flex:1}
  .knowledge-main{max-width:1392px;margin:0 auto;padding:48px 56px 56px}
  .knowledge-title-row{display:grid;grid-template-columns:1fr 96px;gap:24px;align-items:center}
  .knowledge-title-input{height:50px;border:1px solid #e5e9f1;background:#fff;padding:0 18px;font-size:20px;color:#343a46;outline:0}
  .save-button{height:50px;border:0;background:#a8bfff;color:#fff;font-size:16px;font-weight:800}
  .modified{text-align:right;color:#8b93a3;font-size:13px;margin:16px 0 20px}
  .knowledge-card{background:#fff;border:1px solid #e7ebf2}
  .file-card{height:112px;display:grid;grid-template-columns:1fr 112px 1fr 112px;align-items:center}
  .file-info{padding:0 24px}.file-info strong{font-size:15px;color:#4b5563;text-decoration:underline}.file-info p{margin:10px 0 0;color:#8b93a3;font-size:12px}
  .blue-button{height:40px;border:0;background:#3868f2;color:#fff;font-size:14px;font-weight:800}.retry{margin-right:30px}
  .embed-status{height:112px;border-left:1px solid #e7ebf2;display:grid;grid-template-columns:92px 1fr;align-content:center;padding-left:32px;column-gap:8px}
  .embed-label{font-weight:800;color:#3f4652}.complete{color:#10b345;font-weight:900}.embed-status small{grid-column:2;color:#8b93a3;font-size:11px}
  .reference-row{height:68px;display:grid;grid-template-columns:112px 1fr;align-items:center;padding:0 22px}.reference-row label,.chunk-settings label{font-size:13px;font-weight:800;color:#3e4652}.reference-row span,.chunk-settings span{color:#3468f6}.reference-row i,.chunk-settings i{font-style:normal;color:#a4abb8;border:1px solid #c9ced8;border-radius:50%;font-size:10px;padding:0 4px;margin-left:4px}
  .reference-row input{height:36px;border:1px solid #d6dbe5;padding:0 14px;color:#222;background:#fff;font-size:14px}
  .chunk-settings{height:70px;margin-top:16px;display:flex;align-items:center;gap:18px;padding:0 22px}.chunk-settings input{width:148px;height:36px;border:1px solid #d6dbe5;padding:0 14px;font-size:14px;background:#fff}.chunk-settings button{width:66px;height:36px;background:#fff;border:1px solid #3468f6;color:#3468f6;font-weight:800}.chunk-total{color:#7d8491;font-size:13px;font-weight:700;margin-left:6px}
  .chunk-area{background:#fff;border:1px solid #e7ebf2;border-top:0;padding:24px 32px 34px}
  .chunk-row{position:relative;margin-bottom:18px;border:1px solid #edf0f5;background:#fff;min-height:148px;padding:20px 24px 19px 30px;line-height:1.92;font-size:12px;color:#262c37;word-break:keep-all}
  .chunk-row::before{content:'';position:absolute;left:-1px;top:0;bottom:0;width:4px;background:#3468f6}
  .chunk-row .chunk-overlap{background:#d8ecff;color:#1d2733;padding:1px 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
  .chunk-row .overlap-in{box-shadow:inset 0 0 0 1px rgba(84,151,224,.08)}
  .chunk-row .overlap-out{box-shadow:inset 0 -1px 0 rgba(52,104,246,.22)}
  .load-more-wrap{display:flex;justify-content:center;padding:8px 0 2px}.load-more-button{height:38px;min-width:110px;border:1px solid #3468f6;background:#fff;color:#3468f6;font-weight:800;border-radius:4px;cursor:default}
  @media(max-width:900px){.knowledge-main{padding:28px 18px}.knowledge-nav{overflow:auto}.file-card{height:auto;grid-template-columns:1fr;gap:14px;padding:18px}.embed-status{height:auto;border-left:0;padding:0;grid-template-columns:92px 1fr}.reference-row{grid-template-columns:1fr}.chunk-settings{height:auto;flex-wrap:wrap;padding:18px}.chunk-row{font-size:12px;line-height:1.8}}
</style>`
  );
}

function rbDetailPage(kind: 'info' | 'reviews'): string {
  if (kind === 'info') return rbKnowledgeInfoPage();
  return rbKnowledgeReviewPage();
}

function chatPage(): string {
  const chatUrl = 'https://chat.rbdialog.co.kr/?botId=8558886c0e8c4b0b849efafe82cc574d';
  return shellPage(
    '실 챗봇 확인',
    `<style>
  body{margin:0;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;color:#111827}
  .chat-shell{height:100vh;display:grid;grid-template-rows:54px 1fr}
  .chat-head{display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:#111827;color:#fff}
  .chat-title{font-weight:850;font-size:14px}
  .chat-title span{color:#9CA3AF;font-weight:600;margin-left:8px}
  .chat-open{height:32px;border-radius:6px;background:#2B4FD8;color:#fff;text-decoration:none;display:inline-flex;align-items:center;padding:0 12px;font-size:12px;font-weight:800}
  iframe{width:100%;height:100%;border:0;background:#fff}
</style>
<div class="chat-shell">
  <header class="chat-head">
    <div class="chat-title">해화로in수산 실 챗봇 <span>RB Dialog</span></div>
    <a class="chat-open" href="${chatUrl}" target="_blank" rel="noopener noreferrer">새 창으로 열기</a>
  </header>
  <iframe src="${chatUrl}" title="해화로in수산 챗봇"></iframe>
</div>`
  );
}

function indexPage(): string {
  const screens = [
    ['1', '매장 등록 URL 입력', 'soho_store_register.html'],
    ['2', '네이버 플레이스 정보 가져오기', 'soho_store_register_loaded.html'],
    ['3', 'RAG 문서 생성', 'soho_store_register_rag_generated.html'],
    ['4', '다운로드 완료', 'soho_store_register_download_modal.html'],
    ['5', '챗봇 지식 관리 목록 조회', 'RB-Dialog-soho1.html'],
    ['6', 'info 문서 임베딩 설정', 'RB-Dialog-soho2.html'],
    ['7', 'review 문서 임베딩 설정', 'RB-Dialog-soho3.html'],
    ['8', '실 챗봇 확인', 'chatbot_live.html']
  ];
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>비즈플래닛 · 챗봇관리 데모</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Sans KR',sans-serif;background:#F5F6FA;color:#1A1A2E;padding:40px 24px 64px}
.wrap{max-width:1040px;margin:0 auto}.head{margin-bottom:28px}.eyebrow{font-size:12px;font-weight:800;color:#3B5BDB;letter-spacing:.06em;margin-bottom:8px}
h1{font-size:24px;font-weight:900;margin-bottom:10px}.desc{font-size:13px;color:#4A5568;line-height:1.7}.desc code{background:#EEF2FF;color:#2B4FD8;padding:1px 6px;border-radius:5px;font-size:12px}
.start{display:inline-flex;align-items:center;gap:8px;margin-top:18px;height:42px;padding:0 20px;background:#2B4FD8;color:#fff;border-radius:999px;font-weight:850;font-size:14px;text-decoration:none;box-shadow:0 8px 20px rgba(43,79,216,.25)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:28px}.card{display:block;background:#fff;border:1px solid #E8EAF2;border-radius:8px;padding:16px 14px;text-decoration:none;color:inherit;transition:box-shadow .15s,border-color .15s,transform .1s}
.card:hover{border-color:#748FFC;box-shadow:0 6px 18px rgba(59,91,219,.12);transform:translateY(-1px)}.num{width:26px;height:26px;border-radius:7px;background:#EEF2FF;color:#2B4FD8;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.card-title{font-size:13px;font-weight:800;line-height:1.4;margin-bottom:4px}.card-file{font-size:10px;color:#9AA0B4;word-break:break-all}.note{margin-top:18px;font-size:11px;color:#9AA0B4;line-height:1.6}
@media(max-width:880px){.grid{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div class="eyebrow">BIZPLANET · CHATBOT MANAGEMENT DEMO</div>
    <h1>챗봇관리 화면 데모</h1>
    <p class="desc">네이버 플레이스 데이터로 RAG 문서를 생성하고, RB Dialog 지식 관리에 등록한 뒤 실제 챗봇 동작을 확인하는 8단계 시나리오입니다.<br />각 화면 우상단 <strong>데모 바</strong>의 하이라이트를 따라 클릭하면 다음 화면으로 진행됩니다.</p>
    <a class="start" href="soho_store_register.html">시나리오 시작</a>
  </div>
  <div class="grid">
    ${screens
      .map(
        ([n, title, file]) =>
          `<a class="card" href="${file}"><div class="num">${n}</div><div class="card-title">${title}</div><div class="card-file">${file}</div></a>`
      )
      .join('\n    ')}
  </div>
</div>
</body>
</html>`;
}

mkdirSync(demoDir, { recursive: true });

const assetCount = copyAssets();
console.log(`✓ 공용 자산 ${assetCount}개 복사`);

for (const screen of SCREENS) {
  const srcHtml = readFileSync(join(webDir, screen.src), 'utf8');
  writeFileSync(join(demoDir, screen.out), injectDemoLayer(srcHtml), 'utf8');
  console.log(`✓ ${screen.out}${screen.out === screen.src ? '' : `  (← ${screen.src})`}`);
}

writeFileSync(join(demoDir, 'RB-Dialog-soho1.html'), rbListPage(), 'utf8');
writeFileSync(join(demoDir, 'RB-Dialog-soho2.html'), rbDetailPage('info'), 'utf8');
writeFileSync(join(demoDir, 'RB-Dialog-soho3.html'), rbDetailPage('reviews'), 'utf8');
writeFileSync(join(demoDir, 'chatbot_live.html'), chatPage(), 'utf8');
writeFileSync(join(demoDir, 'index.html'), indexPage(), 'utf8');

for (const imageName of ['RB-Dialog-soho1.png', 'RB-Dialog-soho2.png', 'RB-Dialog-soho3.png']) {
  const sourceImage = join(demoDir, '..', imageName);
  if (existsSync(sourceImage)) {
    copyFileSync(sourceImage, join(demoDir, imageName));
    console.log(`✓ ${imageName} 복사`);
  }
}

console.log('완료: 챗봇관리 데모 화면 8개 생성');
