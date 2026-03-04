const Listing = require("../models/listing");
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError");
const mbxGecoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxClient({ accessToken: mapTOKEN });


// ---------------- INDEX ----------------
module.exports.index = async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (err) {
    next(err);
  }
};

// ---------------- NEW FORM ----------------
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// ---------------- SHOW ----------------
module.exports.showListing = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ExpressError(400, "Invalid Listing ID"));
    }

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  } catch (err) {
    next(err);
  }
};

// ---------------- CREATE ----------------
module.exports.createListing = async (req, res, next) => {
  try {
    if (!req.user) {
      req.flash("error", "You must be logged in!");
      return res.redirect("/login");
    }
    let response =await geocodingClient.forwardGeocode({
      query: req.listing.location,
      limit: 1,
    })
      .send();
     
    const newListing = new Listing(req.body.listing);

    // Set owner
    newListing.owner = req.user._id;

    // If image uploaded
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }
    new listing.geometry=response.body.features[0].geometry; 
    let savedListing =await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

// ---------------- EDIT FORM ----------------
module.exports.renderEditForm = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ExpressError(400, "Invalid Listing ID"));
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }
    let originalImageUrl =listing.image.url;
    originalImageUrl =originalImageUrl.replace("/upload","/uploadh_300 ,w_250");
    res.render("listings/edit", { listing,originalImageUrl });
  } catch (err) {
    next(err);
  }
};

// ---------------- UPDATE ----------------
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ExpressError(400, "Invalid Listing ID"));
    }

    let updatedData = req.body.listing;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    // If new image uploaded
    if (req.file) {
      updatedData.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else {
      updatedData.image = listing.image;
    }

    await Listing.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
     
    listing.image ={url ,filename};
    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// ---------------- DELETE ----------------
module.exports.destroyListing = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ExpressError(400, "Invalid Listing ID"));
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};