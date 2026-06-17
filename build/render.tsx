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
  .demo-rb-action{margin-top:14px;width:100%}
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

function rbDetailPage(kind: 'info' | 'reviews'): string {
  const isInfo = kind === 'info';
  const infoPreview = `
        <div class="section-label">Document Preview</div>
        <div class="doc-preview">
          <div class="doc-preview-head"><div class="doc-preview-title">info_해화로in수산.docx</div><div class="doc-preview-note">원문 일부 표시</div></div>
          <div class="doc-section">
            <h3>기본 정보</h3>
            <ul>
              <li>상호명: 해화로in수산</li>
              <li>업종: 음식점 &gt; 일식 &gt; 생선회</li>
              <li>주소: 서울 광진구 광나루로 383 1,2층</li>
              <li>전화: 0507-1359-5863</li>
            </ul>
          </div>
          <div class="doc-section">
            <h3>매장 소개</h3>
            <p>해화로는 신선한 재료를 엄선해 자연 그대로의 깊은 맛을 전하며, 싱싱한 회부터 정갈한 식사와 계절 해산물 요리까지 정성껏 준비하는 매장입니다. AI 요약 기준 핵심 문구는 “신선한 대방어의 겨울철 진미”입니다.</p>
          </div>
          <div class="doc-section">
            <h3>영업시간 및 이용 정보</h3>
            <p>월-목 11:20-23:30, 금-토 11:20-24:00, 일 11:20-23:30 기준으로 안내합니다. 평일 브레이크타임은 14:30-16:30이며 단체 이용, 예약, 무선 인터넷, 남/녀 화장실 구분, 유아의자, 대기공간, 포장, 배달 정보를 포함합니다.</p>
          </div>
          <div class="doc-section">
            <h3>대표 메뉴</h3>
            <p>모듬 회ㆍ산물, 속초식 항아리 물회, 초신선 활어 3종 스페셜, 화덕 모듬 생선구이 쌈밥, 프리미엄 고등어 화덕구이 정찬 등이 챗봇 추천 응답의 기준 메뉴로 등록됩니다.</p>
          </div>
        </div>`;
  const reviewPreview = `
        <div class="section-label">Document Preview</div>
        <div class="doc-preview">
          <div class="doc-preview-head"><div class="doc-preview-title">reviews_해화로in수산.docx</div><div class="doc-preview-note">리뷰 원문 샘플 · 약 3회 스크롤 분량</div></div>
          <div class="review-entry"><div class="review-meta">#001<br>2026.06<br>방문자</div><div class="review-body">회가 정말 신선하고 구성도 알차요. 모듬 회ㆍ산물 주문했는데 해산물 종류가 다양해서 여러 명이 나눠 먹기 좋았습니다.<div class="reply">사장님 답글: 신선한 재료로 보답드리겠습니다. 방문해주셔서 감사합니다.</div></div></div>
          <div class="review-entry"><div class="review-meta">#014<br>2026.05<br>방문자</div><div class="review-body">어린이대공원역 근처에서 회 먹고 싶을 때 추천할 만합니다. 직원분들이 설명을 잘 해주고, 물회가 시원해서 점심 식사로도 괜찮았어요.</div></div>
          <div class="review-entry"><div class="review-meta">#027<br>2026.05<br>방문자</div><div class="review-body">숙성회 식감이 좋고 밑반찬도 깔끔했습니다. 예약하고 가니 자리 안내가 빨랐고, 단체 모임으로 다시 방문하고 싶어요.<div class="reply">사장님 답글: 모임 자리도 편하게 이용하실 수 있도록 준비해두겠습니다.</div></div></div>
          <div class="review-entry"><div class="review-meta">#039<br>2026.04<br>방문자</div><div class="review-body">생선구이 쌈밥이 생각보다 든든해서 점심 메뉴로 좋았습니다. 회 메뉴뿐 아니라 식사 메뉴가 다양해서 같이 간 사람들 취향 맞추기 쉬웠습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#052<br>2026.04<br>방문자</div><div class="review-body">대방어 시즌에 방문했는데 기름지고 고소한 맛이 좋았습니다. 콜키지도 가능해서 와인 가져가서 먹기 좋았고, 직원 응대도 친절했습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#066<br>2026.03<br>방문자</div><div class="review-body">주차는 주변 공영주차장 안내를 받았습니다. 매장 위치가 역에서 가까워서 대중교통으로 가기 편했고, 예약 링크로 미리 잡고 가는 게 좋아 보여요.</div></div>
          <div class="review-entry"><div class="review-meta">#078<br>2026.03<br>방문자</div><div class="review-body">속초식 항아리 물회가 새콤하고 시원합니다. 양도 넉넉해서 둘이 먹기 좋았고, 회덮밥이나 생선구이 같은 식사 메뉴도 같이 주문하기 좋았습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#091<br>2026.02<br>방문자</div><div class="review-body">아이 의자가 있고 좌석 간격도 괜찮았습니다. 가족 식사로 방문했는데 직원분이 메뉴 추천을 잘 해줘서 처음 방문해도 고르기 쉬웠습니다.<div class="reply">사장님 답글: 가족 식사 자리도 만족하실 수 있도록 더 세심히 챙기겠습니다.</div></div></div>
          <div class="review-entry"><div class="review-meta">#100<br>2026.02<br>방문자</div><div class="review-body">해산물 모듬 구성이 푸짐하고 신선했습니다. 회, 물회, 생선구이까지 메뉴 폭이 넓어서 챗봇에서 상황별 추천 답변을 만들기에 좋은 리뷰 데이터입니다.</div></div>
          <div class="review-entry"><div class="review-meta">#112<br>2026.01<br>방문자</div><div class="review-body">처음 방문해서 직원분께 추천을 받았는데 모듬 회와 물회 조합이 좋았습니다. 회가 두툼하고 신선해서 부모님도 만족하셨어요. 네이버 예약으로 잡고 가면 대기 부담이 적을 것 같습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#126<br>2026.01<br>방문자</div><div class="review-body">저녁 시간에는 손님이 많아서 예약을 추천합니다. 회 메뉴 외에도 생선구이, 쌈밥, 알곤이탕처럼 식사류가 있어서 술자리와 식사를 모두 커버할 수 있는 점이 좋았습니다.<div class="reply">사장님 답글: 방문 시간에 맞춰 더 편하게 안내드릴 수 있도록 준비하겠습니다.</div></div></div>
          <div class="review-entry"><div class="review-meta">#139<br>2025.12<br>방문자</div><div class="review-body">대방어가 고소하고 신선했습니다. 겨울 메뉴를 찾는 사람에게 추천하기 좋고, 기본 반찬도 깔끔해서 회 맛을 해치지 않았습니다. 다음에는 숙성회 메뉴도 먹어보고 싶어요.</div></div>
          <div class="review-entry"><div class="review-meta">#151<br>2025.12<br>방문자</div><div class="review-body">포장해서 먹었는데 포장 상태가 깔끔했습니다. 매장에서 먹을 때와 다르게 집에서 먹어도 회 신선도가 유지됐고, 구성 설명을 잘 해주셔서 가족들과 나눠 먹기 편했습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#164<br>2025.11<br>방문자</div><div class="review-body">어린이대공원역에서 가까워 약속 장소로 잡기 좋았습니다. 회식으로 갔는데 메뉴가 다양해 회를 못 먹는 사람도 생선구이나 식사류를 선택할 수 있어 만족도가 높았습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#177<br>2025.11<br>방문자</div><div class="review-body">물회 국물이 시원하고 회 양도 괜찮았습니다. 점심에 빠르게 먹기 좋은 메뉴가 많아서 근처 직장인이나 가족 단위 손님에게 모두 맞을 것 같아요.</div></div>
          <div class="review-entry"><div class="review-meta">#189<br>2025.10<br>방문자</div><div class="review-body">좌석이 깔끔하고 대기공간이 있어서 모임 전에 기다리기 괜찮았습니다. 단체 이용 가능 여부와 예약 가능 여부를 챗봇에서 바로 알려주면 손님 입장에서는 편할 것 같습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#201<br>2025.10<br>방문자</div><div class="review-body">매운탕이 얼큰하고 마무리로 좋았습니다. 회를 먹고 난 뒤 추가하기 좋은 메뉴를 물어보면 매운탕, 알곤이탕, 생선구이 같은 답변이 나오면 자연스러울 것 같아요.<div class="reply">사장님 답글: 마무리 메뉴까지 만족하셨다니 감사합니다. 더 따뜻한 식사로 준비하겠습니다.</div></div></div>
          <div class="review-entry"><div class="review-meta">#218<br>2025.09<br>방문자</div><div class="review-body">인스타그램에서 보고 방문했습니다. 사진으로 본 메뉴와 실제 구성이 비슷했고, 해산물 모듬은 여러 가지를 한 번에 먹을 수 있어서 첫 방문 메뉴로 좋았습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#233<br>2025.09<br>방문자</div><div class="review-body">콜키지가 가능해서 와인 모임으로 방문했습니다. 회와 해산물 메뉴가 와인과 잘 맞았고, 직원분이 접시와 자리 정리를 빠르게 도와줘서 편하게 이용했습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#247<br>2025.08<br>방문자</div><div class="review-body">아이와 함께 갔는데 유아의자가 있어 편했습니다. 매장 분위기가 너무 시끄럽지 않고, 메뉴 설명이 자세해서 가족 식사 장소로 추천할 수 있을 것 같아요.</div></div>
          <div class="review-entry"><div class="review-meta">#261<br>2025.08<br>방문자</div><div class="review-body">전체적으로 신선도, 응대, 메뉴 폭이 장점으로 느껴졌습니다. 주차는 주변 주차장 안내를 미리 확인하면 좋고, 예약 후 방문하면 더 편하게 이용할 수 있습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#274<br>2025.07<br>방문자</div><div class="review-body">회 초보자도 부담 없이 고를 수 있게 메뉴 구성이 설명되어 있었습니다. 물회처럼 시원한 메뉴와 구이 메뉴를 함께 추천하면 다양한 취향을 가진 손님에게 맞을 것 같습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#286<br>2025.07<br>방문자</div><div class="review-body">직원분이 오늘 좋은 생선과 추천 메뉴를 알려주셔서 좋았습니다. 챗봇에서도 “오늘 추천 메뉴”, “처음 방문 추천” 질문에 비슷한 톤으로 답하면 유용할 것 같아요.</div></div>
          <div class="review-entry"><div class="review-meta">#298<br>2025.06<br>방문자</div><div class="review-body">포장과 배달도 가능하다고 안내받았습니다. 집에서 먹을 메뉴를 찾는 사람에게 회 포장, 물회, 생선구이 정찬을 상황에 맞춰 알려주면 좋겠습니다.</div></div>
          <div class="review-entry"><div class="review-meta">#312<br>2025.06<br>방문자</div><div class="review-body">재방문 의사가 있습니다. 회 신선도와 식사 메뉴 선택지가 장점이고, 역 근처라 약속 잡기 편했습니다. 예약, 주차, 대표 메뉴 정보를 한 번에 안내받으면 편할 것 같습니다.</div></div>
        </div>`;
  const infoChunks = `
            <div class="chunk active"><strong>Chunk 001 · 기본 정보</strong>상호명, 업종, 주소, 전화번호를 하나의 검색 단위로 묶어 위치/전화/매장명 질문에 바로 매칭합니다.<small>tokens 128 · source: 기본 정보</small></div>
            <div class="chunk"><strong>Chunk 006 · 영업시간</strong>요일별 영업시간과 브레이크타임을 분리해 “오늘 몇 시까지?”, “점심 가능?” 질문에 사용합니다.<small>tokens 176 · source: 영업시간</small></div>
            <div class="chunk"><strong>Chunk 014 · 메뉴 추천</strong>모듬 회ㆍ산물, 항아리 물회, 활어 3종, 생선구이 쌈밥을 메뉴 추천 후보로 보관합니다.<small>tokens 214 · source: 메뉴판</small></div>
            <div class="chunk"><strong>Chunk 021 · 편의시설</strong>예약, 단체 이용, 유아의자, 포장, 배달, 콜키지 가능 여부를 이용조건 답변에 연결합니다.<small>tokens 165 · source: 편의시설</small></div>`;
  const reviewChunks = `
            <div class="chunk active"><strong>Chunk 043 · 신선도/회 품질</strong>회가 신선하고 숙성회 식감이 좋다는 리뷰를 묶어 메뉴 추천과 품질 신뢰 답변에 사용합니다.<small>tokens 238 · reviews #001, #027, #052</small></div>
            <div class="chunk"><strong>Chunk 057 · 물회/점심 식사</strong>속초식 항아리 물회, 생선구이 쌈밥, 회덮밥 등 점심 식사 가능성을 묻는 질문에 연결합니다.<small>tokens 252 · reviews #014, #039, #078</small></div>
            <div class="chunk"><strong>Chunk 063 · 모임/예약</strong>예약 후 자리 안내, 단체 모임, 직원 메뉴 설명 리뷰를 묶어 회식/가족모임 추천에 사용합니다.<small>tokens 241 · reviews #027, #091</small></div>
            <div class="chunk"><strong>Chunk 071 · 접근성/주차</strong>어린이대공원역, 주변 공영주차장, 대중교통 접근성 리뷰를 매장 방문 안내 답변에 사용합니다.<small>tokens 208 · reviews #066</small></div>
            <div class="chunk"><strong>Chunk 088 · 고객 응대</strong>직원 응대와 사장님 답글이 포함된 리뷰를 친절도/서비스 톤 질문의 보조 근거로 연결합니다.<small>tokens 229 · reviews #001, #091</small></div>
            <div class="chunk"><strong>Chunk 104 · 종합 추천</strong>해산물 모듬 구성, 메뉴 폭, 재방문 의사를 종합해 “처음 가면 뭐 먹을까?” 답변 후보로 사용합니다.<small>tokens 264 · reviews #100</small></div>`;
  return shellPage(
    isInfo ? 'info 파일 벡터 임베딩 설정' : 'review 파일 벡터 임베딩 설정',
    `<div class="rb-shell">
  <aside class="rb-side">
    <div class="rb-brand">RB Dialog</div>
    <div class="rb-bot"><div class="rb-bot-name">해화로in수산 챗봇</div><div class="rb-bot-meta">Knowledge detail</div></div>
    <nav class="rb-nav">
      <a href="#">대시보드</a><a href="#" class="active">지식 관리</a><a href="#">대화 이력</a><a href="#">배포 설정</a>
    </nav>
  </aside>
  <main class="rb-main">
    <div class="rb-top">
      <div><div class="rb-kicker">Vector Embedding</div><h1>${isInfo ? '업체 정보 문서 설정' : '방문자 리뷰 문서 설정'}</h1><p class="rb-desc">${isInfo ? '매장 기본정보 문서를 챗봇 답변의 기준 지식으로 사용합니다.' : '리뷰 문서를 고객 질문의 분위기와 추천 답변 근거로 사용합니다.'}</p></div>
      <button class="rb-btn secondary">목록으로</button>
    </div>
    <div class="detail-layout">
      <section class="doc-card">
        <div class="doc-title">${isInfo ? 'info_해화로in수산.docx' : 'reviews_해화로in수산.docx'}</div>
        <div class="doc-meta"><span class="badge green">임베딩 완료</span><span class="badge blue">${isInfo ? '업체 정보' : '리뷰 모음'}</span><span class="badge gray">text-embedding-3-small</span></div>
        <div class="form-row"><div class="form-label">문서 설명</div><div class="form-value">${isInfo ? '상호명, 업종, 위치, 영업시간, 메뉴, 예약, 주차, 편의시설 정보를 포함합니다.' : '방문자 리뷰 100개, 리뷰 작성일, 사장님 답글, 주요 만족/불편 키워드를 포함합니다.'}</div></div>
        <div class="form-row"><div class="form-label">검색 범위</div><div class="form-value">해화로in수산 챗봇 전용 지식베이스</div></div>
        <div class="form-row"><div class="form-label">청크 설정</div><div class="form-value">chunk size 800 · overlap 120 · Korean sentence boundary</div></div>
        <div class="form-row"><div class="form-label">답변 우선순위</div><div class="form-value">${isInfo ? '영업시간, 위치, 예약, 메뉴 질문에 최우선 사용' : '메뉴 추천, 방문 경험, 분위기 질문에 보조 근거로 사용'}</div></div>
${isInfo ? infoPreview : reviewPreview}
      </section>
      <aside class="doc-card doc-inspector">
        <div class="vector-box">
          <div class="vector-title">청크 검사</div>
          <div class="progress"><span></span></div>
          <div class="scroll-hint">문서 원문과 연결되는 검색 단위입니다. 실제 데이터 전체 대신 데모 확인에 필요한 대표 청크만 표시합니다.</div>
          <div class="chunk-list">
${isInfo ? infoChunks : reviewChunks}
          </div>
        </div>
        <button type="button" class="rb-btn demo-rb-action">${isInfo ? 'review 파일 보기' : '챗봇 구현 확인하기'}</button>
      </aside>
    </div>
  </main>
</div>`,
    rbStyles()
  );
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
