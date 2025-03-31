import { GoogleAuthProvider,signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    function googleLogin(){

        const provider = new GoogleAuthProvider();
        signInWithPopup(auth,provider).then(async (result)=>{
            console.log(result.user);
            // update user data in your database or wherever you need it.
            if (result.user){
                toast.success("Logged in");
                navigate('/home');
            }
        })
    }
  return (
    <>
        <button onClick={googleLogin}>Login With Google</button>
    </>
  )
}
