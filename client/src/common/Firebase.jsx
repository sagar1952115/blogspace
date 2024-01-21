import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0aW8XI203goW0TOYbBxKhAb0Ah7WnMFo",
  authDomain: "blog-app-df6bb.firebaseapp.com",
  projectId: "blog-app-df6bb",
  storageBucket: "blog-app-df6bb.appspot.com",
  messagingSenderId: "473902371095",
  appId: "1:473902371095:web:c35f4db63a4018546de752",
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });
  return user;
};
