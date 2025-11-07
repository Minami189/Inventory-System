import { useRef, useState} from "react"; 
import classes from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { DbContext } from "./App";
import { useContext, useEffect } from "react";
import bcrypt from "bcryptjs";

export default function Login() {
  const db = useContext(DbContext);
  if(!db) return;
  const {supabase, loadItems} = db;


  // Specify as input ref so ts no error
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const messageDisplay = useRef<HTMLInputElement>(null);
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleShowPass(){
    if (!password.current) return;
    if(showPass){
      setShowPass(false);
    }else{
      setShowPass(true);
    }
  }

  useEffect(()=>{
    if(localStorage.getItem("logged_user")){
      navigate("/inventory")
    }

    
  },[])
  
  async function handleLogin() {
  if (!username.current || !password.current) return;
  
  const uname = username.current.value;
  const pword = password.current.value;
  username.current.value = "";
  password.current.value = "";

  const { data, error } = await supabase
    .from("Users")
    .select("password")
    .eq("username", uname)
    .single(); 



    if (error) {
      console.error(error);
      return;
    }

    if (!data) {
      setMessage("Username not Found")
      return;
    }

    const dbPassword = data.password;
    const inputPassword = pword;
    
    if (bcrypt.compareSync(inputPassword, dbPassword)) {
      localStorage.clear();
      localStorage.setItem("logged_user", uname);
      loadItems();
      navigate("/inventory");
    } else {
      setMessage("Incorrect Password")
    }

    //complete this
    const now = new Date();
    const log = {
      username: uname,
      date: now.toISOString().split("T")[0], // YYYY-MM-DD
      time: now.toTimeString().split(" ")[0], // HH:MM:SS
      action: "Login",
    };
    const {data: d, error: e} = await supabase.from("Logs").insert(log);
    if(e){
      console.error(e);
      return;
    }console.log(d);


    setTimeout(()=>{
      setMessage("");
    },2000)

  }



  return (
    <div className={classes.loginpage}>
      <div className={classes.loginwrapper}>
        <h1><b>Login</b></h1>
        <input placeholder="username" ref={username} className={classes.loginput}/>
        <input placeholder="password" ref={password} type={showPass ? "text" : "password"} className={classes.loginput}/>
        <div className={classes.left} onChange={()=>handleShowPass()}><b>Show Password</b><input type="checkbox"></input></div>
        <button onClick={handleLogin} className={classes.loginbutton}>Login</button>
        <p className={classes.message} ref={messageDisplay}>{message}</p>
      </div>
    </div>
  );
}
