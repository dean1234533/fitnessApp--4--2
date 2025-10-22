import React, { useState } from "react";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "./client";
import "../styles/FoodGenerator.css";

const FoodGenerator = () => {
  const [foodType, setFoodType] = useState("breakfast");
  const [recipe, setRecipe] = useState(null);

  // Load a random recipe
  const loadRecipe = async () => {
    setRecipe(null); // clear previous recipe
    const tableName = `${foodType}_recipes`;
    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      console.error("Error fetching recipe:", error);
      return;
    }

    if (data && data.length > 0) {
      const randomRecipe = data[Math.floor(Math.random() * data.length)];
      setRecipe(randomRecipe);
    } else {
      setRecipe(null);
    }
  };

  return (
    <div className="foodGenContainer">
      <h1 className="foodGenH1">Food Generator</h1>

      <div className="foodTypeContainer">
        <p className="foodTypeName">Meal Type</p>
        <select
          className="foodType"
          value={foodType}
          onChange={(event) => setFoodType(event.target.value)}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snacks">Snacks</option>
        </select>
     

      <Button className="foodGenSubmitButton" onClick={loadRecipe}>
        Generate Recipe
      </Button>
 </div>
      {recipe ? (
        <div className="foodGenDisplay">
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients ? (
              Array.isArray(recipe.ingredients) ? (
                recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))
              ) : (
                recipe.ingredients
                  .split(",")
                  .map((ingredient, index) => (
                    <li key={index}>{ingredient.trim()}</li>
                  ))
              )
            ) : (
              <li>No ingredients available</li>
            )}
          </ul>

          <p>Calories: {recipe.calories || "N/A"}</p>
          <p>Prep Time: {recipe.prepTime || "N/A"}</p>
          <p>Protein: {recipe.protein || "N/A"}</p>
        </div>
      ) : null}
    </div>
  );
};

export default FoodGenerator;
