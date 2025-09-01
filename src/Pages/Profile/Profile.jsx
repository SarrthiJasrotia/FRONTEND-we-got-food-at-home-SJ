// src/Pages/Profile/Profile.jsx
import { GiForkKnifeSpoon } from "react-icons/gi";
import { useEffect, useMemo, useState } from "react";
import "./Profile.css";
import bronze from "../../images/bronze.png";
import silver from "../../images/silver.png";
import gold from "../../images/gold.png";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../services/firebase";

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

function Profile() {
  // auth hook — PrivateRoute already guards this page, but we still read user here
  const [user] = useAuthState(auth);

  // local UI state (fed by Firestore snapshot)
  const [currentLevel, setCurrentLevel] = useState(0);        // 0..7
  const [progressBarNumber, setProgressBarNumber] = useState(0); // 0..70 (10 per day)

  // constants for clamping — tweak here if you change the weekly target
  const STEP = 10;              // each day adds 10
  const MAX_LEVEL = 7;          // 7 days in a week
  const MIN_LEVEL = 0;
  const MAX_PROGRESS = 70;      // 7 * 10; if you prefer 6 days, set 60 instead

  // stable doc ref for this user’s progress
  const progressRef = useMemo(() => {
    if (!user?.uid) return null;
    return doc(db, "progressBar", user.uid); // <-- simple, stable path per user
  }, [user?.uid]);

  // live subscription: pulls progress on load and stays in sync
  useEffect(() => {
    if (!progressRef) return;

    let unsub = () => {};
    (async () => {
      // initialize the doc the first time we see this user
      const snap = await getDoc(progressRef);
      if (!snap.exists()) {
        await setDoc(
          progressRef,
          {
            ownerId: user.uid,
            progressBarNumber: 0,
            currentLevel: 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // listen for live updates (including our own writes)
      unsub = onSnapshot(progressRef, (s) => {
        const data = s.data() || {};
        const num = Number(data.progressBarNumber ?? 0);
        const lvl = Number(data.currentLevel ?? Math.round(num / STEP));
        setProgressBarNumber(isNaN(num) ? 0 : num);
        setCurrentLevel(Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, isNaN(lvl) ? 0 : lvl)));
      });
    })();

    // cleanup so we don’t keep listening after logout/nav
    return () => unsub();
  }, [progressRef]);

  // friendly mapping for the badge image + status
  const levelImages = [
    { level: 0, src: bronze, status: "bronze" },
    { level: 1, src: bronze, status: "bronze" },
    { level: 2, src: bronze, status: "bronze" },
    { level: 3, src: bronze, status: "bronze" },
    { level: 4, src: silver, status: "silver" },
    { level: 5, src: silver, status: "silver" },
    { level: 6, src: silver, status: "silver" },
    { level: 7, src: gold,   status: "gold"   },
  ];

  const { src: currentImage, status: currentStatus } =
    levelImages.find((x) => x.level === currentLevel) || levelImages[0];

  // increment helpers — write back to the same Firestore doc
  async function levelUp() {
    if (!progressRef) return; // not signed in (shouldn’t happen due to guard)
    const nextLevel = Math.min(currentLevel + 1, MAX_LEVEL);
    const nextProgress = Math.min(progressBarNumber + STEP, MAX_PROGRESS);

    // write both so we can display quickly on next login
    await setDoc(
      progressRef,
      {
        currentLevel: nextLevel,
        progressBarNumber: nextProgress,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async function levelDown() {
    if (!progressRef) return;
    const nextLevel = Math.max(currentLevel - 1, MIN_LEVEL);
    const nextProgress = Math.max(progressBarNumber - STEP, 0);

    await setDoc(
      progressRef,
      {
        currentLevel: nextLevel,
        progressBarNumber: nextProgress,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return (
    <div className="wrapper">
      <div className="profile-top">
        {/* mild guards — user should exist, but don’t explode if photo/displayName are missing */}
        <img src={user?.photoURL || ""} alt="pfp" className="pfpdiv" />

        <div className="leftcontainer">
          <div className="displayname">{`Chef : ${user?.displayName || "You"}`}</div>

          <div className="profile-bar-div top">
            <GiForkKnifeSpoon
              style={{
                paddingRight: "10px",
                paddingLeft: "0",
                color: "#f09133",
                fontSize: "25px",
              }}
            />
            <div>
              {/* heads-up: max is 70 to match 7 days * 10 step */}
              <progress value={progressBarNumber} max="70"></progress>
            </div>
          </div>
        </div>
      </div>

      <p className="profile-day-count">
        You cooked {currentLevel}/{MAX_LEVEL} days this week
      </p>

      <div className="profile-bottom">
        <h2>Your Achievement</h2>

        <div className="achievement-image">
          <div>
            <img src={currentImage} alt={`Level ${currentLevel}`} />
            <h3>{`You're a ${currentStatus}-level cook!`}</h3>
          </div>
        </div>

        {/* lil UX: clamp buttons so we never overshoot */}
        <button
          className="profile-btn"
          disabled={currentLevel >= MAX_LEVEL || progressBarNumber >= MAX_PROGRESS}
          onClick={levelUp}
        >
          I cooked at home today!
        </button>

        <button
          className="profile-btn"
          disabled={currentLevel <= MIN_LEVEL || progressBarNumber <= 0}
          onClick={levelDown}
        >
          Oops, no I didn't!
        </button>
      </div>
    </div>
  );
}

export default Profile;
