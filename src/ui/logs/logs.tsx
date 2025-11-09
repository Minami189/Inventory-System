import classes from "./logs.module.css";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import { DbContext } from "../App";

export default function Logs(){
    const navigate = useNavigate();
    const db = useContext(DbContext);
    if(!db) return;
    const {supabase, loadedLogs, loadLogs, loadItems, loadProducts} = db;
    const [logs, setLogs] = useState(loadedLogs);
    const usernameRef = useRef<HTMLInputElement>(null);
    const dateRef = useRef<HTMLInputElement>(null);
    const actionRef = useRef<HTMLInputElement>(null);


    async function handleLogout() {
        const now = new Date();
        const uname = localStorage.getItem("logged_user");
        localStorage.clear();
        const log = {
            username: uname,
            date: now.toISOString().split("T")[0], // YYYY-MM-DD
            time: now.toTimeString().split(" ")[0], // HH:MM:SS
            action: "Logout",
        };
        const {data: d, error: e} = await supabase.from("Logs").insert(log);

        if(e){
            console.error(e);
            return;
        }console.log(d);
        loadLogs();
        navigate("/");
    }

    function handleFilter() {
        if (!usernameRef.current || !dateRef.current || !actionRef.current) return;

        const uname = usernameRef.current.value.trim().toLowerCase();
        const date = dateRef.current.value.trim();
        const action = actionRef.current.value.trim().toLowerCase();
        //always start with loaded logs
        //note: loaded logs is the logs loaded in app.tsx
        let filtered = loadedLogs;

        if (uname !== "") {
            filtered = filtered.filter(log =>
            log.username.toLowerCase().includes(uname)
            );
        }

   
        if (date !== "") {
            filtered = filtered.filter(log => log.date === date);
        }

        if (action !== "") {
            filtered = filtered.filter(log => log.action.toLowerCase().includes(action));
        }

        setLogs(filtered);
    }


    useEffect(()=>{
        setLogs(loadedLogs);
    },[loadedLogs])


    return(
        <div className={classes.page}>
            <header className={classes.header}>
                <div className={classes.top}>
                <div className={classes.left}>
                    <h1>{localStorage.getItem("logged_user")}</h1>
                    <button className={classes.active} onClick={()=>handleLogout()}>Logout</button>
                </div>
                <nav>
                    <button className={classes.inactive} onClick={()=>{loadProducts();navigate("/products")}}>Products</button>
                    <button className={classes.inactive} onClick={()=>{loadItems(); navigate("/inventory")}}>Inventory</button>
                    <button className={classes.inactive} onClick={()=>navigate("/history")}>History</button>
                    <button className={classes.active} onClick={()=>{loadLogs(); navigate("/logs")}}>Logs</button>
                </nav>
                
                </div>

                <h1 className={classes.headerTitle}>Logs</h1>
            
            </header>

            <div className={classes.main}>
                <div className={classes.mainTop}>
                    <input type="search" placeholder="filter by username" onChange={handleFilter} ref={usernameRef} className={classes.usernameFilter}/>
                    <div style={{display:"flex", gap:25}}>
                        <input type="date" onChange={handleFilter} ref={dateRef} className={classes.dateFilter}/>
                        <input onChange={handleFilter} ref={actionRef} className={classes.dateFilter} placeholder="filter by action"/>
                    </div>
                </div>

                <div className={classes.tableHeader}>
                    <h2>Username</h2>
                    <h2>Date</h2>
                    <h2>Time</h2>
                    <h2>Action</h2>
                </div>

                {
                    logs.map((log, index)=>{
                        return(
                            <div className={classes.tableBody} style={{backgroundColor: index % 2 != 0 ? "hsla(231, 13%, 20%, 0.5)" : "hsla(231, 13%, 30%, 1.00)"}}>
                                <h3>{log.username}</h3>
                                <h3>{log.date}</h3>
                                <h3>{log.time}</h3>
                                <h3>{log.action}</h3>
                            </div>
                        )
                    })
                }
            </div>

            




            
        </div>
    )
}