import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import confetti from "canvas-confetti";

// SVG 픽토그램 컴포넌트
const CupPictogram = ({ step }) => {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <g stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 30 15 L 70 15 L 72 23 L 28 23 Z" />
        <rect x="22" y="23" width="56" height="8" rx="2" />
        <path d="M 26 31 L 74 31 L 64 85 L 36 85 Z" />

        {step === 0 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <path d="M 29 46 L 71 46" />
            <path d="M 32 66 L 68 66" />
            <circle cx="50" cy="56" r="5" />
          </motion.g>
        )}

        {step === 1 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.line
              x1="25" y1="40" x2="75" y2="40"
              stroke="#3B82F6" strokeWidth="3"
              animate={{ y: [0, 35, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </motion.g>
        )}

        {step === 2 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.path
              d="M 40 60 L 48 68 L 62 50"
              stroke="#34D399" strokeWidth="5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.g>
        )}

        {step === 3 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              style={{ originX: "50px", originY: "58px" }}
              stroke="#F59E0B"
            >
              <path d="M 40 50 L 60 50 L 50 66 Z" fill="none" strokeWidth="4" />
              <path d="M 40 50 L 45 45 M 60 50 L 65 55 M 50 66 L 45 71" strokeWidth="4" />
            </motion.g>
          </motion.g>
        )}
      </g>
    </svg>
  );
};

