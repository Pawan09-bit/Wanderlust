const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Review = require("../models/review");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });

// Middleware (make sure this is imported properly)
const { isLoggedIn } = require("../middleware");

// ========================
// INDEX - Show all listings
// ========================
router.get("/", async (req, res) => {
  const listings = await Listing.find({}).populate("owner");
  res.render("listings/index", { listings });
});

// ========================
// NEW - Form
// ========================
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// ========================
// CREATE - With Geocoding
// ========================
router.post("/", isLoggedIn, async (req, res) => {

  const geoData = await geocoder.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  }).send();

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  // 👇 Auto save coordinates
  newListing.geometry = geoData.body.features[0].geometry;

  await newListing.save();

  req.flash("success", "Listing created successfully!");
  res.redirect(`/listings/${newListing._id}`);
});

// ========================
// SHOW - Single listing
// ========================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
});

module.exports = router;