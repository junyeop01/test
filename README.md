# 사내 하이브리드 웹뷰 앱

회사 내부에서 사용하기 위한 하이브리드 웹뷰 앱입니다. 하나의 웹 서버(API + 반응형 웹앱)를 만들고, 모바일에서는 이를 WebView로 감싸서 앱처럼 사용합니다.

## 주요 기능

1. **회원가입 / 로그인** — 회원가입 시 상태가 `PENDING`이 되며, 관리자가 승인해야 로그인할 수 있습니다. (단, 시스템에 가입자가 한 명도 없을 때 첫 가입자는 자동으로 관리자로 승인됩니다.)
2. **자유게시판 / 공지게시판** — 자유게시판은 승인된 회원 누구나 글을 쓸 수 있고, 공지게시판은 관리자만 글을 쓸 수 있습니다.
3. **사진 등록** — 사진을 업로드하면 서버(sharp)에서 원본을 보존한 채 리사이즈본(최대 가로 1600px)과 썸네일(가로 320px)을 자동 생성합니다.

## 프로젝트 구조

```
server/   Express + TypeScript + Prisma(SQLite) API 서버 (빌드된 client도 함께 서빙)
client/   React + Vite 반응형 웹앱 (모바일 웹뷰에 최적화된 UI)
mobile/   Expo(React Native) WebView 래퍼 — 실제 하이브리드 앱 셸
```

## 로컬 개발 실행

### 1. 서버

```bash
cd server
cp .env.example .env   # JWT_SECRET 등 값 수정
npm install
npx prisma migrate dev
npm run dev             # http://localhost:4000
```

### 2. 클라이언트 (개발 모드)

```bash
cd client
npm install
npm run dev              # http://localhost:5173 (server API로 프록시됨)
```

### 3. 모바일 래퍼 (Expo)

```bash
cd mobile
npm install
# app.json 의 extra.serverUrl 을 배포된 서버 주소로 설정
npm start
```

## 프로덕션 배포 (단일 서버)

`client`를 빌드하면 `server`가 정적 파일까지 함께 서빙하므로 배포 시 컨테이너 하나로 API + 웹앱을 모두 제공합니다.

```bash
docker compose up -d --build
```

`docker-compose.yml`은 `JWT_SECRET` 환경변수를 요구하므로, 루트에 `.env` 파일을 만들어 값을 지정하세요.

```
JWT_SECRET=매우-긴-랜덤-문자열
```

배포 후 모바일 앱(`mobile/app.json`의 `extra.serverUrl`)이 이 서버 주소를 가리키도록 설정하고 Expo로 빌드/배포하면 됩니다.

## 관리자 승인 흐름

1. 사용자가 회원가입하면 상태가 `PENDING`으로 저장됩니다.
2. 관리자 계정으로 로그인 후 `관리자 > 회원 승인 관리` 메뉴에서 대기 중인 회원을 승인/거절합니다.
3. 승인된 회원만 로그인할 수 있습니다.

## 참고

- 최초 관리자 계정은 별도 시딩 없이, **가장 먼저 회원가입하는 계정이 자동으로 관리자 + 승인 상태**가 되도록 구현했습니다. 운영 환경 배포 시 가장 먼저 관리자 계정으로 가입하세요.
- 데이터베이스는 기본적으로 SQLite 파일(`server/data/dev.db`)을 사용합니다. 사용자 규모가 커지면 `DATABASE_URL`을 PostgreSQL 등으로 교체하고 Prisma datasource provider를 변경하면 됩니다.
