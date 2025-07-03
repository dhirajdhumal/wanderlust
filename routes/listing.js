const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

router
    .route("/")
    .get(wrapAsync (listingController.index))
    .post(
    isLoggedIn, 
    upload.single("listing[image]"),
    (req, res, next) => {
        // Inject Cloudinary URL into body for Joi validation
        if (req.file) {
            req.body.listing.image = {
                url: req.file.path
            };
        }
        next();
    },
    validateListing, 
    wrapAsync(listingController.createListing)
);


//new Route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router
    .route("/:id")
    .get(wrapAsync (listingController.showListing))
    .put(
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  (req, res, next) => {
    if (req.file) {
      req.body.listing.image = {
        url: req.file.path
      };
    }
    next();
  },
  validateListing,
  wrapAsync(listingController.updateListing)
)


// Edit Route
router.get(
    "/:id/edit", 
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.renderEditForm)
);

router.delete(
  "/:id", 
  isLoggedIn, 
  isOwner, 
  wrapAsync(listingController.destroyListing)
);


module.exports = router;