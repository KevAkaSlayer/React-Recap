import { useLoaderData } from "react-router";
import CustomCard from "./CustomCard";
import { Box } from "@mui/material";

export default function Recipes() {
  const recipes = useLoaderData();
  console.log(recipes.recipes);
  return (
    <div>
    <Box sx={{display:"flex",alignItems : "center",marginTop : "20px",justifyContent:"center",flexDirection: "column",gap : 2}}>
        <h1>Recipes</h1>
        <div>
            
            {
            recipes.recipes.map((recipe) => <Box sx={{display : "flex",margin : 2}}><CustomCard key={recipe.id} recipe={recipe} /></Box>)       
            }
        </div>
      </Box>
    </div>
  );
}
    