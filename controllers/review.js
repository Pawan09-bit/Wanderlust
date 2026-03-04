const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError");

const Listing = require("../models/listing");
const Review = require("../models/review");

// ---------------- CREATE REVIEW ----------------
module.exports.createReview = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid Listing ID"));
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    return next(new ExpressError(404, "Listing Not Found"));
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};

// ---------------- DELETE REVIEW ----------------
module.exports.destroyReview = async (req, res, next) => {
  let { id, reviewId } = req.params;

  id = id.trim();
  reviewId = reviewId.trim();

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(reviewId)
  ) {
    return next(new ExpressError(400, "Invalid ID"));
  }

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};