---
name: auto-setup
description: 프로젝트를 분석하고 맞춤 인터뷰를 통해 CLAUDE.md, rules, skills를 자동 생성
---

이 스킬이 호출되면 즉시 아래 작업을 수행하세요.

# Step 1: 프로젝트 분석

지금 바로 Agent 도구를 사용하여 `setup-analyzer` 에이전트를 호출하세요.
description: "프로젝트 분석"
prompt: "현재 프로젝트를 분석해주세요. Glob으로 루트의 설정 파일들(package.json, pom.xml, build.gradle, go.mod, Cargo.toml, requirements.txt, pyproject.toml 등)을 찾고, Read로 핵심 설정 파일 내용을 확인하세요. Glob으로 src/, app/, pages/, routes/, controllers/ 등 주요 디렉토리 구조를 파악하세요. 기존 CLAUDE.md 파일과 .claude/ 디렉토리 존재 여부도 확인하세요. 아래 형식으로 분석 결과를 반환해주세요: 언어, 프레임워크, 프로젝트 타입, 패키지 매니저, 테스트 프레임워크, 아키텍처 패턴, 주요 디렉토리, DB/ORM, 인증 방식, 기존 .claude/ 파일 목록"

분석 결과를 받으면 사용자에게 요약해서 보여주세요.

기존 CLAUDE.md 또는 .claude/ 디렉토리가 있으면 AskUserQuestion으로 물어보세요:
- "기존 Claude 설정이 있습니다. 어떻게 처리할까요? (1: 덮어쓰기 2: 머지 3: 스킵)"

# Step 2: 맞춤 인터뷰

Agent 도구를 사용하여 `setup-interviewer` 에이전트를 호출하세요.
description: "맞춤 인터뷰"
prompt에 반드시 포함할 것:
- Step 1의 분석 결과 전체 텍스트 (언어, 프레임워크, 구조, 기술 스택 등)
- "위 분석 결과를 바탕으로 이 프로젝트에 맞는 맞춤 인터뷰를 진행해주세요. 프레임워크에 맞는 질문을 하고 인터뷰 결과를 정해진 형식으로 반환해주세요."

인터뷰 결과를 받으면 사용자에게 간단히 요약하여 보여주세요.

# Step 3: 파일 생성

Agent 도구를 사용하여 `setup-generator` 에이전트를 호출하세요.
description: "설정 파일 생성"
prompt에 반드시 포함할 것:
- Step 1의 분석 결과 전체 텍스트
- Step 2의 모든 질문과 답변
- 기존 파일 처리 방식 (덮어쓰기/머지/스킵)
- "다음 파일들을 생성해주세요: 1) 프로젝트 루트에 CLAUDE.md 2) .claude/rules/ 아래에 프로젝트 규칙 파일들 3) 인터뷰에서 파악된 반복 작업이 있으면 .claude/skills/ 아래에 스킬 파일. 모든 내용은 한국어로, 이 프로젝트에 구체적인 내용을 작성하세요. 범용적인 문구는 사용하지 마세요."

# Step 4: 검증

Agent 도구를 사용하여 `setup-reviewer` 에이전트를 호출하세요.
description: "생성 파일 검증"
prompt에 분석 결과, 인터뷰 결과, 생성된 파일 목록을 포함하세요.

검증 결과가 NEEDS_IMPROVEMENT이면:
- 아래 내용을 모두 포함하여 setup-generator를 다시 호출하세요 (최대 2회까지만 반복):
  - Step 1의 분석 결과 전체 텍스트
  - Step 2의 인터뷰 결과 전체 텍스트
  - 기존 파일 처리 방식
  - Reviewer의 피드백 내용 전체 (개선 필요 사항 목록)
  - "위 피드백을 반영하여 해당 파일들을 수정해주세요."

# Step 5: 완료 보고

생성된 파일 목록과 각 파일의 간단한 설명을 한국어로 보여주세요.

지금 즉시 Step 1부터 시작하세요. 요약하거나 계획만 말하지 말고, Agent 도구를 호출하세요.
