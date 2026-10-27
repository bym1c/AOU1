/* يستقبل الحدث الحالي من Firebase ويحدّث الشاشة فوراً. لو الإنترنت وقف، تبقى الشاشة على آخر حدث. */
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getDatabase,ref,onValue} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const C=window.FIREBASE_CONFIG;
if(typeof REMOTE!=="undefined"&&REMOTE&&C&&C.databaseURL){
  const db=getDatabase(initializeApp(C));
  onValue(ref(db,"screen/state"),s=>{const v=s.val();if(v&&typeof v.sel==="number")window.remoteSet(v.sel)});
}
