const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "A tour must have name"],
			unique: true,
			trim: true,
			maxlength: [40, "A tour name must have less or equal then 40 characters"],
			minlength: [10, "A tour name must have more or equal then 10 characters"],
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, "A tour must have duration"],
		},
		maxGroupSize: {
			type: Number,
			required: [true, "A tour must have group size"],
		},
		difficulty: {
			type: String,
			required: [true, "A tour must have a difficulty type."],
			enum: {
				values: ["easy", "medium", "difficult"],
				message: "Difficulty is either: easy, medium, difficult",
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, "Rating must be above 1.0"],
			max: [5, "Rating must be below 5.0"],
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, "A tour must have price"],
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (val) {
					return val < this.price; // this only points to current doc on New document creations
				},
				message: "Discount price ({VALUE}) should be less than regular price",
			},
		},
		summary: {
			type: String,
			trim: true,
			required: [true, "A tour must have a summary"],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, "A tour must have image"],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false,
		},
		startLocation: {
			// GeoJSON
			type: {
				type: String,
				default: "Point",
				enum: ["Point"],
			},
			coordinates: [Number],
			address: String,
			description: String,
		},
		locations: [
			{
				type: {
					type: String,
					default: "Point",
					enum: ["Point"],
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: "User",
			},
		],
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

tourSchema.virtual("durationWeeks").get(function () {
	return this.duration / 7;
});

// Virtual populate
tourSchema.virtual("reviews", {
	ref: "Review",
	foreignField: "tour",
	localField: "_id",
});

// Document Middleware, run before .save() .create()
tourSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });

	next();
});

// tourSchema.pre("save", async function () {
// 	const guidesPromises = this.guides.map(async (id) => await User.findById(id));
// 	this.guides = await Promise.all(guidesPromises);

// 	next();
// });

// /^find/ means include all the string start with find
tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } });

	this.start = Date.now();

	next();
});

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: "guides",
		select: "-__v -passwordChangedAt",
	});

	next();
});

tourSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds!`); //this shows how long it start to execute
	console.log(docs);
	next();
});

tourSchema.pre("aggregate", function (next) {
	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
	console.log(this.pipeline());
	next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
