import classes from "./products.module.css";
import { useNavigate } from "react-router-dom";
import { DbContext } from "../App";
import { useContext, useEffect, useRef, useState } from "react";
import Edit from "./edit/edit";
import Delete from "./delete/delete";
import Add from "./add/add";

export default function Products() {
  const navigate = useNavigate();
  const db = useContext(DbContext);
  if (!db) return null;

  const { loadedProducts, loadedItems, supabase, loadProducts, loadLogs} = db;

  const [itemsView, setItemsView] = useState(loadedItems);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  //id is used for multiple stuff since the popups that use them don't use multiple ids of different data
  const [id, setID] = useState(0);//item id, variant id

  const [itemAction, setItemAction] = useState("");// value = add || edit
  
  const [deleteWhat, setDeleteWhat] = useState("");// value = item || variant

  const filterRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    setItemsView(loadedItems);
  }, [loadedItems]);

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
  function handleFilter() {
    if (!filterRef.current) return;
    const search = filterRef.current.value.toLowerCase();

    if (search.trim() === "") {
      setItemsView(loadedItems);
      return;
    }

    const filtered = loadedItems.filter((item) =>
      item.name.toLowerCase().includes(search)
    );
    setItemsView(filtered);
  }

  function handleDelete(id: number) {
    setDeleteWhat("variant")
    setID(id);
    setShowDelete(true);
  }

  function handleEdit(id: number) {
    setID(id);
    setShowEdit(true);
  }

  function handleDeleteItem(id: number){
    setDeleteWhat("item");
    setID(id);
    setShowDelete(true);
  }

  function handleEditItem(id: number){
    setItemAction("edit");
    setShowAdd(true);
    setID(id);
  }

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <div className={classes.top}>
          <div className={classes.left}>
            <h1>{localStorage.getItem("logged_user")}</h1>
            <button className={classes.active} onClick={handleLogout}>
              Logout
            </button>
          </div>
          <nav>
            <button className={classes.active} onClick={() => {loadProducts(); navigate("/products")}}>
              Products
            </button>
            <button
              className={classes.inactive}
              onClick={() => navigate("/inventory")}>
              Inventory
            </button>
            <button className={classes.inactive} onClick={() => navigate("/history")}>
              History
            </button>
            <button className={classes.inactive} onClick={() => {loadLogs(); navigate("/logs")}}>
              Logs
            </button>
          </nav>
        </div>

        <h1 className={classes.headerTitle}>Products</h1>
      </header>

      <div className={classes.main}>
        <div className={classes.mainTop}>
          <button className={classes.addItem} onClick={() =>{ setItemAction("add"); setShowAdd(true)}}>
            + NEW
          </button>
          <input
            type="search"
            placeholder="search"
            onChange={handleFilter}
            ref={filterRef}
          />
        </div>

        <div className={classes.tableHeader}>
          <h3>item</h3>
          <h3>variant</h3>
          <h3>stock</h3>
          <h3>unit cost</h3>
          <h3>srp</h3>
          <h3>profit</h3>
        </div>

        <Edit setShowEdit={setShowEdit} showEdit={showEdit} id={id} setID={setID}/>
        <Delete setShowDelete={setShowDelete} showDelete={showDelete} id={id} setID={setID} deleteWhat={deleteWhat}/>
        <Add setShowAdd={setShowAdd} showAdd={showAdd} itemAction={itemAction} id={id}/>

        {itemsView.map((item, index) => {
          const products = loadedProducts.filter(
            (product) => product.name === item.name
          );

          return (
            <div className={classes.productsWrapper} key={item.id}>
              <div
                className={classes.itemWrapper}
                style={{
                  backgroundColor:
                    index % 2 === 0
                      ? "hsla(230, 13%, 15%, 1)"
                      : "hsla(230, 13%, 10%, 1)",
                }}
              >
                <div className={classes.itemName}>
                  <h3>{item.name}</h3>
                  <div className={classes.itemActions}>
                    <button className={classes.delete} onClick={()=>handleDeleteItem(item.id)}>Delete</button>
                    <button className={classes.edit} onClick={()=>handleEditItem(item.id)}>Edit</button>
                  </div>

                  
                </div>


                {products.map((product) => (
                  <div className={classes.tableBody} key={product.id}>
                    <div className={classes.actions}>

                      <button className={classes.edit} onClick={() => handleEdit(product.id)}>
                        Edit
                      </button>

                      <button className={classes.delete} onClick={() => handleDelete(product.id)}>
                        Delete
                      </button>

                    </div>
                    <h3>{product.variant}</h3>
                    <h3>{product.stock}</h3>
                    <h3>{product.unitCost}</h3>
                    <h3>{product.srp}</h3>
                    <h3>{product.profit}</h3>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
