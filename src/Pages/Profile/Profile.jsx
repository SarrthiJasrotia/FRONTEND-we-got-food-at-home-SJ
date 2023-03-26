import { GiForkKnifeSpoon } from "react-icons/gi";
import { useState } from "react";
import "./Profile.css";
import bronze from "../../images/bronze.png";
import silver from "../../images/silver.png";
import gold from "../../images/gold.png";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import { logout, auth, db } from "../../services/firebase";

import {
  query,
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  where,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { async } from "@firebase/util";
import e from "cors";

function Profile() {
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [user, loading, error] = useAuthState(auth);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [progressBarNumber, setProgressBarNumber] = useState()
  const [uId, setUId] = useState("");



  // custom Id for when DOC is created so it can called using it
  const docId = "doc" + user.uid + "Food@Home"

   // pulls the progressBar data from the database when the user loads
    const docRef = doc(db,"progressBar", docId)
    
    const unsubscribe = onSnapshot((docRef),(doc)=>{
      const docData =doc.data().progressBarNumber
      setProgressBarNumber (docData)
      
    }
    
    )
    
   
   
  // updates or adds the progress bar number in the database when chnanged
  useEffect(() => {
    
const progressUpdate = async (e) => {
   

    const docRef = doc(db, 'progressBar', docId);
    const docSnap = await getDoc(docRef)
   

    if (docSnap.exists()) {
      const updatedProgress = { progressBarNumber: progress };
      await updateDoc(docRef, updatedProgress);
      

    } else {
      await setDoc(doc(db, "progressBar", docId), {
        userName: user.displayName,
        userId: user.uid,
        progressBarNumber: progressBarNumber
      })
      

    };

  };
		progressUpdate()
    console.log(progress)
		
	});
// console.log("data",progress);






	
  // /////////////////////////////////////////////////////////// //
  // /////////////////////////////////////////////////////////// //
  useEffect(() => {
    if (loading) {
      // loading screen
      return;
    }
    if (user) {

      setDisplayName(user.displayName);
      setPhotoURL(user.photoURL);
      unsubscribe()
    }
  }, [user, loading]);

  const levelImages = [
    { level: 0, src: `${bronze}`, status: "bronze" },
    { level: 1, src: `${bronze}`, status: "bronze" },
    { level: 2, src: `${bronze}`, status: "bronze" },
    { level: 3, src: `${bronze}`, status: "bronze" },
    { level: 4, src: `${silver}`, status: "silver" },
    { level: 5, src: `${silver}`, status: "silver" },
    { level: 6, src: `${silver}`, status: "silver" },
    { level: 7, src: `${gold}`, status: "gold" },
  ];

  const currentImage = levelImages.find(
    (image) => image.level === currentLevel
  ).src;

  const currentStatus = levelImages.find(
    (status) => status.level === currentLevel
  ).status;

  // level up progress bar
  const handleLevelUp = async (e) => {
    
    setCurrentLevel(currentLevel + 1);

    setProgress(progressBarNumber + 10);

    
   



  };

  // level down progress bar
  const handleLevelDown = async (e) => {
    setCurrentLevel(currentLevel - 1);
    setProgress(progressBarNumber - 10);
    



  };









  return (
    <div className="wrapper">
      <div className="profile-top">
        <img src={user.photoURL} className="pfpdiv" />

        <div className="leftcontainer">
          <div className="displayname">{`Chef ${user.displayName}`}</div>

          <div className="profile-bar-div top">
            <GiForkKnifeSpoon
              style={{
                paddingRight: "10px",
                paddingLeft: "0",
                color: "#f09133",
                fontSize: "25px",
              }}
            />{" "}
            <div>
              <progress value={progressBarNumber} max="60"></progress>
            </div>
          
          </div>  
        </div>
      </div>
    <p className="profile-day-count">
            You cooked {currentLevel}/7 days this week
          </p>
 
      <div className="profile-bottom">
        {" "}
        <h2>Your Achievement</h2>
        <div className="achievement-image">
          {" "}
          <div>
            <img src={currentImage} alt={`Level ${currentLevel}`} />

            <h3>{`You're a ${currentStatus}-level cook!`}</h3>
          </div>
        </div>


        {/* <button onClick={progressUpdate}>TEST</button> */}


        {/* the progress bar btn plus */}
        <button
          className="profile-btn"
          disabled={currentLevel === 7}
          onClick={handleLevelUp}
        >
          I cooked at home today!
        </button>
        {/* the progress bar btn minus */}
        <button
          className="profile-btn"
          disabled={currentLevel === 1}
          onClick={handleLevelDown}
        >
          Oops, no I didn't!
        </button>
      </div>
    </div>
  );
}
export default Profile;
