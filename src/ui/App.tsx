import './App.css'
import { Routes, Route, HashRouter } from 'react-router-dom';
import Inventory from "./inventory/Inventory.tsx";
import Login from './Login.tsx';
import History from './history/history.tsx';
import { createContext, useState, useEffect } from 'react';
import supabase from '../config/supabaseClient.ts';
import Prodcuts from './products/products.tsx';
import Logs from './logs/logs.tsx';


interface Item {
  id: number;
  name: string;
}

interface Product{
  id: number;
  name: string;
  variant: string;
  unitCost: number;
  srp: number;
  profit: number;
  stock: number;
}


interface DBContext {
  //idk what supabase type is exactly so yes
  supabase: typeof supabase;
  //array of type item from above
  loadedItems: Item[];
  loadedProducts: Product[];
  loadedLogs: Log[];
  //loadProducts is an async function
  loadProducts: () => Promise<void>;
  loadItems: () => Promise<void>;
  loadLogs: () => Promise<void>;
}

interface Log{
  username: string;
  date: string;
  time: string;
  action: string;
}

export const DbContext = createContext<DBContext | null>(null);

function App() {
  const [loadedItems, setItems] = useState<Item[]>([]);
  const [loadedProducts, setProducts] = useState<Product[]>([]);
  const [loadedLogs, setLoadedLogs] = useState<Log[]>([]);

  useEffect(() => {
    loadItems();
    loadProducts();
    loadLogs();
  }, []);

  async function loadItems() {
    const { data, error } = await supabase.from("Items").select("*");
    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setItems(data);
    }
  }

  async function loadProducts(){

    const { data, error } = await supabase.from("Item_Variants").select(`id, name, unit_cost, srp, profit, stock, Items (name))`);

    if(error){
      console.error(error);
      return;
    }


    const formatted = data.map((item : any)=>({
      id: item.id,
      name: item.Items.name,
      variant: item.name,
      unitCost: item.unit_cost,
      srp: item.srp,
      profit: item.profit,
      stock: item.stock,
    }))

    setProducts(formatted);
  }

  async function loadLogs(){
    const {data, error} = await supabase.from("Logs").select("date, username, time, action");
    if(error){
      console.error(error);
      return;
    }
    
    setLoadedLogs(data);
  }

  return (
    <DbContext.Provider value={{ supabase, loadedItems, loadedProducts, loadProducts, loadItems, loadLogs, loadedLogs}}>
      <HashRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path='/inventory' element={<Inventory />} />
          <Route path='/history' element={<History />} />
          <Route path='/products' element={<Prodcuts />}/>
          <Route path='/logs' element={<Logs />}/>
        </Routes>
      </HashRouter>
    </DbContext.Provider>
  );
}

export default App;
