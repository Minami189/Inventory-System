import classes from "./add.module.css";
import { useState, useRef, useContext, useEffect } from "react";
import { DbContext } from "../../App";

interface AddProps {
  showAdd: boolean;
  setShowAdd: React.Dispatch<React.SetStateAction<boolean>>;
  itemAction: string; // "edit" or "add"
  id: number; // only used for editing an item
}

export default function Add({ showAdd, setShowAdd, itemAction, id }: AddProps) {
  interface Variant {
    name: string;
    stock: number;
    unit_cost: number;
    srp: number;
    profit: number;
  }

  const db = useContext(DbContext);
  if (!db) return null;
  const { supabase, loadProducts, loadItems } = db;

  const [variants, setVariants] = useState<Variant[]>([
    { name: "", stock: 0, unit_cost: 0, srp: 0, profit: 0 },
  ]);
  const [message, setMessage] = useState("");
  const itemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemRef.current) {
      itemRef.current.value = "";
      itemRef.current.readOnly = false;

      if (itemAction === "edit") {
        itemRef.current.readOnly = true;
      }

      if (itemAction === "add") {
        setVariants([{ name: "", stock: 0, unit_cost: 0, srp: 0, profit: 0 }]);
      }
    }

    async function loadEditData() {
      if (itemAction !== "edit" || !id) return;

      const { data: itemData, error: itemError } = await supabase
        .from("Items")
        .select("name")
        .eq("id", id)
        .single();

      if (itemError || !itemData) {
        console.error(itemError);
        return;
      }

      if (itemRef.current) {
        itemRef.current.value = itemData.name;
      }

      const { data: variantData, error: variantError } = await supabase
        .from("Item_Variants")
        .select("*")
        .eq("item_id", id);

      if (variantError || !variantData) {
        console.error(variantError);
        return;
      }

      setVariants(
        variantData.map((v) => ({
          name: v.name,
          stock: v.stock,
          unit_cost: v.unit_cost,
          srp: v.srp,
          profit: v.profit,
        }))
      );
    }

    loadEditData();
  }, [itemAction, id]);

  function handleAddVariant() {
    const latestVariant = variants[variants.length - 1];
    if (
      latestVariant.name === "" ||
      latestVariant.profit < 1 ||
      latestVariant.srp < 1 ||
      latestVariant.unit_cost < 1 ||
      !latestVariant.stock
    ) {
      setMessage("please fill out all previous variant fields first");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }

    setVariants((prev) => [
      ...prev,
      { name: "", stock: 0, unit_cost: 0, srp: 0, profit: 0 },
    ]);
  }

  function handleChange(index: number, field: keyof Variant, value: string) {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]:
                field === "name" ? value : Number(value) || 0,
            }
          : variant
      )
    );
  }

  async function handleCreate() {
    if (!itemRef.current) return;
    const itemName = itemRef.current.value.trim();

    if (itemName === "") {
      setMessage("please input an item name");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const validVariant = variants.some(
      (v) =>
        v.name && v.unit_cost > 0 && v.srp > 0 && v.profit > 0 && v.stock >= 0
    );

    if (!validVariant) {
      setMessage("please fill out at least one valid variant");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      if (itemAction === "add") {
        // ✅ ADD MODE
        const { data: itemData, error: itemError } = await supabase
          .from("Items")
          .insert([{ name: itemName }])
          .select("id")
          .single();

        if (itemError || !itemData) throw itemError;
        const itemId = itemData.id;

        const { error: variantError } = await supabase
          .from("Item_Variants")
          .insert(
            variants.map((v) => ({
              item_id: itemId,
              name: v.name,
              stock: v.stock,
              unit_cost: v.unit_cost,
              srp: v.srp,
              profit: v.profit,
            }))
          );
        if (variantError) throw variantError;

        // 🧾 LOG - Added item
        const now = new Date();
        const log = {
          username: localStorage.getItem("logged_user"),
          date: now.toISOString().split("T")[0],
          time: now.toTimeString().split(" ")[0],
          action: `Added new item "${itemName}" with ${variants.length} variant(s)`,
        };
        await supabase.from("Logs").insert(log);

        alert("Item successfully added!");
      } else if (itemAction === "edit") {
        // ✅ EDIT MODE
        const { error: itemError } = await supabase
          .from("Items")
          .update({ name: itemName })
          .eq("id", id);
        if (itemError) throw itemError;

        await supabase.from("Item_Variants").delete().eq("item_id", id);
        const { error: variantError } = await supabase
          .from("Item_Variants")
          .insert(
            variants.map((v) => ({
              item_id: id,
              name: v.name,
              stock: v.stock,
              unit_cost: v.unit_cost,
              srp: v.srp,
              profit: v.profit,
            }))
          );
        if (variantError) throw variantError;

        // 🧾 LOG - Edited item
        const now = new Date();
        const log = {
          username: localStorage.getItem("logged_user"),
          date: now.toISOString().split("T")[0],
          time: now.toTimeString().split(" ")[0],
          action: `Edited item "${itemName}"`,
        };
        await supabase.from("Logs").insert(log);

        alert("Item successfully updated!");
      }

      loadProducts();
      loadItems();
      setShowAdd(false);
      setVariants([{ name: "", stock: 0, unit_cost: 0, srp: 0, profit: 0 }]);
      if (itemRef.current) itemRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving the item.");
    }
  }

  return (
    <div
      className={classes.popupBody}
      style={{ display: showAdd ? "flex" : "none" }}
    >
      <div
        onClick={() => setShowAdd(false)}
        className={classes.backdrop}
      />
      <div className={classes.addContent}>
        <div>
          <input
            className={classes.itemName}
            placeholder="item name"
            ref={itemRef}
          />
        </div>

        <div>
          <div className={classes.tableBody}>
            <h2>Variant</h2>
            <h2>Stock</h2>
            <h2>unit cost</h2>
            <h2>srp</h2>
            <h2>profit</h2>
          </div>

          {variants.map((v, index) => (
            <div className={classes.tableBody} key={index}>
              <input
                placeholder="ex. 1 Liter"
                value={v.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />
              <input
                type="number"
                value={v.stock}
                onChange={(e) => handleChange(index, "stock", e.target.value)}
              />
              <input
                type="number"
                value={v.unit_cost}
                onChange={(e) => handleChange(index, "unit_cost", e.target.value)}
              />
              <input
                type="number"
                value={v.srp}
                onChange={(e) => handleChange(index, "srp", e.target.value)}
              />
              <input
                type="number"
                value={v.profit}
                onChange={(e) => handleChange(index, "profit", e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className={classes.actions}>
          <p className={classes.message}>{message}</p>
          <button onClick={handleAddVariant}>+ Add Variant</button>
          <button onClick={handleCreate}>
            {itemAction === "edit" ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
