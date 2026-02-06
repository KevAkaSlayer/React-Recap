import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";

export default function Book({ book }) {
  console.log(book);
  return (
    <Link to={`/book/${book.isbn_13}`}>
      <Card sx={{ maxWidth: 345 }}>
        <CardMedia
          sx={{ height: 140 }}
          image={book.cover_image}
          title={book.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {book.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {book.description}
          </Typography>
        </CardContent>
        <CardActions className="gap-2">
          <p className="font-semibold">{book.author}</p>
          <p className="font-semibold">{book.publisher}</p>
        </CardActions>
      </Card>
    </Link>
  );
}