export default function GreenCodeLanding() {
  const scrollAreaRef = useRef(null);

  const { scrollYProgress: scrollRatio } = useScroll({
    target: scrollAreaRef,
    offset: ["start start", "end end"],
  });

  const cupScale = useTransform(scrollRatio, [0, 0.7, 0.85, 1], [1, 1, 0.95, 1]);
  
  const [stepInfo, setStepInfo] = useState({
    step: 0,
    label: "투입 대기",
    accent: "#10B981",
  });

  // 버튼 참여 상태 및 컵 카운팅 상태
  const [isParticipated, setIsParticipated] = useState(false);
  const [cupsCount, setCupsCount] = useState(1); // 만약 DB에서 못 불러오면 이 숫자가 기본값

  const BIN_ID = "6a8f2b80f5f4af5e2945e3f3 "; 
  const API_KEY = "$2a$10$a90ov8qF9Iwx9AxDyQuliu8mrG7L0j0yqYLN9BbrlKcQpgRgOHFLy";

  // 페이지 처음 들어왔을 때 DB에서 숫자 불러오기
  useEffect(() => {
    const fetchGlobalCount = async () => {
      try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
          headers: {
            "X-Master-Key": API_KEY
          }
        });
        const data = await response.json();
        
        // 에러 없이 잘 불러왔으면 화면 숫자 업데이트
        if (data.record && data.record.cupsCount !== undefined) {
          setCupsCount(data.record.cupsCount);
        }
      } catch (error) {
        console.error("데이터를 불러오지 못했습니다.", error);
      }
    };

    // 만약 BIN_ID와 API_KEY를 아직 입력 안 했다면 실행 안 함
    if (BIN_ID !== "여기에_Bin_ID_입력") {
      fetchGlobalCount();
    }
  }, []);

  // 컵 개수를 기반으로 나머지 수치 자동 계산
  const co2Reduced = cupsCount * 15; 
  const treesPlanted = Math.floor(cupsCount * 0.03478); 

  // 실천하기 버튼 클릭 시 로직
  const handleParticipate = async () => {
    if (!isParticipated) {
      setIsParticipated(true);
      
      confetti({
        particleCount: 100, // 폭죽 조각 개수
        spread: 70,         // 퍼지는 각도
        origin: { y: 0.6 }  // 화면의 살짝 아래쪽에서 터지도록 위치 조정
      });

      const newCount = cupsCount + 1;
      setCupsCount(newCount); // 1. 화면 즉시 반영 (빠른 피드백)

      // 2. DB(JSONBin) 업데이트
      if (BIN_ID !== "여기에_Bin_ID_입력") {
        try {
          await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ cupsCount: newCount })
          });
        } catch (error) {
          console.error("데이터 업데이트에 실패했습니다.", error);
        }
      }
    }
  };

  useEffect(() => {
    return scrollRatio.onChange((currentPos) => {
      if (currentPos < 0.25) {
        setStepInfo({ step: 0, label: "수거함 안착", accent: "#10B981" });
      } else if (currentPos < 0.5) {
        setStepInfo({ step: 1, label: "AI 정밀 검사 중", accent: "#3B82F6" });
      } else if (currentPos < 0.75) {
        setStepInfo({ step: 2, label: "인증 및 리워드 발급", accent: "#34D399" });
      } else {
        setStepInfo({ step: 3, label: "수거 완료 및 자원 순환", accent: "#F59E0B" });
      }
    });
  }, [scrollRatio]);

  const [activeFaq, setActiveFaq] = useState(null);
  const handleFaqClick = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const teamMembers = ["양시환", "진승호", "이현우", "손범수", "장효준", "장건웅"];

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css');

        :root {
          --page-bg: #F8FAFC;
          --surface-dark: #064E3B;
          --font-primary: #0F172A;
          --font-secondary: #475569;
          --brand-light: #D1FAE5;
          --brand-color: #10B981;
          --brand-dark: #047857;
          --olive-btn: #7A8B43;
          --divider: rgba(15, 23, 42, 0.08);
        }

        body {
          margin: 0; background: var(--page-bg); color: var(--font-primary);
          font-family: 'Pretendard Variable', sans-serif; overflow-x: hidden;
        }

        .navbar {
          position: fixed; top: 0; width: 100%; z-index: 50;
          padding: 16px 24px; backdrop-filter: blur(10px);
          background: rgba(248, 250, 252, 0.8); border-bottom: 1px solid var(--divider);
          display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;
        }

        /* 공통 폰트 사이즈 클래스 */
        .desc-text {
          color: var(--font-secondary);
          font-size: 1.15rem;
          line-height: 1.6;
          word-break: keep-all;
        }
        @media (min-width: 768px) {
          .desc-text { font-size: 1.25rem; }
        }

        /* 공통 소제목(Eyebrow) 클래스 */
        .eyebrow-text {
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        /* 표지 영역 */
        .intro-header { 
          padding: 120px 24px; 
          text-align: center; 
          max-width: 1000px; 
          margin: 0 auto; 
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .intro-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--font-primary);
          line-height: 1.35;
          word-break: keep-all;
          margin-bottom: 24px;
        }
        
        @media (min-width: 768px) {
          .intro-title { font-size: 3.5rem; }
        }

        .crew-list {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
          max-width: 700px; margin: 40px auto 0;
        }
        
        .crew-badge {
          background: #fff; border: 1px solid var(--divider); border-radius: 99px; 
          padding: 10px 24px; font-weight: 600; color: var(--brand-dark);
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .project-background { padding: 80px 24px; background: var(--page-bg); text-align: center; }
        .bg-cards-container { display: flex; flex-direction: column; gap: 24px; align-items: center; margin-top: 40px; }
        @media (min-width: 768px) { .bg-cards-container { flex-direction: row; align-items: stretch; } }
        .bg-card { background: #fff; padding: 40px 30px; border-radius: 20px; border: 1px solid var(--divider); flex: 1; box-shadow: 0 4px 20px rgba(0,0,0,0.02); text-align: left; }
        .bg-card h3 { color: var(--brand-dark); font-size: 1.3rem; font-weight: 800; margin-bottom: 20px; text-align: center; }
        .bg-arrow { font-size: 2rem; color: var(--brand-color); display: flex; align-items: center; justify-content: center; font-weight: bold; }
        @media (max-width: 767px) { .bg-arrow { transform: rotate(90deg); margin: 10px 0; } }

        .problem-section {
          padding: 100px 24px; background: #fff; text-align: center; border-top: 1px solid var(--divider);
        }
        .problem-cards {
          display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 40px;
        }
        .problem-card {
          background: var(--page-bg); padding: 32px 24px; border-radius: 20px; 
          border: 1px solid var(--divider); flex: 1; min-width: 260px; max-width: 320px;
        }

        .interactive-section { display: flex; flex-direction: column; background: var(--surface-dark); color: #fff; }
        @media (min-width: 768px) { .interactive-section { flex-direction: row; } }

        .guide-text { flex: 1; padding: 5% 10%; }
        .fixed-visual {
          flex: 1; position: sticky; top: 0; height: 100vh;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
        }

        .scroll-step { height: 100vh; display: flex; align-items: center; }
        
        .data-metrics {
          padding: 120px 24px; background: var(--page-bg); text-align: center; border-top: 1px solid var(--divider);
        }
        .metrics-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;
          max-width: 900px; margin: 40px auto 0;
        }
        .metric-card {
          background: #fff; padding: 30px; border-radius: 20px;
          border: 1px solid var(--divider); box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        
        .details-section { padding: 100px 24px; max-width: 800px; margin: 0 auto; }
        
        .qna-box {
          border-bottom: 1px solid var(--divider); padding: 20px 0; cursor: pointer;
        }
        .qna-title { font-size: 1.2rem; font-weight: 700; color: var(--font-primary); display: flex; justify-content: space-between; }
        .qna-body { margin-top: 10px; color: var(--font-secondary); font-size: 1.05rem; line-height: 1.6; }
      `}</style>

      {/* 내비게이션 */}
      <div className="navbar">
        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--font-primary)" }}>
          Green<span style={{ color: "var(--brand-color)" }}>Code</span>
        </div>
      </div>

      {/* 1. 헤더 (표지) 구역 */}
      <div className="intro-header">
        <div className="eyebrow-text" style={{ color: "var(--brand-color)", marginBottom: "24px" }}>
          GREENCODE CAMPUS PROJECT
        </div>
        <h1 className="intro-title">
          우리가 버린 일회용 컵,<br />
          다시 자원이 될 수 있을까요?
        </h1>
        <p className="desc-text" style={{ marginTop: "24px" }}>
          스마트 렌즈가 단 1초 만에 판별합니다.<br />
          오염되지 않은 컵만 선별하는 똑똑한 캠퍼스 분리수거 솔루션입니다.
        </p>

        <div className="crew-list">
          {teamMembers.map((member, index) => (
            <div className="crew-badge" key={index}>
              {member}
            </div>
          ))}
        </div>
      </div>

      {/* 프로젝트 시작 배경 */}
      <div className="project-background">
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="eyebrow-text" style={{ color: "var(--brand-color)", marginBottom: "16px" }}>
            PROJECT BACKGROUND
          </div>
          <div className="bg-cards-container">
            <div className="bg-card">
              <h3>해결하고자 하는 문제</h3>
              <p className="desc-text" style={{ textAlign: "left" }}>
                교내 카페 컵 배출 시 이물질이 무분별하게 섞여 재활용률이
                저하되는 상황입니다. 개인의 분리배출 노력이 어떤 실질적 변화를
                만드는지 체감하기 어려워 잘못된 배출이 반복되고 있습니다.
              </p>
            </div>

            <div className="bg-arrow">➔</div>

            <div className="bg-card">
              <h3>문제를 해결하고자 하는 이유</h3>
              <p className="desc-text" style={{ textAlign: "left" }}>
                단순한 계도나 개인의 선의에만 의존하는 캠페인은 인식 변화를
                이끌어내기 어렵습니다. 따라서 AI를 통한 피드백 체험, 시각적
                애니메이션, 그리고 게이미피케이션이 결합될 때 이용자가
                자발적으로 한 번씩이라도 분리배출에 동참하게 될 것입니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 문제 인식 (Our Mission) 구역 */}
      <div className="problem-section">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="eyebrow-text" style={{ color: "var(--brand-color)", marginBottom: "16px" }}>
            OUR MISSION
          </div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--font-primary)", marginBottom: "24px", lineHeight: 1.4, wordBreak: "keep-all" }}>
            열심히 분리배출해도<br />
            재활용이 어려운 이유
          </h2>
          <p className="desc-text">
            컵 안에 남은 얼음 한 조각, 무심코 꽂아둔 종이 홀더 하나 때문에 기껏
            모은 플라스틱 컵들이 전부 소각장으로 향한다는 사실을 알고
            계셨습니까?
            <br />
            그린코드는 누군가의 '귀찮음' 때문에 버려지는 자원들을 '기술'을 통해
            구출하고자 합니다.
          </p>

          <div className="problem-cards">
            <div className="problem-card">
              <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🧊</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px", color: "var(--font-primary)" }}>
                남은 음료와 얼음
              </h3>
              <p className="desc-text">
                재활용 공정 기계를 고장 내거나 심한 악취를 유발해 재활용률을
                떨어뜨립니다.
              </p>
            </div>
            <div className="problem-card">
              <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>📝</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px", color: "var(--font-primary)" }}>
                종이 홀더
              </h3>
              <p className="desc-text">
                플라스틱 컵과 재질이 달라 함께 녹이거나 가공할 수 없습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 인터랙티브 애니메이션 구역 */}
      <div ref={scrollAreaRef} className="interactive-section" style={{ height: "400vh" }}>
        <div className="guide-text">
          <div className="scroll-step">
            <div>
              <div className="eyebrow-text" style={{ color: "var(--brand-color)" }}>
                STEP 01
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: 1.3 }}>
                간편한 투입
              </h2>
              <p className="desc-text" style={{ color: "rgba(255,255,255,0.7)" }}>
                다 마신 음료 컵을 수거함 상단 투입구에 가볍게 올려놓습니다.
              </p>
            </div>
          </div>

          <div className="scroll-step">
            <div>
              <div className="eyebrow-text" style={{ color: "#3B82F6" }}>
                STEP 02
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: 1.3 }}>
                1초 AI 스캔
              </h2>
              <p className="desc-text" style={{ color: "rgba(255,255,255,0.7)" }}>
                상단 카메라가 컵 내부에 얼음이나 방해 물질이 있는지 즉각적으로
                파악합니다.
              </p>
            </div>
          </div>

          <div className="scroll-step">
            <div>
              <div className="eyebrow-text" style={{ color: "var(--brand-light)" }}>
                STEP 03
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: 1.3 }}>
                즉각적인 피드백과<br />
                보상 시스템
              </h2>
              <p className="desc-text" style={{ color: "rgba(255,255,255,0.7)" }}>
                완벽히 비워진 컵은 초록불과 함께 리워드용 QR 코드가 생성됩니다.
                이물질이 감지될 경우 다시 분리할 것을 안내합니다.
              </p>
            </div>
          </div>

          <div className="scroll-step">
            <div>
              <div className="eyebrow-text" style={{ color: "#FCD34D" }}>
                STEP 04
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: 1.3 }}>
                가치 있는 수거와<br />
                자원 순환
              </h2>
              <p className="desc-text" style={{ color: "rgba(255,255,255,0.7)" }}>
                통과된 깨끗한 빈 컵들은 수거함에 모이며 리더보드 점수로
                기록됩니다. 선별된 컵은 재활용 공정으로 전달되어 환경 관리
                노동자의 수고를 크게 덜어줍니다.
              </p>
            </div>
          </div>
        </div>

        <div className="fixed-visual">
          <motion.div style={{ scale: cupScale, textAlign: "center", width: "100%", maxWidth: "300px" }}>
            <div style={{ width: "100%", height: "300px", position: "relative", marginBottom: "24px" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepInfo.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ position: "absolute", width: "100%", height: "100%" }}
                >
                  <CupPictogram step={stepInfo.step} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              style={{
                fontSize: "1rem", fontWeight: "bold", color: "#fff", 
                backgroundColor: stepInfo.accent, padding: "10px 24px", 
                borderRadius: "99px", display: "inline-block", 
                transition: "background 0.3s", boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              }}
            >
              {stepInfo.label}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 기대 효과 (임팩트 데이터) */}
      <div className="data-metrics">
        <div className="eyebrow-text" style={{ color: "var(--brand-color)", marginBottom: "16px" }}>
          EXPECTED EFFECT
        </div>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--font-primary)", marginBottom: "16px", wordBreak: "keep-all" }}>
          우리의 작은 실천이 만드는 변화
        </h2>
        <p className="desc-text">
          일회용 컵 하나를 제대로 재활용할 때마다 약 15g의 온실가스를 줄일 수
          있습니다.
          <br />
          우리의 참여가 만드는 변화를 숫자로 직접 확인해 보시기 바랍니다.
        </p>

        <div className="metrics-grid">
          <div className="metric-card">
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🌳</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-dark)" }}>
              {treesPlanted.toLocaleString()} 그루
            </div>
            <p className="desc-text" style={{ marginTop: "8px" }}>
              이번 학기에 심은 소나무 효과
            </p>
          </div>
          <div className="metric-card">
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📉</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-dark)" }}>
              {co2Reduced.toLocaleString()}g CO₂
            </div>
            <p className="desc-text" style={{ marginTop: "8px" }}>
              누적 절감된 탄소 배출량
            </p>
          </div>
          <div className="metric-card">
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>♻️</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-dark)" }}>
              {cupsCount.toLocaleString()} 개
            </div>
            <p className="desc-text" style={{ marginTop: "8px" }}>
              현재까지 완벽히 분류된 컵
            </p>
          </div>
        </div>

        {/* 상호작용 가능한 함께 실천하기 버튼 */}
        <div style={{ marginTop: "60px" }}>
          <button
            onClick={handleParticipate}
            style={{
              padding: "16px 36px",
              fontSize: "1.15rem",
              fontWeight: "bold",
              background: isParticipated ? "var(--brand-dark)" : "var(--brand-color)",
              color: "#fff",
              border: "none",
              borderRadius: "99px",
              cursor: isParticipated ? "default" : "pointer",
              transition: "transform 0.2s, background 0.2s",
              boxShadow: isParticipated ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
              transform: isParticipated ? "scale(0.98)" : "scale(1)",
            }}
            onMouseOver={(e) => {
              if (!isParticipated) e.target.style.background = "var(--brand-dark)";
            }}
            onMouseOut={(e) => {
              if (!isParticipated) e.target.style.background = "var(--brand-color)";
            }}
          >
            {isParticipated ? "참여 완료! 🎉" : "함께 실천하기"}
          </button>
        </div>
      </div>

      {/* FAQ 구역 */}
      <div className="details-section">
        <div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "24px" }}>
            자주 묻는 질문
          </h2>

          <div className="qna-box" onClick={() => handleFaqClick(0)}>
            <div className="qna-title">
              Q. 컵에 얼음이 남아있으면 어떻게 되나요?{" "}
              <span>{activeFaq === 0 ? "−" : "+"}</span>
            </div>
            {activeFaq === 0 && (
              <div className="qna-body">
                AI가 이물질로 판별하여 재활용 투입구를 열지 않습니다. 남은
                음료나 얼음을 개수대에 먼저 버린 후 다시 투입해 주시기 바랍니다.
              </div>
            )}
          </div>

          <div className="qna-box" onClick={() => handleFaqClick(1)}>
            <div className="qna-title">
              Q. 종이컵도 인식이 가능한가요?{" "}
              <span>{activeFaq === 1 ? "−" : "+"}</span>
            </div>
            {activeFaq === 1 && (
              <div className="qna-body">
                현재는 투명한 플라스틱 일회용 컵을 대상으로 AI 모델을 최적화하여
                운영 중입니다. 종이컵은 일반 쓰레기로 분리배출해 주시기
                바랍니다.
              </div>
            )}
          </div>

          <div className="qna-box" onClick={() => handleFaqClick(2)}>
            <div className="qna-title">
              Q. 리워드 지급은 어떤 방식으로 이루어지나요?{" "}
              <span>{activeFaq === 2 ? "−" : "+"}</span>
            </div>
            {activeFaq === 2 && (
              <div className="qna-body">
                정상적으로 컵 수거가 완료되면 수거함 스크린에 고유 QR코드와 인증
                번호가 생성됩니다. 이를 구글 폼에 입력하시면 소정의 리워드 추첨
                자격이 주어집니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 24px 120px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ marginTop: "40px", padding: "60px 20px", background: "var(--surface-dark)", color: "#fff", borderRadius: "24px", boxShadow: "0 20px 40px rgba(6, 78, 59, 0.15)" }}>
          <h3 style={{ fontSize: "1.8rem", marginBottom: "16px", wordBreak: "keep-all" }}>
            지금 팝업 부스에서 직접 경험해 보세요
          </h3>
          <p className="desc-text" style={{ color: "var(--brand-light)", marginBottom: "32px" }}>
            수거함 화면에 나타난 인증 코드를 입력하고 특별한 리워드를 신청할 수
            있습니다.
          </p>
          <button
            style={{
              padding: "18px 40px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              background: "var(--brand-color)",
              color: "#fff",
              border: "none",
              borderRadius: "99px",
              cursor: "pointer",
              transition: "transform 0.2s",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            구글 폼으로 인증하기
          </button>
        </div>
      </div>
    </>
  );
}