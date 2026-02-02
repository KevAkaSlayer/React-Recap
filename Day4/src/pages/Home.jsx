import React from "react";
import { SideNav } from "../components/SideNav";
import { Box, colors, Stack } from "@mui/material";
import Navbar from "../components/Navbar";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import "../Dash.css";
import BarChart from "../charts/BarChart";
export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <Box height={50} />
      <Box sx={{ display: "flex" }}>
        <SideNav />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid size={8}>
                <Stack direction="row" spacing={2}>
                  <Card
                    sx={{ minWidth: 49 + "%", height: 150 }}
                    className="gradient"
                  >
                    <CardContent>
                      <div>
                        <CreditCardIcon />
                      </div>
                      <Typography gutterBottom variant="h5" component="div">
                        $500.00
                      </Typography>
                      <Typography
                        gutterBottom
                        variant="body2"
                        component="div"
                        sx={{ color: "#ccd1d1" }}
                      >
                        Total Earnings
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card
                    sx={{ minWidth: 49 + "%", height: 150 }}
                    className="gradient"
                  >
                    <CardContent>
                      <div>
                        <ShoppingBagIcon />
                      </div>
                      <Typography gutterBottom variant="h5" component="div">
                        $900.00
                      </Typography>
                      <Typography
                        gutterBottom
                        variant="body2"
                        component="div"
                        sx={{ color: "#ccd1d1" }}
                      >
                        Total Orders
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
              <Grid size={4}>
                <Stack spacing={2}>
                  <Card sx={{ maxWidth: 345 }}>
                    <Stack spacing={2} direction="row">
                      <div className="storeicon">
                        <StorefrontIcon />
                      </div>
                      <div className="paddingall">
                        <span className="priceTitle">$230</span>
                        <br />
                        <span className="PriceText">Total Income</span>
                      </div>
                    </Stack>
                  </Card>
                  <Card sx={{ maxWidth: 345 }}>
                    <Stack spacing={2} direction="row">
                      <div className="storeicon">
                        <StorefrontIcon />
                      </div>
                      <div className="paddingall">
                        <span className="priceTitle">$230</span>
                        <br />
                        <span className="PriceText">Total Income</span>
                      </div>
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
            <Box height={20} />
            <Grid container spacing={2}>
              <Grid size={8}>
                <Card sx={{ height: 60 + "vh" }}>
                  <CardContent>
                    <BarChart/>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={4}>
                <Card sx={{ height: 60 + "vh" }}>
                  <CardContent></CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
}
