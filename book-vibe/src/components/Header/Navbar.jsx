import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { NavLink } from "react-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from "../../firebase/firebase.init";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/readlist", label: "ReadList" },
  { to: "/notes", label: "Notes" },
];

function Navbar() {
  const [user, setUser] = React.useState(null);
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = () => {
    signOut(auth).catch(() => {
      alert("Logout failed. Please try again.");
    });
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <MenuBookIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Book Vibe
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              <div className="flex flex-col p-2 gap-2">
                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to}>
                    {link.label}
                  </NavLink>
                ))}
                {user ? (
                  <button className="btn btn-ghost" onClick={handleLogout}>
                    Logout
                  </button>
                ) : (
                  <NavLink to="/login">Login</NavLink>
                )}
              </div>
            </Menu>
          </Box>
          <MenuBookIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Book Vibe
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <div className="flex gap-2 font-semibold">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <div className="flex items-center gap-2">
                <IconButton sx={{ p: 0 }}>
                  <Avatar
                    alt={user.displayName || "User"}
                    src={user.photoURL || ""}
                  />
                </IconButton>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <NavLink className="btn btn-ghost" to="/login">
                Login
              </NavLink>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
