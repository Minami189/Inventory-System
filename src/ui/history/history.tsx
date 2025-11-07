import classes from "./history.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useContext } from "react";
import { DbContext } from "../App";


export default function History(){

    const db = useContext(DbContext);
    if(!db) return;
    const {supabase, loadItems, loadLogs, loadProducts} = db;
    
    interface history{
        date: string,
        item: string,
        variant: string,
        quantity: number,
        profit: number,
        srp: number,
        cost: number,
        user:string;
    }
    const navigate = useNavigate();
    const [history, setHistory] = useState<history[]>([]);
    const [historyView, setHistoryView] = useState<history[]>([]);
    const dateRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);

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
        
        navigate("/");
    }

    useEffect(()=>{
        if(!dateRef.current) return
        loadHistory();
    },[])

    async function loadHistory(){
        //eq with the date later
       
        const { data, error } = await supabase.from("Records").select(`date, quantity, user, Item_Variants (name, unit_cost, srp, profit, Items (name))`);
        

        if(error){
            console.error(error);
            return
        }

        const formatted = data.map((record: any) => ({
            date: record.date,
            item: record.Item_Variants?.Items?.name ?? "Unknown Item",
            variant: record.Item_Variants?.name ?? "Unknown Variant",
            quantity: record.quantity,
            unit_cost: record.Item_Variants?.unit_cost ?? 0,
            srp: record.Item_Variants?.srp ?? 0,
            profit: record.Item_Variants?.profit ?? 0,
            cost: (record.quantity * record.Item_Variants?.unit_cost),
            user: record.user
        }));


        setHistory(formatted);
        setHistoryView(formatted);
        
    }

    function handleFilter() {
        if (!dateRef.current || !usernameRef.current) return;
        const date = dateRef.current.value.trim();
        const username = usernameRef.current.value.trim();

        let filtered = history;

        if (date !== "") {
            filtered = filtered.filter((f) => f.date === date);
        }

        if (username !== "") {
            filtered = filtered.filter((f) =>
            f.user.toLowerCase().includes(username.toLowerCase())
            );
        }

        setHistoryView(filtered);
    }

    return(
        <div className={classes.page}>
            <header className={classes.header}>
                <div className={classes.top}>
                    <div className={classes.left}>
                        <h1>Ramil</h1>
                        <button className={classes.active} onClick={()=>handleLogout()}>Logout</button>
                    </div>
                    <nav>
                        <button className={classes.inactive} onClick={()=>{loadProducts();navigate("/products")}}>Products</button>
                        <button className={classes.inactive} onClick={()=>{loadItems();navigate("/inventory")}}>Inventory</button>
                        <button className={classes.active} onClick={()=>navigate("/history")}>History</button>
                        <button className={classes.inactive} onClick={()=>{loadLogs();navigate("/logs")}}>Logs</button>
                    </nav>
                </div>

                <h1 className={classes.headerTitle}>History</h1>
            </header>


            <div className={classes.main}>
                <div className={classes.mainTop}>
                    <input ref={usernameRef} onChange={()=>handleFilter()} className={classes.dateInput} placeholder="username"/>
                    <input type="date" ref={dateRef} onChange={()=>handleFilter()} className={classes.dateInput}/>  
                </div>
                

                <div className={classes.tableWrapper}>
                    <div className={classes.tableBody}>
                        <h2>date</h2>
                        <h2>user</h2>
                        <h2>item</h2>
                        <h2>amount</h2>
                        <h2>quantity</h2>
                        <h2>total cost</h2>
                        <h2>total srp</h2>
                        <h2>profit</h2>
                    </div>

                    {
                        historyView.map((item, index)=>{
                            return(<div className={classes.tableBody} style={{backgroundColor: index % 2 != 0 ? "hsla(231, 13%, 20%, 0.5)" : "hsla(231, 13%, 30%, 1.00)"}}>
                                <h3>{item.date}</h3>
                                <h3>{item.user}</h3>
                                <h3>{item.item}</h3>
                                <h3>{item.variant}</h3>
                                <h3>{item.quantity}</h3>
                                <h3>{item.profit}</h3>
                                <h3>{item.srp}</h3>
                                <h3>{item.cost}</h3>
                            </div>)
                        })
                    }
                </div>
                <div style={{display: history.length < 1 ? "flex" : "none"}} className={classes.loadingHistory}>Loading History...</div>
                
            </div>
                

                
        </div>
    )
}