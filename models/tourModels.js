const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "A tour must have name"],
			unique: true,
			trim: true,
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
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, "A tour must have price"],
		},
		priceDiscount: Number,
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
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

tourSchema.virtual("durationWeeks").get(function () {
	return this.duration / 7;
});

// Document Middleware, run before .save() .create()
tourSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });

	next();
});

// tourSchema.pre("save", function (next) {
// 	console.log("We will save documents");

// 	next();
// });

// tourSchema.post("save", function (doc, next) {
// 	console.log(doc);

// 	next();
// });

// Query Middleware

// /^find/ means include all the string start with find
tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } });

	this.start = Date.now();

	next();
});

tourSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds!`); //this shows how long it start to execute
	console.log(docs);
	next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
