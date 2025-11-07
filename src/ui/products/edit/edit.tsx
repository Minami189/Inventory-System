import classes from "./edit.module.css";
import { useEffect, useContext, useState, useRef } from "react";
import { DbContext } from "../../App";

interface EditProps {
  showEdit: boolean;
  setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
  setID: React.Dispatch<React.SetStateAction<number>>;
}

export default function Edit({showEdit, setShowEdit, id, setID} : EditProps){
    interface Product{
        id: number;
        name: string;
        variant: string;
        unitCost: number;
        srp: number;
        profit: number;
        stock: number;
    }
    const db = useContext(DbContext);
    if (!db) return;
    const {supabase, loadedProducts, loadProducts, loadLogs} = db;

    const [product, setProduct] = useState<Product>();
    const [message, setMessage]= useState("");
    const costRef = useRef<HTMLInputElement>(null);
    const profitRef = useRef<HTMLInputElement>(null);
    const srpRef = useRef<HTMLInputElement>(null);
    const stockRef = useRef<HTMLInputElement>(null);


    function resetAll(){
        setID(0);
        setShowEdit(false);
    }

    useEffect(()=>{
        if(showEdit){
            loadProduct();
        }
    },[showEdit])

    function loadProduct(){
        const filtered = loadedProducts.filter((product)=>product.id == id);
        if(!costRef.current || !profitRef.current || !srpRef.current || !stockRef.current)return;
        const filteredItem = filtered[0];
        costRef.current.value = String(filteredItem.unitCost);
        profitRef.current.value = String(filteredItem.profit);
        srpRef.current.value = String(filteredItem.srp);
        stockRef.current.value = String(filteredItem.stock);

        setProduct(filteredItem);
    }

    async function handleConfirm(){
        setShowEdit(false);
        if(!costRef.current || !profitRef.current || !srpRef.current || !stockRef.current)return;
        if(costRef.current.value == "" || profitRef.current.value == "" || srpRef.current.value == "" || stockRef.current.value == ""){
            setMessage("please fill out all fields")
            setTimeout(()=>{
                setMessage("");
            }, 2000)
            return;
        };
        const updatedValues = {
            unit_cost: parseFloat(costRef.current.value),
            profit: parseFloat(profitRef.current.value),
            srp: parseFloat(srpRef.current.value),
            stock: parseInt(stockRef.current.value),
        };

        const {data, error} = await supabase.from("Item_Variants").update(updatedValues).eq("id",id);
        if(error){
            console.error(error);
            return;
        }console.log(data);


        const now = new Date();
        const log = {
            username: localStorage.getItem("logged_user"),
            date: now.toISOString().split("T")[0], // YYYY-MM-DD
            time: now.toTimeString().split(" ")[0], // HH:MM:SS
            action: `Edited ${product?.name} (${product?.variant})`,
        };
        const {data:d, error:e} = await supabase.from("Logs").insert(log);
        if(e){
            console.error(e);
            return;
        }console.log(d);
        //refresh live
        loadProducts();
        loadLogs();
    }

    return(
        <div className={classes.popupBody} style={{display: showEdit ? "flex" : "none"}}>
            <div onClick={() => resetAll()} className={classes.backdrop}/>
            
            <div className={classes.editContent}>

                <div className={classes.editTop}>
                    <h1>{product?.name}</h1>
                    <h1>{product?.variant}</h1>
                </div>


                <div className={classes.tableBody}>
                    <h2>Unit Cost</h2>
                    <h2>Profit</h2>
                    <h2>Srp</h2>
                    <h2>Stock</h2>
                </div>
                
                <div className={classes.tableBody}>
                    <input placeholder="unit cost" ref={costRef} type="number"></input>
                    <input placeholder="profit" ref={profitRef} type="number"></input>
                    <input placeholder="srp" ref={srpRef} type="number"></input>
                    <input placeholder="stock" ref={stockRef} type="number"></input>
                </div>

                
                
                
                <section>
                    <p style={{color:"red"}}>{message}</p>
                    <button onClick={handleConfirm} className={classes.confirmButton}>Confirm</button>
                </section>
            </div>
        </div>
    )
}