import classes from "./delete.module.css";
import { useContext } from "react";
import { DbContext } from "../../App";

interface DeleteProps {
  showDelete: boolean;
  setShowDelete: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
  setID: React.Dispatch<React.SetStateAction<number>>;
  deleteWhat: string; // variant || item
}

export default function Delete({ showDelete, setShowDelete, id, setID, deleteWhat }: DeleteProps) {
  const db = useContext(DbContext);
  if (!db) return null;

  const { supabase, loadProducts, loadItems, loadLogs } = db;

  async function handleDelete() {
    setShowDelete(false);

    let deletedName = "";
    let deletedVariant = "";

    try {
      if (deleteWhat === "variant") {
        // Get variant info before deleting (optional)
        const { data: variantData } = await supabase.from("Item_Variants").select("*").eq("id", id).single();
        deletedName = variantData?.name || "";
        deletedVariant = variantData?.variant || "";

        const { error } = await supabase.from("Item_Variants").delete().eq("id", id);
        if (error) throw error;

        loadProducts();
      } 
      else if (deleteWhat === "item") {
        // Get item info before deleting (optional)
        const { data: itemData } = await supabase.from("Items").select("*").eq("id", id).single();
        deletedName = itemData?.name || "";

        const { error } = await supabase.from("Items").delete().eq("id", id);
        if (error) throw error;

        loadProducts();
        loadItems();
      }

      // Log deletion
      const now = new Date();
      const log = {
        username: localStorage.getItem("logged_user"),
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
        action: `Deleted ${deleteWhat} ${deletedName}${deletedVariant ? ` (${deletedVariant})` : ""}`,
      };
      loadLogs();
      
      const { error: logError } = await supabase.from("Logs").insert(log);
      if (logError) throw logError;

    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <div className={classes.popupBody} style={{ display: showDelete ? "flex" : "none" }}>
      <div onClick={() => { setID(0); setShowDelete(false); }} className={classes.backdrop} />
      <div className={classes.deleteContent}>
        <h1>
          Are you sure you want to delete this{" "}
          {deleteWhat === "variant" ? "variant" : "item and its variants"}?
        </h1>
        <div>
          <button onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
