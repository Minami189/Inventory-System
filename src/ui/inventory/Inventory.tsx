import classes from "./Inventory.module.css";
import { useEffect, useState, useRef, useContext } from "react";
import Variants from "../item_variants/variants.tsx";
import { useNavigate } from "react-router-dom";
import { DbContext } from "../App.tsx";



export default function Inventory() {
  
  //Just so TS no error
  interface Item {
    id: number;
    name: string;
  }
  const context = useContext(DbContext);
  if (!context) return null;
  const {loadedItems, supabase, loadLogs, loadProducts} = context;

  const [items, setItems] = useState<Item[]>([]);
  const [itemDisplay, setItemDisplay] = useState<Item[]>([]);
  const filterInput =  useRef<HTMLInputElement>(null);
  const [showVariants, setShowVariants] = useState(false);
  const [selectedItemID, setSelectedItemID] = useState(0);

  const navigate = useNavigate();

  useEffect(()=>{
    setItems(loadedItems);
    setItemDisplay(loadedItems);
  },[loadedItems])


  function handleFilter() {
    if (!filterInput.current) return;

    const search = filterInput.current.value.toLowerCase();

    // when searchbox empty just show all items
    if (search.trim() === "") {
      setItemDisplay(items);
      return;
    }

    // if anything is typed in then we filter according to that
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(search)
    );

    setItemDisplay(filtered);
  }

  function handleItemClick(itemID: number){
    //popup of the variants of the selected item
    setShowVariants(true);
    setSelectedItemID(itemID);
  }

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

  return (
    <div className={classes.homepage}>
      
      <header className={classes.header}>
        <div className={classes.top}>
          <div className={classes.left}>
            <h1>Ramil</h1>
            <button className={classes.active} onClick={()=>handleLogout()}>Logout</button>
          </div>
          <nav>
            <button className={classes.inactive} onClick={()=>{loadProducts();navigate("/products")}}>Products</button>
            <button className={classes.active} onClick={()=>navigate("/inventory")}>Inventory</button>
            <button className={classes.inactive} onClick={()=>navigate("/history")}>History</button>
            <button className={classes.inactive} onClick={()=>{loadLogs();navigate("/logs")}}>Logs</button>
          </nav>
          
        </div>

        <h1 className={classes.headerTitle}>Inventory</h1>
        
      </header>


      <div className={classes.mainTop}>
        <input placeholder="search" ref={filterInput} onChange={handleFilter}></input>    
      </div>

      <div className={classes.itemsContainer}>
        <Variants showVariants={showVariants} setShowVariants={setShowVariants} selectedItemID={selectedItemID}/>
        {
          itemDisplay.map((item)=>{return(<h1 key={item.id} className={classes.itemDisplay} onClick={()=>handleItemClick(item.id)}>{item.name}</h1>)})
        }
      </div>


    </div>
  );
}
