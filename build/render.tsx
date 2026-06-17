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
      body: '해화로in수산 방문자 리뷰 모음 식당명: 해화로in수산 업종: 생선회 / 해산물 위치: 서울 종로구 혜화동 특징: 신선한 회, 방어, 도다리, 고등어 등 다양한 해산물 요리. 2층 규모로 단체석 보유. 사장님이 직접 소통하는 친절한 운영. 아래는 실제 방문자 리뷰 1203건입니다.'
    },
    {
      body: '[리뷰 1] (5.10.일) - 베스트샐러두 2층까지 있고 단체석도 많아서 여러명이 와도 좋을 것 같아요! 저희는 근처에서 공연보고 급하게 찾아 들어왔는데, 맛집인지 잠깐 대기했다가 들어왔는데! 대박ㅎㅎ 맛이 넘 좋습니다! 숙성회 5가지 골라서 시킬 수 있어서 제철에 맛있는 회로 골라 먹을 수 있어 좋았어요!:) ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장을 방문해 주시고 소중한 경험을 공유해 주셔서 진심으로 감사드립니다. 단체석이 많아 여러 분이 함께 오시기에도 편리하다는 말씀 기쁘게 받아들입니다. 특히 숙성회를 계절별로 다양하게 즐기실 수 있도록 준비한 점이 만족스럽게 느껴졌다니 보람을 느낍니다. 앞으로도 신선한 재료와 정성 어린 숙성 기술로 고객님의 입맛을 사로잡을 수 있도록 최선을 다하겠습니다. 공연 후 편안한 식사 시간으로 기억되셨기를 바라며, 다시 한 번 찾아주시면 더욱 특별한 맛과 서비스로 맞이하겠습니다. 감사합니다. [리뷰 2] (4.25.토) - 황지연kelly 인스타보고 찾아온 집 와진짜 이렇게 웃음나오는집은 처음이네~~~ 도다리세로회를 주문하고 다른음식들도 맛보고 싶었눈데.. 기본 반찬이 너무 많이 나오는데.. 하나같이 훌륭하다.. 기본반찬이 미역국부터 시작해서 가자미찜까지 미쳤다.',
      overlapOut: '손이안가는 반찬이 없음 ~ 여기는 정말 좋은 재료로 손님들에게 웃음을 주는 식당이 맞다^^ 친구랑 둘이서 박수치면서 웃으면서 먹어서 기분이 너무 좋아지는 식당이다 재방문의사 300프로 너무 감사해요 소금김밥까지 맛볼수 있게해주세여^^오래오래 이맛유지해주세요^^'
    },
    {
      overlapIn: '손이안가는 반찬이 없음 ~ 여기는 정말 좋은 재료로 손님들에게 웃음을 주는 식당이 맞다^^ 친구랑 둘이서 박수치면서 웃으면서 먹어서 기분이 너무 좋아지는 식당이다 재방문의사 300프로 너무 감사해요 소금김밥까지 맛볼수 있게해주세여^^오래오래 이맛유지해주세요^^',
      body: '▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 먼저 저희 매장에서 즐거운 식사 경험을 하셨다니 진심으로 기쁩니다. 기본 반찬부터 메인 요리까지 만족스럽게 즐기셨다는 말씀에 큰 보람을 느낍니다. 신선한 재료로 정성껏 준비한 음식을 통해 손님들께 행복한 순간을 선사할 수 있다는 것이 저희의 자부심입니다. 앞으로도 변함없이 최상의 품질과 서비스로 보답드릴 것을 약속드립니다. 소금김밥까지 맛보실 수 있도록 더욱 세심히 준비하겠습니다. 다시 한 번 따뜻한 말씀 감사드리며, 다음 방문 때에도 기대 이상의 만족으로 찾아뵐 수 있도록 최선을 다하겠습니다. 감사합니다. [리뷰 3] (4.12.일) - ina**** 음... 신당 중앙시장에서 같은 메뉴로 당한적이 있는데, 해화로in수산은 레벨이 다릅니다.'
    },
    {
      body: '모듬회산물에 아이들은 초밥으로 어른들은 소주한잔 안주로 기가맥힙니다!!!! 노량진 매니아인데, 여긴 더 구성이 알차요!!!! 직원분들 정말 친절하고 술이 술술 넘어가는구나~ ▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 저희 모듬회와 해산물 구성이 아이들 초밥과 술안주로 기가 막히다는 말씀에 저도 모르게 힘이 납니다! 노량진 매니아신데 저희 매장이 더 알차다고 해주시니 정말 감사하고, 직원들 친절함까지 좋게 봐주셔서 저희도 기쁩니다. 앞으로도 이 마음 그대로 더 좋은 구성과 서비스로 준비하겠습니다. 언제든 편하게 또 들러주세요! [리뷰 4] (5.9.토) - 리베란테진원짱 평소 궁금했던 회 국수가 메뉴에 있어서 주문해보았는데, 회가 신선하고 맛있었어요! 반찬도 정갈하고 깔끔하고 다양하게 나옵니다! 맛은 좋았는데, 여직원분(매니저님?)이 불친절하세요ㅠㅠ 반찬 리필 요청했는데 인상 팍 쓰시며 네? 하시던 모습이 무서웠고, 잊혀지질 않네요',
      overlapOut: '[리뷰 5] (4.26.일) - 별이 두 번째 방문인데 이번에도 대만족 !! 첫 방문 때처럼 회가 신선하고 쫄깃해서 맛있었고, 비린 맛 없이 깔끔해요ㅠㅠㅠ무엇보다 스끼다시도 알차게 나와서 그 점이 너무 좋아요 ... 매장 분위기도 편안해서 부담 없이 머물기 좋았습니다 ㅎㅎ재방문해도 역시 괜찮은 곳이라 다음에도 또 올 것 같아요😢💖'
    },
    {
      overlapIn: '[리뷰 5] (4.26.일) - 별이 두 번째 방문인데 이번에도 대만족 !! 첫 방문 때처럼 회가 신선하고 쫄깃해서 맛있었고, 비린 맛 없이 깔끔해요ㅠㅠㅠ무엇보다 스끼다시도 알차게 나와서 그 점이 너무 좋아요 ... 매장 분위기도 편안해서 부담 없이 머물기 좋았습니다 ㅎㅎ재방문해도 역시 괜찮은 곳이라 다음에도 또 올 것 같아요😢💖',
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 두 번째 방문에서도 변함없는 만족감을 느끼셨다니 진심으로 기쁘게 생각합니다. 신선한 재료와 정성 어린 조리를 최우선으로 삼고 있는 만큼, 고객님의 칭찬 말씀은 저희에게 큰 힘이 됩니다. 특히 스끼다시의 풍성함과 편안한 분위기가 좋은 평가를 받아 더욱 보람을 느낍니다. 앞으로도 계절별 제철 식재료와 체계적인 품질 관리를 통해 일관된 맛을 유지하며, 세심한 서비스로 편안한 식사 경험을 제공할 것을 약속드립니다. 소중한 발걸음을 다시 한 번 해주신 점 깊이 감사드리며, 다음 방문 때도 기대 이상의 만족을 드릴 수 있도록 최선을 다하겠습니다. 감사합니다. [리뷰 6] (5.5.화) - sensara 매장분위기는 깔끔하고 나오는 기본 반찬이 매우 신선해요. 기존의 다른 찬들과는 차원이 틀리네요. 숙성회는 탱글 맛은 좀 떨어졌지만 오늘이 어린이날이라 감안해봅니다. 네이버예약시 나오는 서더리탕은 정말 알차게 나왔습니다. 서비스라고 허접한거 없이 비싼 백합조개가 듬뿍들어간 시원하고 담백한 서더리탕이 나왔어요. 무엇하나 정성이 빠지지 않고 소홀한 점이 없는 안주들 입니다.다시한번와서 제철회 먹어보고 정확한리뷰 다시올려 봅니다.'
    },
    {
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장의 분위기와 기본 반찬에 대해 긍정적인 말씀 남겨주셔서 진심으로 감사드립니다. 특히 신선한 재료로 제공되는 기본 반찬에 만족하셨다니 기쁩니다. 다만 숙성회의 식감에 아쉬움을 느끼셨다는 점 깊이 받아들이며, 앞으로 더욱 세심한 재료 관리와 조리 과정을 통해 최상의 맛을 유지하도록 노력하겠습니다. 또한 계절별 특색을 살린 제철 회 메뉴를 선보일 예정이니 다음 방문 시 기대해주시면 감사드리겠습니다. 소중한 의견 주신 만큼 더 나은 서비스로 보답드릴 것을 약속드립니다. 감사합니다. [리뷰 7] (4.17.금) - 리지뉴 친구랑 도다리회 먹으러 왔어요 ㅎㅎ 회 신선하고 밑반찬도 이것저것 많이 나와서 좋아요. 도다리세로회는 처음 먹어보는데 식감 오독오독 쫄깃하니 너무 맛있네요. 직원분들도 너무 친절하셔서 다음에 또 방문하겠습니다! ▶ 사장님 답글: 안녕하세요! 해화로in수산이에요 🐟 친구 분과 함께 찾아주셨다니 더욱 반갑습니다 😊 신선한 도다리와 다양한 밑반찬으로 만족스러운 식사 되셨다니 정말 기쁘네요~ 특히 세로회 식감이 오독오독 쫄깃하다니 저희 재료 선별 노력이 빛을 발한 것 같아요💖 친절한 직원들 덕분에 더 즐거운 시간 보내셨다니 감사합니다! 다음에도 변함없는 맛과 서비스로 기다릴게요 🍣 맛있는 회 생각나실 때 언제든 들러주세요~!',
      overlapOut: '[리뷰 8] (5.16.토) - awe**** 처음에 기본반찬깔릴때부터 깜놀..'
    },
    {
      overlapIn: '[리뷰 8] (5.16.토) - awe**** 처음에 기본반찬깔릴때부터 깜놀..',
      body: '메인이 나왔을땐 더 놀라웠어요. 가성비 짱에다 정갈한 모양새와 여러종류의 신선한 회가 적당한 양과함께 다양한 가짓수로 입도하네요. 재방문할거 같아요. 다음엔 예약하고 와야징~~ ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장에서 특별한 경험을 하셨다니 진심으로 감사드립니다. 기본 반찬부터 메인 요리까지 세심하게 준비한 부분이 고객님께 좋은 인상으로 남았다니 큰 보람을 느낍니다. 특히 신선함과 정갈함을 유지하기 위해 매일 최선을 다하고 있으며, 다양한 메뉴 구성으로 만족스러운 식사를 제공하기 위해 노력하고 있습니다. 재방문을 약속해주셔서 더욱 기쁘며, 다음 방문 시에는 보다 편안하고 원활한 서비스로 모실 수 있도록 예약 시스템을 미리 안내해드리겠습니다. 소중한 의견을 바탕으로 지속적으로 발전하는 모습을 보여드릴 것을 약속드립니다. 다시 한 번 깊은 감사의 말씀 전합니다.',
      overlapOut: '[리뷰 9] (5.8.금) - moonch 회가 정말 쫄깃하고 신선해서 먹는 내내 만족스러웠어요. 생선구이랑 콘치즈가 맛있었습니다. 전체적으로 푸짐하고 깔끔해서 재방문하고 싶은 곳이에요!'
    },
    {
      overlapIn: '[리뷰 9] (5.8.금) - moonch 회가 정말 쫄깃하고 신선해서 먹는 내내 만족스러웠어요. 생선구이랑 콘치즈가 맛있었습니다. 전체적으로 푸짐하고 깔끔해서 재방문하고 싶은 곳이에요!',
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장에서 맛있는 식사 경험을 하셨다니 진심으로 기쁩니다. 특히 회와 생선구이, 콘치즈까지 모두 만족스럽게 즐기셨다니 주방 팀에게도 큰 응원이 될 것 같습니다. 신선한 재료와 정성 어린 조리를 기본으로 삼고 있는 만큼 앞으로도 변함없이 높은 퀄리티를 유지하도록 노력하겠습니다. 또한 매장 환경과 서비스 부분에서도 더욱 세심하게 관리하여 편안하고 즐거운 외식 공간이 되도록 최선을 다하겠습니다. 소중한 의견 남겨주셔서 감사드리며, 다음 방문 때에도 기대에 부응하는 모습으로 찾아 뵙겠습니다. 감사합니다. [리뷰 10] (4.10.금) - shy**** 동네에서 소문난 유명한 맛집인데 생선구이가 먹고싶어 방문했어요! 쌈밥이랑 세트 구성으로 너무 맛있게 잘 먹었어요! 생선구이는 역시 밖에서 먹어야 제맛! 👍 상다리 부러지게 든든히 맛있게 먹었습니다! 다음에 아이들이랑 재방문 할래요! ▶ 사장님 답글: 안녕하세요, 해화로in수산입니다! 쌈밥이랑 세트 구성으로 생선구이를 맛있게 드셨다니 정말 다행입니다. 저희는 생선구이를 겉은 바삭하고 속은 촉촉하게 굽는 것에 늘 신경 쓰고 있는데, 맛있게 드셨다는 말씀에 힘이 납니다. 이렇게 소중한 리뷰 남겨주셔서 정말 감사드리고요, 다음번에 아이들과 함께 오시면 더 맛있는 음식으로 든든하게 준비해 놓겠습니다! 또 뵈요!'
    },
    {
      body: '[리뷰 11] (5.10.일) - 2jooyoung 기본반찬도 너무 잘 나오고 쌈채소도 너무 다양하게 많아요!! 음식도 맛있고 무엇보다 직원분들이 너무 친절해서 기분좋게 밥먹을 수 있었어요!! ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장에서 맛있는 식사 경험과 함께 따뜻한 서비스까지 느끼셨다니 진심으로 기쁩니다. 기본 반찬부터 풍성한 쌈 채소까지 세심하게 준비한 노력을 알아봐 주셔서 감사합니다. 특히 직원들의 친절한 응대가 만족스러운 식사로 이어졌다니 더욱 보람을 느낍니다. 앞으로도 신선한 재료와 정성 가득한 요리로 고객님의 입맛을 사로잡을 뿐만 아니라, 편안하고 즐거운 분위기 속에서 최상의 서비스를 제공하기 위해 최선을 다하겠습니다. 소중한 시간 내어 주신 리뷰를 통해 더욱 발전하는 해화로 in 수산이 되겠습니다. 다시 한 번 깊은 감사의 말씀 전합니다.',
      overlapOut: '[리뷰 12] (4.19.일) - sun**** 아이가 너무좋아하는곳. 모듬해산물짱이네요. 사장님이 작은 말도 신경써서 듣고 바로바로 해주시네요 잘 먹었습니다. 저희는 택시타고와요^^'
    },
    {
      overlapIn: '[리뷰 12] (4.19.일) - sun**** 아이가 너무좋아하는곳. 모듬해산물짱이네요. 사장님이 작은 말도 신경써서 듣고 바로바로 해주시네요 잘 먹었습니다. 저희는 택시타고와요^^',
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 소중한 가족과의 특별한 시간을 저희 매장에서 함께 해주셔서 진심으로 감사드립니다. 특히 아이가 즐겁게 식사할 수 있었다니 더욱 기쁩니다. 모듬해산물 메뉴를 마음에 들어하셨다니 기쁘며, 앞으로도 신선함과 풍성한 맛으로 보답드릴 것을 약속드립니다. 또한 작은 요청도 세심히 경청해주신 점에 대해 칭찬해 주셔서 감사합니다. 고객님의 말씀처럼 모든 순간을 소중히 여기며 한 분 한 분께 맞춤 서비스 제공하기 위해 최선을 다하겠습니다. 택시로 편하게 찾아주신다고 하니 접근성도 지속적으로 점검하여 더 편리한 방문 환경을 만들어 가겠습니다. 다시 한번 따뜻한 후기에 깊이 감사드리며, 다음 방문 때에도 변함없는 만족을 드릴 수 있도록 노력하겠습니다. [리뷰 13] (5.2.토) - heybinii 대창 알고니찜 너무 맛있네요! 매콤한거 좋아하시는 분들 입맛에 딱 좋을거같아요ㅎㅎㅎ호래기 회도 맛나요',
      overlapOut: '▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 대창 알고니찜 맛있게 드셨다니 정말 다행입니다! 저희 매장에서는 매콤한 맛을 살리면서도 재료 본연의 맛을 해치지 않도록 신경 쓰고 있는데, 입맛에 맞으셨다니 저희도 기쁩니다. 🤍 호래기 회도 맛있게 드셨다니 감사하네요! 앞으로도 신선하고 맛있는 해산물로 보답하겠습니다. 또 찾아주세요! 😊'
    },
    {
      overlapIn: '▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 대창 알고니찜 맛있게 드셨다니 정말 다행입니다! 저희 매장에서는 매콤한 맛을 살리면서도 재료 본연의 맛을 해치지 않도록 신경 쓰고 있는데, 입맛에 맞으셨다니 저희도 기쁩니다. 🤍 호래기 회도 맛있게 드셨다니 감사하네요! 앞으로도 신선하고 맛있는 해산물로 보답하겠습니다. 또 찾아주세요! 😊',
      body: '[리뷰 14] (4.19.일) - sal**** 기본 안주부터 너무 실하게 잘 나오네요! 회도 싱싱하고 사장님도 친절하셔서 편안한 분위기에서 맛있게 먹고왔습니다! 테이블마다 머리끈이랑 치실도 있는데 사장님 센스최고💕👍👍 ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장에서 편안하고 즐거운 시간을 보내셨다니 진심으로 기쁩니다. 기본 안주와 메인 요리 모두 만족스럽게 즐기셨다니 주방 팀에게도 큰 힘이 될 것 같습니다. 특히 세심한 배려가 담긴 서비스 요소들, 예를 들어 머리끈이나 치실 같은 작은 배려를 좋게 봐주셔서 감사합니다. 앞으로도 고객님의 소중한 의견을 경청하며 더욱 친절하고 세심한 서비스를 제공할 수 있도록 노력하겠습니다. 다시 한 번 따뜻한 말씀 남겨주셔서 감사드리며, 다음 방문 때도 변함없는 품질과 서비스로 보답드릴 것을 약속드립니다. 건강하시고 늘 행복 가득한 날 되시길 바랍니다.',
      overlapOut: '[리뷰 15] (5.12.화) - 내가 원하는 세상31 가족들과 가끔 오는데 올때마다 친절하고 음식도 맛있습니다. 매장도 넓어서 좋아요'
    },
    {
      overlapIn: '[리뷰 15] (5.12.화) - 내가 원하는 세상31 가족들과 가끔 오는데 올때마다 친절하고 음식도 맛있습니다. 매장도 넓어서 좋아요',
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 가족 분들과 함께 자주 찾아주시고 따뜻한 말씀 남겨주셔서 진심으로 감사드립니다. 저희 매장에서 편안하고 즐거운 시간을 보내실 수 있도록 최선을 다하고 있습니다. 특히 친절한 서비스와 맛있는 음식으로 기억에 남으셨다니 기쁩니다. 앞으로도 변함없이 신선한 재료와 정성 어린 조리로 고객님의 기대에 부응하겠습니다. 넓은 공간에서 여유롭게 식사하실 수 있도록 시설 관리에도 소홀함이 없도록 노력하겠습니다. 다시 한 번 소중한 피드백에 깊이 감사드리며, 다음 방문 때 더욱 만족스러운 경험을 드릴 수 있기를 기대합니다. 건강하시고 행복 가득한 나날 되시길 바랍니다. [리뷰 16] (5.18.월) - 염소아빠엄마 우연히 들른 밥집인데 메뉴도 다양하고 맛도 좋아요!! 재방문 의사 8127입니당!!! 다들 점심식사하러 방문하세요~~ ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장을 찾아주시고 소중한 경험을 공유해주셔서 진심으로 감사드립니다. 다양한 메뉴 구성과 맛을 좋게 평가해주시니 기쁜 마음입니다. 앞으로도 신선한 재료와 정성 어린 조리로 고객님의 기대에 부응할 수 있도록 최선을 다하겠습니다. 특히 점심 시간에도 만족스러운 식사를 제공하기 위해 더욱 세심히 준비하도록 노력하겠습니다. 다시 한 번 감사의 말씀 드리며, 다음 방문 때 더 나은 서비스로 찾아뵐 것을 약속드립니다. 행복 가득한 하루 되시길 바랍니다.'
    },
    {
      body: '[리뷰 17] (5.17.일) - dks**** 두번째방문이에요~ 반찬도정갈하고 아이가 생선을좋아하네요. 어른아이모두좋은곳입니다. 애빼고도 한번와보고싶으나 쉽지않네 ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 소중한 가족과의 두 번째 방문에도 여전히 만족스러운 경험을 드릴 수 있어 진심으로 기쁩니다. 특히 아이들이 좋아하는 메뉴 구성과 정성껏 준비한 반찬에 좋은 평가를 해주셔서 더욱 감사드립니다. 모든 연령대가 편안히 즐길 수 있는 공간을 만들기 위해 재료 선정부터 조리 과정까지 세심하게 관리하고 있습니다. 앞으로도 변함없이 신선하고 안전한 식재료만을 사용하여 고객 여러분의 기대에 부응하겠습니다. 애완동물 동반 없이 방문하시는 경우에도 편안히 머무를 수 있는 서비스 환경을 지속적으로 개선해 나가겠습니다. 다시 한 번 따뜻한 말씀 남겨주셔서 깊은 감사의 인사를 전합니다.',
      overlapOut: '[리뷰 18] (5.11.월) - bsbsjsj 주꾸미도 탱글하고 우렁쌈밥이랑 같이 먹으니까 조합이 진짜 좋았어요 😊 양념도 맛있고 한 끼 든든하게 잘 먹었습니다!'
    },
    {
      overlapIn: '[리뷰 18] (5.11.월) - bsbsjsj 주꾸미도 탱글하고 우렁쌈밥이랑 같이 먹으니까 조합이 진짜 좋았어요 😊 양념도 맛있고 한 끼 든든하게 잘 먹었습니다!',
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장에서 맛있는 식사를 즐기셨다니 진심으로 기쁩니다. 주꾸미 요리와 우렁쌈밥의 조합을 칭찬해주셔서 감사합니다. 신선한 재료와 정성 어린 양념으로 준비한 메뉴를 맛있게 드셨다니 더욱 보람을 느낍니다. 앞으로도 변함없이 건강하고 맛있는 해산물 요리를 제공하기 위해 최선을 다하겠습니다. 특히 계절별 특산물을 활용한 다채로운 메뉴를 선보일 예정이니 많은 관심 부탁드립니다. 소중한 시간 내어 주신 피드백은 앞으로의 서비스 개선에 큰 도움이 될 것입니다. 다시 찾아주시면 더 나은 모습으로 모시겠습니다. 감사합니다. [리뷰 19] (4.24.금) - 김새봄8593 몇달만에 왔어요!! 너무맛있네요!! 오삼불고기 시켰는데 딱 알맞게 맛있고 양도 많아요!!! ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장을 다시 찾아주시고 소중한 후기를 남겨주셔서 진심으로 감사드립니다. 오삼불고기 메뉴를 만족스럽게 즐기셨다니 기쁩니다. 신선한 재료와 정성 어린 조리를 통해 언제나 기대 이상의 맛을 전해드리기 위해 노력하고 있습니다. 앞으로도 변함없는 품질과 서비스로 보답드릴 것을 약속드리며, 다음 방문에서도 더욱 특별한 경험을 선사해 드릴 수 있도록 최선을 다하겠습니다. 따뜻한 말씀에 힘입어 더 나은 모습으로 찾아뵐게요. 감사합니다.',
      overlapOut: '[리뷰 20] (5.2.토) - Leesky'
    },
    {
      overlapIn: '[리뷰 20] (5.2.토) - Leesky',
      body: '어린이 대공원역 횟집 찾다가 방문했어요. 다들 친절하시고 한상차림 음식도 다양하게 나와서 좋아요! 다음에도 또 무조건 재방문 의사있습니다. 다들 꼭 방문해보세요!! ▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 저희 가게를 찾아주셔서 정말 감사합니다! 😊 한상차림 음식 다양하게 준비하고 친절하게 응대하려고 늘 노력하고 있는데, 좋게 봐주셔서 저희도 기분이 좋습니다. 앞으로도 변함없이 정성껏 준비할 테니 또 편하게 들러주세요! 다음에 또 봬겠습니다. 😊 [리뷰 21] (3.21.토) - 찜찜 2층으로 되어있어서 매장이 넓고 쾌적해요! 회도 신선하고 맛있어요! 기본으로 나오는 상차림이 푸짐해서 좋아요! 가격도 이정도면 괜찮은거같아요 어린이대공원역 근처에서 회 먹기엔 여기가 제일 나은거같아요 ㅎㅎ ▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 저희 매장이 넓고 쾌적하다는 점과 회가 신선하고 맛있다는 점, 그리고 푸짐한 기본 상차림까지 좋게 봐주셔서 정말 감사합니다! 어린이대공원역 근처에서 저희 매장이 제일 낫다고 말씀해주시니 운영하는 입장에서 정말 큰 힘이 됩니다. 앞으로도 지금처럼 신선하고 맛있는 회와 푸짐한 상차림으로 실망시켜드리지 않도록 더 열심히 준비하겠습니다. 언제든 편하게 다시 찾아주세요! 😊👍',
      overlapOut: '[리뷰 22] (4.25.토) - 핑쿠48 자연산광어회가 확실히 달라요! 완전 쫀득쫄깃맛있고매운탕도 살도 엄청 많고맛있어요! 기본으로 나오는 음식도 소라미나리무침이 진짜 맛있어요 이퀄리티에 이정도면 최고죠!!! 또올게요'
    },
    {
      overlapIn: '[리뷰 22] (4.25.토) - 핑쿠48 자연산광어회가 확실히 달라요! 완전 쫀득쫄깃맛있고매운탕도 살도 엄청 많고맛있어요! 기본으로 나오는 음식도 소라미나리무침이 진짜 맛있어요 이퀄리티에 이정도면 최고죠!!! 또올게요',
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장에서 자연산 광어회와 매운탕, 그리고 기본 반찬까지 만족스럽게 즐기셨다니 진심으로 감사드립니다. 신선한 재료와 정성 어린 조리를 통해 고객님께 최상의 맛을 전달드리기 위해 항상 노력하고 있습니다. 특히 자연산 광어회의 쫀득함과 매운탕의 풍부한 살코기, 소라미나리무침의 독특한 풍미를 좋게 평가해주셔서 더욱 기쁩니다. 앞으로도 변함없이 높은 품질의 식재료와 세심한 서비스로 보답드릴 것을 약속드립니다. 다시 찾아주신다면 더욱 특별한 경험을 선사하기 위해 최선을 다하겠습니다. 소중한 후기 감사합니다.',
      overlapOut: '[리뷰 23] (4.30.목) - zoo**** 해화로 진짜 너무 자주 가서 사장님이 얼굴 기억하실까 봐 겁나는 단골집입니다. 정갈한 음식 맛은 기본이고, 분위기가 너무 좋아서 술이 술술 들어가요. 건대에서 여기 안 가본 사람이랑은 겸상 안 합니다.'
    },
    {
      overlapIn: '[리뷰 23] (4.30.목) - zoo**** 해화로 진짜 너무 자주 가서 사장님이 얼굴 기억하실까 봐 겁나는 단골집입니다. 정갈한 음식 맛은 기본이고, 분위기가 너무 좋아서 술이 술술 들어가요. 건대에서 여기 안 가본 사람이랑은 겸상 안 합니다.',
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장을 특별한 단골로 아껴주시는 마음에 깊이 감사드립니다. 자주 찾아주시는 만큼 더욱 정성스러운 서비스와 변함없는 맛을 유지하기 위해 최선을 다하고 있습니다. 특히 정갈한 음식과 편안한 분위기를 좋게 평가해주셔서 기쁩니다. 앞으로도 고객님의 소중한 시간을 더욱 특별하게 만들어드릴 수 있도록 메뉴 개발과 서비스 개선에 힘쓰겠습니다. 건대 지역에서 저희를 모르는 이는 있어도 한 번만 오는 사람은 없을 만큼 사랑받는 공간이 되도록 노력하겠습니다. 다시 한번 소중한 말씀 남겨주셔서 진심으로 감사합니다. 언제든 편안히 찾아주세요. [리뷰 24] (4.16.목) - cn**** 봄도다리 세로회랑 해산물 세트 시켰어요 4명 배부르게 먹을 수 있는 양이에요!! 해산물도 너무 신선하고 도다리회도 맛있습니당 밑반찬도 많이 나와서 조아요 ▶ 사장님 답글: 안녕하세요! 해화로in수산이에요 🐟 봄도다리 세로회와 해산물 세트를 주문해주셨군요~ 푸짐한 양으로 4분이서 즐겁게 드셨다니 정말 기쁘네요 💕 신선한 해산물과 봄도다리 회 맛있게 즐겨주셔서 감사합니다 😊 밑반찬까지 다양하게 준비해드린 보람이 있네요! 다음에도 더 풍성하고 맛있는 메뉴로 찾아뵐게요~ 소중한 후기 남겨주셔서 진심으로 감사드려요 🌸 또 만나요~!'
    },
    {
      body: '[리뷰 25] (5.13.수) - starved 친구 추천으로 찾은 횟집! 스끼다시가 아주 넉넉해요! 특히 미나리 무침 넘 좋아 ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장을 추천해 주신 친구 분께 감사의 말씀을 전하며, 소중한 방문과 긍정적인 피드백에 깊이 감사드립니다. 스끼다시와 특히 미나리 무침까지 만족스럽게 즐기셨다니 기쁩니다. 신선한 재료와 정성 어린 조리를 기본으로 하며 고객님께 최상의 맛을 전달하기 위해 노력하고 있습니다. 앞으로도 계절별 특재료를 활용한 다양한 메뉴를 선보일 예정이니 많은 관심 부탁드립니다. 다시 한 번 귀한 시간 내어 찾아주신 점 진심으로 감사드리며, 더욱 특별한 경험을 드릴 수 있도록 최선을 다하겠습니다. [리뷰 26] (3.15.일) - 뚜기두밥 첫 방문이지만 숙성이 잘 된 회 잘 먹었습니다! 무엇보다 제가 회의 종류를 선택할 수 있는 점이 정말 맘에 들었어요! 같이 나온 상차림도 맛있고 먼저 배를 채우기에 모자람이 없었네용>_<회가 전혀 비리지 않고 매장도 쾌적하니 넓어서 근처 숙성회 식당 찾으시는 분들께 추천입니다~!!!',
      overlapOut: '▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 숙성이 잘 된 회와 다양한 회 종류 선택에 만족하셨다니 정말 기쁩니다! 😊 저희는 신선한 재료와 정성으로 준비하는 만큼, 맛있게 드셨다는 말씀에 큰 힘이 됩니다. 앞으로도 변함없이 좋은 맛과 쾌적한 환경으로 보답하겠습니다. 언제든 편하게 다시 찾아주세요! [리뷰 27] (5.9.토) - dla****'
    },
    {
      overlapIn: '▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 숙성이 잘 된 회와 다양한 회 종류 선택에 만족하셨다니 정말 기쁩니다! 😊 저희는 신선한 재료와 정성으로 준비하는 만큼, 맛있게 드셨다는 말씀에 큰 힘이 됩니다. 앞으로도 변함없이 좋은 맛과 쾌적한 환경으로 보답하겠습니다. 언제든 편하게 다시 찾아주세요! [리뷰 27] (5.9.토) - dla****',
      body: '처음 방문했는데 오삼불고기 너무 맛있네요!! 담엔 회먹으러 방문해봐야겠어용 오삼불고기 존맛!! ▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 소중한 방문과 함께 맛있는 경험을 공유해주셔서 진심으로 감사드립니다. 특히 오삼불고기의 맛을 칭찬해주셔서 기쁩니다. 저희 매장에서 제공하는 모든 메뉴는 신선한 재료와 정성 어린 조리를 원칙으로 하고 있습니다. 다음 방문 시에는 더욱 다양한 해산물 요리를 즐기실 수 있도록 최선을 다하겠습니다. 고객님의 기대에 부응할 수 있는 맛과 서비스로 보답드릴 것을 약속드리며, 다시 찾아주시는 그 날까지 변함없는 품질로 기다리겠습니다. 앞으로도 많은 관심 부탁드립니다. 감사합니다.',
      overlapOut: '[리뷰 28] (5.9.토) - 하늘57 직원분들도 친절하고 다양한 메뉴가 있어서 좋네요 ^^ 테이블도 많은 편입니당'
    },
    {
      overlapIn: '[리뷰 28] (5.9.토) - 하늘57 직원분들도 친절하고 다양한 메뉴가 있어서 좋네요 ^^ 테이블도 많은 편입니당',
      body: '▶ 사장님 답글: 안녕하세요, 해화로 in 수산입니다. 먼저 저희 매장을 찾아주시고 따뜻한 말씀 남겨주셔서 진심으로 감사드립니다. 직원들의 친절한 서비스와 다양한 메뉴 구성에 만족하셨다니 기쁘게 생각합니다. 특히 넉넉한 좌석 공간을 언급해주셨는데, 이는 고객님들께서 편안히 식사하실 수 있도록 마련한 부분으로 좋은 평가를 받아 더욱 뿌듯합니다. 앞으로도 계절별 신선한 재료를 활용한 다채로운 메뉴를 선보이며, 세심한 응대로 기억에 남는 식사 경험을 제공하기 위해 노력하겠습니다. 소중한 의견을 바탕으로 지속적으로 발전하는 모습을 보여드리겠습니다. 다시 한 번 감사드립니다. [리뷰 29] (4.4.토) - 키즈57 남편이 회가 먹고 싶다고 해서 왔는데 밤되니 너무 추워서 ㅠㅠㅠ 대기가 있어서 한 15분 기다린거 같네요.',
      overlapOut: '활어회 먹고 싶었는데 다 품절 되어 숙성회 먹었는데 지금 도다리 제철이라 맛있네요 ㅎ 고등어회도 맛나고 우선 확실히 회는 두툼해야 맛있는거 같아요 ㅎㅎ 스끼다시 많다고 해서 왔는데 생각보다 스끼다시는 많지 않네요 ㅎㅎ; (제가 맛집만 다니다 보니 기대치가 살짝 높았나봐요^^;) 암튼 회는 맛있었습니다^^ 오늘 전체적으로 추워서 ㅠㅠ 얼른 탕이 나오길✨'
    },
    {
      overlapIn: '활어회 먹고 싶었는데 다 품절 되어 숙성회 먹었는데 지금 도다리 제철이라 맛있네요 ㅎ 고등어회도 맛나고 우선 확실히 회는 두툼해야 맛있는거 같아요 ㅎㅎ 스끼다시 많다고 해서 왔는데 생각보다 스끼다시는 많지 않네요 ㅎㅎ; (제가 맛집만 다니다 보니 기대치가 살짝 높았나봐요^^;) 암튼 회는 맛있었습니다^^ 오늘 전체적으로 추워서 ㅠㅠ 얼른 탕이 나오길✨',
      body: '▶ 사장님 답글: 안녕하세요, 해화로in수산입니다. 밤에 오셨는데 추우셨다니 죄송한 마음입니다 ㅠㅠ 저희도 빨리 따뜻하게 해드릴 방법을 고민 중입니다. 숙성회와 두툼한 회를 맛있게 드셨다니 정말 다행입니다! 스끼다시가 기대에 못 미치셨다니 이 부분은 저희가 더 신경 써서 준비하도록 하겠습니다. 소중한 의견 주셔서 정말 감사합니다. 다음에는 더 따뜻하고 만족스러운 식사 경험을 드릴 수 있도록 노력하겠습니다. 언제든 편하게 다시 찾아주세요! 😊 [리뷰 30] (4.24.금) - 밋지이이입 항상 사람들로 넘쳐서 한 번은 와보고 싶었던 곳이에요. 드디어 오늘 왔네요. 식사 메뉴를 시켜봤는데 구성이 알차고 반찬이 하나하나 다 맛있어요. 다음에는 회 먹어보려고요. 좋습니다.'
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
