import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useSelectedClient } from "../components/CreateContext";
import BackButton from "../components/backButton";
import Header from "../components/header";
import "../styles/DropDown.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
  },
});

export default function AppBars() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);
  const navigate = useNavigate();
  const { selectedClientId, selectedClientName, clearSelectedClient } =
    useSelectedClient();

  // Fetch role from Firestore
  React.useEffect(() => {
    const loadRole = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const snap = await getDoc(doc(db, "profiles", uid));
        if (snap.exists()) {
          setUserRole(snap.data().role || null);
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };
    loadRole();
  }, []);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearSelectedClient();
      navigate("/SignUpPage", { replace: true });
    } catch (e) {
      console.error("Sign out failed:", e);
      navigate("/SignUpPage", { replace: true });
    }
  };

  const handleMenuItemClick = (action) => {
    handleClose();
    action();
  };

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <ThemeProvider theme={darkTheme}>
        <AppBar
          style={{ border: "1px solid #ab0303" }}
          position="static"
          color="primary"
        >
          <Toolbar>
            <div style={{ marginLeft: "-20px", marginBottom: "13px" }}>
              <BackButton />
            </div>
            {/* CENTER: Title (optional) */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, textAlign: "center" }}
            ></Typography>
            {/* RIGHT: Menu Button */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleClick}
            >
              <MenuIcon />
            </IconButton>

            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {userRole === "trainer" && (
                <MenuItem
                  onClick={() =>
                    handleMenuItemClick(() => navigate("/clientList"))
                  }
                >
                  Client List
                </MenuItem>
              )}

              <MenuItem
                onClick={() =>
                  handleMenuItemClick(() => navigate("/ProfileDisplay"))
                }
              >
                Profile
              </MenuItem>

              {userRole === "trainer" && (
                <MenuItem
                  onClick={() =>
                    handleMenuItemClick(() => {
                      if (selectedClientId) {
                        navigate(`/ProfileView/${selectedClientId}`);
                      } else {
                        alert("⚠️ Please select a client first.");
                      }
                    })
                  }
                  title={
                    selectedClientName
                      ? `Viewing: ${selectedClientName}`
                      : "View profile"
                  }
                >
                  {selectedClientName ? "Client Info" : "Profile View"}
                </MenuItem>
              )}

              {userRole === "client" && (
                <MenuItem
                  onClick={() =>
                    handleMenuItemClick(() => navigate("/NotePad"))
                  }
                >
                  Note Pad
                </MenuItem>
              )}

              <MenuItem onClick={() => handleMenuItemClick(handleLogout)}>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    </Stack>
  );
}
