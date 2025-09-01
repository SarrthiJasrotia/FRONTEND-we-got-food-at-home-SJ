// src/Pages/AddIngredients/AddIngredients.jsx
import axios from "axios";
import { Link } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useState, useEffect } from "react";
import ItemList from "../../Components/ItemList";
import "../AddIngredients/AddIngredients.css";
import { BallTriangle } from "react-loading-icons";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  query,
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  where,
} from "firebase/firestore";

function AddIngredients() {
  const [user, loading] = useAuthState(auth);

  // data
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [uId, setUId] = useState("");

  // ui
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState(false);
  const [response, setResponse] = useState("");
  const [load, setLoad] = useState(false);

  // auth → uid
  useEffect(() => {
    if (loading) return;
    setUId(user?.uid || "");
  }, [user, loading]);

  // add item for this user
  const addItem = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!uId || !text) return;
    await addDoc(collection(db, "items"), {
      user: uId,
      text,
      selected: false,
    });
    setInput("");
  };

  // subscribe to this user's items
  useEffect(() => {
    if (!uId) return;

    const q = query(collection(db, "items"), where("user", "==", uId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ ...d.data(), id: d.id }));
      setItems(arr);
      setSelectedItems(arr.filter((x) => x.selected).map((x) => x.text));
    });

    return () => unsubscribe();
  }, [uId]);

  // toggle selected
  const selectItem = async (item) => {
    await updateDoc(doc(db, "items", item.id), { selected: !item.selected });
  };

  // delete item
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "items", id));
  };

  // model prompt
  const prompt = `Give me one recipe that can be made using ONLY these ingredients: ${selectedItems.join(
    ", "
  )}. Return clear steps. Keep it simple.`;

  // reset recipe view
  const handleNewPrompt = (e) => {
    e.preventDefault();
    setResponse("");
    setRecipe(false);
  };

  // call backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    setLoad(true);
    setRecipe(false);
    setResponse("");

    try {
      const res = await axios.post("http://localhost:5000/chat", { prompt });
      const data = res?.data;
      const asText =
        typeof data === "string" ? data : JSON.stringify(data, null, 2);
      setResponse(asText);
      setRecipe(true);
    } catch (err) {
      console.error(err);
      setResponse("Error generating recipe. Try again.");
      setRecipe(true);
    } finally {
      setLoad(false);
    }
  };

  return (
    <>
      <div>
        <Link to="/home">
          <IoChevronBackOutline
            style={{
              alignItems: "center",
              color: "gray",
              display: "flex",
              marginTop: "20px",
              marginLeft: "10px",
              fontSize: "40px",
            }}
          />
        </Link>
      </div>

      {!recipe && (
        <div className="ingredients-div">
          <div>
            <h1>Enter Ingredients</h1>

            <form onSubmit={addItem}>
              <input
                className="custom-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                placeholder="Add Item"
              />
              <button className="add-btn">Add</button>
            </form>

            <ul className="ingredients-div">
              {items.map((item) => (
                <ItemList
                  key={item.id}
                  item={item}
                  selectItem={selectItem}
                  deleteItem={deleteItem}
                />
              ))}
            </ul>

            {selectedItems.length > 0 && (
              <p>
                You are including {selectedItems.length} of the {items.length} items in your recipe
              </p>
            )}
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <button className="home-logout-button" type="submit" disabled={load}>
                {load ? "Cooking up ideas…" : "Create a recipe"}
              </button>
            </form>
          </div>
        </div>
      )}

      {load ? (
        <BallTriangle
          stroke="#f09133"
          fill="#ed7f12"
          strokeOpacity={0.1}
          fillOpacity={1}
          speed={0.75}
        />
      ) : null}

      <div>
        {recipe && (
          <>
            <div className="recipe">
              <article>
                <h1>Recipe</h1>
                <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>
              </article>
            </div>

            <Link to="/home">
              <button className="recipe-button">I Cooked this Recipe!</button>
            </Link>

            <button className="recipe-button" onClick={handleNewPrompt}>
              Make something else!
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default AddIngredients;
