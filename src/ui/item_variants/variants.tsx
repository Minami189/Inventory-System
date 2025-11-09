import classes from "./variants.module.css";
import supabase from "../../config/supabaseClient";
import { useEffect, useRef, useState } from "react";

interface VariantsProps {
  showVariants: boolean;
  setShowVariants: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItemID: number;
}

export default function Variants({showVariants, setShowVariants, selectedItemID,}: VariantsProps) {

  interface Variant {
    name: string;
    id: number;
    stock: number;
  }

  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedVariantName, setSelectedVariantName] = useState("Select Variant");
  const [variantStocks, setStocks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedItemID) return;
    resetEverything();
    loadVariants();
    
  }, [selectedItemID]);

  useEffect(()=>{
    // on open no date so just set to default of now
    if(!dateRef.current) return;
    //turns the date to readable date
    dateRef.current.value = new Date().toISOString().split("T")[0];
  })

  async function loadVariants() {
    setLoading(true);
    const { data, error } = await supabase
      .from("Item_Variants")
      .select("name, id, stock")
      .eq("item_id", selectedItemID);

    if (error) {
      console.error(error);
      return;
    }

    if (!data) return;

    setVariants(data);
    setLoading(false);
  }

  function handlePickVariant(variantID: number, variantName: string, stock:number) {
    setSelectedVariant(variantID);
    setSelectedVariantName(variantName);
    setStocks(stock);
  }

  function resetEverything() {
    setSelectedVariantName("");
    setSelectedVariant(0);
    setLoading(true);
  }
  
  async function handleConfirm(){
    if(!dateRef.current || !quantityRef.current) return;
    const variantID = selectedVariant;
    const quantity = Number(quantityRef.current.value);
    const date = dateRef.current.value;
    
    if(selectedVariantName == "" || !quantity || date == ""){
      setMessage("please fill out all fields");
      setTimeout(()=>{
        setMessage("")
      }, 2000)
      return;
    }

    if(variantStocks < quantity){
      setMessage("not enough stocks");
      setTimeout(()=>{
        setMessage("")
      }, 2000)
      return;
    }

    setShowVariants(false);
    const {data, error} = await supabase.from("Records").insert([{variant_id:variantID, quantity:quantity, date:date}]);

    if(error) {
      console.error(error);
      setMessage("error: please try again");
      return;
    }console.log(data);

    const newStock = variantStocks - quantity;
    const { error: stockError } = await supabase
    .from("Item_Variants")
    .update({ stock: newStock })
    .eq("id", variantID);
    
    if(stockError) return;

    resetEverything();
  }

  return (
    <div style={{ display: showVariants ? "flex" : "none" }} className={classes.variantBody}>
      <div onClick={() => setShowVariants(false)} className={classes.backdrop}/>

      <div className={classes.variantContent}>
        {// if still loading then just show loading
        loading ? (
          <h1>Loading...</h1>
        ) : (
          <>
            <h1 className={classes.variantName}>
              {selectedVariantName}
              <h4 style={{display: selectedVariantName == "" ? "block" : "none"}}>Select Amount</h4>
              <p style={{display: selectedVariantName != "" ? "block" : "none"}}>{variantStocks} stocks</p>
            </h1>


            <input type="date" ref={dateRef} className={classes.dateInput}/>
            <div className={classes.variantSelection}>
              
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  className={classes.variant}
                  onClick={() => handlePickVariant(variant.id, variant.name, variant.stock)}
                >
                  {variant.name}
                </button>
              ))}
            </div>

            <div className={classes.quantityContainer}>
              <input type="number" ref={quantityRef} placeholder="Quantity"/>
            </div>

            <div className={classes.bottomContainer}>
              <p>{message}</p>
              <button className={classes.confirmButton} onClick={handleConfirm}>Confirm</button>
            </div>
            
          </>
        )}
      </div>
    </div>
  );
}
