import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { logout, auth, db } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useState, useEffect } from "react";
import ItemList from "../../Components/ItemList";
import Recipes from "../../Components/Recipes";
import "../AddIngredients/AddIngredients.css";
import { Hearts} from "react-loading-icons";
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
} from 'firebase/firestore';
function AddIngredients() {
	const [prompttest, setPrompt] = useState('');
	const [response, setResponse] = useState('');
	const [load, setLoad] = useState(false);
	const [user, loading, error] = useAuthState(auth);
	const [items, setItems] = useState([]);
	const [input, setInput] = useState('');
	const [selectedItems, setSelectedItems] = useState([]);
	const [visible, setVisible] = useState(false);
	const [uId, setUId] = useState('');
	const [recipe, setRecipe] = useState(false);
	const prompt = `give me a recipe that can be made using only ${selectedItems.toString(
		' ',
	)} respond your answer in a clean format`;
	const navigate = useNavigate();

	// Create ItemList
	useEffect(() => {
		if (!loading) {
			setUId(user.uid);
		}
	}, [loading, user]);

	const addItem = async (e) => {
		e.preventDefault(e);
		if (input === '') {
			alert('Please enter a valid food item');
			return;
		}
		await addDoc(collection(db, 'items'), {
			user: uId,
			text: input,
			selected: false,
		});
		setInput('');
	};

	// Read item from firebase

	useEffect(() => {
		const collectionRef = collection(db, 'items');
		const q = query(collectionRef, where('user', '==', uId));

		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			let itemsArr = [];

			querySnapshot.forEach((doc) => {
				itemsArr.push({ ...doc.data(), id: doc.id });
			});
			console.log(itemsArr);
			setItems(itemsArr);
			let newArr = [];
			for (let i = 0; i < itemsArr.length; i++) {
				if (itemsArr[i].selected === true) {
					newArr.push(itemsArr[i].text);
				}
			}
			setSelectedItems(newArr);
		});
		return () => unsubscribe();
	}, [uId, loading]);

	// Items in firebase
	const selectItem = async (item) => {
		await updateDoc(doc(db, 'items', item.id), {
			selected: !item.selected,
		});
	};

	// Delete item
	const deleteItem = async (id) => {
		await deleteDoc(doc(db, 'items', id));
	};

	// ////////////////////////////////////////
	const handleNewPrompt = async (e) => {
		e.preventDefault();
		setResponse('');
		setRecipe(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoad(true);
		const gptData = await // Send a request to the server with the prompt
		axios.post('https://we-got-food-at-home.herokuapp.com/chat', { prompt });
		try {
			const res = await axios.post('https://we-got-food-at-home.herokuapp.com/chat', { prompt });
			setLoad(false);
			setRecipe(true);
			console.log(res.data);
			setResponse(res.data);
		} catch (error) {
			console.error(error);
		}
		// Update the response state with the server's response
	};

	const handleClick = () => {
		// setLoading(true)
		setVisible(true);
	};

	return (
		<>
			<div>{/* <Link to="/ingredients/recipes">Recipes</Link> */}</div>
			{recipe ? (
				true
			) : (
				<div className='ingredients-div'>
					<div>
						<div >
							
							
							<h1> <Link to="/home"><IoChevronBackOutline style={{marginRight:"30px", color:'gray', fontSize:"40px"}}  /></Link> Enter Ingredients</h1>
							<form onSubmit={addItem}>
								<input
									className='custom-input'
									value={input}
									onChange={(e) => setInput(e.target.value)}
									type='text'
									placeholder='Add Item'
								/>
								<button className='add-btn'>Add</button>
							</form>
							<ul className='ingredients-div'>
								{items.map((item, index) => (
									<ItemList
										key={index}
										item={item}
										selectItem={selectItem}
										deleteItem={deleteItem}
									/>
								))}
							</ul>
							{selectedItems.length < 1 ? null : (
								<p>{`You are including ${selectedItems.length} of the ${items.length} items in your recipe`}</p>
							)}
						</div>
					</div>
					<div>
						<div>
							{/* Submits the prompt with the selected items */}

							<form onSubmit={handleSubmit}>
								<button
									className='home-logout-button'
									onClick={handleClick}
									type='submit'>
									Create a recipe
								</button>
							</form>
						</div>
					</div>
				</div>
			)}

			{load ? (
				<Hearts
					stroke='#f09133'
					fill='#ed7f12'
					strokeOpacity={0.1}
					fillOpacity={1}
					speed={0.75}
				/>
			) : (
				' '
			)}

			<div>
				{/* <div>
					{recipe ? (
						<div className='recipe'>
							<h1>{response.name}</h1>

							<div>
								<h2>Ingredients</h2>
								<ol>
									{response.ingredients.map((ingredient, index) => (
										<li key={index}>{ingredient}</li>
									))}
								</ol>
							</div>
							<div>
								<h2>Instructions</h2>
								<ol>
                  {
                    
                    
                    response.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}
                    
                    
                    </li>
									))}
								</ol>
							</div>
						</div>
					) : (
						''
					)}
				</div> */}
				

				

				<div>
					{recipe ? (
						<><div className="recipe">
					<h1>Recipe</h1>
					{response}</div>
							<button className='recipe-button'>
								I Cooked this Recipe!
							</button>
							<button className='recipe-button' onClick={handleNewPrompt}>
								Make a new recipe!{' '}
							</button>
						</>
					) : (
						''
					)}
				</div>
			</div>
		</>
	);
}

export default AddIngredients;
