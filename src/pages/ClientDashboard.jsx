// components/ClientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Card.css";
import UserAvatar from "../components/avatar";

function ClientDashboard() {
  const [clientName, setClientName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadClient = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const ref = doc(db, "profiles", uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const profile = snap.data();
          setClientName(profile.name || "Client");
        } else {
          console.warn("No profile found for this user");
          setClientName("Client");
        }
      } catch (err) {
        console.error("Error fetching client profile:", err);
      }
    };

    loadClient();
  }, []);

  const ImageButton = styled(ButtonBase)(({ theme }) => ({
    position: "relative",
    height: 250,
    width: "30%",
    margin: 10,
    [theme.breakpoints.down("xl")]: {
      width: "43% !important",
      margin: 30,
      height: 250,
    },

    [theme.breakpoints.down("lg", "md")]: {
      width: "43% !important",

      height: 200,
    },

    [theme.breakpoints.down("md", "sm")]: {
      width: "39% !important",
      height: 200,
    },

    [theme.breakpoints.down("sm")]: {
      width: "100% !important",
      margin: 10,
    },
    "&:hover, &.Mui-focusVisible": {
      zIndex: 1,
      "& .MuiImageBackdrop-root": {
        opacity: 0.15,
      },
      "& .MuiImageMarked-root": {
        opacity: 0,
      },
      "& .MuiTypography-root": {
        border: "4px solid currentColor",
      },
    },
  }));

  const ImageSrc = styled("span")({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: "cover",
    backgroundPosition: "center 40%",
  });

  const Image = styled("span")(({ theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.white,
  }));

  const ImageBackdrop = styled("span")(({ theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity"),
  }));

  const ImageMarked = styled("span")(({ theme }) => ({
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  }));

  const cards = [
    {
      url: "/images/pexels-pixabay-416778.jpg",
      title: "Workouts",
      onClick: () => navigate("/client/workoutsPage"),
    },
    {
      url: "/images/pexels-mastercowley-1153369.jpg",
      title: "Food Generator",
      onClick: () => navigate("/FoodGenerator"),
    },
    {
      url: "/images/pexels-fotios-photos-1172019.jpg",
      title: "Food Diary",
      onClick: () => navigate("/client/FoodDiary"),
    },
    {
      url: "/images/digital-connection-technology-social-media.jpg",
      title: "Chat",
      onClick: () => navigate(`/TrainerChat`),
    },
  ];

  return (
    <Box className="cardContainer">
      <div className="avatarContainer">
        <UserAvatar className="cardAvatar" />
      </div>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Welcome {clientName}
      </Typography>
      <h1 className="cardH1">
        If You Have a Strong Mind, The Body Will Follow
      </h1>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {cards.map((card) => (
          <ImageButton key={card.title} focusRipple onClick={card.onClick}>
            <ImageSrc style={{ backgroundImage: `url(${card.url})` }} />
            <ImageBackdrop className="MuiImageBackdrop-root" />
            <Image>
              <Typography
                component="span"
                variant="subtitle1"
                color="inherit"
                sx={{
                  position: "relative",
                  p: 4,
                  pt: 2,
                  pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                }}
              >
                {card.title}
                <ImageMarked className="MuiImageMarked-root" />
              </Typography>
            </Image>
          </ImageButton>
        ))}
      </Box>
    </Box>
  );
}

export default ClientDashboard;
